const express = require('express');
const router = express.Router();
const { Character } = require('../models');
const auth = require('../middleware/auth');

// Story templates for different scenarios
const storyTemplates = {
  adventure: [
    "In the {region}, {character} discovered an ancient {artifact} that whispered secrets of the {element} realm.",
    "While exploring the depths of {region}, {character} encountered a mysterious {creature} who offered a cryptic riddle.",
    "The winds of {region} carried {character} to a hidden grove where {magical_event} occurred.",
    "Deep within {region}, {character} found traces of an ancient civilization that worshipped {deity}.",
    "As {character} ventured through {region}, a {weather_event} revealed a secret passage to {hidden_location}."
  ],
  combat: [
    "The battle against the {enemy} in {region} tested every skill {character} had learned.",
    "With {weapon} in hand, {character} faced the legendary {boss} that had terrorized {region} for centuries.",
    "In the arena of {region}, {character} proved their worth against {opponent} in an epic duel.",
    "The {creature} emerged from the shadows of {region}, forcing {character} into a desperate fight for survival.",
    "As the sun set over {region}, {character} stood victorious over the fallen {enemy}, their legend growing."
  ],
  discovery: [
    "In the forgotten ruins of {region}, {character} uncovered the lost art of {magic_school}.",
    "The ancient library in {region} revealed to {character} the true history of the {ancient_race}.",
    "While mining in {region}, {character} discovered a vein of {rare_mineral} that pulsed with magical energy.",
    "The wise {npc} of {region} shared with {character} the secret knowledge of {ancient_technique}.",
    "In a moment of clarity within {region}, {character} understood the deeper meaning of {philosophical_concept}."
  ],
  social: [
    "The tavern in {region} buzzed with tales of {character}'s recent adventures and growing reputation.",
    "Fellow adventurers in {region} sought out {character} for their wisdom and leadership.",
    "The guild master of {region} personally commended {character} for their service to the realm.",
    "In the marketplace of {region}, merchants competed to offer {character} their finest wares.",
    "The people of {region} celebrated {character} as a true hero of their time."
  ]
};

const storyElements = {
  regions: [
    'Whispering Woods', 'Crystal Caverns', 'Shadowmere Swamps', 'Golden Plains', 'Frostpeak Mountains',
    'Ember Desert', 'Moonlit Shores', 'Starfall Valley', 'Thornwood Forest', 'Misty Highlands'
  ],
  artifacts: [
    'runic tablet', 'crystal orb', 'ancient tome', 'mystical amulet', 'enchanted blade',
    'sacred chalice', 'star fragment', 'elemental stone', 'spirit vessel', 'time shard'
  ],
  creatures: [
    'ethereal guardian', 'shadow wraith', 'crystal elemental', 'ancient dragon', 'forest spirit',
    'void walker', 'storm giant', 'fire phoenix', 'ice maiden', 'star bearer'
  ],
  elements: [
    'fire', 'water', 'earth', 'air', 'shadow', 'light', 'void', 'time', 'space', 'spirit'
  ],
  enemies: [
    'Shadowbeast', 'Crystal Golem', 'Void Reaper', 'Storm Lord', 'Fire Demon',
    'Ice Wraith', 'Earth Titan', 'Wind Serpent', 'Dark Sorcerer', 'Chaos Dragon'
  ],
  magical_events: [
    'a portal to another realm opened', 'the very air shimmered with magic', 'ancient spirits awakened',
    'time itself seemed to slow', 'reality bent and twisted', 'elemental forces converged'
  ]
};

// Generate a story
router.post('/generate', auth, async (req, res) => {
  try {
    const { type = 'random', context } = req.body;
    
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    // Select story type
    let storyType = type;
    if (type === 'random') {
      const types = Object.keys(storyTemplates);
      storyType = types[Math.floor(Math.random() * types.length)];
    }

    // Get random template
    const templates = storyTemplates[storyType] || storyTemplates.adventure;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate story elements
    const elements = {
      character: character.name,
      region: context?.region || character.current_region || getRandomElement('regions'),
      artifact: getRandomElement('artifacts'),
      creature: getRandomElement('creatures'),
      element: getRandomElement('elements'),
      enemy: getRandomElement('enemies'),
      magical_event: getRandomElement('magical_events'),
      weapon: context?.weapon || 'trusty weapon',
      boss: `${getRandomElement('elements')} ${getRandomElement('enemies')}`,
      opponent: context?.opponent || 'worthy adversary',
      hidden_location: `${getRandomElement('elements')} ${getRandomElement('regions')}`,
      weather_event: 'sudden storm',
      deity: `${getRandomElement('elements')} God`,
      magic_school: `School of ${getRandomElement('elements')}`,
      ancient_race: `${getRandomElement('elements')} Elves`,
      rare_mineral: `${getRandomElement('elements')}ite`,
      npc: `${getRandomElement('elements')} Sage`,
      ancient_technique: `${getRandomElement('elements')} Mastery`,
      philosophical_concept: `the balance of ${getRandomElement('elements')}`
    };

    // Replace placeholders in template
    let story = template;
    Object.keys(elements).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      story = story.replace(regex, elements[key]);
    });

    // Add character context
    const contextualEnding = generateContextualEnding(character, storyType);
    story += ` ${contextualEnding}`;

    res.json({
      success: true,
      story: {
        title: `${character.name}'s ${storyType.charAt(0).toUpperCase() + storyType.slice(1)} Tale`,
        content: story,
        type: storyType,
        timestamp: new Date(),
        character_level: character.level,
        character_region: character.current_region
      }
    });

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate story' });
  }
});

// Get story history
router.get('/history', auth, async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { user_id: req.user.id }
    });

    if (!character) {
      return res.json({ success: false, message: 'Character not found' });
    }

    // For now, return recent generated stories (in real app, store in database)
    res.json({
      success: true,
      stories: [],
      message: 'Story history feature coming soon!'
    });

  } catch (error) {
    console.error('Story history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get story history' });
  }
});

// Helper functions
function getRandomElement(category) {
  const elements = storyElements[category] || ['unknown'];
  return elements[Math.floor(Math.random() * elements.length)];
}

function generateContextualEnding(character, storyType) {
  const endings = {
    adventure: [
      `This experience added to ${character.name}'s growing legend.`,
      `The tale would be told in taverns for years to come.`,
      `${character.name} felt their understanding of the world deepen.`
    ],
    combat: [
      `Victory strengthened ${character.name}'s resolve.`,
      `The battle scars would serve as reminders of this triumph.`,
      `${character.name}'s reputation as a warrior grew.`
    ],
    discovery: [
      `This knowledge would serve ${character.name} well in future endeavors.`,
      `${character.name} carefully recorded this discovery in their journal.`,
      `The wisdom gained would guide ${character.name}'s path forward.`
    ],
    social: [
      `${character.name}'s influence in the realm continued to grow.`,
      `These connections would prove valuable in times to come.`,
      `${character.name} had earned the respect of many.`
    ]
  };

  const typeEndings = endings[storyType] || endings.adventure;
  return typeEndings[Math.floor(Math.random() * typeEndings.length)];
}

module.exports = router;
