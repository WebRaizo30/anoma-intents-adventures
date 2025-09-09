const express = require('express');
const router = express.Router();
const { Character, Pet, CharacterPet, Item, CharacterItem } = require('../models');
const auth = require('../middleware/auth');

// Get character's pets
router.get('/', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const characterPets = await CharacterPet.findAll({
      where: { character_id: character.id },
      include: [{
        model: Pet,
        as: 'pet'
      }]
    });

    const pets = characterPets.map(cp => ({
      id: cp.pet.id,
      name: cp.pet.name,
      type: cp.pet.type,
      rarity: cp.pet.rarity,
      level: cp.level,
      experience: cp.experience,
      happiness: cp.happiness,
      is_active: cp.is_active,
      base_stats: cp.pet.base_stats,
      special_ability: cp.pet.special_ability,
      description: cp.pet.description
    }));

    res.json({
      success: true,
      pets,
      activePet: pets.find(p => p.is_active) || null
    });

  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ success: false, message: 'Failed to get pets' });
  }
});

// Get available pets to adopt
router.get('/available', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    // Get pets not owned by character
    const ownedPetIds = await CharacterPet.findAll({
      where: { character_id: character.id },
      attributes: ['pet_id']
    }).then(pets => pets.map(p => p.pet_id));

    const availablePets = await Pet.findAll({
      where: {
        id: { [require('sequelize').Op.notIn]: ownedPetIds }
      },
      limit: 10
    });

    // Check unlock requirements
    const petsWithRequirements = availablePets.map(pet => ({
      ...pet.toJSON(),
      canUnlock: checkUnlockRequirement(pet.unlock_requirement, character)
    }));

    res.json({
      success: true,
      availablePets: petsWithRequirements
    });

  } catch (error) {
    console.error('Get available pets error:', error);
    res.status(500).json({ success: false, message: 'Failed to get available pets' });
  }
});

// Adopt a pet
router.post('/adopt/:petId', auth, async (req, res) => {
  try {
    const { petId } = req.params;
    
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.json({ success: false, message: 'Pet not found' });
    }

    // Check if already owned
    const existing = await CharacterPet.findOne({
      where: { character_id: character.id, pet_id: petId }
    });

    if (existing) {
      return res.json({ success: false, message: 'You already own this pet' });
    }

    // Check unlock requirement
    if (!checkUnlockRequirement(pet.unlock_requirement, character)) {
      return res.json({ 
        success: false, 
        message: `Requirement not met: ${pet.unlock_requirement}` 
      });
    }

    // Adopt the pet
    await CharacterPet.create({
      character_id: character.id,
      pet_id: petId,
      level: 1,
      experience: 0,
      happiness: 100,
      is_active: false
    });

    res.json({
      success: true,
      message: `Successfully adopted ${pet.name}!`,
      pet: pet.toJSON()
    });

  } catch (error) {
    console.error('Adopt pet error:', error);
    res.status(500).json({ success: false, message: 'Failed to adopt pet' });
  }
});

// Set active pet
router.put('/active/:petId', auth, async (req, res) => {
  try {
    const { petId } = req.params;
    
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    // Deactivate all pets
    await CharacterPet.update(
      { is_active: false },
      { where: { character_id: character.id } }
    );

    // Activate selected pet
    const result = await CharacterPet.update(
      { is_active: true },
      { 
        where: { 
          character_id: character.id, 
          pet_id: petId 
        } 
      }
    );

    if (result[0] === 0) {
      return res.json({ success: false, message: 'Pet not found in your collection' });
    }

    const pet = await Pet.findByPk(petId);
    
    res.json({
      success: true,
      message: `${pet.name} is now your active pet!`,
      activePetId: petId
    });

  } catch (error) {
    console.error('Set active pet error:', error);
    res.status(500).json({ success: false, message: 'Failed to set active pet' });
  }
});

// Feed pet
router.post('/feed/:petId', auth, async (req, res) => {
  try {
    const { petId } = req.params;
    const { itemId } = req.body;
    
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    // Check if owns the pet
    const characterPet = await CharacterPet.findOne({
      where: { character_id: character.id, pet_id: petId },
      include: [{ model: Pet, as: 'pet' }]
    });

    if (!characterPet) {
      return res.json({ success: false, message: 'Pet not found' });
    }

    // Check if owns the food item
    const characterItem = await CharacterItem.findOne({
      where: { character_id: character.id, item_id: itemId, quantity: { [require('sequelize').Op.gt]: 0 } },
      include: [{ model: Item, as: 'item' }]
    });

    if (!characterItem || characterItem.item.category !== 'consumable') {
      return res.json({ success: false, message: 'Food item not found or invalid' });
    }

    // Apply food effects
    const effect = JSON.parse(characterItem.item.effect || '{}');
    let happinessGain = effect.pet_happiness || 10;
    let expGain = effect.pet_experience || 0;
    let statGain = effect.pet_stats || 0;

    // Update pet
    const newHappiness = Math.min(100, characterPet.happiness + happinessGain);
    const newExperience = characterPet.experience + expGain;
    
    await characterPet.update({
      happiness: newHappiness,
      experience: newExperience
    });

    // Consume the item
    if (characterItem.quantity > 1) {
      await characterItem.update({ quantity: characterItem.quantity - 1 });
    } else {
      await characterItem.destroy();
    }

    res.json({
      success: true,
      message: `Fed ${characterPet.pet.name} with ${characterItem.item.name}!`,
      pet: {
        happiness: newHappiness,
        experience: newExperience,
        happinessGain,
        expGain
      }
    });

  } catch (error) {
    console.error('Feed pet error:', error);
    res.status(500).json({ success: false, message: 'Failed to feed pet' });
  }
});

// Helper function to give pet experience and level up
async function givePetExperience(characterId, petId, experienceGained) {
  try {
    const characterPet = await CharacterPet.findOne({
      where: { character_id: characterId, pet_id: petId }
    });

    if (characterPet) {
      const newExperience = characterPet.experience + experienceGained;
      const newLevel = Math.floor(newExperience / 100) + 1; // 100 XP per level
      
      await characterPet.update({
        experience: newExperience,
        level: newLevel
      });

      return { leveledUp: newLevel > characterPet.level, newLevel };
    }
  } catch (error) {
    console.error('Error giving pet experience:', error);
  }
  return { leveledUp: false, newLevel: 1 };
}

// Helper function to check unlock requirements
function checkUnlockRequirement(requirement, character) {
  if (!requirement) return true;
  
  // Level requirement
  if (requirement.includes('level')) {
    const requiredLevel = parseInt(requirement.match(/\d+/)[0]);
    return character.level >= requiredLevel;
  }
  
  // Quest requirements
  if (requirement.includes('quests')) {
    const requiredQuests = parseInt(requirement.match(/\d+/)[0]);
    return (character.quests_completed || 0) >= requiredQuests;
  }
  
  if (requirement.includes('wisdom-based quests')) {
    const requiredQuests = parseInt(requirement.match(/\d+/)[0]);
    return (character.wisdom_quests_completed || 0) >= requiredQuests;
  }
  
  // Region requirements
  if (requirement.includes('regions')) {
    const requiredRegions = parseInt(requirement.match(/\d+/)[0]);
    return (character.regions_explored || 0) >= requiredRegions;
  }
  
  if (requirement.includes('astral regions')) {
    const requiredRegions = parseInt(requirement.match(/\d+/)[0]);
    return (character.astral_regions_explored || 0) >= requiredRegions;
  }
  
  // Specific activity requirements
  if (requirement.includes('herbs')) {
    const requiredHerbs = parseInt(requirement.match(/\d+/)[0]);
    return (character.herbs_gathered || 0) >= requiredHerbs;
  }
  
  if (requirement.includes('stealth missions')) {
    const requiredMissions = parseInt(requirement.match(/\d+/)[0]);
    return (character.stealth_missions_completed || 0) >= requiredMissions;
  }
  
  if (requirement.includes('crystals')) {
    const requiredCrystals = parseInt(requirement.match(/\d+/)[0]);
    return (character.crystals_mined || 0) >= requiredCrystals;
  }
  
  if (requirement.includes('fire spells')) {
    const requiredSpells = parseInt(requirement.match(/\d+/)[0]);
    return (character.fire_spells_cast || 0) >= requiredSpells;
  }
  
  if (requirement.includes('shadow creatures')) {
    const requiredCreatures = parseInt(requirement.match(/\d+/)[0]);
    return (character.shadow_creatures_defeated || 0) >= requiredCreatures;
  }
  
  if (requirement.includes('resurrect')) {
    const requiredDeaths = parseInt(requirement.match(/\d+/)[0]);
    return (character.deaths_and_resurrections || 0) >= requiredDeaths;
  }
  
  if (requirement.includes('trees')) {
    const requiredTrees = parseInt(requirement.match(/\d+/)[0]);
    return (character.trees_planted || 0) >= requiredTrees;
  }
  
  return true; // Default to unlocked for now
}

module.exports = router;
