import Phaser from 'phaser';

export class AssetManager {
  private scene: Phaser.Scene;
  private manifest: any;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async loadAssetManifest() {
    try {
      const response = await fetch('/assets/manifest.json');
      this.manifest = await response.json();
      // Asset manifest loaded
    } catch (error) {
      console.error('Failed to load asset manifest:', error);
      this.createFallbackAssets();
    }
  }

  createFallbackAssets() {
    console.log('Creating fallback colored assets...');
    
    // Create character sprites
    AssetManager.createCharacterSprites(this.scene);
    
    // Create tile sprites
    this.createTileSprites();
    
    // Create item sprites
    this.createItemSprites();
    
    // Create UI elements
    this.createUISprites();
  }

  private static createCharacterSprites(scene: Phaser.Scene) {
    const graphics = scene.add.graphics();
    
    // Player characters by race
    const raceColors = {
      human: 0xDEB887,     // BurlyWood
      elf: 0x90EE90,       // LightGreen
      dwarf: 0xCD853F,     // Peru
      orc: 0x8B4513,       // SaddleBrown
      halfling: 0xF0E68C,  // Khaki
      dragonborn: 0xFF4500, // OrangeRed
      tiefling: 0x8B0000,  // DarkRed
      gnome: 0xDA70D6,     // Orchid
      drow: 0x2F4F4F,      // DarkSlateGray
      aasimar: 0xFFD700,   // Gold
      githzerai: 0x9370DB, // MediumPurple
      starborn: 0x00CED1   // DarkTurquoise
    };

    Object.entries(raceColors).forEach(([race, color]) => {
      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillCircle(16, 16, 12);
      graphics.fillStyle(0x000000);
      graphics.fillCircle(12, 12, 2); // Left eye
      graphics.fillCircle(20, 12, 2); // Right eye
      graphics.generateTexture(`player_${race}`, 32, 32);
    });

    // Enemy sprites - more detailed
    AssetManager.createDetailedEnemySprites(scene, graphics);

    // Boss sprites - epic versions
    AssetManager.createBossSprites(scene, graphics);
  }

  createTileSprites() {
    const graphics = this.scene.add.graphics();
    
    // Enhanced Grass Tile
    graphics.clear();
    graphics.fillStyle(0x228B22); // Base grass color
    graphics.fillRect(0, 0, 32, 32);
    
    // Add grass texture with multiple shades
    graphics.fillStyle(0x32CD32); // Lighter grass
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.6) {
          graphics.fillRect(i * 4, j * 4, 2, 2);
        }
      }
    }
    
    // Add darker grass patches
    graphics.fillStyle(0x006400); // Darker grass
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (Math.random() > 0.7) {
          graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
        }
      }
    }
    
    // Add small grass details
    graphics.fillStyle(0x90EE90); // Light green details
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 28 + 2;
      const y = Math.random() * 28 + 2;
      graphics.fillRect(x, y, 1, 1);
    }
    
    graphics.generateTexture('tile_grass', 32, 32);
    
    // Enhanced Stone Tile
      graphics.clear();
    graphics.fillStyle(0x708090); // Base stone color
      graphics.fillRect(0, 0, 32, 32);
      
    // Add stone texture with cracks and variations
    graphics.fillStyle(0x808080); // Lighter stone
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
        if (Math.random() > 0.5) {
          graphics.fillRect(i * 8, j * 8, 6, 6);
        }
      }
    }
    
    // Add darker stone areas
    graphics.fillStyle(0x696969); // Darker stone
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (Math.random() > 0.6) {
          graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
        }
      }
    }
    
    // Add stone cracks
    graphics.lineStyle(1, 0x2F4F4F);
    for (let i = 0; i < 3; i++) {
      const startX = Math.random() * 32;
      const startY = Math.random() * 32;
      const endX = startX + (Math.random() - 0.5) * 16;
      const endY = startY + (Math.random() - 0.5) * 16;
      graphics.lineBetween(startX, startY, endX, endY);
    }
    
    graphics.generateTexture('tile_stone', 32, 32);
    
    // Enhanced Water Tile
      graphics.clear();
    graphics.fillStyle(0x4169E1); // Base water color
      graphics.fillRect(0, 0, 32, 32);
    
    // Add water ripples and waves
    graphics.fillStyle(0x87CEEB); // Light blue waves
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(0, i * 8, 32, 2);
    }
    
    // Add water highlights
    graphics.fillStyle(0xADD8E6); // Very light blue highlights
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.7) {
          graphics.fillRect(i * 4, j * 4, 2, 2);
        }
      }
    }
    
    // Add water depth variations
    graphics.fillStyle(0x000080); // Dark blue depth
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (Math.random() > 0.8) {
          graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
        }
      }
    }
    
    graphics.generateTexture('tile_water', 32, 32);
    
    // Enhanced Sand Tile
    graphics.clear();
    graphics.fillStyle(0xF4A460); // Base sand color
    graphics.fillRect(0, 0, 32, 32);
    
    // Add sand texture with grains
    graphics.fillStyle(0xDEB887); // Lighter sand
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        if (Math.random() > 0.6) {
          graphics.fillRect(i * 2, j * 2, 1, 1);
        }
      }
    }
    
    // Add darker sand areas
    graphics.fillStyle(0xD2691E); // Darker sand
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.7) {
          graphics.fillRect(i * 4, j * 4, 2, 2);
        }
      }
    }
    
    // Add sand dunes effect
    graphics.fillStyle(0xCD853F); // Dune color
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(0, i * 8, 32, 1);
    }
    
    graphics.generateTexture('tile_sand', 32, 32);
    
    // Enhanced Snow Tile
    graphics.clear();
    graphics.fillStyle(0xF0F8FF); // Base snow color
    graphics.fillRect(0, 0, 32, 32);
    
    // Add snow texture with sparkles
    graphics.fillStyle(0xFFFFFF); // Pure white sparkles
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if (Math.random() > 0.8) {
          graphics.fillRect(i * 1.6, j * 1.6, 1, 1);
        }
      }
    }
    
    // Add snow depth variations
    graphics.fillStyle(0xE6E6FA); // Light lavender depth
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.7) {
          graphics.fillRect(i * 4, j * 4, 3, 3);
        }
      }
    }
    
    // Add ice crystals
    graphics.lineStyle(1, 0x87CEEB);
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * 32;
      const y = Math.random() * 32;
      graphics.lineBetween(x, y, x + 4, y + 4);
      graphics.lineBetween(x + 4, y, x, y + 4);
    }
    
    graphics.generateTexture('tile_snow', 32, 32);
    
    // Enhanced Lava Tile
    graphics.clear();
    graphics.fillStyle(0xFF4500); // Base lava color
    graphics.fillRect(0, 0, 32, 32);
    
    // Add lava flow patterns
    graphics.fillStyle(0xFF6347); // Lighter lava
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(0, i * 8, 32, 3);
    }
    
    // Add lava bubbles and hot spots
    graphics.fillStyle(0xFFD700); // Golden hot spots
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.8) {
          graphics.fillCircle(i * 4 + 2, j * 4 + 2, 2);
        }
      }
    }
    
    // Add darker lava areas
    graphics.fillStyle(0x8B0000); // Dark red lava
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if (Math.random() > 0.7) {
          graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
        }
      }
    }
    
    // Add lava glow effect
    graphics.fillStyle(0xFFFF00); // Yellow glow
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 32;
      const y = Math.random() * 32;
      graphics.fillRect(x, y, 1, 1);
    }
    
    graphics.generateTexture('tile_lava', 32, 32);
  }

  private createItemSprites() {
    const graphics = this.scene.add.graphics();
    
    // Weapon sprites
    const weaponData = {
      sword: { color: 0xC0C0C0, shape: 'sword' },
      axe: { color: 0x8B4513, shape: 'axe' },
      bow: { color: 0xD2691E, shape: 'bow' },
      staff: { color: 0x9370DB, shape: 'staff' },
      dagger: { color: 0x2F4F4F, shape: 'dagger' }
    };

    Object.entries(weaponData).forEach(([weapon, data]) => {
      graphics.clear();
      graphics.fillStyle(data.color);
      
      switch (data.shape) {
        case 'sword':
          graphics.fillRect(14, 4, 4, 24);
          graphics.fillRect(12, 6, 8, 4);
          break;
        case 'axe':
          graphics.fillRect(14, 8, 4, 16);
          graphics.fillRect(10, 8, 12, 8);
          break;
        case 'bow':
          graphics.lineStyle(3, data.color);
          graphics.strokeCircle(16, 16, 10);
          break;
        case 'staff':
          graphics.fillRect(15, 4, 2, 24);
          graphics.fillCircle(16, 6, 4);
          break;
        case 'dagger':
          graphics.fillRect(14, 8, 4, 16);
          graphics.fillRect(12, 10, 8, 2);
          break;
      }
      
      graphics.generateTexture(`weapon_${weapon}`, 32, 32);
    });

    // Armor sprites
    const armorColors = {
      helmet: 0xC0C0C0,
      chestplate: 0x708090,
      boots: 0x8B4513,
      shield: 0xFFD700
    };

    Object.entries(armorColors).forEach(([armor, color]) => {
      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillRect(6, 6, 20, 20);
      graphics.lineStyle(2, 0x000000);
      graphics.strokeRect(6, 6, 20, 20);
      graphics.generateTexture(`armor_${armor}`, 32, 32);
    });

    // Enhanced consumable sprites
    this.createDetailedItemSprites(graphics);
  }

  private createUISprites() {
    const graphics = this.scene.add.graphics();
    
    // Button states
    const buttonColors = {
      normal: 0x4A4A4A,
      hover: 0x6A6A6A,
      pressed: 0x2A2A2A
    };

    Object.entries(buttonColors).forEach(([state, color]) => {
      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillRoundedRect(0, 0, 128, 32, 8);
      graphics.lineStyle(2, 0x9c27b0);
      graphics.strokeRoundedRect(0, 0, 128, 32, 8);
      graphics.generateTexture(`button_${state}`, 128, 32);
    });

    // Panel backgrounds
    graphics.clear();
    graphics.fillStyle(0x1A1A1A, 0.9);
    graphics.fillRoundedRect(0, 0, 200, 150, 8);
    graphics.lineStyle(2, 0x9c27b0);
    graphics.strokeRoundedRect(0, 0, 200, 150, 8);
    graphics.generateTexture('panel_bg', 200, 150);

    // Health bar
    graphics.clear();
    graphics.fillStyle(0x4CAF50);
    graphics.fillRect(0, 0, 100, 8);
    graphics.generateTexture('health_bar', 100, 8);

    // Mana bar
    graphics.clear();
    graphics.fillStyle(0x2196F3);
    graphics.fillRect(0, 0, 100, 8);
    graphics.generateTexture('mana_bar', 100, 8);

    // XP bar
    graphics.clear();
    graphics.fillStyle(0xFF9800);
    graphics.fillRect(0, 0, 100, 8);
    graphics.generateTexture('exp_bar', 100, 8);
  }

  // Get sprite for character based on race and class
  getCharacterSprite(race: string, characterClass: string, gender: string = 'male'): string {
    // Mevcut race'ler için gerçek asset kullan
    const availableRaces = ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'drow', 'githzerai', 'svirfneblin'];
    if (availableRaces.includes(race)) {
      return `player_${race}`;
    }
    
    // Diğerleri için fallback
    return `player_default`;
  }

  getPetSprite(petType: string): string {
    const petSpriteMap: { [key: string]: string } = {
      'forest_wolf': 'pet_forest_wolf',
      'crystal_bat': 'pet_crystal_bat', 
      'garden_snake': 'pet_garden_snake',
      'shadow_cat': 'pet_shadow_cat',
      'crystal_golem': 'pet_crystal_golem',
      'flame_sprite': 'pet_flame_sprite',
      'storm_eagle': 'pet_storm_eagle',
      'void_hound': 'pet_void_hound',
      'phoenix_chick': 'pet_phoenix_chick',
      'anoma_spirit': 'pet_anoma_spirit'
    };
    
    return petSpriteMap[petType] || 'pet_forest_wolf';
  }

  getBossSprite(bossName: string, region: string): string {
    const bossNameLower = bossName.toLowerCase().replace(/\s+/g, '_');
    const bossSpriteMap: { [key: string]: string } = {
      'ancient_treant': 'boss_ancient_treant',
      'shadow_wolf_alpha': 'boss_shadow_wolf_alpha',
      'stone_giant': 'boss_stone_giant', 
      'dragon_wyrmling': 'boss_dragon_wyrmling',
      'sand_worm': 'boss_sand_worm',
      'mummy_lord': 'boss_mummy_lord'
    };
    
    return bossSpriteMap[bossNameLower] || 'enemy_skeleton';
  }

  // Get sprite for item based on category and type
  getItemSprite(category: string, type: string): string {
    if (category === 'weapon') return `weapon_${type}`;
    if (category === 'armor') return `armor_${type}`;
    if (category === 'consumable') return `item_${type}`;
    return 'item_coin'; // fallback
  }

  // Get tile sprite for region - README'deki 21 region sistemine uygun
  getTileSprite(regionName: string): string {
    const regionTileMap: { [key: string]: string } = {
      // Ana Material Plane Regions
      starting_meadows: 'grass',
      whispering_woods: 'grass',
      golden_plains: 'grass',
      starfall_valley: 'grass',
      moonlit_shores: 'sand',
      
      // Dağlık ve Soğuk Bölgeler
      frostpeak_mountains: 'snow',
      misty_highlands: 'stone',
      crystal_caverns: 'stone',
      crystal_spires: 'stone',
      
      // Çöl ve Sıcak Bölgeler  
      ember_desert: 'sand',
      
      // Orman Bölgeleri
      thornwood_forest: 'grass',
      fungal_gardens: 'grass',
      
      // Bataklık ve Su Bölgeleri
      shadowmere_swamps: 'water',
      sunken_ruins: 'water',
      
      // Underdark Regions
      underdark_entrance: 'stone',
      deepest_dark: 'stone',
      shadow_market: 'stone',
      
      // Astral Plane Regions
      void_nexus: 'lava',
      astral_observatory: 'stone',
      dream_realm: 'grass',
      nightmare_depths: 'lava',
      
      // Default
      surface_world: 'grass'
    };
    
    return `tile_${regionTileMap[regionName] || 'grass'}`;
  }

  private static createDetailedEnemySprites(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics) {
    // Skeleton
    graphics.clear();
    graphics.fillStyle(0xF5F5DC); // Beige base
    graphics.fillRect(6, 8, 20, 16); // Body
    graphics.fillRect(10, 4, 12, 8); // Head
    graphics.fillStyle(0xFFFFFF); // White bones
    graphics.fillRect(8, 10, 2, 10); // Left arm bone
    graphics.fillRect(22, 10, 2, 10); // Right arm bone
    graphics.fillRect(12, 20, 2, 8); // Left leg bone
    graphics.fillRect(18, 20, 2, 8); // Right leg bone
    graphics.fillStyle(0xFF0000); // Red eyes
    graphics.fillCircle(13, 8, 1);
    graphics.fillCircle(19, 8, 1);
    graphics.generateTexture('enemy_skeleton', 32, 32);

    // Goblin
    graphics.clear();
    graphics.fillStyle(0x228B22); // Green skin
    graphics.fillCircle(16, 12, 10); // Body
    graphics.fillCircle(16, 8, 6); // Head
    graphics.fillStyle(0x8B4513); // Brown clothes
    graphics.fillRect(12, 14, 8, 6); // Vest
    graphics.fillStyle(0xFF0000); // Red eyes
    graphics.fillCircle(14, 7, 1);
    graphics.fillCircle(18, 7, 1);
    graphics.fillStyle(0xFFFFFF); // White teeth
    graphics.fillRect(15, 9, 2, 1);
    graphics.generateTexture('enemy_goblin', 32, 32);

    // Spider
    graphics.clear();
    graphics.fillStyle(0x4B0082); // Purple body
    graphics.fillCircle(16, 16, 6); // Main body
    graphics.fillCircle(16, 12, 4); // Head
    graphics.fillStyle(0x2F0052); // Darker purple for legs
    // 8 spider legs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const legX = 16 + Math.cos(angle) * 8;
      const legY = 16 + Math.sin(angle) * 8;
      graphics.fillRect(legX - 1, legY - 1, 2, 2);
    }
    graphics.fillStyle(0xFF0000); // Red eyes
    graphics.fillCircle(15, 11, 1);
    graphics.fillCircle(17, 11, 1);
    graphics.generateTexture('enemy_spider', 32, 32);

    // Wolf
    graphics.clear();
    graphics.fillStyle(0x696969); // Gray fur
    graphics.fillCircle(16, 16, 8); // Body
    graphics.fillCircle(12, 10, 5); // Head
    graphics.fillCircle(8, 8, 2); // Snout
    graphics.fillStyle(0x2F2F2F); // Dark gray
    graphics.fillCircle(10, 9, 1); // Nose
    graphics.fillStyle(0xFF0000); // Red eyes
    graphics.fillCircle(11, 7, 1);
    graphics.fillCircle(13, 7, 1);
    // Ears
    graphics.fillStyle(0x696969);
    graphics.fillCircle(9, 5, 2);
    graphics.fillCircle(15, 5, 2);
    graphics.generateTexture('enemy_wolf', 32, 32);

    // Dragon
    graphics.clear();
    graphics.fillStyle(0xFF0000); // Red scales
    graphics.fillCircle(16, 16, 10); // Body
    graphics.fillCircle(16, 8, 6); // Head
    graphics.fillStyle(0x8B0000); // Dark red details
    graphics.fillRect(14, 4, 4, 2); // Horns
    graphics.fillStyle(0xFFD700); // Gold belly
    graphics.fillCircle(16, 18, 6);
    graphics.fillStyle(0xFF4500); // Orange eyes
    graphics.fillCircle(14, 7, 1);
    graphics.fillCircle(18, 7, 1);
    // Wings
    graphics.fillStyle(0x8B0000);
    graphics.fillCircle(8, 12, 4);
    graphics.fillCircle(24, 12, 4);
    graphics.generateTexture('enemy_dragon', 32, 32);

    // Demon
    graphics.clear();
    graphics.fillStyle(0x8B0000); // Dark red skin
    graphics.fillCircle(16, 16, 9); // Body
    graphics.fillCircle(16, 8, 6); // Head
    graphics.fillStyle(0x2F0000); // Very dark red
    graphics.fillRect(13, 4, 2, 3); // Left horn
    graphics.fillRect(17, 4, 2, 3); // Right horn
    graphics.fillStyle(0xFFD700); // Gold details
    graphics.fillRect(12, 14, 8, 2); // Belt
    graphics.fillStyle(0xFF6600); // Orange eyes
    graphics.fillCircle(14, 7, 1);
    graphics.fillCircle(18, 7, 1);
    graphics.fillStyle(0xFF0000); // Red mouth
    graphics.fillRect(14, 9, 4, 1);
    graphics.generateTexture('enemy_demon', 32, 32);
  }

  private static createBossSprites(scene: Phaser.Scene, graphics: Phaser.GameObjects.Graphics) {
    // Boss Treant
    graphics.clear();
    graphics.fillStyle(0x8B4513); // Brown trunk
    graphics.fillRect(8, 12, 16, 16); // Main trunk
    graphics.fillStyle(0x228B22); // Green leaves
    graphics.fillCircle(6, 8, 4);
    graphics.fillCircle(16, 6, 6);
    graphics.fillCircle(26, 8, 4);
    graphics.fillStyle(0x654321); // Dark brown
    graphics.fillRect(12, 20, 2, 6); // Left root
    graphics.fillRect(18, 20, 2, 6); // Right root
    graphics.fillStyle(0xFF0000); // Red eyes
    graphics.fillCircle(13, 16, 2);
    graphics.fillCircle(19, 16, 2);
    graphics.fillStyle(0x8B0000); // Dark red mouth
    graphics.fillRect(14, 20, 4, 2);
    graphics.generateTexture('boss_treant', 32, 32);

    // Boss Dragon
    graphics.clear();
    graphics.fillStyle(0xFF0000); // Red scales
    graphics.fillCircle(16, 16, 12); // Large body
    graphics.fillCircle(16, 8, 8); // Large head
    graphics.fillStyle(0x8B0000); // Dark red details
    graphics.fillRect(12, 2, 3, 4); // Left horn
    graphics.fillRect(17, 2, 3, 4); // Right horn
    graphics.fillStyle(0xFFD700); // Gold belly
    graphics.fillCircle(16, 20, 8);
    graphics.fillStyle(0xFF4500); // Orange eyes
    graphics.fillCircle(13, 7, 2);
    graphics.fillCircle(19, 7, 2);
    // Large wings
    graphics.fillStyle(0x8B0000);
    graphics.fillCircle(4, 12, 6);
    graphics.fillCircle(28, 12, 6);
    // Fire breath effect
    graphics.fillStyle(0xFF6600);
    graphics.fillCircle(16, 12, 3);
    graphics.generateTexture('boss_dragon', 32, 32);

    // Boss Sandworm
    graphics.clear();
    graphics.fillStyle(0xDEB887); // Sandy color
    graphics.fillCircle(16, 16, 10); // Body segment
    graphics.fillCircle(16, 8, 8); // Head
    graphics.fillCircle(16, 24, 6); // Tail
    graphics.fillStyle(0x8B7355); // Dark sand
    // Segmented body rings
    graphics.fillRect(6, 14, 20, 2);
    graphics.fillRect(6, 18, 20, 2);
    graphics.fillRect(6, 22, 20, 2);
    graphics.fillStyle(0xFF0000); // Red eyes
    graphics.fillCircle(14, 6, 2);
    graphics.fillCircle(18, 6, 2);
    graphics.fillStyle(0x2F2F2F); // Black mouth
    graphics.fillCircle(16, 10, 3);
    // Teeth
    graphics.fillStyle(0xFFFFFF);
    graphics.fillRect(13, 8, 1, 3);
    graphics.fillRect(16, 8, 1, 3);
    graphics.fillRect(19, 8, 1, 3);
    graphics.generateTexture('boss_sandworm', 32, 32);
  }

  private createDetailedItemSprites(graphics: Phaser.GameObjects.Graphics) {
    // Health Potion
    graphics.clear();
    graphics.fillStyle(0xFF0000); // Red base
    graphics.fillRect(12, 8, 8, 16); // Bottle body
    graphics.fillStyle(0x8B0000); // Dark red liquid
    graphics.fillRect(13, 10, 6, 12); // Liquid
    graphics.fillStyle(0x654321); // Brown cork
    graphics.fillRect(14, 6, 4, 4); // Cork
    graphics.fillStyle(0xFFFFFF); // White label
    graphics.fillRect(13, 14, 6, 4); // Label
    graphics.generateTexture('item_potion_health', 32, 32);

    // Mana Potion
    graphics.clear();
    graphics.fillStyle(0x0000FF); // Blue base
    graphics.fillRect(12, 8, 8, 16); // Bottle body
    graphics.fillStyle(0x000080); // Dark blue liquid
    graphics.fillRect(13, 10, 6, 12); // Liquid
    graphics.fillStyle(0x654321); // Brown cork
    graphics.fillRect(14, 6, 4, 4); // Cork
    graphics.fillStyle(0xFFFFFF); // White label
    graphics.fillRect(13, 14, 6, 4); // Label
    graphics.generateTexture('item_potion_mana', 32, 32);

    // Generic Potion
    graphics.clear();
    graphics.fillStyle(0x9370DB); // Purple base
    graphics.fillRect(12, 8, 8, 16); // Bottle body
    graphics.fillStyle(0x663399); // Dark purple liquid
    graphics.fillRect(13, 10, 6, 12); // Liquid
    graphics.fillStyle(0x654321); // Brown cork
    graphics.fillRect(14, 6, 4, 4); // Cork
    graphics.generateTexture('item_potion', 32, 32);

    // Gold Coin
    graphics.clear();
    graphics.fillStyle(0xFFD700); // Gold outer
    graphics.fillCircle(16, 16, 10); // Outer circle
    graphics.fillStyle(0xFFA500); // Orange inner
    graphics.fillCircle(16, 16, 8); // Inner circle
    graphics.fillStyle(0xFFFF00); // Yellow center
    graphics.fillCircle(16, 16, 6); // Center
    graphics.fillStyle(0xFFD700); // Gold highlight
    graphics.fillCircle(14, 14, 2); // Highlight spot
    graphics.generateTexture('item_coin', 32, 32);

    // Gem
    graphics.clear();
    graphics.fillStyle(0x9370DB); // Purple gem
    graphics.fillRect(10, 12, 12, 8); // Base
    graphics.fillRect(12, 10, 8, 4); // Middle
    graphics.fillRect(14, 8, 4, 4); // Top
    graphics.fillStyle(0xDDA0DD); // Light purple highlights
    graphics.fillRect(11, 13, 2, 2);
    graphics.fillRect(15, 11, 2, 2);
    graphics.fillRect(16, 9, 2, 2);
    graphics.generateTexture('item_gem', 32, 32);

    // Sword (item version)
    graphics.clear();
    graphics.fillStyle(0xC0C0C0); // Silver blade
    graphics.fillRect(14, 4, 4, 20); // Blade
    graphics.fillStyle(0x8B4513); // Brown handle
    graphics.fillRect(13, 20, 6, 8); // Handle
    graphics.fillStyle(0xFFD700); // Gold guard
    graphics.fillRect(10, 18, 12, 3); // Guard
    graphics.generateTexture('item_sword', 32, 32);

    // Shield (item version)
    graphics.clear();
    graphics.fillStyle(0x8B4513); // Brown wood
    graphics.fillCircle(16, 16, 10); // Shield base
    graphics.fillStyle(0xC0C0C0); // Silver rim
    graphics.lineStyle(2, 0xC0C0C0);
    graphics.strokeCircle(16, 16, 10); // Rim
    graphics.fillStyle(0xFFD700); // Gold boss
    graphics.fillCircle(16, 16, 4); // Center boss
    graphics.generateTexture('item_shield', 32, 32);

    // Ring
    graphics.clear();
    graphics.fillStyle(0xFFD700); // Gold band
    graphics.fillCircle(16, 16, 8); // Outer ring
    graphics.fillStyle(0x000000); // Black center
    graphics.fillCircle(16, 16, 5); // Inner hole
    graphics.fillStyle(0xFF0000); // Red gem
    graphics.fillCircle(16, 12, 3); // Gem on top
    graphics.generateTexture('item_ring', 32, 32);

    // Scroll
    graphics.clear();
    graphics.fillStyle(0xF5DEB3); // Wheat colored paper
    graphics.fillRect(8, 6, 16, 20); // Paper
    graphics.fillStyle(0x8B4513); // Brown text lines
    graphics.fillRect(10, 10, 12, 1);
    graphics.fillRect(10, 13, 12, 1);
    graphics.fillRect(10, 16, 12, 1);
    graphics.fillRect(10, 19, 8, 1);
    graphics.fillStyle(0xDC143C); // Red ribbon
    graphics.fillRect(15, 4, 2, 24); // Ribbon
    graphics.generateTexture('item_scroll', 32, 32);
  }

  // Get enemy sprite
  getEnemySprite(enemyType: string): string {
    return `enemy_${enemyType}`;
  }

  static createFallbackAssets(scene: Phaser.Scene) {
    console.log('🎨 Attempting to create fallback assets...');
    
    // Wait for scene.add to be available
    const waitForSceneReady = (callback: () => void, maxAttempts = 20) => {
      let attempts = 0;
      const checkReady = () => {
        attempts++;
        console.log(`🔍 Checking scene readiness (attempt ${attempts}/${maxAttempts})...`);
        
        if (scene && scene.textures && scene.add && typeof scene.add.graphics === 'function' && scene.game && scene.game.isRunning) {
          console.log('✅ Scene is ready for fallback assets creation');
          callback();
        } else {
          console.warn(`⚠️ Scene not ready (attempt ${attempts}/${maxAttempts}):`, {
            scene: !!scene,
            textures: !!scene?.textures,
            add: !!scene?.add,
            graphics: typeof scene?.add?.graphics,
            game: !!scene?.game,
            isRunning: scene?.game?.isRunning
          });
          
          if (attempts < maxAttempts) {
            setTimeout(checkReady, 300);
          } else {
            console.error('❌ Scene failed to become ready after maximum attempts');
          }
        }
      };
      checkReady();
    };

    waitForSceneReady(() => {
      try {
        console.log('🎨 Creating fallback colored assets...');
        
        // Create fallback assets with retry mechanism
        const createWithRetry = (creator: () => void, name: string, maxRetries = 5) => {
          let attempts = 0;
          const tryCreate = () => {
            try {
              if (scene && scene.textures && scene.add && typeof scene.add.graphics === 'function' && scene.game && scene.game.isRunning) {
                creator();
              } else {
                throw new Error('Scene not ready or graphics not available or game not running');
              }
            } catch (error) {
              attempts++;
              console.warn(`⚠️ Failed to create ${name} (attempt ${attempts}/${maxRetries}):`, error);
              if (attempts < maxRetries) {
                setTimeout(tryCreate, 500);
              } else {
                console.error(`❌ Failed to create ${name} after ${maxRetries} attempts`);
              }
            }
          };
          tryCreate();
        };
        
        // Create fallback character sprites
        const characterRaces = ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'drow'];
        characterRaces.forEach(race => {
          createWithRetry(() => {
            AssetManager.createFallbackCharacterSprite(scene, `player_${race}`, race);
          }, `character sprite ${race}`);
        });
        
        // Create fallback enemy sprites
        const enemies = ['skeleton', 'goblin', 'wolf', 'spider'];
        enemies.forEach(enemy => {
          createWithRetry(() => {
            AssetManager.createFallbackEnemySprite(scene, `enemy_${enemy}`, enemy);
          }, `enemy sprite ${enemy}`);
        });
        
        // Create fallback item sprites
        const items = ['coin', 'gem', 'potion_health', 'potion', 'sword', 'shield'];
        items.forEach(item => {
          createWithRetry(() => {
            AssetManager.createFallbackItemSprite(scene, `item_${item}`, item);
          }, `item sprite ${item}`);
        });
        
        // Create fallback tile sprites
        const tiles = ['grass', 'stone', 'water', 'sand', 'snow', 'lava'];
        tiles.forEach(tile => {
          createWithRetry(() => {
            AssetManager.createFallbackTileSprite(scene, `tile_${tile}`, tile);
          }, `tile sprite ${tile}`);
        });
        
        // Create fallback UI sprites
        createWithRetry(() => {
          AssetManager.createFallbackUISprites(scene);
        }, 'UI sprites');
        
        console.log('✅ All fallback assets creation initiated');
      } catch (error) {
        console.error('❌ Error initiating fallback assets creation:', error);
      }
    });
  }

  static createFallbackCharacterSprite(scene: Phaser.Scene, key: string, race: string) {
    if (!scene || !scene.textures || !scene.add || !scene.game || !scene.game.isRunning) {
      console.warn(`⚠️ Scene is not ready for fallback character sprite: ${key}`);
      return;
    }
    
    if (scene.textures.exists(key)) {
      console.log(`✅ Texture ${key} already exists, skipping fallback creation`);
      return;
    }
    
    try {
      // Double check that scene.add is available and not null
      if (!scene.add || typeof scene.add.graphics !== 'function' || !scene.game || !scene.game.isRunning) {
        console.warn(`⚠️ Scene.add.graphics is not available for fallback character sprite: ${key}`);
        return;
      }
      
      const graphics = scene.add.graphics();
      const raceColors: { [key: string]: number } = {
        human: 0xDEB887, elf: 0x90EE90, dwarf: 0xCD853F, orc: 0x8B4513,
        halfling: 0xF0E68C, dragonborn: 0xFF4500, tiefling: 0x8B0000,
        drow: 0x2F4F4F, githzerai: 0x9370DB
      };

      const color = raceColors[race] || 0x9C27B0;

      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillCircle(16, 16, 12);
      graphics.fillStyle(0x000000);
      graphics.fillCircle(12, 12, 2);
      graphics.fillCircle(20, 12, 2);
      graphics.fillStyle(0xFF0000);
      graphics.fillRect(14, 18, 4, 2);
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
      console.log(`✅ Created fallback character sprite: ${key}`);
    } catch (error) {
      console.error(`❌ Error creating fallback character sprite for ${key}:`, error);
    }
  }

  static createFallbackEnemySprite(scene: Phaser.Scene, key: string, enemy: string) {
    if (!scene || !scene.textures || !scene.add || !scene.game || !scene.game.isRunning) {
      console.warn(`⚠️ Scene is not ready for fallback enemy sprite: ${key}`);
      return;
    }
    
    if (scene.textures.exists(key)) {
      console.log(`✅ Texture ${key} already exists, skipping fallback creation`);
      return;
    }
    
    try {
      // Double check that scene.add is available and not null
      if (!scene.add || typeof scene.add.graphics !== 'function' || !scene.game || !scene.game.isRunning) {
        console.warn(`⚠️ Scene.add.graphics is not available for fallback enemy sprite: ${key}`);
        return;
      }
      
      const graphics = scene.add.graphics();
      const enemyColors: { [key: string]: number } = {
        skeleton: 0xF5F5DC, goblin: 0x228B22, spider: 0x4B0082,
        wolf: 0x696969, dragon: 0xFF0000, demon: 0x8B0000
      };

      const color = enemyColors[enemy] || 0xFF4500;

      graphics.clear();
      graphics.fillStyle(color);
      graphics.fillRect(4, 4, 24, 24);
      graphics.fillStyle(0xFF0000);
      graphics.fillCircle(10, 10, 2);
      graphics.fillCircle(22, 10, 2);
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
      console.log(`✅ Created fallback enemy sprite: ${key}`);
    } catch (error) {
      console.error(`❌ Error creating fallback enemy sprite for ${key}:`, error);
    }
  }

  static createFallbackItemSprite(scene: Phaser.Scene, key: string, item: string) {
    if (!scene || !scene.textures || !scene.add || !scene.game || !scene.game.isRunning) {
      console.warn(`⚠️ Scene is not ready for fallback item sprite: ${key}`);
      return;
    }
    
    if (scene.textures.exists(key)) {
      console.log(`✅ Texture ${key} already exists, skipping fallback creation`);
      return;
    }
    
    try {
      // Double check that scene.add is available and not null
      if (!scene.add || typeof scene.add.graphics !== 'function' || !scene.game || !scene.game.isRunning) {
        console.warn(`⚠️ Scene.add.graphics is not available for fallback item sprite: ${key}`);
        return;
      }
      
      const graphics = scene.add.graphics();
      let color = 0xFFD700;
      
      if (item.includes('potion_health')) color = 0xFF0000;
      else if (item.includes('potion_mana')) color = 0x0000FF;
      else if (item.includes('gem')) color = 0x9370DB;
      else if (item === 'sword') color = 0xC0C0C0;
      else if (item === 'shield') color = 0x708090;
      else if (item === 'ring') color = 0xFFD700;
      else if (item === 'scroll') color = 0xF5DEB3;
      
      graphics.clear();
      graphics.fillStyle(color);
      
      if (item.includes('potion')) {
        graphics.fillRect(12, 8, 8, 16);
        graphics.fillRect(14, 6, 4, 4);
      } else if (item === 'coin') {
        graphics.fillCircle(16, 16, 8);
      } else if (item === 'sword') {
        graphics.fillRect(14, 4, 4, 24);
        graphics.fillRect(12, 6, 8, 4);
      } else if (item === 'shield') {
        graphics.fillRect(6, 6, 20, 20);
        graphics.lineStyle(2, 0x000000);
        graphics.strokeRect(6, 6, 20, 20);
      } else if (item === 'ring') {
        graphics.lineStyle(3, color);
        graphics.strokeEllipse(16, 16, 12, 8);
        graphics.fillStyle(0xFF1493);
        graphics.fillEllipse(16, 12, 4, 3);
      } else if (item === 'scroll') {
        graphics.fillRect(6, 8, 20, 16);
        graphics.lineStyle(1, 0x8B4513);
        graphics.strokeRect(6, 8, 20, 16);
        // Add text lines
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(10, 12, 12, 1);
        graphics.fillRect(10, 14, 10, 1);
        graphics.fillRect(10, 16, 11, 1);
      } else {
        graphics.fillRect(8, 8, 16, 16);
      }
      
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
      console.log(`✅ Created fallback item sprite: ${key}`);
    } catch (error) {
      console.error(`❌ Error creating fallback item sprite for ${key}:`, error);
    }
  }

  static createFallbackTileSprite(scene: Phaser.Scene, key: string, tile: string) {
    if (!scene || !scene.textures || !scene.add || !scene.game || !scene.game.isRunning) {
      console.warn(`⚠️ Scene is not ready for fallback tile sprite: ${key}`);
      return;
    }
    
    if (scene.textures.exists(key)) {
      console.log(`✅ Texture ${key} already exists, skipping fallback creation`);
      return;
    }
    
    try {
      // Double check that scene.add is available and not null
      if (!scene.add || typeof scene.add.graphics !== 'function' || !scene.game || !scene.game.isRunning) {
        console.warn(`⚠️ Scene.add.graphics is not available for fallback tile sprite: ${key}`);
        return;
      }
      
      const graphics = scene.add.graphics();
      
      // Enhanced tile creation based on type
      switch (tile) {
        case 'grass':
          // Enhanced Grass Tile with smooth edges
          graphics.clear();
          graphics.fillStyle(0x228B22); // Base grass color
          graphics.fillRect(0, 0, 32, 32);
          
          // Add grass texture with multiple shades
          graphics.fillStyle(0x32CD32); // Lighter grass
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (Math.random() > 0.6) {
                graphics.fillRect(i * 4, j * 4, 2, 2);
              }
            }
          }
          
          // Add darker grass patches
          graphics.fillStyle(0x006400); // Darker grass
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
              if (Math.random() > 0.7) {
                graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
              }
            }
          }
          
          // Add small grass details
          graphics.fillStyle(0x90EE90); // Light green details
          for (let i = 0; i < 12; i++) {
            const x = Math.random() * 28 + 2;
            const y = Math.random() * 28 + 2;
            graphics.fillRect(x, y, 1, 1);
          }
          
          // Add smooth edge gradient for better blending
          graphics.fillStyle(0x228B22, 0.5);
          graphics.fillRect(0, 0, 32, 3); // Top edge
          graphics.fillRect(0, 29, 32, 3); // Bottom edge
          graphics.fillRect(0, 0, 3, 32); // Left edge
          graphics.fillRect(29, 0, 3, 32); // Right edge
          
          // Add corner gradients for seamless blending
          graphics.fillStyle(0x228B22, 0.7);
          graphics.fillRect(0, 0, 4, 4); // Top-left corner
          graphics.fillRect(28, 0, 4, 4); // Top-right corner
          graphics.fillRect(0, 28, 4, 4); // Bottom-left corner
          graphics.fillRect(28, 28, 4, 4); // Bottom-right corner
          break;
          
        case 'stone':
          // Enhanced Stone Tile with smooth edges
      graphics.clear();
          graphics.fillStyle(0x708090); // Base stone color
      graphics.fillRect(0, 0, 32, 32);
      
          // Add stone texture with cracks and variations
          graphics.fillStyle(0x808080); // Lighter stone
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
              if (Math.random() > 0.5) {
                graphics.fillRect(i * 8, j * 8, 6, 6);
              }
            }
          }
          
          // Add darker stone areas
          graphics.fillStyle(0x696969); // Darker stone
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
              if (Math.random() > 0.6) {
                graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
              }
            }
          }
          
          // Add stone cracks
          graphics.lineStyle(1, 0x2F4F4F);
          for (let i = 0; i < 3; i++) {
            const startX = Math.random() * 32;
            const startY = Math.random() * 32;
            const endX = startX + (Math.random() - 0.5) * 16;
            const endY = startY + (Math.random() - 0.5) * 16;
            graphics.lineBetween(startX, startY, endX, endY);
          }
          
          // Add smooth edge gradient for better blending
          graphics.fillStyle(0x708090, 0.5);
          graphics.fillRect(0, 0, 32, 3); // Top edge
          graphics.fillRect(0, 29, 32, 3); // Bottom edge
          graphics.fillRect(0, 0, 3, 32); // Left edge
          graphics.fillRect(29, 0, 3, 32); // Right edge
          
          // Add corner gradients for seamless blending
          graphics.fillStyle(0x708090, 0.7);
          graphics.fillRect(0, 0, 4, 4); // Top-left corner
          graphics.fillRect(28, 0, 4, 4); // Top-right corner
          graphics.fillRect(0, 28, 4, 4); // Bottom-left corner
          graphics.fillRect(28, 28, 4, 4); // Bottom-right corner
          break;
          
        case 'water':
          // Enhanced Water Tile with smooth edges
          graphics.clear();
          graphics.fillStyle(0x4169E1); // Base water color
          graphics.fillRect(0, 0, 32, 32);
          
          // Add water ripples and waves
          graphics.fillStyle(0x87CEEB); // Light blue waves
          for (let i = 0; i < 4; i++) {
            graphics.fillRect(0, i * 8, 32, 2);
          }
          
          // Add water highlights
          graphics.fillStyle(0xADD8E6); // Very light blue highlights
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (Math.random() > 0.7) {
                graphics.fillRect(i * 4, j * 4, 2, 2);
              }
            }
          }
          
          // Add water depth variations
          graphics.fillStyle(0x000080); // Dark blue depth
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
              if (Math.random() > 0.8) {
                graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
              }
            }
          }
          
          // Add smooth edge gradient for better blending
          graphics.fillStyle(0x4169E1, 0.5);
          graphics.fillRect(0, 0, 32, 3); // Top edge
          graphics.fillRect(0, 29, 32, 3); // Bottom edge
          graphics.fillRect(0, 0, 3, 32); // Left edge
          graphics.fillRect(29, 0, 3, 32); // Right edge
          
          // Add corner gradients for seamless blending
          graphics.fillStyle(0x4169E1, 0.7);
          graphics.fillRect(0, 0, 4, 4); // Top-left corner
          graphics.fillRect(28, 0, 4, 4); // Top-right corner
          graphics.fillRect(0, 28, 4, 4); // Bottom-left corner
          graphics.fillRect(28, 28, 4, 4); // Bottom-right corner
          break;
          
        case 'sand':
          // Enhanced Sand Tile with smooth edges
          graphics.clear();
          graphics.fillStyle(0xF4A460); // Base sand color
          graphics.fillRect(0, 0, 32, 32);
          
          // Add sand texture with grains
          graphics.fillStyle(0xDEB887); // Lighter sand
          for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
              if (Math.random() > 0.6) {
                graphics.fillRect(i * 2, j * 2, 1, 1);
              }
            }
          }
          
          // Add darker sand areas
          graphics.fillStyle(0xD2691E); // Darker sand
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (Math.random() > 0.7) {
                graphics.fillRect(i * 4, j * 4, 2, 2);
              }
            }
          }
          
          // Add sand dunes effect
          graphics.fillStyle(0xCD853F); // Dune color
          for (let i = 0; i < 4; i++) {
            graphics.fillRect(0, i * 8, 32, 1);
          }
          
          // Add smooth edge gradient for better blending
          graphics.fillStyle(0xF4A460, 0.5);
          graphics.fillRect(0, 0, 32, 3); // Top edge
          graphics.fillRect(0, 29, 32, 3); // Bottom edge
          graphics.fillRect(0, 0, 3, 32); // Left edge
          graphics.fillRect(29, 0, 3, 32); // Right edge
          
          // Add corner gradients for seamless blending
          graphics.fillStyle(0xF4A460, 0.7);
          graphics.fillRect(0, 0, 4, 4); // Top-left corner
          graphics.fillRect(28, 0, 4, 4); // Top-right corner
          graphics.fillRect(0, 28, 4, 4); // Bottom-left corner
          graphics.fillRect(28, 28, 4, 4); // Bottom-right corner
          break;
          
        case 'snow':
          // Enhanced Snow Tile with smooth edges
          graphics.clear();
          graphics.fillStyle(0xF0F8FF); // Base snow color
          graphics.fillRect(0, 0, 32, 32);
          
          // Add snow texture with sparkles
          graphics.fillStyle(0xFFFFFF); // Pure white sparkles
          for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
              if (Math.random() > 0.8) {
                graphics.fillRect(i * 1.6, j * 1.6, 1, 1);
              }
            }
          }
          
          // Add snow depth variations
          graphics.fillStyle(0xE6E6FA); // Light lavender depth
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (Math.random() > 0.7) {
                graphics.fillRect(i * 4, j * 4, 3, 3);
              }
            }
          }
          
          // Add ice crystals
          graphics.lineStyle(1, 0x87CEEB);
          for (let i = 0; i < 4; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            graphics.lineBetween(x, y, x + 4, y + 4);
            graphics.lineBetween(x + 4, y, x, y + 4);
          }
          
          // Add smooth edge gradient for better blending
          graphics.fillStyle(0xF0F8FF, 0.5);
          graphics.fillRect(0, 0, 32, 3); // Top edge
          graphics.fillRect(0, 29, 32, 3); // Bottom edge
          graphics.fillRect(0, 0, 3, 32); // Left edge
          graphics.fillRect(29, 0, 3, 32); // Right edge
          
          // Add corner gradients for seamless blending
          graphics.fillStyle(0xF0F8FF, 0.7);
          graphics.fillRect(0, 0, 4, 4); // Top-left corner
          graphics.fillRect(28, 0, 4, 4); // Top-right corner
          graphics.fillRect(0, 28, 4, 4); // Bottom-left corner
          graphics.fillRect(28, 28, 4, 4); // Bottom-right corner
          break;
          
        case 'lava':
          // Enhanced Lava Tile with smooth edges
          graphics.clear();
          graphics.fillStyle(0xFF4500); // Base lava color
          graphics.fillRect(0, 0, 32, 32);
          
          // Add lava flow patterns
          graphics.fillStyle(0xFF6347); // Lighter lava
          for (let i = 0; i < 4; i++) {
            graphics.fillRect(0, i * 8, 32, 3);
          }
          
          // Add lava bubbles and hot spots
          graphics.fillStyle(0xFFD700); // Golden hot spots
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (Math.random() > 0.8) {
                graphics.fillCircle(i * 4 + 2, j * 4 + 2, 2);
              }
            }
          }
          
          // Add darker lava areas
          graphics.fillStyle(0x8B0000); // Dark red lava
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
              if (Math.random() > 0.7) {
                graphics.fillRect(i * 5 + 1, j * 5 + 1, 3, 3);
              }
            }
          }
          
          // Add lava glow effect
          graphics.fillStyle(0xFFFF00); // Yellow glow
          for (let i = 0; i < 12; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            graphics.fillRect(x, y, 1, 1);
          }
          
          // Add smooth edge gradient for better blending
          graphics.fillStyle(0xFF4500, 0.5);
          graphics.fillRect(0, 0, 32, 3); // Top edge
          graphics.fillRect(0, 29, 32, 3); // Bottom edge
          graphics.fillRect(0, 0, 3, 32); // Left edge
          graphics.fillRect(29, 0, 3, 32); // Right edge
          
          // Add corner gradients for seamless blending
          graphics.fillStyle(0xFF4500, 0.7);
          graphics.fillRect(0, 0, 4, 4); // Top-left corner
          graphics.fillRect(28, 0, 4, 4); // Top-right corner
          graphics.fillRect(0, 28, 4, 4); // Bottom-left corner
          graphics.fillRect(28, 28, 4, 4); // Bottom-right corner
          break;
          
        default:
          // Default enhanced tile
          graphics.clear();
          graphics.fillStyle(0x228B22); // Default green
          graphics.fillRect(0, 0, 32, 32);
          
          // Add texture pattern
          graphics.fillStyle(0x32CD32);
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (Math.random() > 0.6) {
                graphics.fillRect(i * 4, j * 4, 2, 2);
              }
            }
          }
          break;
      }
      
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
      console.log(`✅ Created enhanced fallback tile sprite: ${key}`);
    } catch (error) {
      console.error(`❌ Error creating fallback tile sprite for ${key}:`, error);
    }
  }

  static createFallbackBossSprite(scene: Phaser.Scene, key: string, boss: string) {
    if (!scene || !scene.textures || !scene.add || !scene.game || !scene.game.isRunning) {
      console.warn(`⚠️ Scene is not ready for fallback boss sprite: ${key}`);
      return;
    }
    
    if (scene.textures.exists(key)) {
      console.log(`✅ Texture ${key} already exists, skipping fallback creation`);
      return;
    }
    
    try {
      // Double check that scene.add is available and not null
      if (!scene.add || typeof scene.add.graphics !== 'function' || !scene.game || !scene.game.isRunning) {
        console.warn(`⚠️ Scene.add.graphics is not available for fallback boss sprite: ${key}`);
        return;
      }
      
      const graphics = scene.add.graphics();
      const bossColors: { [key: string]: number } = {
        boss_ancient_treant: 0x228B22,      // Forest Green
        boss_dragon_wyrmling: 0xFF4500,     // Orange Red
        boss_mummy_lord: 0xF5DEB3,          // Wheat
        boss_sand_worm: 0xD2B48C,           // Tan
        boss_shadow_wolf_alpha: 0x2F4F4F,   // Dark Slate Gray
        boss_stone_giant: 0x696969          // Dim Gray
      };

      const color = bossColors[boss] || 0xFF0000;

      graphics.clear();
      graphics.fillStyle(color);
      
      // Create boss-specific shapes
      if (boss.includes('treant')) {
        // Tree-like boss
        graphics.fillRect(12, 20, 8, 12); // Trunk
        graphics.fillCircle(16, 12, 10);  // Leaves
      } else if (boss.includes('dragon')) {
        // Dragon-like boss
        graphics.fillRect(8, 8, 16, 16);  // Body
        graphics.fillTriangle(24, 8, 32, 16, 24, 24); // Tail
      } else if (boss.includes('mummy')) {
        // Mummy-like boss
        graphics.fillRect(8, 8, 16, 16);  // Body
        graphics.lineStyle(2, 0x8B4513);
        for (let i = 0; i < 4; i++) {
          graphics.lineBetween(8, 12 + i * 2, 24, 12 + i * 2);
        }
      } else if (boss.includes('worm')) {
        // Worm-like boss
        graphics.fillCircle(16, 16, 12);
        graphics.fillStyle(color + 0x202020);
        graphics.fillCircle(16, 16, 8);
      } else if (boss.includes('wolf')) {
        // Wolf-like boss
        graphics.fillRect(8, 12, 16, 12);  // Body
        graphics.fillRect(4, 8, 8, 8);     // Head
        graphics.fillTriangle(0, 12, 4, 16, 4, 8); // Ears
      } else if (boss.includes('giant')) {
        // Giant-like boss
        graphics.fillRect(6, 6, 20, 20);   // Large body
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(10, 26, 12, 6);  // Legs
      } else {
        // Generic boss
        graphics.fillRect(4, 4, 24, 24);
      }
      
      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
      console.log(`✅ Created fallback boss sprite: ${key}`);
    } catch (error) {
      console.error(`❌ Error creating fallback boss sprite for ${key}:`, error);
    }
  }

  static createFallbackUISprites(scene: Phaser.Scene) {
    if (!scene || !scene.textures || !scene.add || !scene.game || !scene.game.isRunning) {
      console.warn('⚠️ Scene is not ready for fallback UI sprites');
      return;
    }

    // Create basic UI fallback sprites if needed
    const uiSprites = ['ui_logo'];
    
    uiSprites.forEach(key => {
      if (!scene.textures.exists(key)) {
        try {
          // Double check that scene.add is available and not null
          if (!scene.add || typeof scene.add.graphics !== 'function' || !scene.game || !scene.game.isRunning) {
            console.warn(`⚠️ Scene.add.graphics is not available for fallback UI sprite: ${key}`);
            return;
          }
          
          const graphics = scene.add.graphics();
          graphics.clear();
          graphics.fillStyle(0x9C27B0);
          graphics.fillRect(0, 0, 64, 32);
          graphics.generateTexture(key, 64, 32);
          graphics.destroy();
          console.log(`✅ Created fallback UI sprite: ${key}`);
        } catch (error) {
          console.error(`❌ Error creating fallback UI sprite for ${key}:`, error);
        }
      }
    });
  }
}

export default AssetManager;
