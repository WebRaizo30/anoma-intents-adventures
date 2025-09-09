const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const Region = sequelize.define('Region', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  display_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  difficulty_modifier: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
    validate: {
      min: 0.1,
      max: 5.0
    }
  },
  
  // Map configuration
  map_width: {
    type: DataTypes.INTEGER,
    defaultValue: 800
  },
  map_height: {
    type: DataTypes.INTEGER,
    defaultValue: 600
  },
  spawn_x: {
    type: DataTypes.FLOAT,
    defaultValue: 400
  },
  spawn_y: {
    type: DataTypes.FLOAT,
    defaultValue: 300
  }
}, {
  tableName: 'regions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Get spawn position for new players
Region.prototype.getSpawnPosition = function() {
  return {
    x: this.spawn_x,
    y: this.spawn_y
  };
};

// Check if position is within region bounds
Region.prototype.isValidPosition = function(x, y) {
  return x >= 0 && x <= this.map_width && y >= 0 && y <= this.map_height;
};

// Get region-specific currency name
Region.prototype.getRacialCurrency = function(race) {
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
};

module.exports = Region;
