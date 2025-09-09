const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const ShrimpFarm = sequelize.define('ShrimpFarm', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  character_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'characters',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'My Shrimp Farm'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 20
    }
  },
  tank_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  current_shrimp: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  water_quality: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  food_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  last_harvest: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_maintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_harvested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'shrimp_farms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Farm level up calculation
ShrimpFarm.prototype.canLevelUp = function() {
  const requiredExp = this.level * this.level * 100; // Level² × 100
  return this.experience >= requiredExp && this.level < 20;
};

ShrimpFarm.prototype.levelUp = function() {
  if (this.canLevelUp() && this.level < 20) {
    this.level += 1;
    this.tank_capacity += 5; // +5 capacity per level
    this.experience = 0; // Reset experience
    return true;
  }
  return false;
};

// Calculate harvest yield
ShrimpFarm.prototype.calculateHarvest = function() {
  const baseYield = Math.floor(this.current_shrimp * 0.3); // 30% harvest rate
  const qualityMultiplier = this.water_quality / 100;
  const foodMultiplier = this.food_level / 100;
  const levelBonus = this.level * 0.1;
  
  const finalYield = Math.floor(baseYield * qualityMultiplier * foodMultiplier * (1 + levelBonus));
  return Math.max(0, finalYield);
};

// Get shrimp market value
ShrimpFarm.prototype.getShrimpValue = function() {
  const baseValue = 50; // 50 gold per shrimp
  const qualityBonus = (this.water_quality - 50) / 100; // Quality bonus/penalty
  const levelBonus = this.level * 5; // +5 gold per level
  
  return Math.max(10, baseValue + (baseValue * qualityBonus) + levelBonus);
};

// Daily maintenance decay
ShrimpFarm.prototype.applyDailyDecay = function() {
  this.water_quality = Math.max(0, this.water_quality - 5);
  this.food_level = Math.max(0, this.food_level - 10);
  
  // Poor conditions affect shrimp health
  if (this.water_quality < 30 || this.food_level < 20) {
    const shrimpLoss = Math.floor(this.current_shrimp * 0.1); // 10% loss
    this.current_shrimp = Math.max(0, this.current_shrimp - shrimpLoss);
  }
};

module.exports = ShrimpFarm;
