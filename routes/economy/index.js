const express = require('express');
const { Character, User } = require('../../models');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// Daily intent collection
router.post('/daily', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if daily already collected today
    const now = new Date();
    const lastDaily = character.last_daily;
    
    if (lastDaily) {
      const timeDiff = now - new Date(lastDaily);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        const hoursLeft = Math.ceil(24 - hoursDiff);
        return res.status(400).json({
          success: false,
          message: `Daily intent already collected. Try again in ${hoursLeft} hours.`
        });
      }
    }

    // Give daily intent reward
    const dailyAmount = parseInt(process.env.DAILY_INTENT_AMOUNT) || 100;
    
    // Ensure intent is a number and add daily amount
    const currentIntent = parseInt(character.intent) || 0;
    const newIntent = currentIntent + dailyAmount;
    
    if (newIntent > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({
        success: false,
        message: 'Intent limit reached. Cannot earn more intent.'
      });
    }
    
    character.intent = newIntent;
    character.last_daily = now;
    await character.save();

    // Leaderboard güncelleme
    try {
      const { io } = require('../../server');
      const { sequelize } = require('../../config/database/connection');
      
      const intentQuery = `
        SELECT 
          c.name,
          c.race,
          c.class,
          c.intent,
          ROW_NUMBER() OVER (ORDER BY c.intent DESC) as rank
        FROM characters c
        ORDER BY c.intent DESC
        LIMIT 50
      `;
      const [intentLeaderboard] = await sequelize.query(intentQuery);
      
      io.emit('leaderboardUpdate', {
        type: 'intent',
        leaderboard: intentLeaderboard,
        timestamp: new Date()
      });
      
      // Intent leaderboard updated silently
    } catch (error) {
      console.error('❌ Error updating intent leaderboard:', error);
    }

    res.json({
      success: true,
      message: `Daily intent collected! +${dailyAmount} intent`,
      intentEarned: dailyAmount,
      totalIntent: character.intent
    });

  } catch (error) {
    console.error('Daily collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Work for intent
router.post('/work', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check work cooldown (1 hour)
    const now = new Date();
    const lastWork = character.last_work;
    
    if (lastWork) {
      const timeDiff = now - new Date(lastWork);
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff < 60) {
        const minutesLeft = Math.ceil(60 - minutesDiff);
        return res.status(400).json({
          success: false,
          message: `You are tired from work. Rest for ${minutesLeft} more minutes.`
        });
      }
    }

    // Calculate work earnings based on level and race
    const baseAmount = parseInt(process.env.WORK_INTENT_AMOUNT) || 50;
    const levelBonus = Math.floor(character.level * 2);
    const workEarnings = baseAmount + levelBonus;

    // Ensure intent is a number and add work earnings
    const currentIntent = parseInt(character.intent) || 0;
    const newIntent = currentIntent + workEarnings;
    
    if (newIntent > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({
        success: false,
        message: 'Intent limit reached. Cannot earn more intent.'
      });
    }

    character.intent = newIntent;
    character.last_work = now;
    await character.save();

    // Leaderboard güncelleme
    try {
      const { io } = require('../../server');
      const { sequelize } = require('../../config/database/connection');
      
      const intentQuery = `
        SELECT 
          c.name,
          c.race,
          c.class,
          c.intent,
          ROW_NUMBER() OVER (ORDER BY c.intent DESC) as rank
        FROM characters c
        ORDER BY c.intent DESC
        LIMIT 50
      `;
      const [intentLeaderboard] = await sequelize.query(intentQuery);
      
      io.emit('leaderboardUpdate', {
        type: 'intent',
        leaderboard: intentLeaderboard,
        timestamp: new Date()
      });
      
      // Intent leaderboard updated silently
    } catch (error) {
      console.error('❌ Error updating intent leaderboard:', error);
    }

    res.json({
      success: true,
      message: `Work completed! +${workEarnings} intent`,
      intentEarned: workEarnings,
      totalIntent: character.intent
    });

  } catch (error) {
    console.error('Work error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Transfer intent to another player
router.post('/transfer', authMiddleware, async (req, res) => {
  try {
    const { targetUsername, amount } = req.body;

    if (!targetUsername || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid target username and positive amount required'
      });
    }

    // Get sender character
    const senderCharacter = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!senderCharacter) {
      return res.status(404).json({
        success: false,
        message: 'Your character not found'
      });
    }

    // Check if sender has enough intent
    if (senderCharacter.intent < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient intent for transfer'
      });
    }

    // Find target user and character
    
    const targetUser = await User.findOne({
      where: { 
        username: {
          [require('sequelize').Op.iLike]: targetUsername
        }
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target player not found'
      });
    }

    const targetCharacter = await Character.findOne({
      where: { user_id: targetUser.id }
    });

    if (!targetCharacter) {
      return res.status(404).json({
        success: false,
        message: 'Target player has no character'
      });
    }

    // Prevent self-transfer
    if (senderCharacter.id === targetCharacter.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer intent to yourself'
      });
    }

    // Perform transfer
    const senderCurrentIntent = parseInt(senderCharacter.intent) || 0;
    const targetCurrentIntent = parseInt(targetCharacter.intent) || 0;
    
    const newSenderIntent = senderCurrentIntent - amount;
    const newTargetIntent = targetCurrentIntent + amount;
    
    // Check if target would exceed safe limits
    if (newTargetIntent > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({
        success: false,
        message: 'Target player would exceed intent limit.'
      });
    }
    
    senderCharacter.intent = newSenderIntent;
    targetCharacter.intent = newTargetIntent;

    await senderCharacter.save();
    await targetCharacter.save();

    // Transfer completed silently

    // Verify the transfer was saved correctly
    const verifySender = await Character.findByPk(senderCharacter.id);
    const verifyTarget = await Character.findByPk(targetCharacter.id);
    
    // Transfer verification completed silently

    // Notify both users about the transfer
    try {
      const { io } = require('../../server');
      
      // Check if rooms exist
      const senderRoom = io.sockets.adapter.rooms.get(`user_${req.user.id}`);
      const targetRoom = io.sockets.adapter.rooms.get(`user_${targetUser.id}`);
      
      // Notify sender
      io.to(`user_${req.user.id}`).emit('characterUpdate', {
        type: 'transfer_sent',
        character: verifySender,
        message: `Sent ${amount} intent to ${targetUser.username}`
      });
      
      // Notify target user
      io.to(`user_${targetUser.id}`).emit('characterUpdate', {
        type: 'transfer_received',
        character: verifyTarget,
        message: `Received ${amount} intent from ${senderCharacter.name}`
      });
      
      // Socket notifications sent to both users
    } catch (error) {
      console.error('❌ Error sending socket notifications:', error);
    }

    // Leaderboard güncelleme
    try {
      const { io } = require('../../server');
      const { sequelize } = require('../../config/database/connection');
      
      const intentQuery = `
        SELECT 
          c.name,
          c.race,
          c.class,
          c.intent,
          ROW_NUMBER() OVER (ORDER BY c.intent DESC) as rank
        FROM characters c
        ORDER BY c.intent DESC
        LIMIT 50
      `;
      const [intentLeaderboard] = await sequelize.query(intentQuery);
      
      io.emit('leaderboardUpdate', {
        type: 'intent',
        leaderboard: intentLeaderboard,
        timestamp: new Date()
      });
      
      // Intent leaderboard updated silently
    } catch (error) {
      console.error('❌ Error updating intent leaderboard:', error);
    }

    res.json({
      success: true,
      message: `Successfully transferred ${amount} intent to ${targetUsername}`,
      remainingIntent: senderCharacter.intent
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get banking information
router.get('/bank', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Get race-specific banking info
    const bankingInfo = {
      race: character.race,
      intent: character.intent,
      racial_currency: character.racial_currency,
      currency_name: getRacialCurrencyName(character.race),
      exchange_rate: getRacialExchangeRate(character.race),
      services: [
        'Currency Exchange',
        'Intent Storage',
        'Transaction History',
        'Investment Options'
      ]
    };

    res.json({
      success: true,
      banking: bankingInfo
    });

  } catch (error) {
    console.error('Banking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper functions
function getRacialCurrencyName(race) {
  const currencies = {
    human: 'Imperial Coins',
    elf: 'Moonstone Shards',
    dwarf: 'Iron Tokens',
    orc: 'Blood Marks',
    halfling: 'Lucky Pennies',
    dragonborn: 'Dragon Scales',
    tiefling: 'Soul Gems',
    gnome: 'Tinker Bits',
    drow: 'Shadow Crystals',
    duergar: 'Mind Stones',
    aasimar: 'Light Fragments',
    githyanki: 'Silver Pieces'
  };
  
  return currencies[race] || 'Ancient Coins';
}

function getRacialExchangeRate(race) {
  // Different races have different exchange rates with gold
  const rates = {
    human: 1.0,
    elf: 1.2,
    dwarf: 0.9,
    orc: 0.8,
    halfling: 1.1,
    dragonborn: 1.5,
    tiefling: 1.3,
    gnome: 1.0,
    drow: 1.4,
    duergar: 1.1,
    aasimar: 1.6,
    githyanki: 1.8
  };
  
  return rates[race] || 1.0;
}

module.exports = router;
