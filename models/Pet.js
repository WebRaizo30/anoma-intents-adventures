const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'companion'
  },
  rarity: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'common'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  special_ability: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  base_stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  unlock_requirement: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'pets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Pet;
