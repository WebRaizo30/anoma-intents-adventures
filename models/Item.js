const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['weapon', 'armor', 'accessory', 'consumable', 'material', 'tool', 'quest', 'treasure', 'special']]
    }
  },
  rarity: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical']]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  // Item stat bonuses
  strength_bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dexterity_bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  constitution_bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  intelligence_bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wisdom_bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  charisma_bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Requirements
  level_requirement: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  race_requirement: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  class_requirement: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Get rarity multiplier for value calculations
Item.prototype.getRarityMultiplier = function() {
  const multipliers = {
    common: 1,
    uncommon: 2,
    rare: 4,
    epic: 8,
    legendary: 16,
    mythical: 32
  };
  return multipliers[this.rarity] || 1;
};

// Check if character can use this item
Item.prototype.canBeUsedBy = function(character) {
  // Level requirement
  if (character.level < this.level_requirement) {
    return { canUse: false, reason: 'Level too low' };
  }
  
  // Race requirement
  if (this.race_requirement && character.race !== this.race_requirement) {
    return { canUse: false, reason: 'Race requirement not met' };
  }
  
  // Class requirement
  if (this.class_requirement && character.class !== this.class_requirement) {
    return { canUse: false, reason: 'Class requirement not met' };
  }
  
  return { canUse: true };
};

module.exports = Item;
