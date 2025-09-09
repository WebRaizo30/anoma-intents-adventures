const express = require('express');
const router = express.Router();
const { Character, CharacterPet } = require('../models');
const auth = require('../middleware/auth');

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

// Helper function to apply pet special abilities
async function applyPetAbilities(character, baseDamage, baseIntentReward, baseExpReward, victory) {
  const activePet = await character.getActivePet();
  let finalDamage = baseDamage;
  let finalIntentReward = baseIntentReward;
  let finalExpReward = baseExpReward;
  let petMessages = [];

  if (activePet && activePet.special_ability) {
    const ability = activePet.special_ability.toLowerCase();
    
    // Pack Hunter: +10% combat damage
    if (ability.includes('pack hunter') && victory) {
      const damageBonus = Math.floor(baseDamage * 0.1);
      finalDamage = Math.max(0, finalDamage - damageBonus); // Reduce damage taken
      petMessages.push(`🐺 ${activePet.name}'s Pack Hunter reduced damage by ${damageBonus}!`);
    }
    
    // Stealth Strike: 15% chance to avoid damage
    if (ability.includes('stealth strike')) {
      if (Math.random() < 0.15) {
        finalDamage = 0;
        petMessages.push(`🐱 ${activePet.name}'s Stealth Strike completely avoided damage!`);
      }
    }
    
    // Crystal Shield: Absorbs 20% of damage taken
    if (ability.includes('crystal shield')) {
      const absorbedDamage = Math.floor(finalDamage * 0.2);
      finalDamage = Math.max(0, finalDamage - absorbedDamage);
      petMessages.push(`🗿 ${activePet.name}'s Crystal Shield absorbed ${absorbedDamage} damage!`);
    }
    
    // Lightning Strike: 25% chance for bonus lightning damage
    if (ability.includes('lightning strike') && victory) {
      if (Math.random() < 0.25) {
        const lightningBonus = Math.floor(baseIntentReward * 0.5);
        finalIntentReward += lightningBonus;
        petMessages.push(`🦅 ${activePet.name}'s Lightning Strike added ${lightningBonus} bonus intent!`);
      }
    }
    
    // Void Bite: Drains enemy mana and heals you
    if (ability.includes('void bite') && victory) {
      const healAmount = Math.floor(baseIntentReward * 0.3);
      const currentHealth = character.health;
      const maxHealth = 100;
      const actualHeal = Math.min(healAmount, maxHealth - currentHealth);
      if (actualHeal > 0) {
        await character.update({ health: Math.min(maxHealth, currentHealth + actualHeal) });
        petMessages.push(`🌑 ${activePet.name}'s Void Bite healed you for ${actualHeal} HP!`);
      }
    }
    
    // Ancient Knowledge: +50% XP from quests
    if (ability.includes('ancient knowledge') && victory) {
      const xpBonus = Math.floor(baseExpReward * 0.5);
      finalExpReward += xpBonus;
      petMessages.push(`🐢 ${activePet.name}'s Ancient Knowledge added ${xpBonus} bonus XP!`);
    }
    
    // Intent Mastery: All actions have 25% chance to succeed perfectly
    if (ability.includes('intent mastery')) {
      if (Math.random() < 0.25) {
        finalIntentReward = Math.floor(finalIntentReward * 1.5);
        petMessages.push(`✨ ${activePet.name}'s Intent Mastery doubled your intent reward!`);
      }
    }
  }

  return {
    damage: finalDamage,
    intentReward: finalIntentReward,
    expReward: finalExpReward,
    petMessages
  };
}

// Start PvE Combat
router.post('/pve', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    if (character.health <= 0) {
      return res.json({ success: false, message: 'You must heal before fighting!' });
    }

    // Combat calculation including equipped item bonuses and pet bonuses
    const playerPower = await character.getCombatPower();
    const enemyPower = Math.floor(Math.random() * 50) + character.level * 2;
    
    const victory = playerPower > enemyPower;
    const baseDamage = Math.floor(Math.random() * 20) + 5;
    const baseIntentReward = victory ? Math.floor(Math.random() * 25) + 5 : 0;
    const baseExpReward = victory ? Math.floor(Math.random() * 15) + 3 : 1;

    // Apply pet abilities
    const petResults = await applyPetAbilities(character, baseDamage, baseIntentReward, baseExpReward, victory);
    
    // Apply damage
    const newHealth = Math.max(0, character.health - petResults.damage);
    
    // Apply rewards if victory
    const currentIntent = parseInt(character.intent) || 0;
    const currentXP = parseInt(character.experience) || 0;
    let newIntent = currentIntent;
    let newExp = currentXP;
    
    if (victory) {
      newIntent += petResults.intentReward;
      newExp += petResults.expReward;
      
      // Check if intent would exceed safe limits
      if (newIntent > Number.MAX_SAFE_INTEGER) {
        newIntent = Number.MAX_SAFE_INTEGER;
      }
    }

    // Give experience to active pet
    let petLevelUpMessage = '';
    const activePet = await character.getActivePet();
    if (activePet) {
      const petExpGained = victory ? Math.floor(Math.random() * 5) + 2 : 1; // 2-6 XP for victory, 1 for defeat
      const petLevelResult = await givePetExperience(character.id, activePet.id, petExpGained);
      
      if (petLevelResult.leveledUp) {
        petLevelUpMessage = `🎉 ${activePet.name} reached level ${petLevelResult.newLevel}!`;
        petResults.petMessages.push(petLevelUpMessage);
      }
    }

    await character.update({
      health: newHealth,
      intent: newIntent,
      experience: newExp
    });

    const result = {
      success: true,
      victory,
      damage: petResults.damage,
      playerPower,
      enemyPower,
      intentReward: petResults.intentReward,
      expReward: petResults.expReward,
      newHealth,
      petMessages: petResults.petMessages,
      message: victory 
        ? `Victory! Earned ${petResults.intentReward} intent and ${petResults.expReward} XP. Took ${petResults.damage} damage.`
        : `Defeat! Lost ${petResults.damage} health but gained ${petResults.expReward} XP.`
    };

    res.json(result);
  } catch (error) {
    console.error('PvE combat error:', error);
    res.status(500).json({ success: false, message: 'Combat failed' });
  }
});

// Challenge another player
router.post('/challenge', auth, async (req, res) => {
  try {
    const { targetUsername } = req.body;
    
    if (!targetUsername) {
      return res.json({ success: false, message: 'Target username required' });
    }

    const challenger = await Character.findOne({
      where: { user_id: req.user.id }
    });

    const target = await Character.findOne({
      where: { name: targetUsername }
    });

    if (!challenger || !target) {
      return res.json({ success: false, message: 'Player not found' });
    }

    if (challenger.id === target.id) {
      return res.json({ success: false, message: 'Cannot challenge yourself' });
    }

    if (challenger.health <= 0 || target.health <= 0) {
      return res.json({ success: false, message: 'Both players must be healthy' });
    }

    // PvP calculation including equipped item bonuses
    const challengerPower = await challenger.getCombatPower();
    const targetPower = await target.getCombatPower();
    
    const victory = challengerPower > targetPower;
    const damage = Math.floor(Math.random() * 15) + 5;
    const intentStake = Math.min(challenger.intent, target.intent, 100);

    // Apply results
    const challengerCurrentIntent = parseInt(challenger.intent) || 0;
    const targetCurrentIntent = parseInt(target.intent) || 0;
    
    if (victory) {
      const newChallengerIntent = Math.min(Number.MAX_SAFE_INTEGER, challengerCurrentIntent + intentStake);
      const newTargetIntent = Math.max(0, targetCurrentIntent - intentStake);
      
      await challenger.update({
        intent: newChallengerIntent,
        experience: parseInt(challenger.experience) + 10
      });
      await target.update({
        intent: newTargetIntent,
        health: Math.max(0, target.health - damage)
      });
    } else {
      const newChallengerIntent = Math.max(0, challengerCurrentIntent - intentStake);
      const newTargetIntent = Math.min(Number.MAX_SAFE_INTEGER, targetCurrentIntent + intentStake);
      
      await challenger.update({
        intent: newChallengerIntent,
        health: Math.max(0, challenger.health - damage)
      });
      await target.update({
        intent: newTargetIntent,
        experience: parseInt(target.experience) + 10
      });
    }

    res.json({
      success: true,
      victory,
      damage,
      intentStake,
      challengerPower,
      targetPower,
      message: victory 
        ? `Victory against ${targetUsername}! Won ${intentStake} intent.`
        : `Defeated by ${targetUsername}. Lost ${intentStake} intent and ${damage} health.`
    });

  } catch (error) {
    console.error('PvP combat error:', error);
    res.status(500).json({ success: false, message: 'PvP combat failed' });
  }
});

// Heal character
router.post('/heal', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    if (character.health >= 100) {
      return res.json({ success: false, message: 'Already at full health' });
    }

    const healCost = Math.floor((100 - character.health) * 2);
    
    const currentIntent = parseInt(character.intent) || 0;
    
    if (currentIntent < healCost) {
      return res.json({ 
        success: false, 
        message: `Need ${healCost} intent to heal (you have ${currentIntent})` 
      });
    }

    await character.update({
      health: 100,
      intent: currentIntent - healCost
    });

    res.json({
      success: true,
      healCost,
      message: `Healed to full health for ${healCost} intent`
    });

  } catch (error) {
    console.error('Heal error:', error);
    res.status(500).json({ success: false, message: 'Healing failed' });
  }
});

// Get combat stats
router.get('/stats', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    const combatPower = await character.getCombatPower();
    const healCost = character.health < 100 ? Math.floor((100 - character.health) * 2) : 0;

    res.json({
      success: true,
      stats: {
        health: character.health,
        combatPower,
        healCost,
        canFight: character.health > 0
      }
    });

  } catch (error) {
    console.error('Combat stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get combat stats' });
  }
});

module.exports = router;
