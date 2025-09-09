const { sequelize } = require('../config/database/connection');
const User = require('./User');
const Character = require('./Character');
const Item = require('./Item');
const Quest = require('./Quest');
const Region = require('./Region');
const Pet = require('./Pet');
const CharacterPet = require('./CharacterPet');
const ShrimpFarm = require('./ShrimpFarm');

// Define associations
User.hasOne(Character, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Character.belongsTo(User, { 
  foreignKey: 'user_id'
});

Character.belongsToMany(Item, {
  through: 'character_items',
  foreignKey: 'character_id',
  otherKey: 'item_id',
  as: 'inventory'
});

Item.belongsToMany(Character, {
  through: 'character_items',
  foreignKey: 'item_id',
  otherKey: 'character_id'
});

Character.belongsToMany(Quest, {
  through: 'character_quests',
  foreignKey: 'character_id',
  otherKey: 'quest_id',
  as: 'completedQuests'
});

Quest.belongsToMany(Character, {
  through: 'character_quests',
  foreignKey: 'quest_id',
  otherKey: 'character_id'
});

// Pet associations
Character.belongsToMany(Pet, {
  through: CharacterPet,
  foreignKey: 'character_id',
  otherKey: 'pet_id',
  as: 'pets'
});

Pet.belongsToMany(Character, {
  through: CharacterPet,
  foreignKey: 'pet_id',
  otherKey: 'character_id',
  as: 'owners'
});

CharacterPet.belongsTo(Character, {
  foreignKey: 'character_id'
});

CharacterPet.belongsTo(Pet, {
  foreignKey: 'pet_id',
  as: 'pet'
});

// Shrimp Farm associations
Character.hasOne(ShrimpFarm, {
  foreignKey: 'character_id',
  onDelete: 'CASCADE'
});

ShrimpFarm.belongsTo(Character, {
  foreignKey: 'character_id'
});

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Skip sync since we use manual SQL schema
    console.log('✅ Database models loaded. Using manual SQL schema.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Character,
  Item,
  Quest,
  Region,
  Pet,
  CharacterPet,
  ShrimpFarm,
  initializeDatabase
};
