const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const CharacterPet = sequelize.define('CharacterPet', {
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
  pet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pets',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  happiness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  last_fed: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'character_pets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CharacterPet;
