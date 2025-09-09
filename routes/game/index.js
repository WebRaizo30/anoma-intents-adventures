const express = require('express');
const { Character, Region } = require('../../models');
const authMiddleware = require('../../middleware/auth');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database/connection');

const router = express.Router();

// Get leaderboards
router.get('/leaderboard/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50 } = req.query;

    const { sequelize } = require('../../config/database/connection');
    let query;
    let replacements = [parseInt(limit)];

    switch (type) {
      case 'level':
        query = `
          SELECT 
            c.name,
            c.race,
            c.class,
            c.level,
            c.experience,
            ROW_NUMBER() OVER (ORDER BY c.level DESC, c.experience DESC) as rank
          FROM characters c
          ORDER BY c.level DESC, c.experience DESC
          LIMIT ?
        `;
        break;
        
      case 'intent':
        query = `
          SELECT 
            c.name,
            c.race,
            c.class,
            c.intent,
            ROW_NUMBER() OVER (ORDER BY c.intent DESC) as rank
          FROM characters c
          ORDER BY c.intent DESC
          LIMIT ?
        `;
        break;
        
      case 'quests':
        query = `
          SELECT 
            c.name,
            c.race,
            c.class,
            COUNT(cq.id) as quests_completed,
            ROW_NUMBER() OVER (ORDER BY COUNT(cq.id) DESC) as rank
          FROM characters c
          LEFT JOIN character_quests cq ON c.id = cq.character_id AND cq.status = 'completed'
          GROUP BY c.id, c.name, c.race, c.class
          ORDER BY quests_completed DESC
          LIMIT ?
        `;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid leaderboard type. Use: level, intent, or quests'
        });
    }

    const [leaderboard] = await sequelize.query(query, {
      replacements: replacements
    });

    res.json({
      success: true,
      leaderboard: leaderboard,
      type: type
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all regions
router.get('/regions', async (req, res) => {
  try {
    const regions = await Region.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      regions: regions
    });

  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get region details
router.get('/regions/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const region = await Region.findOne({
      where: { name: name }
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        message: 'Region not found'
      });
    }

    // Get players currently in this region
    const playersInRegion = await Character.findAll({
      where: { current_region: name },
      attributes: ['name', 'race', 'class', 'level', 'position_x', 'position_y'],
      include: [{
        model: require('../../models').User,
        attributes: ['username']
      }]
    });

    res.json({
      success: true,
      region: region.toJSON(),
      players: playersInRegion.map(char => ({
        name: char.name,
        username: char.User.username,
        race: char.race,
        class: char.class,
        level: char.level,
        position: {
          x: char.position_x,
          y: char.position_y
        }
      }))
    });

  } catch (error) {
    console.error('Get region error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate random story
router.post('/story', authMiddleware, async (req, res) => {
  try {
    const { type = 'random' } = req.body;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    const story = generateStory(type, character);

    res.json({
      success: true,
      story: story
    });

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Boss fight
router.post('/boss', authMiddleware, async (req, res) => {
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

    // Boss fight requirements
    if (character.level < 5) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least level 5 to fight bosses'
      });
    }

    // Generate boss based on region and level
    const boss = generateBoss(character.current_region, character.level);
    
    // Calculate fight outcome
    const outcome = calculateBossFight(character, boss);

    // Apply results
    const currentXP = parseInt(character.experience) || 0;
    const xpGained = parseInt(outcome.xp_gained) || 0;
    character.experience = currentXP + xpGained;
    
    // Ensure intent is a number and add boss reward
    const currentIntent = parseInt(character.intent) || 0;
    const intentGained = parseInt(outcome.intent_gained) || 0;
    character.intent = currentIntent + intentGained;

    // Check for level up
    let leveledUp = false;
    while (character.canLevelUp() && character.level < 100) {
      character.levelUp();
      leveledUp = true;
    }

    await character.save();

    res.json({
      success: true,
      boss: boss,
      outcome: {
        ...outcome,
        leveledUp,
        newLevel: character.level
      },
      character: {
        level: character.level,
        experience: character.experience,
        intent: character.intent
      }
    });

  } catch (error) {
    console.error('Boss fight error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply game rewards from real-time gameplay
router.post('/rewards', authMiddleware, async (req, res) => {
  try {
    const { xp_gained = 0, intent_gained = 0, items_collected = 0, enemies_defeated = 0 } = req.body;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Applying game rewards

    // Apply XP
    if (xp_gained > 0) {
      const currentXP = parseInt(character.experience) || 0;
      const xpToAdd = parseInt(xp_gained) || 0;
      character.experience = currentXP + xpToAdd;
    }

    // Apply Intent (ensure it's a number)
    if (intent_gained > 0) {
      const currentIntent = parseInt(character.intent) || 0;
      const intentToAdd = parseInt(intent_gained) || 0;
      const newIntent = currentIntent + intentToAdd;
      character.intent = newIntent;
      // Character intent updated
    }

    // Check for level up
    let leveledUp = false;
    let oldLevel = character.level;
    while (character.canLevelUp() && character.level < 100) {
      character.levelUp();
      leveledUp = true;
    }

    // Save changes
    const saveResult = await character.save();
    // Character saved successfully

    if (leveledUp) {
      // Character leveled up
    }

    // Leaderboard güncelleme - sadece önemli değişikliklerde
    if (xp_gained > 0 || intent_gained > 0 || leveledUp) {
      try {
        const { io } = require('../../server');
        
        // Level ve Gold leaderboard'larını güncelle
        if (xp_gained > 0 || leveledUp) {
          const levelQuery = `
            SELECT 
              c.name,
              c.race,
              c.class,
              c.level,
              c.experience,
              ROW_NUMBER() OVER (ORDER BY c.level DESC, c.experience DESC) as rank
            FROM characters c
            ORDER BY c.level DESC, c.experience DESC
            LIMIT 50
          `;
          const [levelLeaderboard] = await sequelize.query(levelQuery);
          
          io.emit('leaderboardUpdate', {
            type: 'level',
            leaderboard: levelLeaderboard,
            timestamp: new Date()
          });
        }
        
        if (intent_gained > 0) {
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
        }
        
        // Leaderboards updated
      } catch (error) {
        console.error('❌ Error updating leaderboards:', error);
      }
    }

    res.json({
      success: true,
      message: 'Rewards applied successfully',
      rewards: {
        xp_gained,
        intent_gained,
        items_collected,
        enemies_defeated
      },
      character: {
        level: character.level,
        experience: character.experience,
        intent: character.intent,
        leveledUp,
        oldLevel: leveledUp ? oldLevel : character.level
      }
    });

  } catch (error) {
    console.error('Apply rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper functions
function generateStory(type, character) {
  const storyTemplates = {
    random: [
      `${character.name} the ${character.race} ${character.class} discovered an ancient artifact in the ${character.current_region}.`,
      `During a peaceful moment, ${character.name} reflected on their journey as a ${character.race} ${character.class}.`,
      `${character.name} encountered a mysterious stranger who spoke of ancient prophecies.`
    ],
    dungeon: [
      `${character.name} descended into the dark depths of an ancient dungeon, torch in hand.`,
      `The ${character.race} ${character.class} navigated treacherous corridors filled with traps and monsters.`
    ],
    wilderness: [
      `${character.name} ventured into the untamed wilderness of the ${character.current_region}.`,
      `As a ${character.race} ${character.class}, ${character.name} felt at home in nature's embrace.`
    ],
    city: [
      `${character.name} walked through the bustling streets of a grand city.`,
      `The ${character.race} ${character.class} observed the diverse crowd of merchants and travelers.`
    ],
    mystical: [
      `${character.name} witnessed a mystical phenomenon that defied explanation.`,
      `Ancient magic stirred around the ${character.race} ${character.class}.`
    ]
  };

  const templates = storyTemplates[type] || storyTemplates.random;
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    type: type,
    content: randomTemplate,
    character: {
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level
    }
  };
}

function generateBoss(region, characterLevel) {
  const bosses = {
    forest: ['Ancient Treant', 'Shadow Wolf Alpha', 'Corrupted Dryad'],
    mountain: ['Stone Giant', 'Dragon Wyrmling', 'Frost Troll'],
    desert: ['Sand Worm', 'Mummy Lord', 'Fire Elemental']
  };

  const regionBosses = bosses[region] || bosses.forest;
  const bossName = regionBosses[Math.floor(Math.random() * regionBosses.length)];
  
  return {
    name: bossName,
    level: characterLevel + Math.floor(Math.random() * 3) + 1,
    region: region,
    health: (characterLevel + 5) * 20,
    attack: characterLevel * 3 + 10
  };
}

function calculateBossFight(character, boss) {
  // Simple combat calculation
  const characterPower = character.level * 10 + character.strength + character.dexterity + character.constitution;
  const bossPower = boss.level * 12 + boss.attack;
  
  const successRate = Math.max(0.2, Math.min(0.9, characterPower / bossPower));
  const isVictory = Math.random() < successRate;
  
  if (isVictory) {
    const xpReward = Math.floor((boss.level * 50 + Math.floor(Math.random() * 50))); // Reduced from 100 to 50
    const intentReward = Math.floor((boss.level * 25 + Math.floor(Math.random() * 25))); // Reduced from 50 to 25
    
    return {
      victory: true,
      message: `Victory! You defeated the ${boss.name}!`,
      xp_gained: xpReward,
      intent_gained: intentReward
    };
  } else {
    const xpReward = Math.floor(boss.level * 10); // Reduced from 20 to 10
    
    return {
      victory: false,
      message: `Defeat! The ${boss.name} was too powerful, but you gained some experience.`,
      xp_gained: xpReward,
      intent_gained: 0
    };
  }
}

module.exports = router;