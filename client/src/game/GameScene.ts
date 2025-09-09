import Phaser from 'phaser';
import { AssetManager } from './AssetManager';
import AssetLoader from './AssetLoader';

export class GameScene extends Phaser.Scene {
  private assetManager!: AssetManager;
  private assetLoader!: AssetLoader;
  private player!: Phaser.GameObjects.Sprite;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private currentRegion: string = 'starting_meadows';
  private playerData: any = null;
  private otherPlayers: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private enemies: Phaser.GameObjects.Sprite[] = [];
  private items: Phaser.GameObjects.Sprite[] = [];
  private mapTiles: Phaser.GameObjects.TileSprite[] = [];
  private lastPositionUpdate: number = 0;
  private positionUpdateInterval: number = 33; // 33ms (30fps) for optimized network performance
  private socket: any = null;
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private hasJoinedRegion: boolean = false;
  private lastMoveTime: number = 0;
  private chatPanelOpen: boolean = false;
  
  // Chat message bubble system
  private messageBubbles: Map<string, Phaser.GameObjects.Container> = new Map();
  private messageBubbleTimers: Map<string, Phaser.Time.TimerEvent> = new Map();
  
  constructor() {
    super({ key: 'GameScene', physics: { default: 'arcade' } });
  }

  async preload() {
    // Preloading game assets silently
    
    try {
      // Wait for scene to be fully ready with increased timeout
      let attempts = 0;
      const maxAttempts = 20; // Increased from 10 to 20
      
      while ((!this.textures || !this.add) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Increased from 200 to 300
        attempts++;
      }
      
      if (!this.textures || !this.add) {
        throw new Error('Scene not ready after multiple attempts');
      }

      // Scene is ready, loading assets

      // Load game assets with retry mechanism
      await AssetLoader.loadGameAssets(this);
      
      // Verify that character sprites are loaded
      await this.verifyCharacterSprites();
      
      // Load sound effects
      this.loadSounds();
      
      // Preload completed successfully
      
    } catch (error) {
      console.error('❌ Asset loading failed in preload:', error);
      // Create fallback assets as last resort
      // Creating fallback assets due to loading failure
      AssetManager.createFallbackAssets(this);
    }
  }

  private async verifyCharacterSprites() {
    // Verifying character sprites silently
    
    const characterRaces = ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'drow', 'githzerai', 'svirfneblin'];
    
    for (const race of characterRaces) {
      const key = `player_${race}`;
      if (!this.textures.exists(key)) {
        console.warn(`⚠️ Character sprite ${key} not found, creating fallback`);
        AssetManager.createFallbackCharacterSprite(this, key, race);
      } else {
        // Character sprite verified
      }
    }
    
    // Character sprite verification completed
  }

  async create() {
    // Creating game scene silently
    
    // Initialize asset manager
    this.assetManager = new AssetManager(this);
    
    // Load sounds into memory
    this.createSounds();
    
    // Always create player first
    this.createPlayer();
    
    // Always start in open world mode by default
    // Entering Open World Mode
    this.createMap();
    this.createEnvironmentalObjects();
    this.createItems();
    this.game.events.emit('contextChanged', 'world');
    
    // Always create enemies and setup
    this.createEnemies();
    this.setupControls();
    this.setupUI();
    
    // Listen for external updates
    this.setupEventListeners();
    
    // Setup multiplayer listeners
    this.setupMultiplayerListeners();
    
    // Add dungeon generation button to UI
    this.addDungeonButton();
    
    // Emit scene ready event
    this.game.events.emit('sceneCreated', 'GameScene');
    this.game.events.emit('sceneStarted', 'GameScene');
  }

  private loadSounds() {
    // Loading sound effects silently
    
    // Combat sounds
    this.load.audio('sword_swing', '/assets/sounds/sword_swing.mp3');
    this.load.audio('hit', '/assets/sounds/hit.mp3');
    this.load.audio('magic_cast', '/assets/sounds/magic_cast.mp3');
    this.load.audio('heal', '/assets/sounds/heal.mp3');
    
    // UI sounds
    this.load.audio('button_click', '/assets/sounds/button_click.mp3');
    this.load.audio('item_pickup', '/assets/sounds/item_pickup.mp3');
    this.load.audio('level_up', '/assets/sounds/level_up.mp3');
    
    // Environment sounds
    this.load.audio('footstep', '/assets/sounds/footstep.mp3');
    this.load.audio('door_open', '/assets/sounds/door_open.mp3');
    this.load.audio('chest_open', '/assets/sounds/chest_open.mp3');
  }

  // Ses çalma fonksiyonları
  public playSound(soundName: string, volume: number = 0.5) {
    try {
      if (this.sounds.has(soundName)) {
        const sound = this.sounds.get(soundName)!;
        if (sound instanceof Phaser.Sound.WebAudioSound) {
          sound.setVolume(volume);
        }
        sound.play();
        // Playing sound
      } else {
        console.warn(`🔊 Sound not found: ${soundName}`);
      }
    } catch (error) {
      console.error(`🔊 Error playing sound ${soundName}:`, error);
    }
  }

  public playCombatSound(soundName: string) {
    this.playSound(soundName, 0.6);
  }

  public playUISound(soundName: string) {
    this.playSound(soundName, 0.4);
  }

  public playEnvironmentSound(soundName: string) {
    this.playSound(soundName, 0.3);
  }

  private createSounds() {
    // Creating sound instances
    
    const soundNames = [
      'sword_swing', 'hit', 'magic_cast', 'heal',
      'button_click', 'item_pickup', 'level_up',
      'footstep', 'door_open', 'chest_open'
    ];
    
    soundNames.forEach(soundName => {
      try {
        if (this.cache.audio.exists(soundName)) {
          const sound = this.sound.add(soundName);
          this.sounds.set(soundName, sound);
          // Sound created
        } else {
          console.warn(`🔊 Sound not found in cache: ${soundName}`);
        }
      } catch (error) {
        console.error(`🔊 Error creating sound ${soundName}:`, error);
      }
    });
  }



  private createMap() {
    // Creating map
    
    // Ensure tile textures exist before creating map
    const requiredTiles = ['tile_grass', 'tile_stone', 'tile_water', 'tile_sand', 'tile_snow', 'tile_lava'];
    for (const tileKey of requiredTiles) {
      if (!this.textures.exists(tileKey)) {
        console.warn(`⚠️ Tile texture ${tileKey} not found, creating fallback`);
        const tileType = tileKey.replace('tile_', '');
        AssetManager.createFallbackTileSprite(this, tileKey, tileType);
      } else {
        // Tile texture exists and will be used
      }
    }
    
    const mapWidth = Math.floor(this.scale.width / 32) + 4;
    const mapHeight = Math.floor(this.scale.height / 32) + 4;
    const tileSize = 32;
    
    // Creating map with calculated dimensions
    
    // Açık dünya haritası - duvar yok, sadece terrain
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        // Region'a göre farklı terrain pattern'leri
        const terrainType = this.getTerrainForPosition(x, y, mapWidth, mapHeight);
        
        // Creating tile
        
        // Texture'ın gerçekten var olup olmadığını ve ne tür olduğunu kontrol et
        if (this.textures.exists(terrainType)) {
          const texture = this.textures.get(terrainType);
          const source = texture.source[0];
          if (source && source.image) {
                      // Texture exists
          }
        } else {
          console.warn(`⚠️ Texture ${terrainType} does not exist!`);
        }
        
        const tileSprite = this.add.tileSprite(
          x * tileSize, 
          y * tileSize, 
          tileSize, 
          tileSize, 
          terrainType
        );
        
        tileSprite.setOrigin(0, 0);
        tileSprite.setAlpha(0.85); // Daha şeffaf yap
        
        // Tile'ların kenarlarını yumuşatmak için blend mode ekle
        tileSprite.setBlendMode(Phaser.BlendModes.SCREEN);
        
        // Tile'ların birbirini tamamlaması için pozisyon ayarı - daha fazla overlap
        const finalX = x * tileSize - 4; // 4 pixel overlap
        const finalY = y * tileSize - 4; // 4 pixel overlap
        tileSprite.setPosition(finalX, finalY);
        
        // Tile sprite created
        
        this.mapTiles.push(tileSprite);
      }
    }
    
    // Map created successfully
    
    // Doğal sınırlar ekle (nehirler, dağlar vs)
    this.createNaturalBoundaries();
  }

  private getTerrainForPosition(x: number, y: number, mapWidth: number, mapHeight: number): string {
    // Region'a göre ana terrain
    if (!this.assetManager) {
      console.warn('⚠️ AssetManager not initialized, using fallback terrain');
      return 'tile_grass';
    }
    
    const baseTerrain = this.assetManager.getTileSprite(this.currentRegion);
    
    // Çeşitlilik için rastgele varyasyonlar
    const rand = Math.random();
    const noise = Math.sin(x * 0.3) * Math.cos(y * 0.3);
    
    if (this.currentRegion === 'starting_meadows') {
      if (rand < 0.1 && noise > 0.3) return 'tile_water'; // Nehir/göl
      if (rand < 0.05) return 'tile_stone'; // Kayalar
      return 'tile_grass'; // Ana terrain
    } else if (this.currentRegion === 'crystal_caverns') {
      if (rand < 0.3) return 'tile_stone';
      if (rand < 0.1) return 'tile_lava';
      return 'tile_grass';
    } else if (this.currentRegion === 'ember_desert') {
      if (rand < 0.2) return 'tile_stone'; // Kayalar
      return 'tile_sand';
    } else if (this.currentRegion === 'frostpeak_mountains') {
      if (rand < 0.4) return 'tile_stone'; // Dağlık alan
      return 'tile_snow';
    }
    
    return baseTerrain;
  }

  private createNaturalBoundaries() {
    // Nehir/yol ekleme
    if (this.currentRegion === 'starting_meadows') {
      this.createRiver();
    }
  }

  private createRiver() {
    const riverWidth = 3;
    const startY = Math.floor(this.scale.height / 32 / 3);
    const endY = Math.floor(this.scale.height / 32 * 2 / 3);
    
    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < riverWidth; x++) {
        const riverX = Math.floor(this.scale.width / 32 / 4) + x;
        const waterTile = this.add.tileSprite(
          riverX * 32, 
          y * 32, 
          32, 
          32, 
          'tile_water'
        );
        waterTile.setOrigin(0, 0);
        waterTile.setAlpha(0.8);
        this.mapTiles.push(waterTile);
      }
    }
  }

  private createEnvironmentalObjects() {
    // Önce environmental sprite'ları oluştur
    this.createEnvironmentalSprites();
    
    // Region'a göre environmental objeler
    const objectCount = 15 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < objectCount; i++) {
      const x = 64 + Math.random() * (this.scale.width - 128);
      const y = 64 + Math.random() * (this.scale.height - 128);
      
      // Region'a göre obje türü seç
      const objType = this.getEnvironmentalObject(this.currentRegion);
      
      // Sprite olarak ekle
      const obj = this.add.sprite(x, y, `env_${objType}`);
      obj.setScale(0.8 + Math.random() * 0.4); // Rastgele boyut varyasyonu
      obj.setDepth(2);
      obj.setAlpha(0.9);
    }
  }

  private createEnvironmentalSprites() {
    const graphics = this.add.graphics();
    
    // Ağaç sprite'ı
    graphics.clear();
    graphics.fillStyle(0x8B4513); // Trunk
    graphics.fillRect(12, 20, 8, 12);
    graphics.fillStyle(0x228B22); // Leaves
    graphics.fillCircle(16, 12, 10);
    graphics.generateTexture('env_tree', 32, 32);
    
    // Çam ağacı
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(14, 20, 4, 10);
    graphics.fillStyle(0x006400);
    graphics.fillTriangle(16, 5, 8, 18, 24, 18);
    graphics.fillTriangle(16, 10, 10, 22, 22, 22);
    graphics.generateTexture('env_pine', 32, 32);
    
    // Kaya
    graphics.clear();
    graphics.fillStyle(0x696969);
    graphics.fillCircle(16, 18, 8);
    graphics.fillStyle(0x808080);
    graphics.fillCircle(14, 16, 4);
    graphics.generateTexture('env_rock', 32, 32);
    
    // Kristal
    graphics.clear();
    graphics.fillStyle(0x9370DB);
    graphics.fillRect(10, 8, 4, 16);
    graphics.fillRect(14, 6, 4, 20);
    graphics.fillRect(18, 10, 4, 14);
    graphics.fillStyle(0xDDA0DD);
    graphics.fillRect(12, 10, 2, 12);
    graphics.fillRect(16, 8, 2, 16);
    graphics.generateTexture('env_crystal', 32, 32);
    
    // Kaktüs
    graphics.clear();
    graphics.fillStyle(0x228B22);
    graphics.fillRect(13, 10, 6, 16);
    graphics.fillRect(8, 16, 6, 6);
    graphics.fillRect(18, 14, 6, 6);
    graphics.fillStyle(0x32CD32);
    graphics.fillRect(14, 12, 4, 12);
    graphics.generateTexture('env_cactus', 32, 32);
    
    // Çiçek
    graphics.clear();
    graphics.fillStyle(0x00FF00);
    graphics.fillRect(15, 20, 2, 8);
    graphics.fillStyle(0xFF69B4);
    graphics.fillCircle(16, 16, 3);
    graphics.fillStyle(0xFFB6C1);
    graphics.fillCircle(13, 14, 2);
    graphics.fillCircle(19, 14, 2);
    graphics.fillCircle(13, 18, 2);
    graphics.fillCircle(19, 18, 2);
    graphics.generateTexture('env_flower', 32, 32);
    
    // Mantar
    graphics.clear();
    graphics.fillStyle(0xF5F5DC);
    graphics.fillRect(14, 18, 4, 8);
    graphics.fillStyle(0xFF4500);
    graphics.fillCircle(16, 14, 6);
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(12, 12, 1);
    graphics.fillCircle(20, 12, 1);
    graphics.fillCircle(16, 10, 1);
    graphics.generateTexture('env_mushroom', 32, 32);
    
    // Ölü ağaç
    graphics.clear();
    graphics.fillStyle(0x4A4A4A);
    graphics.fillRect(13, 18, 6, 10);
    graphics.lineStyle(3, 0x4A4A4A);
    graphics.lineBetween(13, 15, 8, 8);
    graphics.lineBetween(19, 18, 24, 10);
    graphics.lineBetween(16, 12, 20, 5);
    graphics.generateTexture('env_dead_tree', 32, 32);
  }

  private getEnvironmentalObject(region: string): string {
    const regionObjects: { [key: string]: string[] } = {
      starting_meadows: ['tree', 'rock', 'flower'],
      whispering_woods: ['tree', 'tree', 'mushroom'],
      crystal_caverns: ['crystal', 'rock', 'stalagmite'],
      ember_desert: ['cactus', 'rock', 'oasis'],
      frostpeak_mountains: ['pine', 'rock', 'ice'],
      shadowmere_swamps: ['dead_tree', 'rock', 'moss']
    };
    
    const objects = regionObjects[region] || ['tree', 'rock'];
    return objects[Math.floor(Math.random() * objects.length)];
  }



  private createPlayer() {
    // Creating player
    
    // Create player sprite
    const playerSprite = this.playerData?.race || 'human';
    const spriteKey = `player_${playerSprite}`;
    
    // Player sprite key determined
    
    // Check if the texture exists, if not create fallback
    if (!this.textures.exists(spriteKey)) {
      console.warn(`⚠️ Player texture ${spriteKey} not found, creating fallback`);
      AssetManager.createFallbackCharacterSprite(this, spriteKey, playerSprite);
      
      // Double check after creating fallback
      if (!this.textures.exists(spriteKey)) {
        console.error(`❌ Failed to create fallback texture for ${spriteKey}`);
        // Use a default texture as last resort
        const defaultKey = 'player_human';
        if (this.textures.exists(defaultKey)) {
          // Using default texture
          this.player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, defaultKey);
        } else {
          console.error(`❌ No fallback textures available`);
          return;
        }
      } else {
        // Fallback texture created successfully
        this.player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, spriteKey);
      }
    } else {
      // Using existing texture
      this.player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, spriteKey);
    }
    
    this.player.setScale(1.5);
    this.player.setDepth(10);
    
    // Add player name label
    const nameText = this.add.text(
      this.player.x, 
      this.player.y - 25, 
      this.playerData?.name || 'Adventurer',
      {
        fontSize: '12px',
        color: '#9c27b0',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 4, y: 2 }
      }
    );
    nameText.setOrigin(0.5);
    nameText.setDepth(11);
    
    // Store reference to name text
    (this.player as any).nameText = nameText;
    
    // Player created successfully
    
    // Create HP bar
    // HP bar removed - now handled by CharacterCard
  }

  private sendInitialPosition() {
    if (this.socket && this.player && this.playerData) {
      // Use character's actual current_region from database if available
      const actualRegion = this.playerData.current_region || this.currentRegion;
      
      // Önce region'a join ol
      if (!this.hasJoinedRegion) {
        this.socket.emit('joinRegion', {
          region: actualRegion,
          character: this.playerData
        });
        this.hasJoinedRegion = true;
        // Joined region
      }
      
      // Sonra pozisyon gönder
      const moveData = {
        region: actualRegion,
        position: { x: this.player.x, y: this.player.y },
        character: this.playerData
      };
      this.socket.emit('playerMove', moveData);
      // Initial position sent successfully
    } else {
      // Cannot send initial position - missing required data
    }
  }

  private createEnemies() {
    // Region'a göre enemy türleri ve sayıları
    const regionEnemies = this.getRegionEnemies(this.currentRegion);
    const enemyCount = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < enemyCount; i++) {
      const x = 64 + Math.random() * (this.scale.width - 128);
      const y = 64 + Math.random() * (this.scale.height - 128);
      
      const enemyType = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
      const enemyKey = `enemy_${enemyType}`;
      
      // Check if the texture exists, if not create fallback
      if (!this.textures.exists(enemyKey)) {
        AssetManager.createFallbackEnemySprite(this, enemyKey, enemyType);
      }
      
      // Create the enemy sprite
      const enemy = this.add.sprite(x, y, enemyKey);
      
      enemy.setScale(1.0);
      enemy.setDepth(5);
      enemy.setInteractive();
      
      // Enemy level badge
      const level = 1 + Math.floor(Math.random() * 3);
      const levelText = this.add.text(x, y - 35, `Lv.${level}`, {
        fontSize: '10px',
        color: '#ff4444',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 3, y: 1 }
      });
      levelText.setOrigin(0.5);
      levelText.setDepth(6);
      (enemy as any).levelText = levelText;
      
      // Realistic AI movement
      this.tweens.add({
        targets: enemy,
        x: x + (Math.random() - 0.5) * 150,
        y: y + (Math.random() - 0.5) * 150,
        duration: 4000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          if ((enemy as any).levelText) {
            (enemy as any).levelText.setPosition(enemy.x, enemy.y - 35);
          }
        }
      });
      
      // Click to attack
      enemy.on('pointerdown', () => {
        this.attackEnemy(enemy);
      });
      
      this.enemies.push(enemy);
    }

    // 25% chance to spawn a boss in open world
    if (Math.random() < 0.25) {
      const bossX = 100 + Math.random() * (this.scale.width - 200);
      const bossY = 100 + Math.random() * (this.scale.height - 200);
      this.spawnOpenWorldBoss(bossX, bossY);
    }
  }

  private getRegionEnemies(region: string): string[] {
    const regionEnemyMap: { [key: string]: string[] } = {
      starting_meadows: ['skeleton', 'goblin'],
      whispering_woods: ['wolf', 'spider'],
      crystal_caverns: ['skeleton', 'spider'],
      ember_desert: ['skeleton', 'goblin'],
      frostpeak_mountains: ['wolf', 'skeleton'],
      shadowmere_swamps: ['spider', 'goblin'],
      // Underdark regions - daha güçlü düşmanlar
      underdark_entrance: ['skeleton', 'spider'],
      deepest_dark: ['skeleton'],
      // Astral regions - mistik düşmanlar  
      void_nexus: ['skeleton'],
      dream_realm: ['skeleton', 'spider']
    };
    
    return regionEnemyMap[region] || ['skeleton', 'goblin'];
  }

  private createItems() {
    // Spawn random items with better distribution
    const itemCount = 10 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < itemCount; i++) {
      const x = 64 + Math.random() * (this.scale.width - 128);
      const y = 64 + Math.random() * (this.scale.height - 128);
      
      // More diverse item types with rarity
      const itemTypes = [
        'coin', 'coin', 'coin', // Common (30%)
        'potion_health', 'potion_health', // Common healing (20%)
        'gem', 'gem', // Uncommon (20%)
        'potion_mana', // Uncommon (10%)
        'sword', // Rare (10%)
        'shield', 'ring', 'scroll' // Very rare (10%)
      ];
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      
      // Check if the texture exists, if not create fallback
      const itemKey = `item_${itemType}`;
      if (!this.textures.exists(itemKey)) {
        AssetManager.createFallbackItemSprite(this, itemKey, itemType);
      }
      
      const item = this.add.sprite(x, y, itemKey);
      item.setScale(0.8);
      item.setDepth(3);
      item.setInteractive();
      
      // Store item type for collection
      (item as any).itemType = itemType;
      
      // Add rarity-based glow effect
      const glowColor = this.getItemGlowColor(itemType);
      const glowCircle = this.add.circle(x, y, 16, glowColor, 0.3);
      glowCircle.setDepth(2);
      
      // Pulsing glow animation
      this.tweens.add({
        targets: glowCircle,
        alpha: 0.6,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Gentle bobbing animation for item
      this.tweens.add({
        targets: item,
        y: y - 5,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Click to collect
      item.on('pointerdown', () => {
        glowCircle.destroy();
        this.collectItem(item, itemType);
      });
      
      // Store glow reference for cleanup
      (item as any).glowCircle = glowCircle;
      
      this.items.push(item);
    }
    
    // Items spawned on map
  }

  private getItemGlowColor(itemType: string): number {
    const rarityColors: { [key: string]: number } = {
      'coin': 0xFFD700,        // Gold - common
      'potion_health': 0xFF0000, // Red - common
      'potion_mana': 0x0000FF,  // Blue - common
      'gem': 0x9370DB,         // Purple - uncommon
      'potion': 0x9370DB,      // Purple - uncommon
      'sword': 0xFF6600,       // Orange - rare
      'shield': 0xFF6600,      // Orange - rare
      'ring': 0xFF1493,        // Pink - very rare
      'scroll': 0xFF1493       // Pink - very rare
    };
    return rarityColors[itemType] || 0xFFFFFF;
  }

  private setupControls() {
    // Create cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Create WASD keys
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D');
    
    // Click to move
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only move if not clicking on interactive objects
      if (!pointer.event.target || pointer.event.target === this.game.canvas) {
        this.movePlayerTo(pointer.x, pointer.y);
      }
    });
    
    // Global keyboard event listener to handle chat panel state
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      // If chat panel is open, prevent game controls
      if (this.chatPanelOpen) {
        // Allow only specific keys in chat (Enter, Escape, etc.)
        if (!['Enter', 'Escape', 'Backspace', 'Delete', 'Tab'].includes(event.key)) {
          // Don't prevent default for typing keys
          return;
        }
      }
    });
  }

  private setupUI() {
    // Region label with better formatting
    const regionName = this.getRegionDisplayName(this.currentRegion);
    this.add.text(20, 80, `📍 ${regionName}`, {
      fontSize: '18px',
      color: '#9c27b0',
      backgroundColor: 'rgba(0,0,0,0.9)',
      padding: { x: 12, y: 6 },
      fontStyle: 'bold'
    }).setDepth(100);

    // Instructions with better positioning - moved up to avoid floating buttons
    this.add.text(20, this.scale.height - 120, 
      '🎮 WASD/Arrow Keys: Move | Click: Move/Interact | Floating Buttons: Game Panels', {
      fontSize: '14px',
      color: '#ff9800',
      backgroundColor: 'rgba(0,0,0,0.9)',
      padding: { x: 12, y: 6 },
      wordWrap: { width: 500 }
    }).setDepth(100);
  }

  private getRegionDisplayName(region: string): string {
    const regionNames: { [key: string]: string } = {
      starting_meadows: 'Starting Meadows',
      whispering_woods: 'Whispering Woods',
      crystal_caverns: 'Crystal Caverns',
      shadowmere_swamps: 'Shadowmere Swamps',
      golden_plains: 'Golden Plains',
      frostpeak_mountains: 'Frostpeak Mountains',
      ember_desert: 'Ember Desert',
      moonlit_shores: 'Moonlit Shores',
      starfall_valley: 'Starfall Valley',
      thornwood_forest: 'Thornwood Forest',
      misty_highlands: 'Misty Highlands',
      sunken_ruins: 'Sunken Ruins',
      void_nexus: 'Void Nexus',
      astral_observatory: 'Astral Observatory',
      dream_realm: 'Dream Realm',
      nightmare_depths: 'Nightmare Depths',
      underdark_entrance: 'Underdark Entrance',
      fungal_gardens: 'Fungal Gardens',
      crystal_spires: 'Crystal Spires',
      shadow_market: 'Shadow Market',
      deepest_dark: 'Deepest Dark'
    };
    
    return regionNames[region] || region.replace(/_/g, ' ').toUpperCase();
  }

  private setupEventListeners() {
    // Listen for external events (from React context)
    this.game.events.on('updatePlayerData', (data: any) => {
      // Use the improved updatePlayerData method
      this.updatePlayerData(data);
      // Player data updated in GameScene
    });

    this.game.events.on('setSocket', (socket: any) => {
      this.setSocket(socket);
    });

    this.game.events.on('changeRegion', (regionName: string) => {
      this.currentRegion = regionName;
      this.regenerateMap();
    });

    // Listen for texture loaded events
    this.events.on('textureLoaded', (textureKey: string) => {
      console.log(`🎨 Texture loaded: ${textureKey}`);
      // If this is a player texture and we have player data, try to update sprite
      if (textureKey.startsWith('player_') && this.playerData) {
        const expectedSprite = this.assetManager?.getCharacterSprite(
          this.playerData.race, 
          this.playerData.class
        );
        if (textureKey === expectedSprite) {
          console.log(`🔄 Retrying player sprite update for ${textureKey}`);
          this.updatePlayerSprite();
        }
      }
    });
  }

  private setupMultiplayerListeners() {
    if (!this.socket) return;

    // Listen for other players joining
    this.socket.on('playerJoined', (data: any) => {
      console.log('👋 Player joined:', data);
      if (data.character && data.position) {
        this.addOtherPlayer(data.playerId, data.character, data.position);
      }
    });

    // Listen for other players leaving
    this.socket.on('playerLeft', (data: any) => {
      console.log('👋 Player left:', data);
      this.removeOtherPlayer(data.playerId);
    });

    // Listen for other players moving
    this.socket.on('playerMoved', (data: any) => {
      console.log('🚶 Player moved:', data);
      if (data.position) {
        this.moveOtherPlayer(data.playerId, data.position);
      }
    });

    // Listen for current players list
    this.socket.on('currentPlayers', (players: any[]) => {
      console.log('👥 Received current players:', players);
      this.clearOtherPlayers();
      players.forEach(player => {
        if (player.character && player.position) {
          this.addOtherPlayer(player.playerId, player.character, player.position);
        }
      });
    });

    // Clean up listeners when scene is destroyed
    this.events.on('destroy', () => {
      if (this.socket) {
        this.socket.off('playerJoined');
        this.socket.off('playerLeft');
        this.socket.off('playerMoved');
        this.socket.off('currentPlayers');
      }
    });
  }

  private movePlayerTo(x: number, y: number) {
    // Calculate distance for dynamic duration
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
    const baseSpeed = 300; // pixels per second
    const duration = Math.max(200, Math.min(800, distance / baseSpeed * 1000)); // Min 200ms, max 800ms
    
    // Stop any existing movement
    this.tweens.killTweensOf(this.player);
    
    // Smooth movement to target with improved easing
    this.tweens.add({
      targets: this.player,
      x: x,
      y: y,
      duration: duration,
      ease: 'Sine.easeInOut', // Smoother easing curve
      onUpdate: () => {
        // Update name text position
        if ((this.player as any).nameText) {
          (this.player as any).nameText.setPosition(this.player.x, this.player.y - 25);
        }
        // Send position updates during movement for smoother sync
        if (this.socket && this.playerData) {
          const actualRegion = this.playerData.current_region || this.currentRegion;
          const moveData = {
            region: actualRegion,
            position: { x: this.player.x, y: this.player.y },
            character: this.playerData
          };
          this.socket.emit('playerMove', moveData);
        }
      },
      onComplete: () => {
        // Send final position update to server after movement completes
        if (this.socket && this.playerData) {
          const actualRegion = this.playerData.current_region || this.currentRegion;
          const moveData = {
            region: actualRegion,
            position: { x: this.player.x, y: this.player.y },
            character: this.playerData
          };
          console.log('🔍 DEBUG: Sending click movement playerMove:', JSON.stringify(moveData, null, 2));
          this.socket.emit('playerMove', moveData);
          console.log('📍 Click movement position update sent:', moveData);
        }
      }
    });
  }

  private attackEnemy(enemy: Phaser.GameObjects.Sprite) {
    // Enemy fights back first - take damage
    const enemyDamage = 5 + Math.floor(Math.random() * 15);
    this.takeDamage(enemyDamage);
    
    // Calculate rewards
    const xpGained = 15 + Math.floor(Math.random() * 25);
    const intentGained = 8 + Math.floor(Math.random() * 20);
    
    // Visual attack effect
    this.tweens.add({
      targets: enemy,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        // Show rewards immediately
        const rewardText = this.add.text(enemy.x, enemy.y - 40, `💀 DEFEATED!\n+${xpGained} XP\n+${intentGained} Intent`, {
          fontSize: '14px',
          color: '#FFD700',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        // Animate reward text
        this.tweens.add({
          targets: rewardText,
          y: enemy.y - 80,
          alpha: 0,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => rewardText.destroy()
        });
        
        // Remove enemy with explosion effect
        const explosion = this.add.circle(enemy.x, enemy.y, 25, 0xFF4500, 0.9);
        this.tweens.add({
          targets: explosion,
          scaleX: 3,
          scaleY: 3,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            explosion.destroy();
          }
        });
        
        // Create loot particles
        for (let i = 0; i < 8; i++) {
          const particle = this.add.circle(enemy.x, enemy.y, 3, 0xFFD700);
          particle.setDepth(8);
          
          this.tweens.add({
            targets: particle,
            x: enemy.x + (Math.random() - 0.5) * 100,
            y: enemy.y + (Math.random() - 0.5) * 100,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          });
        }
        
        // Clean up level text
        if ((enemy as any).levelText) {
          (enemy as any).levelText.destroy();
        }
        
        enemy.destroy();
        this.enemies = this.enemies.filter(e => e !== enemy);
        
        // Emit combat event to React with actual rewards
        this.game.events.emit('enemyDefeated', { 
          type: 'pve',
          enemy: 'monster',
          xp_gained: xpGained,
          intent_gained: intentGained
        });
      }
    });
  }

  private collectItem(item: Phaser.GameObjects.Sprite, itemType: string) {
    // Calculate item rewards
    let goldValue = 10 + Math.floor(Math.random() * 20);
    let intentValue = 5 + Math.floor(Math.random() * 15); // Base intent reward
    const itemName = this.getItemName(itemType);
    
    // Special effects for different item types
    let collectionMessage = `📦 COLLECTED!\n${itemName}\n+${goldValue} Gold\n+${intentValue} Intent`;
    let messageColor = '#4CAF50';
    
    if ((itemType === 'potion_health' || itemType === 'potion') && this.playerHealth < this.maxHealth) {
      const healAmount = 20 + Math.floor(Math.random() * 30);
      this.healPlayer(healAmount);
      intentValue = intentValue + 10; // Health potions give bonus intent
      collectionMessage = `📦 COLLECTED!\n${itemName}\n+${goldValue} Gold\n+${intentValue} Intent\n+${healAmount} HP`;
      messageColor = '#FF0000'; // Red for health
    } else if (itemType === 'potion_mana') {
      intentValue = intentValue + 8; // Mana potions give bonus intent
      collectionMessage = `📦 COLLECTED!\n${itemName}\n+${goldValue} Gold\n+${intentValue} Intent\n+25 Mana`;
      messageColor = '#0000FF'; // Blue for mana
    } else if (itemType === 'coin') {
      goldValue = goldValue * 2; // Coins give more gold
      intentValue = intentValue + 15; // Coins give good intent
      collectionMessage = `💰 GOLD COIN!\n+${goldValue} Gold\n+${intentValue} Intent`;
      messageColor = '#FFD700'; // Gold color
    } else if (itemType === 'gem') {
      goldValue = goldValue * 3; // Gems are valuable
      intentValue = intentValue + 25; // Gems give excellent intent
      collectionMessage = `💎 PRECIOUS GEM!\n+${goldValue} Gold\n+${intentValue} Intent`;
      messageColor = '#9370DB'; // Purple for gems
    } else if (['sword', 'shield', 'ring', 'scroll'].includes(itemType)) {
      goldValue = goldValue * 4; // Rare items are very valuable
      intentValue = intentValue + 35; // Rare items give the best intent
      collectionMessage = `⭐ RARE ITEM!\n${itemName}\n+${goldValue} Gold\n+${intentValue} Intent`;
      messageColor = '#FF6600'; // Orange for rare items
    }
    
    // Show collection text
    const collectionText = this.add.text(item.x, item.y - 30, collectionMessage, {
      fontSize: '12px',
      color: messageColor,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(10);
    
    // Animate collection text
    this.tweens.add({
      targets: collectionText,
      y: item.y - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => collectionText.destroy()
    });
    
    // Create sparkle effect
    for (let i = 0; i < 6; i++) {
      const sparkle = this.add.circle(item.x, item.y, 2, 0x4CAF50);
      sparkle.setDepth(9);
      
      this.tweens.add({
        targets: sparkle,
        x: item.x + (Math.random() - 0.5) * 60,
        y: item.y + (Math.random() - 0.5) * 60,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }
    
    // Visual collection effect
    this.tweens.add({
      targets: item,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      y: item.y - 30,
      duration: 500,
      ease: 'Back.easeIn',
      onComplete: () => {
        // Clean up glow circle if it exists
        if ((item as any).glowCircle) {
          (item as any).glowCircle.destroy();
        }
        
        item.destroy();
        this.items = this.items.filter(i => i !== item);
        
        // Emit collection event to React with rewards
        this.game.events.emit('itemCollected', {
          type: itemType,
          name: itemName,
          gold_gained: goldValue,
          intent_gained: intentValue,
          position: { x: item.x, y: item.y }
        });
        
        console.log(`🎁 Item collected: ${itemName}, Gold: +${goldValue}, Intent: +${intentValue}`);
      }
    });
  }

  private getItemName(itemType: string): string {
    const itemNames: { [key: string]: string } = {
      'sword': 'Iron Sword',
      'potion': 'Magic Potion',
      'potion_health': 'Health Potion',
      'potion_mana': 'Mana Potion',
      'shield': 'Wooden Shield',
      'bow': 'Elven Bow',
      'armor': 'Leather Armor',
      'ring': 'Magic Ring',
      'gem': 'Precious Gem',
      'scroll': 'Magic Scroll',
      'coin': 'Gold Coin',
      'default': 'Treasure'
    };
    return itemNames[itemType] || itemNames['default'];
  }

  // HP bar functionality removed - now handled by CharacterCard component

  private updateHealthBar() {
    // HP bar functionality removed - now handled by CharacterCard component
    // Health updates are managed through GameContext
  }

  private takeDamage(damage: number) {
    this.playerHealth = Math.max(0, this.playerHealth - damage);
    
    // Update playerData health to keep it synchronized
    if (this.playerData) {
      this.playerData.health = this.playerHealth;
    }
    
    // HP bar update removed - handled by CharacterCard
    
    // Show damage text
    const damageText = this.add.text(this.player.x, this.player.y - 50, `-${damage}`, {
      fontSize: '16px',
      color: '#FF0000',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(10);
    
    this.tweens.add({
      targets: damageText,
      y: this.player.y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
    
    if (this.playerHealth <= 0) {
      this.handlePlayerDeath();
    }
  }

  private healPlayer(amount: number) {
    const oldHealth = this.playerHealth;
    this.playerHealth = Math.min(this.maxHealth, this.playerHealth + amount);
    const actualHealing = this.playerHealth - oldHealth;
    
    // Update playerData health to keep it synchronized
    if (this.playerData) {
      this.playerData.health = this.playerHealth;
    }
    
    if (actualHealing > 0) {
      // HP bar update removed - handled by CharacterCard
      
      // Show healing text
      const healText = this.add.text(this.player.x, this.player.y - 50, `+${actualHealing}`, {
        fontSize: '16px',
        color: '#4CAF50',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(10);
      
      this.tweens.add({
        targets: healText,
        y: this.player.y - 80,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => healText.destroy()
      });
    }
  }

  private updatePlayerSprite() {
    console.log('🔄 updatePlayerSprite called with playerData:', this.playerData);
    if (this.playerData && this.player && this.assetManager) {
      const newSprite = this.assetManager.getCharacterSprite(
        this.playerData.race, 
        this.playerData.class
      );
      
      // Check if the texture exists before updating
      if (this.textures.exists(newSprite)) {
        // Only update if the sprite is actually different
        if (this.player.texture.key !== newSprite) {
          console.log(`🎨 Updating player sprite from ${this.player.texture.key} to ${newSprite}`);
          this.player.setTexture(newSprite);
        } else {
          console.log(`✅ Player sprite already correct: ${newSprite}`);
        }
        
        // Update name text if it exists and name changed
        if ((this.player as any).nameText && this.playerData.name) {
          const currentName = (this.player as any).nameText.text;
          if (currentName !== this.playerData.name) {
            (this.player as any).nameText.setText(this.playerData.name);
            console.log(`📝 Updated player name: ${currentName} -> ${this.playerData.name}`);
          }
        }
        console.log(`✅ Player sprite update completed: ${newSprite}`);
      } else {
        console.warn(`⚠️ Texture ${newSprite} does not exist, creating fallback`);
        // Create fallback texture instead of retrying
        AssetManager.createFallbackCharacterSprite(this, newSprite, this.playerData.race || 'human');
        
        // Try to update again after creating fallback
        if (this.textures.exists(newSprite)) {
          console.log(`🔄 Retrying player sprite update with fallback texture: ${newSprite}`);
          this.player.setTexture(newSprite);
        } else {
          console.error(`❌ Failed to create fallback texture for ${newSprite}`);
        }
      }
    } else {
      console.warn('⚠️ Cannot update player sprite - missing:', {
        playerData: !!this.playerData,
        player: !!this.player,
        assetManager: !!this.assetManager
      });
    }
  }

  private regenerateMap() {
    console.log('🗺️ Regenerating map...');
    
    // Store player position before clearing
    const playerPosition = this.player ? { x: this.player.x, y: this.player.y } : null;
    const playerNameText = (this.player as any)?.nameText;
    
    // Clear existing map
    this.mapTiles.forEach(tile => tile.destroy());
    this.mapTiles = [];
    
    // Clear enemies and items
    this.enemies.forEach(enemy => {
      if ((enemy as any).levelText) {
        (enemy as any).levelText.destroy();
      }
      enemy.destroy();
    });
    this.enemies = [];
    
    this.items.forEach(item => {
      if ((item as any).glowCircle) {
        (item as any).glowCircle.destroy();
      }
      item.destroy();
    });
    this.items = [];
    
    // Clear environmental objects (but preserve player and other players)
    this.children.getAll().forEach((child: any) => {
      if (child.type === 'Sprite' && child.depth === 2) {
        child.destroy();
      }
    });
    
    // Recreate everything
    this.createMap();
    this.createEnvironmentalObjects();
    this.createEnemies();
    this.createItems();
    
    // Restore player position if it was stored
    if (playerPosition && this.player) {
      this.player.setPosition(playerPosition.x, playerPosition.y);
      if (playerNameText) {
        playerNameText.setPosition(playerPosition.x, playerPosition.y - 25);
      }
      console.log(`🎯 Player position restored to: ${playerPosition.x}, ${playerPosition.y}`);
    }
    
    // Ensure character sprites are still available after map regeneration
    this.ensureCharacterSpritesAfterRegeneration();
    
    console.log('✅ Map regeneration completed');
  }

  private ensureCharacterSpritesAfterRegeneration() {
    console.log('🔍 Ensuring character sprites after map regeneration...');
    
    // Verify that all character sprites are still available
    const characterRaces = ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'drow', 'githzerai', 'svirfneblin'];
    
    for (const race of characterRaces) {
      const key = `player_${race}`;
      if (!this.textures.exists(key)) {
        console.warn(`⚠️ Character sprite ${key} missing after regeneration, recreating...`);
        AssetManager.createFallbackCharacterSprite(this, key, race);
      }
    }
    
    // Update player sprite if needed
    if (this.player && this.playerData) {
      const expectedSprite = `player_${this.playerData.race || 'human'}`;
      if (this.textures.exists(expectedSprite) && this.player.texture.key !== expectedSprite) {
        console.log(`🔄 Updating player sprite after regeneration: ${this.player.texture.key} -> ${expectedSprite}`);
        this.player.setTexture(expectedSprite);
      }
    }
    
    // Update other players if needed
    this.otherPlayers.forEach((otherPlayer, playerId) => {
      const playerData = (otherPlayer as any).playerData;
      if (playerData) {
        const expectedSprite = `player_${playerData.race || 'human'}`;
        if (this.textures.exists(expectedSprite) && otherPlayer.texture.key !== expectedSprite) {
          console.log(`🔄 Updating other player sprite after regeneration: ${otherPlayer.texture.key} -> ${expectedSprite}`);
          otherPlayer.setTexture(expectedSprite);
        }
      }
    });
    
    console.log('✅ Character sprite verification completed');
  }

  update() {
    // Handle continuous input with improved responsiveness
    const baseSpeed = 250; // Increased from 200 for better responsiveness
    const diagonalSpeed = baseSpeed * 0.707; // Normalize diagonal movement (1/√2)
    let moving = false;
    const prevX = this.player.x;
    const prevY = this.player.y;
    
    // Calculate movement direction
    let moveX = 0;
    let moveY = 0;
    
    // Sohbet paneli açıkken karakter hareketini tamamen engelle
    if (this.chatPanelOpen) {
      // Chat panel açıkken hiçbir hareket yapma
      moving = false;
    } else if (this.wasd && this.cursors) {
      // Chat panel kapalıyken normal kontroller
      if (this.cursors.left.isDown || this.wasd.A.isDown) {
        moveX -= 1;
        moving = true;
      }
      if (this.cursors.right.isDown || this.wasd.D.isDown) {
        moveX += 1;
        moving = true;
      }
      if (this.cursors.up.isDown || this.wasd.W.isDown) {
        moveY -= 1;
        moving = true;
      }
      if (this.cursors.down.isDown || this.wasd.S.isDown) {
        moveY += 1;
        moving = true;
      }
    }
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= diagonalSpeed;
      moveY *= diagonalSpeed;
    } else {
      moveX *= baseSpeed;
      moveY *= baseSpeed;
    }
    
    // Apply movement with frame-rate independent timing
    const deltaTime = this.game.loop.delta / 1000;
    this.player.x += moveX * deltaTime;
    this.player.y += moveY * deltaTime;

    // Keep player within bounds - açık dünya, soft boundaries
    const margin = 16; // Daha az margin
    this.player.x = Phaser.Math.Clamp(this.player.x, margin, this.scale.width - margin);
    this.player.y = Phaser.Math.Clamp(this.player.y, margin, this.scale.height - margin);

    // Update name text position
    if ((this.player as any).nameText && moving) {
      (this.player as any).nameText.setPosition(this.player.x, this.player.y - 25);
    }

    // Send position updates to other players with optimized frequency
    if (this.socket && this.playerData && moving) {
      const currentTime = this.time.now;
      const positionChanged = Math.abs(this.player.x - prevX) > 2 || Math.abs(this.player.y - prevY) > 2; // Increased threshold
      
      // Send updates at 30fps (33ms) for better network performance while maintaining smoothness
      if (currentTime - this.lastPositionUpdate > 33 && positionChanged) {
        const actualRegion = this.playerData.current_region || this.currentRegion;
        const moveData = {
          region: actualRegion,
          position: { x: this.player.x, y: this.player.y },
          character: this.playerData
        };
        
        this.socket.emit('playerMove', moveData);
        this.lastPositionUpdate = currentTime;
        
        // Log only occasionally to avoid spam
        if (Math.random() < 0.02) { // Reduced logging frequency
          console.log('🔍 DEBUG: Sending WASD movement playerMove:', JSON.stringify(moveData, null, 2));
          console.log('📍 WASD movement position update sent:', moveData);
        }
      }
    }

    // Health regeneration over time (1 HP every 5 seconds)
    if (this.playerHealth < this.maxHealth && this.time.now % 5000 < 16) {
      this.healPlayer(1);
    }
    
    // Update message bubble positions
    this.updateMessageBubblePositions();
  }

  // Public methods for external control
  public updatePlayerData(data: any) {
    console.log('🔄 updatePlayerData called with:', { 
      name: data.name, 
      level: data.level, 
      race: data.race,
      intent: data.intent,
      experience: data.experience
    });
    
    // Check if this is a meaningful update that requires sprite change
    const needsSpriteUpdate = this.playerData && (
      data.race !== this.playerData.race ||
      data.class !== this.playerData.class ||
      data.name !== this.playerData.name
    );
    
    this.playerData = data;
    
    // Update local health variables to match character data
    if (data.health !== undefined) {
      this.playerHealth = data.health;
    }
    
    // Update player name label if it exists
    if (this.player && (this.player as any).nameText) {
      (this.player as any).nameText.setText(data.name || 'Unknown');
      console.log('✅ Updated player name label to:', data.name);
    }
    
    // Only update sprite if there's a meaningful change
    if (needsSpriteUpdate) {
      console.log('🎨 Sprite update needed due to character change');
      this.updatePlayerSprite();
    } else {
      console.log('✅ No sprite update needed, only data update');
    }
    
    // Update health bar when player data changes
    // HP bar update removed - handled by CharacterCard
    
    // Try to send initial position after a short delay to ensure everything is ready
    setTimeout(() => {
      this.sendInitialPosition();
    }, 100);
  }

  public setSocket(socket: any) {
    this.socket = socket;
    console.log('🔌 Socket set in GameScene:', socket ? 'Connected' : 'Disconnected');
    console.log('🔍 Player exists:', !!this.player);
    console.log('🔍 PlayerData exists:', !!this.playerData);
    
    // Setup multiplayer listeners when socket is set
    if (socket) {
      this.setupMultiplayerListeners();
    }
    
    // Socket bağlantısı kurulduğunda region'a join ol
    if (socket && this.playerData) {
      setTimeout(() => {
        this.sendInitialPosition();
      }, 500);
    }
  }

  public setChatPanelOpen(isOpen: boolean) {
    this.chatPanelOpen = isOpen;
    console.log('💬 Chat panel state changed:', isOpen);
    
    if (isOpen) {
      console.log('🔒 Chat panel opened - game controls disabled');
      // Chat panel açıkken tüm game input'larını devre dışı bırak
      if (this.wasd) {
        this.wasd.W.reset();
        this.wasd.A.reset();
        this.wasd.S.reset();
        this.wasd.D.reset();
      }
      if (this.cursors) {
        this.cursors.up.reset();
        this.cursors.down.reset();
        this.cursors.left.reset();
        this.cursors.right.reset();
      }
    } else {
      console.log('🔓 Chat panel closed - game controls enabled');
    }
  }

  // Show chat message bubble above player
  public showMessageBubble(playerId: string, message: string, playerName: string) {
    console.log(`💬 Showing message bubble for ${playerName}: ${message}`);
    
    // Remove existing bubble if any
    this.removeMessageBubble(playerId);
    
    // Find the player sprite
    let playerSprite: Phaser.GameObjects.Sprite | null = null;
    
    if (playerId === 'local') {
      playerSprite = this.player;
    } else if (playerId === 'other') {
      // For other players, show bubble above the first other player found
      const firstOtherPlayer = this.otherPlayers.values().next().value;
      if (firstOtherPlayer) {
        playerSprite = firstOtherPlayer;
      }
    } else {
      playerSprite = this.otherPlayers.get(playerId) || null;
    }
    
    if (!playerSprite) {
      console.warn(`⚠️ Player sprite not found for message bubble: ${playerId}`);
      return;
    }
    
    // Create message bubble container
    const bubbleContainer = this.add.container(playerSprite.x, playerSprite.y - 60);
    
    // Set depth to ensure bubble appears above everything
    bubbleContainer.setDepth(1000);
    
    // Create background rectangle
    const maxWidth = 200;
    const padding = 10;
    const lineHeight = 16;
    const maxLines = 3;
    
    // Split message into lines
    const words = message.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * 8 > maxWidth - padding * 2) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Limit lines
    const displayLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      displayLines[maxLines - 1] = displayLines[maxLines - 1].slice(0, -3) + '...';
    }
    
    // Calculate dimensions
    const textWidth = Math.max(...displayLines.map(line => line.length * 8));
    const bubbleWidth = Math.min(textWidth + padding * 2, maxWidth);
    const bubbleHeight = displayLines.length * lineHeight + padding * 2;
    
    // Create bubble background
    const bubbleBg = this.add.rectangle(0, 0, bubbleWidth, bubbleHeight, 0x000000, 0.8);
    bubbleBg.setStrokeStyle(2, 0x9c27b0);
    bubbleBg.setOrigin(0.5, 0.5);
    
    // Create player name text
    const nameText = this.add.text(0, -bubbleHeight / 2 + 5, playerName, {
      fontSize: '12px',
      color: '#9c27b0',
      fontFamily: 'Arial'
    });
    nameText.setOrigin(0.5, 0);
    
    // Create message text
    const messageText = this.add.text(0, -bubbleHeight / 2 + 20, displayLines.join('\n'), {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial',
      wordWrap: { width: bubbleWidth - padding * 2 }
    });
    messageText.setOrigin(0.5, 0);
    
    // Add elements to container
    bubbleContainer.add([bubbleBg, nameText, messageText]);
    
    // Store bubble reference
    this.messageBubbles.set(playerId, bubbleContainer);
    
    // Set timer to remove bubble after 3 seconds
    const timer = this.time.delayedCall(3000, () => {
      this.removeMessageBubble(playerId);
    });
    
    this.messageBubbleTimers.set(playerId, timer);
    
    // Add fade-in animation
    bubbleContainer.setAlpha(0);
    this.tweens.add({
      targets: bubbleContainer,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
    
    console.log(`✅ Message bubble created for ${playerName}`);
  }
  
  // Remove message bubble
  private removeMessageBubble(playerId: string) {
    const bubble = this.messageBubbles.get(playerId);
    const timer = this.messageBubbleTimers.get(playerId);
    
    if (timer) {
      timer.destroy();
      this.messageBubbleTimers.delete(playerId);
    }
    
    if (bubble) {
      // Fade out animation
      this.tweens.add({
        targets: bubble,
        alpha: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          bubble.destroy();
          this.messageBubbles.delete(playerId);
        }
      });
    }
  }
  
  // Clear all message bubbles
  public clearAllMessageBubbles() {
    this.messageBubbles.forEach((bubble, playerId) => {
      this.removeMessageBubble(playerId);
    });
  }
  
  // Force clear all message bubbles (for cleanup)
  public forceClearAllMessageBubbles() {
    this.messageBubbleTimers.forEach((timer, playerId) => {
      timer.destroy();
    });
    this.messageBubbleTimers.clear();
    
    this.messageBubbles.forEach((bubble, playerId) => {
      bubble.destroy();
    });
    this.messageBubbles.clear();
  }
  
  // Update message bubble positions
  private updateMessageBubblePositions() {
    this.messageBubbles.forEach((bubble, playerId) => {
      let playerSprite: Phaser.GameObjects.Sprite | null = null;
      
      if (playerId === 'local') {
        playerSprite = this.player;
      } else if (playerId === 'other') {
        const firstOtherPlayer = this.otherPlayers.values().next().value;
        if (firstOtherPlayer) {
          playerSprite = firstOtherPlayer;
        }
      } else {
        playerSprite = this.otherPlayers.get(playerId) || null;
      }
      
      if (playerSprite && bubble) {
        bubble.setPosition(playerSprite.x, playerSprite.y - 60);
      }
    });
  }

  public getPlayerPosition(): { x: number, y: number } | null {
    if (this.player) {
      return { x: this.player.x, y: this.player.y };
    }
    return null;
  }

  public changeRegion(regionName: string) {
    // Only regenerate map if region actually changed
    if (this.currentRegion !== regionName) {
      console.log(`🗺️ Region changed from ${this.currentRegion} to ${regionName}`);
      this.currentRegion = regionName;
      this.regenerateMap();
    } else {
      console.log(`🗺️ Region unchanged: ${regionName}`);
    }
  }

  public addOtherPlayer(playerId: string, playerData: any, position?: { x: number, y: number }) {
    console.log(`🎮 Adding other player: ${playerData.name} (ID: ${playerId}) at position:`, position);
    
    if (!this.otherPlayers.has(playerId)) {
      // Create proper character sprite for other players
      const spriteKey = `player_${playerData.race || 'human'}`;
      
      console.log(`🎯 Other player sprite key: ${spriteKey}`);
      console.log(`🎯 Texture exists: ${this.textures.exists(spriteKey)}`);
      
      // Check if the texture exists, if not create fallback
      if (!this.textures.exists(spriteKey)) {
        console.warn(`⚠️ Other player texture ${spriteKey} not found, creating fallback`);
        AssetManager.createFallbackCharacterSprite(this, spriteKey, playerData.race || 'human');
        
        // Double check after creating fallback
        if (!this.textures.exists(spriteKey)) {
          console.error(`❌ Failed to create fallback texture for other player ${spriteKey}`);
          // Use a default texture as last resort
          const defaultKey = 'player_human';
          if (this.textures.exists(defaultKey)) {
            console.log(`🔄 Using default texture for other player: ${defaultKey}`);
            const otherPlayer = this.add.sprite(
              position?.x || (300 + Math.random() * 200),
              position?.y || (250 + Math.random() * 100),
              defaultKey
            );
            this.setupOtherPlayerSprite(otherPlayer, playerData, playerId);
            this.otherPlayers.set(playerId, otherPlayer);
            return;
          } else {
            console.error(`❌ No fallback textures available for other player`);
            return;
          }
        } else {
          console.log(`✅ Fallback texture created successfully for other player: ${spriteKey}`);
        }
      }
      
      // Use provided position or default to a random position
      const startX = position?.x || (300 + Math.random() * 200);
      const startY = position?.y || (250 + Math.random() * 100);
      
      const otherPlayer = this.add.sprite(startX, startY, spriteKey);
      this.setupOtherPlayerSprite(otherPlayer, playerData, playerId);
      this.otherPlayers.set(playerId, otherPlayer);
      console.log(`✅ Other player added: ${playerData.name} at (${startX}, ${startY}). Total players: ${this.otherPlayers.size}`);
    } else {
      console.log(`⚠️ Player ${playerData.name} already exists`);
    }
  }

  private setupOtherPlayerSprite(otherPlayer: Phaser.GameObjects.Sprite, playerData: any, playerId: string) {
    otherPlayer.setScale(1.3);
    otherPlayer.setDepth(9);
    otherPlayer.setTint(0xcccccc); // Slightly dimmed to distinguish from main player
      
    // Add name label with better styling
    const nameText = this.add.text(
      otherPlayer.x, 
      otherPlayer.y - 35, 
      playerData.name,
      {
        fontSize: '11px',
        color: '#4caf50',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 8, y: 4 },
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1
      }
    );
    nameText.setOrigin(0.5);
    nameText.setDepth(10);
    
    // Add level badge
    const levelText = this.add.text(
      otherPlayer.x, 
      otherPlayer.y + 25, 
      `Lv.${playerData.level || 1}`,
      {
        fontSize: '10px',
        color: '#ffd700',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 4, y: 2 },
        fontStyle: 'bold'
      }
    );
    levelText.setOrigin(0.5);
    levelText.setDepth(10);
    
    // Store references
    (otherPlayer as any).nameText = nameText;
    (otherPlayer as any).levelText = levelText;
    (otherPlayer as any).playerData = playerData;
    (otherPlayer as any).playerId = playerId;
  }

  public removeOtherPlayer(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      console.log(`👋 Removing other player ${playerId}`);
      if ((player as any).nameText) {
        (player as any).nameText.destroy();
      }
      if ((player as any).levelText) {
        (player as any).levelText.destroy();
      }
      player.destroy();
      this.otherPlayers.delete(playerId);
      console.log(`✅ Player removed. Total players: ${this.otherPlayers.size}`);
    } else {
      console.log(`⚠️ Player ${playerId} not found for removal`);
    }
  }

  public clearOtherPlayers() {
    console.log(`🧹 Clearing all other players (${this.otherPlayers.size} players)`);
    this.otherPlayers.forEach((player, playerId) => {
      if ((player as any).nameText) {
        (player as any).nameText.destroy();
      }
      if ((player as any).levelText) {
        (player as any).levelText.destroy();
      }
      player.destroy();
    });
    this.otherPlayers.clear();
    console.log('✅ All other players cleared');
  }

  public moveOtherPlayer(playerId: string, position: { x: number, y: number }) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      // Log only occasionally to avoid spam
      if (Math.random() < 0.1) { // Log only 10% of movements
        console.log(`🚶 Moving other player ${playerId} to:`, position);
      }
      
      // Stop any existing movement tween for this player
      this.tweens.killTweensOf(player);
      
      // Calculate distance for dynamic duration
      const distance = Phaser.Math.Distance.Between(player.x, player.y, position.x, position.y);
      const baseSpeed = 400; // pixels per second for other players
      const duration = Math.max(16, Math.min(100, distance / baseSpeed * 1000)); // Min 16ms, max 100ms
      
      this.tweens.add({
        targets: player,
        x: position.x,
        y: position.y,
        duration: duration,
        ease: 'Sine.easeOut', // Smooth easing for other players
        onUpdate: () => {
          if ((player as any).nameText) {
            (player as any).nameText.setPosition(player.x, player.y - 35);
          }
          if ((player as any).levelText) {
            (player as any).levelText.setPosition(player.x, player.y + 25);
          }
        },
        onComplete: () => {
          // Log only occasionally to avoid spam
          if (Math.random() < 0.05) { // Log only 5% of completions
            console.log(`✅ Other player ${playerId} movement completed`);
          }
        }
      });
    } else {
      console.log(`⚠️ Player ${playerId} not found for movement`);
    }
  }
  // PROCEDURAL GENERATION SYSTEM FOR ROGUELIKE ELEMENTS
  
  private generateProceduralDungeon() {
    console.log('🏰 Generating procedural dungeon...');
    
    // Clear existing map tiles
    this.mapTiles.forEach(tile => tile.destroy());
    this.mapTiles = [];
    
    // Clear existing enemies and items
    this.enemies.forEach(enemy => {
      if ((enemy as any).levelText) {
        (enemy as any).levelText.destroy();
      }
      enemy.destroy();
    });
    this.enemies = [];
    
    this.items.forEach(item => {
      if ((item as any).glowCircle) {
        (item as any).glowCircle.destroy();
      }
      item.destroy();
    });
    this.items = [];
    
    // Generate dungeon layout
    const dungeonData = this.createDungeonLayout();
    this.renderDungeon(dungeonData);
    
    // Place procedural items and enemies
    this.placeProceduralContent(dungeonData);
    
    // Add exit dungeon button
    this.addExitDungeonButton();
    
    // Update dungeon button text
    if ((this as any).dungeonButtonText) {
      (this as any).dungeonButtonText.setText('🏰 NEW DUNGEON\nGENERATE ANOTHER');
    }
    
    // Position player in first room center with new tile size - with safety check
    if (dungeonData.rooms.length > 0 && this.player && this.player.setPosition) {
      const firstRoom = dungeonData.rooms[0];
      const tileSize = 48; // Match the new tile size
      
      // Calculate safe player position within screen bounds
      const rawPlayerX = (firstRoom.x + Math.floor(firstRoom.width / 2)) * tileSize;
      const rawPlayerY = (firstRoom.y + Math.floor(firstRoom.height / 2)) * tileSize;
      
      // Ensure player stays within screen bounds
      const playerX = Math.max(48, Math.min(rawPlayerX, this.scale.width - 48));
      const playerY = Math.max(48, Math.min(rawPlayerY, this.scale.height - 48));
      
      this.player.setPosition(playerX, playerY);
      console.log(`🎯 Player positioned safely at: ${playerX}, ${playerY} (raw: ${rawPlayerX}, ${rawPlayerY})`);
    } else if (!this.player) {
      console.warn('⚠️ Player not found during dungeon generation, creating...');
      this.createPlayer();
    }
  }
  
  private createDungeonLayout() {
    // Make dungeon much smaller and more manageable
    const width = 30;   // 1440px genişlik (30 * 48) - reduced from 50
    const height = 25;  // 1200px yükseklik (25 * 48) - reduced from 40
    const rooms: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // Initialize dungeon with walls
    const dungeon = Array(height).fill(null).map(() => Array(width).fill(1));
    
    // Generate rooms - fewer rooms for smaller dungeon
    const roomCount = Phaser.Math.Between(8, 12);  // Reduced from 15-25
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = Phaser.Math.Between(4, 8);  // Smaller rooms
      const roomHeight = Phaser.Math.Between(4, 6);
      const x = Phaser.Math.Between(1, width - roomWidth - 1);
      const y = Phaser.Math.Between(1, height - roomHeight - 1);
      
      // Check if room overlaps with existing rooms
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width + 1 && x + roomWidth + 1 > room.x &&
            y < room.y + room.height + 1 && y + roomHeight + 1 > room.y) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        rooms.push({x, y, width: roomWidth, height: roomHeight});
        
        // Carve out room
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            dungeon[ry][rx] = 0; // Floor
          }
        }
      }
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      const roomA = rooms[i];
      const roomB = rooms[i + 1];
      
      const centerAX = Math.floor(roomA.x + roomA.width / 2);
      const centerAY = Math.floor(roomA.y + roomA.height / 2);
      const centerBX = Math.floor(roomB.x + roomB.width / 2);
      const centerBY = Math.floor(roomB.y + roomB.height / 2);
      
      // Horizontal corridor
      const startX = Math.min(centerAX, centerBX);
      const endX = Math.max(centerAX, centerBX);
      for (let x = startX; x <= endX; x++) {
        if (centerAY >= 0 && centerAY < height) {
          dungeon[centerAY][x] = 0;
        }
      }
      
      // Vertical corridor
      const startY = Math.min(centerAY, centerBY);
      const endY = Math.max(centerAY, centerBY);
      for (let y = startY; y <= endY; y++) {
        if (centerBX >= 0 && centerBX < width) {
          dungeon[y][centerBX] = 0;
        }
      }
    }
    
    return { dungeon, rooms, width, height };
  }
  
  private renderDungeon(dungeonData: any) {
    const { dungeon, width, height } = dungeonData;
    const tileSize = 32;  // Reduced from 48 to make dungeon more compact
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (dungeon[y][x] === 1) {
          // Enhanced walls with depth and texture
          const wallTexture = this.textures.exists('tile_stone') ? 'tile_stone' : 'tile_grass';
          const wall = this.add.tileSprite(x * tileSize, y * tileSize, tileSize, tileSize, wallTexture);
          wall.setOrigin(0, 0);
          wall.setDepth(2);
          wall.setTint(0x2F2F2F); // Dark stone walls
          this.mapTiles.push(wall);
          
          // Add wall highlights for 3D effect
          if (y > 0 && dungeon[y-1][x] === 0) {
            const highlight = this.add.rectangle(x * tileSize + tileSize/2, y * tileSize + 2, tileSize, 4, 0x555555);
            highlight.setDepth(3);
            this.mapTiles.push(highlight as any);
          }
        } else {
          // Enhanced floor with patterns
          const floorTexture = this.textures.exists('tile_stone') ? 'tile_stone' : 'tile_grass';
          const floor = this.add.tileSprite(x * tileSize, y * tileSize, tileSize, tileSize, floorTexture);
          floor.setOrigin(0, 0);
          floor.setDepth(0);
          floor.setTint(0x666666); // Gray stone floor
          this.mapTiles.push(floor);
          
          // Add random floor details for texture
          if (Math.random() < 0.15) {
            const detail = this.add.circle(
              x * tileSize + Phaser.Math.Between(8, 24),
              y * tileSize + Phaser.Math.Between(8, 24),
              Phaser.Math.Between(1, 3),
              0x444444
            );
            detail.setDepth(1);
            detail.setAlpha(0.6);
            this.mapTiles.push(detail as any);
          }
        }
      }
    }
  }
  
  private placeProceduralContent(dungeonData: any) {
    const { rooms } = dungeonData;
    
    // Place enemies in rooms
    rooms.forEach((room: {x: number, y: number, width: number, height: number}, index: number) => {
      if (index === 0) return; // Skip first room (player spawn)
      
      const enemyCount = Phaser.Math.Between(1, 3);
      for (let i = 0; i < enemyCount; i++) {
        const x = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
        const y = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
        
        this.spawnProceduralEnemy(x * 48 + 24, y * 48 + 24);
      }
    });
    
    // Place treasure chests
    rooms.forEach((room: {x: number, y: number, width: number, height: number}, index: number) => {
      if (index === 0) return; // Skip first room
      
      if (Math.random() < 0.6) { // 60% chance for treasure
        const x = Phaser.Math.Between(room.x + 1, room.x + room.width - 2);
        const y = Phaser.Math.Between(room.y + 1, room.y + room.height - 2);
        
        this.spawnTreasureChest(x * 48 + 24, y * 48 + 24);
      }
    });
    
    // Place boss in last room
    if (rooms.length > 0) {
      const bossRoom = rooms[rooms.length - 1];
      const x = Math.floor(bossRoom.x + bossRoom.width / 2);
      const y = Math.floor(bossRoom.y + bossRoom.height / 2);
      
      this.spawnBoss(x * 48 + 24, y * 48 + 24);
    }
  }
  
  private spawnProceduralEnemy(x: number, y: number) {
    // Create simple enemy sprite
    const enemyKey = 'enemy_skeleton';
    
    // Check if the texture exists, if not create fallback
    if (!this.textures.exists(enemyKey)) {
      console.warn(`⚠️ Enemy texture ${enemyKey} not found, creating fallback`);
      if (this.assetManager) {
        AssetManager.createFallbackEnemySprite(this, enemyKey, 'skeleton');
      } else {
        console.error('❌ AssetManager not available for fallback enemy sprite');
        return;
      }
    }
    
    const enemy = this.add.sprite(x, y, enemyKey);
    enemy.setTint(0xff6666); // Red tint for enemies
    enemy.setScale(0.8);
    enemy.setDepth(5);
    
    // Add enemy AI behavior with safety check
    if (this.physics) {
      this.physics.add.existing(enemy);
      if ((enemy.body as Phaser.Physics.Arcade.Body)) {
        (enemy.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
      }
    }
    
    // Simple patrol AI
    this.tweens.add({
      targets: enemy,
      x: x + Phaser.Math.Between(-50, 50),
      y: y + Phaser.Math.Between(-50, 50),
      duration: Phaser.Math.Between(2000, 4000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.enemies.push(enemy);
  }
  
  private spawnTreasureChest(x: number, y: number) {
    const chestKey = 'item_gem';
    
    // Check if the texture exists, if not create fallback
    if (!this.textures.exists(chestKey)) {
      console.warn(`⚠️ Chest texture ${chestKey} not found, creating fallback`);
      if (this.assetManager) {
        AssetManager.createFallbackItemSprite(this, chestKey, 'gem');
      } else {
        console.error('❌ AssetManager not available for fallback chest sprite');
        return;
      }
    }
    
    const chest = this.add.sprite(x, y, chestKey);
    chest.setInteractive();
    chest.setDepth(3);
    chest.setScale(1.2);
    
    // Add glow effect
    const glow = this.add.circle(x, y, 20, 0xffd700, 0.3);
    glow.setDepth(2);
    
    // Pulsing animation
    this.tweens.add({
      targets: [chest, glow],
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Click to open
    chest.on('pointerdown', () => {
      this.openTreasureChest(chest, glow, x, y);
    });
  }
  
  private openTreasureChest(chest: Phaser.GameObjects.Sprite, glow: Phaser.GameObjects.Arc, x: number, y: number) {
    // Destroy chest and glow
    chest.destroy();
    glow.destroy();
    
    // Generate random loot
    const lootTypes = ['gold', 'gem', 'potion', 'weapon', 'armor'];
    const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
    const lootAmount = Phaser.Math.Between(50, 200);
    
    // Show loot text
    const lootText = this.add.text(x, y - 30, `+${lootAmount} ${lootType}!`, {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    
    // Animate loot text
    this.tweens.add({
      targets: lootText,
      y: y - 60,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => lootText.destroy()
    });
    
    // Particle effect
    this.createLootParticles(x, y);
  }
  
  private spawnBoss(x: number, y: number) {
    const bossTypes = [
      'boss_ancient_treant',
      'boss_dragon_wyrmling', 
      'boss_mummy_lord',
      'boss_sand_worm',
      'boss_shadow_wolf_alpha',
      'boss_stone_giant'
    ];
    const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    
    // Check if the texture exists, if not create fallback
    if (!this.textures.exists(bossType)) {
      console.warn(`⚠️ Boss texture ${bossType} not found, creating fallback`);
      if (this.assetManager) {
        AssetManager.createFallbackBossSprite(this, bossType, bossType.replace('boss_', ''));
      } else {
        console.error('❌ AssetManager not available for fallback boss sprite');
        return;
      }
    }
    
    const boss = this.add.sprite(x, y, bossType);
    boss.setScale(1.5);
    boss.setDepth(6);
    boss.setInteractive();
    
    // Add boss physics with safety check
    if (this.physics) {
      this.physics.add.existing(boss);
      if ((boss.body as Phaser.Physics.Arcade.Body)) {
        (boss.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
      }
    }
    
    // Boss name
    const bossName = this.add.text(x, y - 50, `💀 ${bossType.toUpperCase()} BOSS`, {
      fontSize: '14px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(7);
    
    // Menacing animation
    this.tweens.add({
      targets: [boss, bossName],
      scaleX: boss.scaleX * 1.2,
      scaleY: boss.scaleY * 1.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Boss fight interaction
    boss.on('pointerdown', () => {
      this.initiateBossFight(boss, bossName, bossType);
    });
  }

  private spawnOpenWorldBoss(x: number, y: number) {
    const bossTypes = [
      'boss_ancient_treant',
      'boss_dragon_wyrmling', 
      'boss_mummy_lord',
      'boss_sand_worm',
      'boss_shadow_wolf_alpha',
      'boss_stone_giant'
    ];
    const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    
    console.log(`🔍 Creating boss with sprite: ${bossType}`);
    console.log(`🔍 Texture exists check: ${this.textures.exists(bossType)}`);
    console.log(`🔍 Available boss textures:`, this.textures.getTextureKeys().filter(key => key.includes('boss')));
    
    // Check if the texture exists, if not create fallback
    let boss: Phaser.GameObjects.Sprite;
    if (this.textures.exists(bossType)) {
      boss = this.add.sprite(x, y, bossType);
      console.log(`✅ Using SVG sprite for boss: ${bossType}`);
    } else {
      console.warn(`⚠️ Boss texture ${bossType} not found, creating fallback`);
      if (this.assetManager) {
        AssetManager.createFallbackBossSprite(this, bossType, bossType.replace('boss_', ''));
      } else {
        console.error('❌ AssetManager not available for fallback boss sprite');
        return;
      }
      boss = this.add.sprite(x, y, bossType);
      console.log(`✅ Using fallback sprite for boss: ${bossType}`);
    }
    
    boss.setScale(1.8); // Slightly bigger than dungeon boss
    boss.setDepth(6);
    boss.setInteractive();
    
    // Add boss physics with safety check
    if (this.physics) {
      this.physics.add.existing(boss);
      if ((boss.body as Phaser.Physics.Arcade.Body)) {
        (boss.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
      }
    }
    
    // Boss name with different styling for open world
    const bossName = this.add.text(x, y - 60, `👑 WORLD BOSS\n${bossType.toUpperCase()}`, {
      fontSize: '12px',
      color: '#FFD700',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(7);
    
    // Epic glow effect for world boss
    const glowCircle = this.add.circle(x, y, 40, 0xFFD700, 0.2);
    glowCircle.setDepth(4);
    
    // Menacing animation
    this.tweens.add({
      targets: [boss, bossName],
      scaleX: boss.scaleX * 1.1,
      scaleY: boss.scaleY * 1.1,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Glow pulse animation
    this.tweens.add({
      targets: glowCircle,
      alpha: 0.4,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });
    
    // Boss fight interaction
    boss.on('pointerdown', () => {
      this.initiateOpenWorldBossFight(boss, bossName, glowCircle, bossType);
    });
  }
  
  private initiateBossFight(boss: Phaser.GameObjects.Sprite, bossName: Phaser.GameObjects.Text, bossType: string) {
    // Emit boss fight context
    this.game.events.emit('contextChanged', 'boss');
    
    // Simple boss fight simulation
    const playerLevel = this.playerData?.level || 1;
    const bossLevel = playerLevel + Phaser.Math.Between(2, 5);
    
    const playerPower = playerLevel * 10;
    const bossPower = bossLevel * 15;
    
    const victory = playerPower > bossPower * 0.7; // Give player slight advantage
    
    if (victory) {
      // Victory!
      boss.destroy();
      bossName.destroy();
      
      const victoryText = this.add.text(boss.x, boss.y, '🎉 VICTORY!', {
        fontSize: '24px',
        color: '#00ff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(10);
      
      // Victory animation
      this.tweens.add({
        targets: victoryText,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 3000,
        ease: 'Power2',
        onComplete: () => victoryText.destroy()
      });
      
      // Return to normal world after victory
      this.time.delayedCall(3000, () => {
        this.game.events.emit('contextChanged', 'world');
      });
      
    } else {
      // Defeat - player takes damage and loses gold
      const damageTaken = Phaser.Math.Between(20, 40);
      const goldLost = Phaser.Math.Between(50, 150);
      
      // Update player health
      this.playerHealth = Math.max(0, this.playerHealth - damageTaken);
      this.updateHealthBar();
      
      // Update player data
      if (this.playerData) {
        this.playerData.gold = Math.max(0, (this.playerData.gold || 0) - goldLost);
      }
      
      const defeatText = this.add.text(boss.x, boss.y - 80, `💀 DEFEAT!\n-${damageTaken} HP\n-${goldLost} Gold`, {
        fontSize: '16px',
        color: '#ff0000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(10);
      
      this.tweens.add({
        targets: defeatText,
        alpha: 0,
        duration: 3000,
        onComplete: () => defeatText.destroy()
      });
      
      // Show damage effect on player
      this.player.setTint(0xff0000);
      this.time.delayedCall(500, () => {
        this.player.clearTint();
      });
      
      // Respawn player at center of screen
      this.player.setPosition(this.scale.width / 2, this.scale.height / 2);
      this.game.events.emit('contextChanged', 'world');
      
      // Emit player data update to sync with server
      if (this.socket) {
        this.socket.emit('updatePlayerStats', {
          health: this.playerHealth,
          gold: this.playerData?.gold || 0
        });
      }
    }
  }

  private initiateOpenWorldBossFight(boss: Phaser.GameObjects.Sprite, bossName: Phaser.GameObjects.Text, glowCircle: Phaser.GameObjects.Arc, bossType: string) {
    // Emit boss fight context
    this.game.events.emit('contextChanged', 'boss');
    
    // Enhanced boss fight simulation for world boss
    const playerLevel = this.playerData?.level || 1;
    const bossLevel = playerLevel + Phaser.Math.Between(3, 7); // World bosses are stronger
    
    const playerPower = playerLevel * 10;
    const bossPower = bossLevel * 20; // World bosses are more powerful
    
    const victory = playerPower > bossPower * 0.6; // Harder fight
    
    if (victory) {
      // Epic Victory!
      boss.destroy();
      bossName.destroy();
      glowCircle.destroy();
      
      const victoryText = this.add.text(boss.x, boss.y, '🏆 EPIC VICTORY!\n+LEGENDARY LOOT!', {
        fontSize: '20px',
        color: '#FFD700',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(10);
      
      // Epic victory animation
      this.tweens.add({
        targets: victoryText,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: 4000,
        ease: 'Power2',
        onComplete: () => victoryText.destroy()
      });

      // Epic loot explosion
      this.createEpicLootParticles(boss.x, boss.y);
      
      // Return to normal world after victory
      this.time.delayedCall(4000, () => {
        this.game.events.emit('contextChanged', 'world');
      });
      
    } else {
      // Defeat - more dramatic for world boss with severe consequences
      const damageTaken = Phaser.Math.Between(40, 80); // More damage for world boss
      const goldLost = Phaser.Math.Between(100, 300); // More gold lost for world boss
      
      // Update player health
      this.playerHealth = Math.max(0, this.playerHealth - damageTaken);
      this.updateHealthBar();
      
      // Update player data
      if (this.playerData) {
        this.playerData.gold = Math.max(0, (this.playerData.gold || 0) - goldLost);
      }
      
      const defeatText = this.add.text(boss.x, boss.y - 80, `💀 CRUSHED BY WORLD BOSS!\n-${damageTaken} HP\n-${goldLost} Gold`, {
        fontSize: '16px',
        color: '#ff0000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(10);
      
      this.tweens.add({
        targets: defeatText,
        alpha: 0,
        duration: 4000,
        onComplete: () => defeatText.destroy()
      });
      
      // Show severe damage effect on player
      this.player.setTint(0xff0000);
      this.tweens.add({
        targets: this.player,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.player.clearTint();
          this.player.setAlpha(1);
        }
      });
      
      // Respawn player at center of screen
      this.player.setPosition(this.scale.width / 2, this.scale.height / 2);
      this.game.events.emit('contextChanged', 'world');
      
      // Emit player data update to sync with server
      if (this.socket) {
        this.socket.emit('updatePlayerStats', {
          health: this.playerHealth,
          gold: this.playerData?.gold || 0
        });
      }
    }
  }
  
  private createLootParticles(x: number, y: number) {
    // Create simple particle effect
    for (let i = 0; i < 10; i++) {
      const particle = this.add.circle(x, y, 3, 0xffd700);
      particle.setDepth(8);
      
      const angle = (i / 10) * Math.PI * 2;
      const distance = 50;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private createEpicLootParticles(x: number, y: number) {
    // Create epic particle effect for world boss victory
    for (let i = 0; i < 25; i++) {
      const colors = [0xFFD700, 0xFF6B35, 0x9B59B6, 0x3498DB, 0xE74C3C];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this.add.circle(x, y, 4 + Math.random() * 3, color);
      particle.setDepth(9);
      
      this.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 200,
        y: y + (Math.random() - 0.5) * 200,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 2000 + Math.random() * 1000,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }
  
  // Add method to trigger procedural generation from external components
  public generateNewDungeon() {
    this.generateProceduralDungeon();
    this.game.events.emit('contextChanged', 'dungeon');
  }
  
  private addDungeonButton() {
    // Add button to generate new dungeon - positioned relative to screen size
    const buttonX = this.scale.width - 120;
    const buttonY = 60;
    
    const buttonBg = this.add.rectangle(buttonX, buttonY, 200, 45, 0x9c27b0, 0.9);
    buttonBg.setInteractive();
    buttonBg.setDepth(50);
    buttonBg.setStrokeStyle(2, 0xFFD700);
    
    const buttonText = this.add.text(buttonX, buttonY, '🏰 DUNGEON MODE\nEXPLORE DUNGEON', {
      fontSize: '11px',
      color: '#FFD700',
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(51);
    
    // Button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0xe91e63, 0.9);
      buttonText.setScale(1.1);
    });
    
    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x9c27b0, 0.8);
      buttonText.setScale(1.0);
    });
    
    // Button click
    buttonBg.on('pointerdown', () => {
      console.log('🏰 Generating new procedural dungeon...');
      this.generateProceduralDungeon();
      
      // Show notification
      const notification = this.add.text(400, 100, '🏰 New Dungeon Generated!', {
        fontSize: '18px',
        color: '#00ff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(100);
      
      this.tweens.add({
        targets: notification,
        alpha: 0,
        y: 50,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => notification.destroy()
      });
    });
    
    // Store button references for later removal/update
    (this as any).dungeonButton = buttonBg;
    (this as any).dungeonButtonText = buttonText;
  }
  
  private addExitDungeonButton() {
    // Add exit dungeon button - positioned next to dungeon button
    const buttonX = this.scale.width - 320;
    const buttonY = 60;
    
    const exitButtonBg = this.add.rectangle(buttonX, buttonY, 180, 45, 0xd32f2f, 0.9);
    exitButtonBg.setInteractive();
    exitButtonBg.setDepth(50);
    exitButtonBg.setStrokeStyle(2, 0xFFD700);
    
    const exitButtonText = this.add.text(buttonX, buttonY, '🚪 EXIT DUNGEON\nRETURN TO WORLD', {
      fontSize: '11px',
      color: '#FFD700',
      fontFamily: '"Cinzel", "Times New Roman", serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(51);
    
    // Button hover effects
    exitButtonBg.on('pointerover', () => {
      exitButtonBg.setFillStyle(0xf44336, 0.9);
      exitButtonText.setScale(1.1);
    });
    
    exitButtonBg.on('pointerout', () => {
      exitButtonBg.setFillStyle(0xd32f2f, 0.9);
      exitButtonText.setScale(1.0);
    });
    
    // Button click - exit dungeon
    exitButtonBg.on('pointerdown', () => {
      console.log('🚪 Exiting dungeon, returning to open world...');
      this.exitDungeon();
      
      // Show notification
      const notification = this.add.text(400, 100, '🌍 Returned to Open World!', {
        fontSize: '18px',
        color: '#4caf50',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(100);
      
      this.tweens.add({
        targets: notification,
        alpha: 0,
        y: 50,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => notification.destroy()
      });
    });
    
    // Store button references
    (this as any).exitDungeonButton = exitButtonBg;
    (this as any).exitDungeonButtonText = exitButtonText;
  }
  
  private exitDungeon() {
    // Clear dungeon elements
    this.mapTiles.forEach(tile => tile.destroy());
    this.mapTiles = [];
    
    // Clear enemies
    this.enemies.forEach(enemy => {
      if ((enemy as any).levelText) {
        (enemy as any).levelText.destroy();
      }
      enemy.destroy();
    });
    this.enemies = [];
    
    // Clear items
    this.items.forEach(item => {
      if ((item as any).glowCircle) {
        (item as any).glowCircle.destroy();
      }
      item.destroy();
    });
    this.items = [];
    
    // Remove exit button and update dungeon button
    if ((this as any).exitDungeonButton) {
      (this as any).exitDungeonButton.destroy();
      (this as any).exitDungeonButtonText.destroy();
      (this as any).exitDungeonButton = null;
      (this as any).exitDungeonButtonText = null;
    }
    
    // Update dungeon button text
    if ((this as any).dungeonButtonText) {
      (this as any).dungeonButtonText.setText('🏰 DUNGEON MODE\nEXPLORE DUNGEON');
    }
    
    // Regenerate open world
    this.createMap();
    this.createEnvironmentalObjects();
    this.createEnemies();
    this.createItems();
    
    // Reset player position to center - with safety check
    if (this.player && this.player.setPosition) {
      this.player.setPosition(this.scale.width / 2, this.scale.height / 2);
      console.log('🎯 Player repositioned to center');
    } else {
      console.warn('⚠️ Player object not found, recreating...');
      // Recreate player if missing
      this.createPlayer();
    }
    
    // Emit context change
    this.game.events.emit('contextChanged', 'world');
    
    console.log('🌍 Successfully returned to open world');
  }
  
  // Permadeath system
  private handlePlayerDeath() {
    console.log('💀 Player death - implementing permadeath...');
    
    // Show death screen
    const deathOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    deathOverlay.setDepth(100);
    
    const deathText = this.add.text(400, 250, '💀 YOU HAVE DIED', {
      fontSize: '32px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101);
    
    const respawnText = this.add.text(400, 350, 'Respawning in new dungeon...', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);
    
    // Reset after 3 seconds
    this.time.delayedCall(3000, () => {
      deathOverlay.destroy();
      deathText.destroy();
      respawnText.destroy();
      
      // Generate new dungeon (permadeath = new world)
      this.generateProceduralDungeon();
      
      // Reset player position - will be set by generateProceduralDungeon
      // this.player.setPosition(100, 100); // Removed - let dungeon generation handle this
    });
  }


}

export default GameScene;
