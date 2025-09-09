const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database/connection');

const Quest = sequelize.define('Quest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['forest', 'mountain', 'desert', 'underdark', 'astral', 'city', 'plains', 'swamp', 'tundra', 'volcano']]
    }
  },
  difficulty: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['easy', 'medium', 'hard']]
    }
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  intent_reward: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  level_requirement: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  alignment_requirement: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'quests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Calculate quest rewards based on difficulty and character level
Quest.prototype.calculateRewards = function(characterLevel) {
  const difficultyMultipliers = {
    easy: 0.6,
    medium: 1.0,
    hard: 1.3
  };
  
  const multiplier = difficultyMultipliers[this.difficulty] || 1.0;
  // Removed level bonus multiplier - it was causing excessive XP gains
  
  return {
    xp: Math.floor(this.xp_reward * multiplier),
    intent: Math.floor(this.intent_reward * multiplier)
  };
};

// Check if character can start this quest
Quest.prototype.canBeStartedBy = function(character) {
  // Level requirement
  if (character.level < this.level_requirement) {
    return { canStart: false, reason: 'Level too low' };
  }
  
  // Alignment requirement
  if (this.alignment_requirement && character.alignment !== this.alignment_requirement) {
    return { canStart: false, reason: 'Alignment requirement not met' };
  }
  
  return { canStart: true };
};

// Generate random quest outcome
Quest.prototype.generateOutcome = function(character) {
  const baseSuccessRate = 0.5; // 50% base success rate (reduced from 70%)
  
  // Difficulty modifiers
  const difficultyModifiers = {
    easy: 0.2,
    medium: 0.0,
    hard: -0.2
  };
  
  // Level difference modifier (reduced bonus)
  const levelDiff = character.level - this.level_requirement;
  const levelModifier = Math.min(levelDiff * 0.02, 0.2); // Max 20% bonus (reduced from 30%)
  
  const successRate = Math.max(0.1, baseSuccessRate + difficultyModifiers[this.difficulty] + levelModifier);
  const isSuccess = Math.random() < successRate;
  
  // Calculate rewards
  const rewards = this.calculateRewards(character.level);
  
  // Reduce rewards on failure
  if (!isSuccess) {
    rewards.xp = Math.floor(rewards.xp * 0.3);
    rewards.intent = Math.floor(rewards.intent * 0.2);
  }
  
  // Check for item drops (60% chance)
  const itemDrop = Math.random() < 0.6;
  
  // Check for Anomage encounter (15% chance)
  const anomageEncounter = Math.random() < 0.15;
  
  return {
    success: isSuccess,
    xp_gained: rewards.xp,
    intent_gained: rewards.intent,
    item_drop: itemDrop,
    anomage_encounter: anomageEncounter,
    message: isSuccess ? 'Quest completed successfully!' : 'Quest failed, but you gained some experience.'
  };
};

module.exports = Quest;
