const express = require('express');
const { Character, Item } = require('../../models');
const authMiddleware = require('../../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Generate random stat bonuses for items
function generateRandomStatBonuses(category) {
  const bonuses = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0
  };
  
  // Different categories get different stat focuses
  const statFocus = {
    weapon: ['strength', 'dexterity'],
    armor: ['constitution', 'strength'],
    accessory: ['charisma', 'intelligence', 'wisdom'],
    treasure: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
    material: ['intelligence', 'wisdom'],
    tool: ['dexterity', 'intelligence']
  };
  
  const focusStats = statFocus[category] || statFocus.treasure;
  
  // Give 1-3 random stats a bonus of 1-3 points
  const numStats = Math.floor(Math.random() * 3) + 1; // 1-3 stats
  const selectedStats = focusStats.sort(() => 0.5 - Math.random()).slice(0, numStats);
  
  selectedStats.forEach(stat => {
    bonuses[stat] = Math.floor(Math.random() * 3) + 1; // 1-3 bonus points
  });
  
  return bonuses;
}

// Get character inventory
router.get('/', authMiddleware, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: Item,
        as: 'inventory',
        through: {
          attributes: ['quantity', 'equipped', 'acquired_at']
        }
      }]
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Organize inventory by category
    const inventory = {};
    character.inventory.forEach(item => {
      if (!inventory[item.category]) {
        inventory[item.category] = [];
      }
      
      inventory[item.category].push({
        ...item.toJSON(),
        quantity: item.character_items.quantity,
        equipped: item.character_items.equipped,
        acquired_at: item.character_items.acquired_at
      });
    });

    // Calculate total stats from equipped items
    const equippedStats = await character.getTotalStats();

    res.json({
      success: true,
      inventory: inventory,
      equipped_stats: equippedStats,
      total_items: character.inventory.length
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Equip/unequip item
router.put('/equip/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { equip } = req.body; // true to equip, false to unequip

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character owns this item
    const { sequelize } = require('../../config/database/connection');
    const [characterItem] = await sequelize.query(`
      SELECT ci.*, i.name, i.category, i.level_requirement, i.race_requirement, i.class_requirement
      FROM character_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.character_id = ? AND ci.item_id = ?
    `, {
      replacements: [character.id, itemId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!characterItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    // Check if item can be equipped
    const item = await Item.findByPk(itemId);
    const canUse = item.canBeUsedBy(character);
    
    if (!canUse.canUse && equip) {
      return res.status(400).json({
        success: false,
        message: `Cannot equip item: ${canUse.reason}`
      });
    }

    // If equipping, unequip other items in same category
    if (equip && ['weapon', 'armor', 'accessory'].includes(item.category)) {
      await sequelize.query(`
        UPDATE character_items 
        SET equipped = false 
        WHERE character_id = ? AND item_id IN (
          SELECT id FROM items WHERE category = ?
        )
      `, {
        replacements: [character.id, item.category]
      });
    }

    // Update equipment status
    await sequelize.query(`
      UPDATE character_items 
      SET equipped = ? 
      WHERE character_id = ? AND item_id = ?
    `, {
      replacements: [equip, character.id, itemId]
    });

    res.json({
      success: true,
      message: `Item ${equip ? 'equipped' : 'unequipped'} successfully`,
      item: {
        name: item.name,
        category: item.category,
        equipped: equip
      }
    });

  } catch (error) {
    console.error('Equip item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get shop items
router.get('/shop', authMiddleware, async (req, res) => {
  try {
    const { category, rarity, page = 1, limit = 20 } = req.query;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Build shop query
    const shopQuery = {
      level_requirement: {
        [Op.lte]: character.level + 2 // Show items slightly above level
      }
    };

    if (category) shopQuery.category = category;
    if (rarity) shopQuery.rarity = rarity;

    const offset = (page - 1) * limit;

    const shopItems = await Item.findAndCountAll({
      where: shopQuery,
      order: [['category', 'ASC'], ['rarity', 'DESC'], ['level_requirement', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Add shop pricing (markup based on rarity)
    const itemsWithPricing = shopItems.rows
      .filter(item => item !== null && item.rarity && item.value !== undefined)
      .map(item => {
        try {
          const rarityMarkup = item.getRarityMultiplier();
          const shopPrice = Math.floor(item.value * rarityMarkup * 1.5); // 50% markup
          
          return {
            ...item.toJSON(),
            shop_price: shopPrice,
            can_afford: character.intent >= shopPrice
          };
        } catch (error) {
          console.error('Error processing item:', item.id, error);
          return null;
        }
      })
      .filter(item => item !== null);

    res.json({
      success: true,
      items: itemsWithPricing,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: shopItems.count,
        pages: Math.ceil(shopItems.count / limit)
      },
      character_intent: character.intent
    });

  } catch (error) {
    console.error('Shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add item to inventory (for game collection)
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { itemName, itemType, intentValue = 0 } = req.body;

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Find or create item
    const { sequelize } = require('../../config/database/connection');
    let [item] = await sequelize.query(`
      SELECT * FROM items WHERE name = ?
    `, {
      replacements: [itemName],
      type: sequelize.QueryTypes.SELECT
    });

    if (!item) {
      // Create new item if doesn't exist with random stat bonuses
      const statBonuses = generateRandomStatBonuses(itemType || 'treasure');
      const [newItems] = await sequelize.query(`
        INSERT INTO items (
          name, category, rarity, description, value,
          strength_bonus, dexterity_bonus, constitution_bonus,
          intelligence_bonus, wisdom_bonus, charisma_bonus
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *
      `, {
        replacements: [
          itemName,
          itemType || 'treasure',
          'common',
          `A ${itemName} found during adventure`,
          intentValue,
          statBonuses.strength,
          statBonuses.dexterity,
          statBonuses.constitution,
          statBonuses.intelligence,
          statBonuses.wisdom,
          statBonuses.charisma
        ]
      });
      item = newItems[0];
    }

    // Add to character inventory
    const [existingItem] = await sequelize.query(`
      SELECT * FROM character_items 
      WHERE character_id = ? AND item_id = ?
    `, {
      replacements: [character.id, item.id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingItem) {
      // Update quantity
      await sequelize.query(`
        UPDATE character_items 
        SET quantity = quantity + 1
        WHERE character_id = ? AND item_id = ?
      `, {
        replacements: [character.id, item.id]
      });
    } else {
      // Add new item
      await sequelize.query(`
        INSERT INTO character_items (character_id, item_id, quantity)
        VALUES (?, ?, 1)
      `, {
        replacements: [character.id, item.id]
      });
    }

    // Item added to inventory

    res.json({
      success: true,
      message: `${itemName} added to inventory!`,
      item: {
        name: item.name,
        category: item.category,
        value: item.value
      }
    });

  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Buy item from shop
router.post('/shop/buy', authMiddleware, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    if (!itemId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid item ID and quantity required'
      });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    const item = await Item.findByPk(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if character can use this item
    const canUse = item.canBeUsedBy(character);
    if (!canUse.canUse) {
      return res.status(400).json({
        success: false,
        message: `Cannot buy item: ${canUse.reason}`
      });
    }

    // Calculate total cost
    const rarityMarkup = item.getRarityMultiplier();
    const unitPrice = Math.floor(item.value * rarityMarkup * 1.5);
    const totalCost = unitPrice * quantity;

    const currentIntent = parseInt(character.intent) || 0;
    if (currentIntent < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient intent. Need ${totalCost} intent, have ${currentIntent} intent.`
      });
    }

    // Add item to inventory
    const { sequelize } = require('../../config/database/connection');
    
    // Check if item already exists in inventory
    const [existingItem] = await sequelize.query(`
      SELECT * FROM character_items 
      WHERE character_id = ? AND item_id = ?
    `, {
      replacements: [character.id, itemId],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingItem) {
      // Update quantity
      await sequelize.query(`
        UPDATE character_items 
        SET quantity = quantity + ?
        WHERE character_id = ? AND item_id = ?
      `, {
        replacements: [quantity, character.id, itemId]
      });
    } else {
      // Add new item
      await sequelize.query(`
        INSERT INTO character_items (character_id, item_id, quantity)
        VALUES (?, ?, ?)
      `, {
        replacements: [character.id, itemId, quantity]
      });
    }

    // Deduct intent
    character.intent = currentIntent - totalCost;
    await character.save();

    res.json({
      success: true,
      message: `Successfully purchased ${quantity}x ${item.name}`,
      item: {
        name: item.name,
        quantity: quantity,
        unitPrice: unitPrice,
        totalCost: totalCost
      },
      remainingIntent: character.intent
    });

  } catch (error) {
    console.error('Buy item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Sell item from inventory
router.post('/sell/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity = 1 } = req.body;

    if (!itemId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid item ID and quantity required'
      });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character owns this item
    const { sequelize } = require('../../config/database/connection');
    const [characterItem] = await sequelize.query(`
      SELECT ci.*, i.name, i.value, i.category
      FROM character_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.character_id = ? AND ci.item_id = ?
    `, {
      replacements: [character.id, itemId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!characterItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    if (characterItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough items. You have ${characterItem.quantity}, trying to sell ${quantity}`
      });
    }

    // Calculate sell price (50% of base value)
    const sellPrice = Math.floor(characterItem.value * 0.5 * quantity);

    // Remove items from inventory
    if (characterItem.quantity === quantity) {
      // Remove entire item
      await sequelize.query(`
        DELETE FROM character_items 
        WHERE character_id = ? AND item_id = ?
      `, {
        replacements: [character.id, itemId]
      });
    } else {
      // Reduce quantity
      await sequelize.query(`
        UPDATE character_items 
        SET quantity = quantity - ?
        WHERE character_id = ? AND item_id = ?
      `, {
        replacements: [quantity, character.id, itemId]
      });
    }

    // Add intent to character
    const currentIntent = parseInt(character.intent) || 0;
    character.intent = currentIntent + sellPrice;
    await character.save();

    res.json({
      success: true,
      message: `Successfully sold ${quantity}x ${characterItem.name} for ${sellPrice} intent`,
      item: {
        name: characterItem.name,
        quantity: quantity,
        sellPrice: sellPrice
      },
      remainingIntent: character.intent
    });

  } catch (error) {
    console.error('Sell item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Use item from inventory
router.post('/use/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity = 1 } = req.body;

    if (!itemId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid item ID and quantity required'
      });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character owns this item
    const { sequelize } = require('../../config/database/connection');
    const [characterItem] = await sequelize.query(`
      SELECT ci.*, i.name, i.value, i.category, i.description
      FROM character_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.character_id = ? AND ci.item_id = ?
    `, {
      replacements: [character.id, itemId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!characterItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    if (characterItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough items. You have ${characterItem.quantity}, trying to use ${quantity}`
      });
    }

    // Check if item can be used
    if (['treasure', 'material'].includes(characterItem.category)) {
      return res.status(400).json({
        success: false,
        message: `${characterItem.name} cannot be used directly. Try selling it instead.`
      });
    }

    // Handle different item categories
    let effect = '';
    let healthRestored = 0;

    if (characterItem.category === 'potion') {
      // Potion effects
      if (characterItem.name.toLowerCase().includes('health')) {
        const maxHealth = character.constitution * 10;
        const currentHealth = character.health || 0;
        const restoreAmount = Math.floor(maxHealth * 0.3); // Restore 30% of max health
        const newHealth = Math.min(maxHealth, currentHealth + restoreAmount);
        healthRestored = newHealth - currentHealth;
        
        character.health = newHealth;
        await character.save();
        
        effect = `Restored ${healthRestored} health`;
      } else if (characterItem.name.toLowerCase().includes('mana')) {
        // For future mana system
        effect = 'Mana restored (mana system not implemented yet)';
      }
    } else if (characterItem.category === 'weapon' || characterItem.category === 'armor' || characterItem.category === 'accessory') {
      return res.status(400).json({
        success: false,
        message: `${characterItem.name} is equipment. Use equip/unequip instead of use.`
      });
    } else {
      effect = `${characterItem.name} used successfully`;
    }

    // Remove items from inventory (for consumables)
    if (characterItem.category === 'potion') {
      if (characterItem.quantity === quantity) {
        // Remove entire item
        await sequelize.query(`
          DELETE FROM character_items 
          WHERE character_id = ? AND item_id = ?
        `, {
          replacements: [character.id, itemId]
        });
      } else {
        // Reduce quantity
        await sequelize.query(`
          UPDATE character_items 
          SET quantity = quantity - ?
          WHERE character_id = ? AND item_id = ?
        `, {
          replacements: [quantity, character.id, itemId]
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully used ${quantity}x ${characterItem.name}`,
      effect: effect,
      healthRestored: healthRestored,
      item: {
        name: characterItem.name,
        category: characterItem.category,
        quantity: characterItem.quantity - quantity
      }
    });

  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete item from inventory
router.delete('/delete/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity = 1 } = req.body;

    if (!itemId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid item ID and quantity required'
      });
    }

    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if character owns this item
    const { sequelize } = require('../../config/database/connection');
    const [characterItem] = await sequelize.query(`
      SELECT ci.*, i.name, i.category
      FROM character_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.character_id = ? AND ci.item_id = ?
    `, {
      replacements: [character.id, itemId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!characterItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    if (characterItem.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough items. You have ${characterItem.quantity}, trying to delete ${quantity}`
      });
    }

    // Remove items from inventory
    if (characterItem.quantity === quantity) {
      // Remove entire item
      await sequelize.query(`
        DELETE FROM character_items 
        WHERE character_id = ? AND item_id = ?
      `, {
        replacements: [character.id, itemId]
      });
    } else {
      // Reduce quantity
      await sequelize.query(`
        UPDATE character_items 
        SET quantity = quantity - ?
        WHERE character_id = ? AND item_id = ?
      `, {
        replacements: [quantity, character.id, itemId]
      });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${quantity}x ${characterItem.name}`,
      item: {
        name: characterItem.name,
        category: characterItem.category,
        quantity: characterItem.quantity - quantity
      }
    });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
