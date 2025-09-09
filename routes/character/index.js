const express = require('express');
const { Character, User } = require('../../models');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

// Get character profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found. Create a character first.'
      });
    }

    // Calculate level progress
    const currentLevelXp = character.getXpForLevel(character.level);
    const nextLevelXp = character.getXpForLevel(character.level + 1);
    const progressXp = character.experience - currentLevelXp;
    const requiredXp = nextLevelXp - currentLevelXp;

    res.json({
      success: true,
      character: {
        ...character.toJSON(),
        levelProgress: {
          current: progressXp,
          required: requiredXp,
          percentage: Math.floor((progressXp / requiredXp) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new character
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, race, characterClass } = req.body;

    if (!name || !race || !characterClass) {
      return res.status(400).json({
        success: false,
        message: 'Name, race, and class are required'
      });
    }

    // Check if user already has a character
    const existingCharacter = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (existingCharacter) {
      return res.status(400).json({
        success: false,
        message: 'You already have a character. Only one character per user is allowed.'
      });
    }

    // Apply racial starting bonuses
    const racialBonuses = {
      human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
      elf: { dexterity: 2, intelligence: 2, wisdom: 1 },
      dwarf: { constitution: 3, strength: 2 },
      orc: { strength: 3, constitution: 2 },
      halfling: { dexterity: 2, charisma: 2, wisdom: 1 },
      dragonborn: { strength: 2, charisma: 2, constitution: 1 },
      tiefling: { charisma: 3, intelligence: 2 },
      gnome: { intelligence: 3, constitution: 1, wisdom: 1 },
      'half-elf': { charisma: 2, dexterity: 1, intelligence: 1, wisdom: 1 },
      'half-orc': { strength: 2, constitution: 2, charisma: 1 },
      // Underdark races
      drow: { dexterity: 2, intelligence: 2, charisma: 1 },
      duergar: { constitution: 2, wisdom: 2, strength: 1 },
      svirfneblin: { constitution: 2, wisdom: 2, dexterity: 1 },
      derro: { charisma: 3, intelligence: 1, wisdom: 1 },
      quaggoth: { strength: 4, constitution: 1 },
      // Astral plane races
      aasimar: { charisma: 3, wisdom: 2 },
      kalashtar: { wisdom: 3, charisma: 2 },
      githzerai: { wisdom: 3, dexterity: 2 },
      sylph: { dexterity: 3, intelligence: 2 },
      starborn: { intelligence: 3, wisdom: 2 },
      githyanki: { strength: 2, intelligence: 2, constitution: 1 }
    };

    // Apply class starting bonuses
    const classBonuses = {
      warrior: { strength: 3, constitution: 2 },
      mage: { intelligence: 3, wisdom: 2 },
      rogue: { dexterity: 3, charisma: 2 },
      cleric: { wisdom: 3, charisma: 2 },
      ranger: { dexterity: 2, wisdom: 2, constitution: 1 },
      paladin: { strength: 2, charisma: 2, constitution: 1 },
      warlock: { charisma: 3, intelligence: 2 },
      bard: { charisma: 3, dexterity: 2 },
      monk: { dexterity: 2, wisdom: 2, constitution: 1 },
      druid: { wisdom: 3, constitution: 2 },
      // Underdark classes
      shadowmancer: { intelligence: 3, dexterity: 2 },
      voidpriest: { wisdom: 3, charisma: 2 },
      gloomhunter: { dexterity: 3, wisdom: 2 },
      crystalsmith: { intelligence: 2, constitution: 2, strength: 1 },
      mindflayer: { intelligence: 4, wisdom: 1 },
      // Astral plane classes
      'astral monk': { wisdom: 3, dexterity: 2 },
      'planar mage': { intelligence: 3, wisdom: 2 },
      'dream walker': { wisdom: 3, charisma: 2 },
      'star weaver': { intelligence: 3, charisma: 2 },
      'mind sage': { intelligence: 4, wisdom: 1 }
    };

    // Calculate starting stats
    const baseStats = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
    const raceBonus = racialBonuses[race] || {};
    const classBonus = classBonuses[characterClass] || {};

    // Apply bonuses
    Object.keys(baseStats).forEach(stat => {
      baseStats[stat] += (raceBonus[stat] || 0) + (classBonus[stat] || 0);
      baseStats[stat] = Math.min(baseStats[stat], 20); // Cap at 20 for starting characters
    });

    // Create character
    const character = await Character.create({
      user_id: req.user.id,
      name,
      race,
      class: characterClass,
      ...baseStats
    });

    res.status(201).json({
      success: true,
      message: 'Character created successfully!',
      character: character.toJSON()
    });

  } catch (error) {
    console.error('Character creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during character creation'
    });
  }
});

// Change character race (costs 2500 gold)
router.put('/race', authMiddleware, async (req, res) => {
  try {
    const { newRace } = req.body;

    if (!newRace) {
      return res.status(400).json({
        success: false,
        message: 'New race is required'
      });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    if (character.intent < 2500) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient intent. Race change costs 2500 intent.'
      });
    }

    if (character.race === newRace) {
      return res.status(400).json({
        success: false,
        message: 'You are already this race'
      });
    }

    // Update race and deduct intent
    const currentIntent = parseInt(character.intent) || 0;
    character.race = newRace;
    character.intent = currentIntent - 2500;
    await character.save();

    res.json({
      success: true,
      message: `Race changed to ${newRace} successfully!`,
      character: character.toJSON()
    });

  } catch (error) {
    console.error('Race change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change character class (costs 2500 gold)
router.put('/class', authMiddleware, async (req, res) => {
  try {
    const { newClass } = req.body;

    if (!newClass) {
      return res.status(400).json({
        success: false,
        message: 'New class is required'
      });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    const currentIntent = parseInt(character.intent) || 0;
    if (currentIntent < 2500) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient intent. Class change costs 2500 intent.'
      });
    }

    if (character.class === newClass) {
      return res.status(400).json({
        success: false,
        message: 'You are already this class'
      });
    }

    // Update class and deduct intent
    character.class = newClass;
    character.intent = currentIntent - 2500;
    await character.save();

    res.json({
      success: true,
      message: `Class changed to ${newClass} successfully!`,
      character: character.toJSON()
    });

  } catch (error) {
    console.error('Class change error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update character position
router.put('/position', authMiddleware, async (req, res) => {
  try {
    const { region, x, y } = req.body;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Update position
    if (region) character.current_region = region;
    if (x !== undefined) character.position_x = x;
    if (y !== undefined) character.position_y = y;

    await character.save();

    res.json({
      success: true,
      character: {
        current_region: character.current_region,
        position_x: character.position_x,
        position_y: character.position_y
      }
    });

  } catch (error) {
    console.error('Position update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get available races and classes
router.get('/options', (req, res) => {
  const races = {
    standard: ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'gnome', 'half-elf', 'half-orc'],
    underdark: ['drow', 'duergar', 'svirfneblin', 'derro', 'quaggoth'],
    astral: ['aasimar', 'kalashtar', 'githzerai', 'sylph', 'starborn'],
    other: ['githyanki']
  };

  const classes = {
    standard: ['warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin', 'warlock', 'bard', 'monk', 'druid'],
    underdark: ['shadowmancer', 'voidpriest', 'gloomhunter', 'crystalsmith', 'mindflayer'],
    astral: ['astral monk', 'planar mage', 'dream walker', 'star weaver', 'mind sage']
  };

  res.json({
    success: true,
    races,
    classes
  });
});

module.exports = router;
