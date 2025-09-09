const express = require('express');
const { Character, Quest, Item, CharacterPet } = require('../../models');
const authMiddleware = require('../../middleware/auth');
const { Op } = require('sequelize');

// Helper function to give pet experience and level up
async function givePetExperience(characterId, petId, experienceGained) {
  try {
    const characterPet = await CharacterPet.findOne({
      where: { character_id: characterId, pet_id: petId }
    });

    if (characterPet) {
      const newExperience = characterPet.experience + experienceGained;
      const newLevel = Math.floor(newExperience / 100) + 1; // 100 XP per level
      
      await characterPet.update({
        experience: newExperience,
        level: newLevel
      });

      return { leveledUp: newLevel > characterPet.level, newLevel };
    }
  } catch (error) {
    console.error('Error giving pet experience:', error);
  }
  return { leveledUp: false, newLevel: 1 };
}

const router = express.Router();

// Start a quest
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { difficulty = 'medium', region } = req.body;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Find available quests
    const questQuery = {
      difficulty: difficulty,
      level_requirement: {
        [Op.lte]: character.level
      }
    };

    if (region) {
      questQuery.region = region;
    } else {
      questQuery.region = character.current_region;
    }

    // Check alignment requirement if exists
    const availableQuests = await Quest.findAll({
      where: {
        ...questQuery,
        [Op.or]: [
          { alignment_requirement: null },
          { alignment_requirement: character.alignment }
        ]
      }
    });

    if (availableQuests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No suitable quests available for your level and alignment'
      });
    }

    // Select random quest
    const selectedQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];

    // Generate quest outcome
    const outcome = selectedQuest.generateOutcome(character);

    // Apply pet bonuses to quest rewards
    const activePet = await character.getActivePet();
    let finalXpGained = parseInt(outcome.xp_gained) || 0;
    let finalIntentGained = parseInt(outcome.intent_gained) || 0;
    let petMessages = [];

    if (activePet && activePet.special_ability) {
      const ability = activePet.special_ability.toLowerCase();
      
      // Ancient Knowledge: +50% XP from quests
      if (ability.includes('ancient knowledge')) {
        const xpBonus = Math.floor(finalXpGained * 0.5);
        finalXpGained += xpBonus;
        petMessages.push(`🐢 ${activePet.name}'s Ancient Knowledge added ${xpBonus} bonus XP!`);
      }
      
      // Intent Mastery: All actions have 25% chance to succeed perfectly
      if (ability.includes('intent mastery')) {
        if (Math.random() < 0.25) {
          finalIntentGained = Math.floor(finalIntentGained * 1.5);
          petMessages.push(`✨ ${activePet.name}'s Intent Mastery doubled your intent reward!`);
        }
      }
      
      // Herb Finder: +20% potion effectiveness (for future potion system)
      if (ability.includes('herb finder')) {
        // This will be implemented when potion system is added
        petMessages.push(`🐍 ${activePet.name}'s Herb Finder is ready for potion crafting!`);
      }
    }

    // Update character
    const oldExperience = character.experience;
    const oldLevel = character.level;
    
    // Ensure XP values are numbers to prevent string concatenation
    const currentXP = parseInt(character.experience) || 0;
    character.experience = currentXP + finalXpGained;
    
    // Ensure intent is a number and add quest reward
    const currentIntent = parseInt(character.intent) || 0;
    character.intent = currentIntent + finalIntentGained;

    // Quest XP Update processed

    // Check for level up
    let leveledUp = false;
    while (character.canLevelUp() && character.level < 100) {
      const oldLvl = character.level;
      character.levelUp();
      // Level up
      leveledUp = true;
    }

    // Give experience to active pet
    if (activePet) {
      const petExpGained = outcome.success ? Math.floor(Math.random() * 3) + 1 : 1; // 1-3 XP for success, 1 for failure
      const petLevelResult = await givePetExperience(character.id, activePet.id, petExpGained);
      
      if (petLevelResult.leveledUp) {
        const levelUpMessage = `🎉 ${activePet.name} reached level ${petLevelResult.newLevel}!`;
        petMessages.push(levelUpMessage);
      }
    }

    await character.save();
    // Character saved with updated stats

    // Handle item drops
    let itemDropped = null;
    if (outcome.item_drop) {
      // Get random item appropriate for character level
      const availableItems = await Item.findAll({
        where: {
          level_requirement: {
            [Op.lte]: character.level
          },
          [Op.or]: [
            { race_requirement: null },
            { race_requirement: character.race }
          ],
          [Op.or]: [
            { class_requirement: null },
            { class_requirement: character.class }
          ]
        }
      });

      if (availableItems.length > 0) {
        itemDropped = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        // Add item to character inventory (we'll implement this in inventory routes)
        // For now, just return the item info
      }
    }

    // Record quest completion
    const { sequelize } = require('../../config/database/connection');
    await sequelize.query(
      'INSERT INTO character_quests (character_id, quest_id, status, completed_at, xp_gained, intent_gained, items_gained) VALUES (?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          character.id,
          selectedQuest.id,
          outcome.success ? 'completed' : 'failed',
          new Date(),
          outcome.xp_gained,
          outcome.intent_gained,
          JSON.stringify(itemDropped ? [itemDropped.id] : [])
        ]
      }
    );

    // Leaderboard güncelleme - quest completion ve level/intent değişiklikleri için
    if (outcome.success || outcome.xp_gained > 0 || outcome.intent_gained > 0 || leveledUp) {
      try {
        const { io } = require('../../server');
        
        // Quest leaderboard güncelleme
        if (outcome.success) {
          const questQuery = `
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
            LIMIT 50
          `;
          const [questLeaderboard] = await sequelize.query(questQuery);
          
          io.emit('leaderboardUpdate', {
            type: 'quests',
            leaderboard: questLeaderboard,
            timestamp: new Date()
          });
        }
        
        // Level leaderboard güncelleme
        if (outcome.xp_gained > 0 || leveledUp) {
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
        
        // Intent leaderboard güncelleme
        if (outcome.intent_gained > 0) {
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
        
        // Leaderboards updated for quest completion
      } catch (error) {
        console.error('❌ Error updating leaderboards after quest:', error);
      }
    }

    res.json({
      success: true,
      quest: {
        name: selectedQuest.name,
        description: selectedQuest.description,
        difficulty: selectedQuest.difficulty,
        region: selectedQuest.region
      },
      outcome: {
        success: outcome.success,
        xp_gained: finalXpGained,
        intent_gained: finalIntentGained,
        leveledUp,
        newLevel: character.level,
        itemDropped: itemDropped ? {
          name: itemDropped.name,
          category: itemDropped.category,
          rarity: itemDropped.rarity
        } : null
      },
      character: {
        level: character.level,
        experience: character.experience,
        intent: character.intent
      },
      petMessages: petMessages
    });

  } catch (error) {
    console.error('Quest start error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get available quests for current region
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const { region, difficulty } = req.query;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    const questQuery = {
      level_requirement: {
        [Op.lte]: character.level
      }
    };

    if (region) {
      questQuery.region = region;
    } else {
      questQuery.region = character.current_region;
    }

    if (difficulty) {
      questQuery.difficulty = difficulty;
    }

    const quests = await Quest.findAll({
      where: {
        ...questQuery,
        [Op.or]: [
          { alignment_requirement: null },
          { alignment_requirement: character.alignment }
        ]
      },
      order: [['difficulty', 'ASC'], ['level_requirement', 'ASC']]
    });

    // Calculate rewards for each quest
    const questsWithRewards = quests.map(quest => {
      const rewards = quest.calculateRewards(character.level);
      return {
        ...quest.toJSON(),
        calculated_rewards: rewards
      };
    });

    res.json({
      success: true,
      quests: questsWithRewards,
      region: region || character.current_region,
      characterLevel: character.level
    });

  } catch (error) {
    console.error('Get available quests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get quest history
router.get('/history', authMiddleware, async (req, res) => {
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

    const { sequelize } = require('../../config/database/connection');
    const [questHistory] = await sequelize.query(`
      SELECT 
        cq.*,
        q.name as quest_name,
        q.description as quest_description,
        q.region,
        q.difficulty
      FROM character_quests cq
      JOIN quests q ON cq.quest_id = q.id
      WHERE cq.character_id = ?
      ORDER BY cq.completed_at DESC
      LIMIT 50
    `, {
      replacements: [character.id]
    });

    res.json({
      success: true,
      questHistory: questHistory
    });

  } catch (error) {
    console.error('Quest history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get quest statistics
router.get('/stats', authMiddleware, async (req, res) => {
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

    const { sequelize } = require('../../config/database/connection');
    
    // Get quest statistics
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_quests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_quests,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_quests,
        SUM(xp_gained) as total_xp_from_quests,
        SUM(intent_gained) as total_intent_from_quests,
        COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_quests,
        COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_quests,
        COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_quests
      FROM character_quests cq
      JOIN quests q ON cq.quest_id = q.id
      WHERE cq.character_id = ?
    `, {
      replacements: [character.id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      stats: stats[0] || {
        total_quests: 0,
        completed_quests: 0,
        failed_quests: 0,
        total_xp_from_quests: 0,
        total_intent_from_quests: 0,
        easy_quests: 0,
        medium_quests: 0,
        hard_quests: 0
      }
    });

  } catch (error) {
    console.error('Quest stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
