const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // One character per user
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  race: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [[
        // Standard races
        'human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'gnome', 'half-elf', 'half-orc',
        // Underdark races
        'drow', 'duergar', 'svirfneblin', 'derro', 'quaggoth',
        // Astral plane races
        'aasimar', 'kalashtar', 'githzerai', 'sylph', 'starborn',
        // Other planar races
        'githyanki'
      ]]
    }
  },
  class: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [[
        // Standard classes
        'warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin', 'warlock', 'bard', 'monk', 'druid',
        // Underdark classes
        'shadowmancer', 'voidpriest', 'gloomhunter', 'crystalsmith', 'mindflayer',
        // Astral plane classes
        'astral monk', 'planar mage', 'dream walker', 'star weaver', 'mind sage'
      ]]
    }
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 100
    }
  },
  experience: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  gold: {
    type: DataTypes.BIGINT,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 999999999999 // Maximum safe value
    }
  },
  intent: {
    type: DataTypes.BIGINT,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 999999999999 // Maximum safe value
    }
  },
  health: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  racial_currency: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  alignment: {
    type: DataTypes.STRING(20),
    defaultValue: 'neutral',
    validate: {
      isIn: [['lawful_good', 'neutral_good', 'chaotic_good', 'lawful_neutral', 'neutral', 'chaotic_neutral', 'lawful_evil', 'neutral_evil', 'chaotic_evil']]
    }
  },
  
  // Stats
  strength: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 30 }
  },
  dexterity: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 30 }
  },
  constitution: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 30 }
  },
  intelligence: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 30 }
  },
  wisdom: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 30 }
  },
  charisma: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1, max: 30 }
  },
  
  // Position
  current_region: {
    type: DataTypes.STRING(20),
    defaultValue: 'forest'
  },
  position_x: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  position_y: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  
  // Progress tracking for pet unlock requirements
  quests_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  regions_explored: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  herbs_gathered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  stealth_missions_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  crystals_mined: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  fire_spells_cast: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  shadow_creatures_defeated: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  wisdom_quests_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  deaths_and_resurrections: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  astral_regions_explored: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  trees_planted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  
  // Timestamps
  last_daily: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_work: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'characters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Calculate total XP required for a specific level (Cumulative formula) - HARDER SYSTEM
Character.prototype.getXpForLevel = function(level) {
  if (level <= 1) return 0;
  
  // Calculate cumulative XP required for each level
  let totalXp = 0;
  
  // Level 1-10: 500 * level² (cumulative) - MUCH HARDER
  for (let i = 1; i <= Math.min(level, 10); i++) {
    totalXp += i * i * 500;
  }
  
  // Level 11-20: 1000 * level² (cumulative)
  if (level > 10) {
    for (let i = 11; i <= Math.min(level, 20); i++) {
      totalXp += i * i * 1000;
    }
  }
  
  // Level 21-30: 1500 * level² (cumulative)
  if (level > 20) {
    for (let i = 21; i <= Math.min(level, 30); i++) {
      totalXp += i * i * 1500;
    }
  }
  
  // Level 31-40: 2000 * level² (cumulative)
  if (level > 30) {
    for (let i = 31; i <= Math.min(level, 40); i++) {
      totalXp += i * i * 2000;
    }
  }
  
  // Level 41-50: 2500 * level² (cumulative)
  if (level > 40) {
    for (let i = 41; i <= Math.min(level, 50); i++) {
      totalXp += i * i * 2500;
    }
  }
  
  // Level 51-60: 3000 * level² (cumulative)
  if (level > 50) {
    for (let i = 51; i <= Math.min(level, 60); i++) {
      totalXp += i * i * 3000;
    }
  }
  
  // Level 61-70: 3500 * level² (cumulative)
  if (level > 60) {
    for (let i = 61; i <= Math.min(level, 70); i++) {
      totalXp += i * i * 3500;
    }
  }
  
  // Level 71-80: 4000 * level² (cumulative)
  if (level > 70) {
    for (let i = 71; i <= Math.min(level, 80); i++) {
      totalXp += i * i * 4000;
    }
  }
  
  // Level 81-90: 4500 * level² (cumulative)
  if (level > 80) {
    for (let i = 81; i <= Math.min(level, 90); i++) {
      totalXp += i * i * 4500;
    }
  }
  
  // Level 91-100: 5000 * level² (cumulative)
  if (level > 90) {
    for (let i = 91; i <= level; i++) {
      totalXp += i * i * 5000;
    }
  }
  
  return totalXp;
};

// Calculate total XP required for next level
Character.prototype.getRequiredXp = function() {
  return this.getXpForLevel(this.level + 1);
};

// Check if character can level up
Character.prototype.canLevelUp = function() {
  const requiredXp = this.getRequiredXp();
  const currentXP = parseInt(this.experience) || 0;
  return currentXP >= requiredXp && this.level < 100;
};

// Level up character
Character.prototype.levelUp = function() {
  if (this.canLevelUp() && this.level < 100) {
    this.level += 1;
    // Add stat bonuses based on race/class
    this.applyLevelUpBonuses();
    return true;
  }
  return false;
};

// Apply racial and class bonuses on level up
Character.prototype.applyLevelUpBonuses = function() {
  // Racial bonuses
  const racialBonuses = {
    human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    elf: { dexterity: 2, intelligence: 1 },
    dwarf: { constitution: 2, strength: 1 },
    orc: { strength: 2, constitution: 1 },
    // Add more racial bonuses...
  };
  
  // Class bonuses
  const classBonuses = {
    warrior: { strength: 2, constitution: 1 },
    mage: { intelligence: 2, wisdom: 1 },
    rogue: { dexterity: 2, charisma: 1 },
    // Add more class bonuses...
  };
  
  const raceBonus = racialBonuses[this.race] || {};
  const classBonus = classBonuses[this.class] || {};
  
  // Apply bonuses
  Object.keys(raceBonus).forEach(stat => {
    this[stat] = Math.min(this[stat] + Math.floor(raceBonus[stat] / 2), 30);
  });
  
  Object.keys(classBonus).forEach(stat => {
    this[stat] = Math.min(this[stat] + Math.floor(classBonus[stat] / 2), 30);
  });
};

// Get active pet and its bonuses
Character.prototype.getActivePet = async function() {
  const { sequelize } = require('../config/database/connection');
  
  try {
    const activePet = await sequelize.query(`
      SELECT p.name, p.type, p.rarity, p.base_stats, p.special_ability, cp.level, cp.happiness
      FROM character_pets cp
      JOIN pets p ON cp.pet_id = p.id
      WHERE cp.character_id = ? AND cp.is_active = true
    `, {
      replacements: [this.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    return activePet[0] || null;
  } catch (error) {
    console.error('Error getting active pet:', error);
    return null;
  }
};

// Get total stats including equipped item bonuses and pet bonuses
Character.prototype.getTotalStats = async function() {
  const { sequelize } = require('../config/database/connection');
  
  try {
    // Get equipped items and their bonuses
    const equippedItems = await sequelize.query(`
      SELECT i.strength_bonus, i.dexterity_bonus, i.constitution_bonus,
             i.intelligence_bonus, i.wisdom_bonus, i.charisma_bonus
      FROM character_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.character_id = ? AND ci.equipped = true
    `, {
      replacements: [this.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Calculate total bonuses from equipped items
    const itemBonuses = (equippedItems || []).reduce((bonuses, item) => {
      bonuses.strength += item.strength_bonus || 0;
      bonuses.dexterity += item.dexterity_bonus || 0;
      bonuses.constitution += item.constitution_bonus || 0;
      bonuses.intelligence += item.intelligence_bonus || 0;
      bonuses.wisdom += item.wisdom_bonus || 0;
      bonuses.charisma += item.charisma_bonus || 0;
      return bonuses;
    }, { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 });
    
    // Get active pet and its bonuses
    const activePet = await this.getActivePet();
    let petBonuses = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };
    
    if (activePet && activePet.base_stats) {
      try {
        const petStats = typeof activePet.base_stats === 'string' 
          ? JSON.parse(activePet.base_stats) 
          : activePet.base_stats;
        
        // Apply pet level multiplier (pet stats increase with level)
        const levelMultiplier = 1 + (activePet.level - 1) * 0.1; // 10% increase per level
        
        petBonuses = {
          strength: Math.floor((petStats.strength || 0) * levelMultiplier),
          dexterity: Math.floor((petStats.dexterity || 0) * levelMultiplier),
          constitution: Math.floor((petStats.constitution || 0) * levelMultiplier),
          intelligence: Math.floor((petStats.intelligence || 0) * levelMultiplier),
          wisdom: Math.floor((petStats.wisdom || 0) * levelMultiplier),
          charisma: Math.floor((petStats.charisma || 0) * levelMultiplier)
        };
        

      } catch (error) {
        console.error('Error parsing pet stats:', error);
      }
    }
    
    // Return base stats + item bonuses + pet bonuses
    const totalStats = {
      strength: this.strength + itemBonuses.strength + petBonuses.strength,
      dexterity: this.dexterity + itemBonuses.dexterity + petBonuses.dexterity,
      constitution: this.constitution + itemBonuses.constitution + petBonuses.constitution,
      intelligence: this.intelligence + itemBonuses.intelligence + petBonuses.intelligence,
      wisdom: this.wisdom + itemBonuses.wisdom + petBonuses.wisdom,
      charisma: this.charisma + itemBonuses.charisma + petBonuses.charisma
    };
    
    return totalStats;
  } catch (error) {
    console.error('Error in getTotalStats:', error);
    // Return base stats if there's an error
    const baseStats = {
      strength: this.strength,
      dexterity: this.dexterity,
      constitution: this.constitution,
      intelligence: this.intelligence,
      wisdom: this.wisdom,
      charisma: this.charisma
    };
    return baseStats;
  }
};

// Get combat power including equipped item bonuses
Character.prototype.getCombatPower = async function() {
  try {
    console.log('🔍 getCombatPower called for character:', this.name);
    console.log('🔍 Base stats - strength:', this.strength, 'dexterity:', this.dexterity, 'level:', this.level);
    
    const totalStats = await this.getTotalStats();
    console.log('🔍 Total stats with bonuses:', totalStats);
    
    const combatPower = totalStats.strength + totalStats.dexterity + this.level;
    console.log('🔍 Calculated combat power:', combatPower);
    
    return combatPower;
  } catch (error) {
    console.error('Error in getCombatPower:', error);
    // Return base combat power if there's an error
    const basePower = this.strength + this.dexterity + this.level;
    console.log('🔍 Returning base combat power due to error:', basePower);
    return basePower;
  }
};

module.exports = Character;
