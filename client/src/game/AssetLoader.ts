import Phaser from 'phaser';

import { AssetManager } from './AssetManager';

export class AssetLoader {
  private static loadedAssets = new Set<string>();
  private static maxRetries = 3;
  private static retryDelay = 1000; // 1 second

  static async loadGameAssets(scene: Phaser.Scene): Promise<void> {
    // Loading game assets
    
    // Clear loaded assets set when starting fresh
    AssetLoader.loadedAssets.clear();
    
    try {
      // Wait for scene to be fully ready
      let attempts = 0;
      const maxAttempts = 15; // Increased from 10 to 15
      
      while ((!scene || !scene.textures || !scene.add) && attempts < maxAttempts) {
        console.warn(`⚠️ Scene not ready, waiting... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 300)); // Increased from 200 to 300
        attempts++;
      }
      
      if (!scene || !scene.textures || !scene.add) {
        throw new Error('Scene failed to become ready after multiple attempts');
      }

      // Scene is ready, proceeding with asset loading

      // Load all SVG assets first with retry mechanism
      await this.loadAllSVGAssetsWithRetry(scene);
      
      // All game assets loaded successfully
    } catch (error) {
      console.error('❌ Error loading game assets:', error);
      // Create fallback assets if loading fails
      if (scene && scene.add) {
        // Creating fallback assets due to loading failure
        AssetManager.createFallbackAssets(scene);
      }
    }
  }

  private static async loadAllSVGAssetsWithRetry(scene: Phaser.Scene): Promise<void> {
    let retryCount = 0;
    
    while (retryCount < this.maxRetries) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${this.maxRetries} to load SVG assets...`);
        
        // Queue all SVG assets
        this.loadCharacterSprites(scene);
        this.loadEnemySprites(scene);
        this.loadBossSprites(scene);
        this.loadItemSprites(scene);
        this.loadTileSprites(scene);
        this.loadUISprites(scene);
        
        // Start loading all queued assets
        if (scene.load.list.size > 0) {
          console.log(`🚀 Starting to load ${scene.load.list.size} assets...`);
          
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              scene.load.off('complete', onComplete);
              scene.load.off('loaderror', onError);
              reject(new Error('Asset loading timeout after 30 seconds'));
            }, 30000); // 30 second timeout
            
            const onComplete = () => {
              clearTimeout(timeout);
              scene.load.off('complete', onComplete);
              scene.load.off('loaderror', onError);
              console.log('✅ All SVG assets loaded successfully');
              resolve();
            };
            
            const onError = (file: any) => {
              clearTimeout(timeout);
              scene.load.off('complete', onComplete);
              scene.load.off('loaderror', onError);
              console.error(`❌ Failed to load asset:`, file);
              reject(new Error(`Failed to load asset: ${file.key}`));
            };
            
            scene.load.on('complete', onComplete);
            scene.load.on('loaderror', onError);
            
            scene.load.start();
          });
          
          // If we get here, loading was successful
          break;
        } else {
          console.log('✅ No new assets to load');
          break;
        }
      } catch (error) {
        retryCount++;
        console.error(`❌ Asset loading attempt ${retryCount} failed:`, error);
        
        if (retryCount < this.maxRetries) {
          console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          
          // Clear any failed loads and reset the loader
          scene.load.reset();
        } else {
          console.error('❌ All asset loading attempts failed, using fallback assets');
          throw error;
        }
      }
    }
  }

  private static async loadCharacterSprites(scene: Phaser.Scene): Promise<void> {
    const characterRaces = ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn', 'tiefling', 'drow', 'githzerai', 'svirfneblin'];
    
    console.log('👤 Loading character sprites...');
    
    for (const race of characterRaces) {
      const key = `player_${race}`;
      const path = `/assets/characters/${race}_male.svg`;
      
      if (!scene.textures.exists(key)) {
        // Add to load queue with error handling
        try {
          scene.load.svg(key, path);
          console.log(`🔄 Queued character sprite: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to queue character sprite ${key}:`, error);
        }
      } else {
        console.log(`✅ Texture ${key} already exists, skipping`);
      }
    }
  }

  private static async loadEnemySprites(scene: Phaser.Scene): Promise<void> {
    const enemies = ['skeleton', 'goblin', 'wolf', 'spider'];
    
    console.log('👹 Loading enemy sprites...');
    
    for (const enemy of enemies) {
      const key = `enemy_${enemy}`;
      const path = `/assets/characters/${enemy}.svg`;
      
      if (!scene.textures.exists(key)) {
        try {
          scene.load.svg(key, path);
          console.log(`🔄 Queued enemy sprite: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to queue enemy sprite ${key}:`, error);
        }
      } else {
        console.log(`✅ Texture ${key} already exists, skipping`);
      }
    }
  }

  private static async loadBossSprites(scene: Phaser.Scene): Promise<void> {
    const bosses = [
      'boss_ancient_treant',
      'boss_dragon_wyrmling', 
      'boss_mummy_lord',
      'boss_sand_worm',
      'boss_shadow_wolf_alpha',
      'boss_stone_giant'
    ];
    
    console.log('🐉 Loading boss sprites...');
    
    for (const boss of bosses) {
      const key = boss;
      const path = `/assets/characters/${boss}.svg`;
      
      if (!scene.textures.exists(key)) {
        try {
          scene.load.svg(key, path);
          console.log(`🔄 Queued boss sprite: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to queue boss sprite ${key}:`, error);
        }
      } else {
        console.log(`✅ Texture ${key} already exists, skipping`);
      }
    }
  }

  private static async loadItemSprites(scene: Phaser.Scene): Promise<void> {
    const items = [
      'coin', 
      'gem', 
      'potion_health', 
      'potion', 
      'potion_mana',
      'sword', 
      'shield',
      'ring',
      'scroll',
      'shrimp_baby',
      'shrimp_adult',
      'shrimp_tank'
    ];
    
    console.log('🎁 Loading item sprites...');
    
    for (const item of items) {
      const key = `item_${item}`;
      const path = `/assets/items/${item}.svg`;
      
      if (!scene.textures.exists(key)) {
        try {
          scene.load.svg(key, path);
          console.log(`🔄 Queued item sprite: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to queue item sprite ${key}:`, error);
        }
      } else {
        console.log(`✅ Texture ${key} already exists, skipping`);
      }
    }
  }

  private static async loadTileSprites(scene: Phaser.Scene): Promise<void> {
    const tiles = ['grass', 'stone', 'water', 'sand', 'snow', 'lava'];
    
    console.log('🗺️ Loading tile sprites...');
    
    for (const tile of tiles) {
      const key = `tile_${tile}`;
      const path = `/assets/tiles/${tile}.svg`;
      
      if (!scene.textures.exists(key)) {
        try {
          scene.load.svg(key, path);
          console.log(`🔄 Queued tile sprite: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to queue tile sprite ${key}:`, error);
        }
      } else {
        console.log(`✅ Texture ${key} already exists, skipping`);
      }
    }
  }

  private static async loadUISprites(scene: Phaser.Scene): Promise<void> {
    const uiAssets = ['logo'];
    
    console.log('🎨 Loading UI sprites...');
    
    for (const ui of uiAssets) {
      const key = `ui_${ui}`;
      const path = `/assets/ui/${ui}.svg`;
      
      if (!scene.textures.exists(key)) {
        try {
          scene.load.svg(key, path);
          console.log(`🔄 Queued UI sprite: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Failed to queue UI sprite ${key}:`, error);
        }
      } else {
        console.log(`✅ Texture ${key} already exists, skipping`);
      }
    }
  }

  // Legacy method for backward compatibility
  private static async loadAllSVGAssets(scene: Phaser.Scene): Promise<void> {
    return this.loadAllSVGAssetsWithRetry(scene);
  }

}

export default AssetLoader;