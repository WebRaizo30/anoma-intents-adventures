const express = require('express');
const router = express.Router();
const { Character, ShrimpFarm } = require('../models');
const auth = require('../middleware/auth');

// Get shrimp farm info
router.get('/', auth, async (req, res) => {
  try {
    // GET /api/shrimp request
    
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    // Character lookup completed

    if (!character) {
      // Character not found for user
      return res.json({ success: false, message: 'Character not found' });
    }

    let shrimpFarm = await ShrimpFarm.findOne({
      where: { character_id: character.id }
    });

    // Existing shrimp farm lookup completed

    // Create farm if doesn't exist
    if (!shrimpFarm) {
      // Creating new shrimp farm for character
      shrimpFarm = await ShrimpFarm.create({
        character_id: character.id,
        name: `${character.name}'s Shrimp Farm`
      });
      // New shrimp farm created
    }

    // Apply daily decay if needed
    const now = new Date();
    const lastMaintenance = shrimpFarm.last_maintenance || shrimpFarm.created_at;
    const daysSince = Math.floor((now - lastMaintenance) / (1000 * 60 * 60 * 24));
    
    // Days since last maintenance calculated
    
    if (daysSince > 0) {
      for (let i = 0; i < daysSince; i++) {
        shrimpFarm.applyDailyDecay();
      }
      await shrimpFarm.save();
      // Applied daily decay
    }

    const responseData = {
      success: true,
      farm: {
        id: shrimpFarm.id,
        name: shrimpFarm.name,
        level: shrimpFarm.level,
        tank_capacity: shrimpFarm.tank_capacity,
        current_shrimp: shrimpFarm.current_shrimp,
        water_quality: shrimpFarm.water_quality,
        food_level: shrimpFarm.food_level,
        total_harvested: shrimpFarm.total_harvested,
        experience: shrimpFarm.experience,
        can_level_up: shrimpFarm.canLevelUp(),
        shrimp_value: shrimpFarm.getShrimpValue(),
        harvest_yield: shrimpFarm.calculateHarvest()
      }
    };

    // Sending response
    res.json(responseData);

  } catch (error) {
    console.error('🦐 Get shrimp farm error:', error);
    console.error('🦐 Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to get farm info' });
  }
});

// Buy shrimp juveniles
router.post('/buy-shrimp', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1 || quantity > 50) {
      return res.json({ success: false, message: 'Invalid quantity (1-50)' });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const shrimpFarm = await ShrimpFarm.findOne({
      where: { character_id: character.id }
    });

    if (!shrimpFarm) {
      return res.json({ success: false, message: 'Shrimp farm not found' });
    }

    // Check capacity
    if (shrimpFarm.current_shrimp + quantity > shrimpFarm.tank_capacity) {
      return res.json({ 
        success: false, 
        message: `Tank capacity exceeded. Max: ${shrimpFarm.tank_capacity}` 
      });
    }

    // Check cost (25 intent per juvenile)
    const cost = quantity * 25;
    const currentIntent = parseInt(character.intent) || 0;
    
    if (currentIntent < cost) {
      return res.json({ 
        success: false, 
        message: `Insufficient intent. Need: ${cost}, Have: ${currentIntent}` 
      });
    }

    // Process purchase
    character.intent = currentIntent - cost;
    shrimpFarm.current_shrimp += quantity;
    
    await character.save();
    await shrimpFarm.save();

    res.json({
      success: true,
      message: `Purchased ${quantity} shrimp juveniles for ${cost} intent`,
      farm: {
        current_shrimp: shrimpFarm.current_shrimp,
        tank_capacity: shrimpFarm.tank_capacity
      },
      character: {
        intent: character.intent
      }
    });

  } catch (error) {
    console.error('Buy shrimp error:', error);
    res.status(500).json({ success: false, message: 'Failed to buy shrimp' });
  }
});

// Harvest shrimp
router.post('/harvest', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const shrimpFarm = await ShrimpFarm.findOne({
      where: { character_id: character.id }
    });

    if (!shrimpFarm) {
      return res.json({ success: false, message: 'Shrimp farm not found' });
    }

    // Check if harvest is available (minimum 6 hours)
    const now = new Date();
    const lastHarvest = shrimpFarm.last_harvest || new Date(0);
    const hoursSince = (now - lastHarvest) / (1000 * 60 * 60);
    
    if (hoursSince < 6) {
      const remainingHours = Math.ceil(6 - hoursSince);
      return res.json({ 
        success: false, 
        message: `Harvest available in ${remainingHours} hours` 
      });
    }

    const harvestYield = shrimpFarm.calculateHarvest();
    
    if (harvestYield === 0) {
      return res.json({ 
        success: false, 
        message: 'No shrimp ready for harvest' 
      });
    }

    // Calculate rewards
    const shrimpValue = shrimpFarm.getShrimpValue();
    const intentEarned = harvestYield * shrimpValue;
    const expGained = harvestYield * 10;

    // Update farm and character
    shrimpFarm.current_shrimp -= harvestYield;
    shrimpFarm.total_harvested += harvestYield;
    shrimpFarm.experience += expGained;
    shrimpFarm.last_harvest = now;

    const currentIntent = parseInt(character.intent) || 0;
    character.intent = currentIntent + intentEarned;

    // Check for level up
    let leveledUp = false;
    while (shrimpFarm.canLevelUp() && shrimpFarm.level < 20) {
      shrimpFarm.levelUp();
      leveledUp = true;
    }

    await character.save();
    await shrimpFarm.save();

    res.json({
      success: true,
      message: `Harvested ${harvestYield} shrimp for ${intentEarned} intent!`,
      harvest: {
        shrimp_harvested: harvestYield,
        intent_earned: intentEarned,
        experience_gained: expGained,
        leveled_up: leveledUp,
        new_level: shrimpFarm.level
      },
      farm: {
        level: shrimpFarm.level,
        current_shrimp: shrimpFarm.current_shrimp,
        total_harvested: shrimpFarm.total_harvested,
        experience: shrimpFarm.experience
      },
      character: {
        intent: character.intent
      }
    });

  } catch (error) {
    console.error('Harvest shrimp error:', error);
    res.status(500).json({ success: false, message: 'Failed to harvest shrimp' });
  }
});

// Feed shrimp (maintain food level)
router.post('/feed', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const shrimpFarm = await ShrimpFarm.findOne({
      where: { character_id: character.id }
    });

    if (!shrimpFarm) {
      return res.json({ success: false, message: 'Shrimp farm not found' });
    }

    // Cost: 10 intent per feeding
    const feedCost = 10;
    const currentIntent = parseInt(character.intent) || 0;
    
    if (currentIntent < feedCost) {
      return res.json({ 
        success: false, 
        message: `Insufficient intent. Need: ${feedCost}, Have: ${currentIntent}` 
      });
    }

    // Feed shrimp
    character.intent = currentIntent - feedCost;
    shrimpFarm.food_level = Math.min(100, shrimpFarm.food_level + 30);
    
    await character.save();
    await shrimpFarm.save();

    res.json({
      success: true,
      message: `Fed shrimp for ${feedCost} intent. Food level: ${shrimpFarm.food_level}%`,
      farm: {
        food_level: shrimpFarm.food_level
      },
      character: {
        intent: character.intent
      }
    });

  } catch (error) {
    console.error('Feed shrimp error:', error);
    res.status(500).json({ success: false, message: 'Failed to feed shrimp' });
  }
});

// Clean tank (maintain water quality)
router.post('/clean', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const shrimpFarm = await ShrimpFarm.findOne({
      where: { character_id: character.id }
    });

    if (!shrimpFarm) {
      return res.json({ success: false, message: 'Shrimp farm not found' });
    }

    // Cost: 15 intent per cleaning
    const cleanCost = 15;
    const currentIntent = parseInt(character.intent) || 0;
    
    if (currentIntent < cleanCost) {
      return res.json({ 
        success: false, 
        message: `Insufficient intent. Need: ${cleanCost}, Have: ${currentIntent}` 
      });
    }

    // Clean tank
    character.intent = currentIntent - cleanCost;
    shrimpFarm.water_quality = Math.min(100, shrimpFarm.water_quality + 40);
    shrimpFarm.last_maintenance = new Date();
    
    await character.save();
    await shrimpFarm.save();

    res.json({
      success: true,
      message: `Cleaned tank for ${cleanCost} intent. Water quality: ${shrimpFarm.water_quality}%`,
      farm: {
        water_quality: shrimpFarm.water_quality
      },
      character: {
        intent: character.intent
      }
    });

  } catch (error) {
    console.error('Clean tank error:', error);
    res.status(500).json({ success: false, message: 'Failed to clean tank' });
  }
});

module.exports = router;
