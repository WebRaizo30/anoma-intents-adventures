import api from './authService';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export interface Character {
  id: number;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  gold: number;
  intent: number;
  racial_currency: number;
  alignment: string;
  
  // Stats
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Health
  hp: number;
  health: number;
  
  // Position
  current_region: string;
  position_x: number;
  position_y: number;
  
  // Quest progress
  completed_quests: number;
  
  // Progress info
  levelProgress?: {
    current: number;
    required: number;
    percentage: number;
  };
}

export interface Quest {
  id: number;
  name: string;
  description: string;
  region: string;
  difficulty: string;
  xp_reward: number;
  intent_reward: number; // Changed from gold_reward
  level_requirement: number;
  calculated_rewards?: {
    xp: number;
    intent: number; // Changed from gold
  };
}

export interface Item {
  id: number;
  name: string;
  category: string;
  rarity: string;
  description: string;
  value: number;
  shop_price?: number;
  can_afford?: boolean;
  equipped?: boolean;
  quantity?: number;
}

export const gameService = {
  // Initialize socket connection
  initializeSocket(): Socket {
    const socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
    
    socket.connect();
    return socket;
  },

  // Character management
  async getCharacterProfile(): Promise<any> {
    const response = await api.get('/character/profile');
    return response.data;
  },

  async createCharacter(name: string, race: string, characterClass: string): Promise<any> {
    const response = await api.post('/character/create', {
      name,
      race,
      characterClass
    });
    return response.data;
  },

  async changeRace(newRace: string): Promise<any> {
    const response = await api.put('/character/race', { newRace });
    return response.data;
  },

  async changeClass(newClass: string): Promise<any> {
    const response = await api.put('/character/class', { newClass });
    return response.data;
  },



  async getCharacterOptions(): Promise<any> {
    const response = await api.get('/character/options');
    return response.data;
  },

  // Economy
  async collectDaily(): Promise<any> {
    const response = await api.post('/economy/daily');
    return response.data;
  },

  async work(): Promise<any> {
    const response = await api.post('/economy/work');
    return response.data;
  },

  async transferIntent(targetUsername: string, amount: number): Promise<any> {
    const response = await api.post('/economy/transfer', {
      targetUsername,
      amount
    });
    return response.data;
  },

  async getBankInfo(): Promise<any> {
    const response = await api.get('/economy/bank');
    return response.data;
  },

  // Quests
  async startQuest(difficulty: string = 'medium', region?: string): Promise<any> {
    const response = await api.post('/quest/start', {
      difficulty,
      region
    });
    return response.data;
  },

  async getAvailableQuests(region?: string, difficulty?: string): Promise<any> {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await api.get(`/quest/available?${params.toString()}`);
    return response.data;
  },

  async getQuestHistory(): Promise<any> {
    const response = await api.get('/quest/history');
    return response.data;
  },

  async getQuestStats(): Promise<any> {
    const response = await api.get('/quest/stats');
    return response.data;
  },

  // Inventory
  async getInventory(): Promise<any> {
    const response = await api.get('/inventory');
    return response.data;
  },

  async equipItem(itemId: number, equip: boolean): Promise<any> {
    const response = await api.put(`/inventory/equip/${itemId}`, { equip });
    return response.data;
  },

  async sellItem(itemId: number, quantity: number = 1): Promise<any> {
    const response = await api.post(`/inventory/sell/${itemId}`, { quantity });
    return response.data;
  },

  async useItem(itemId: number, quantity: number = 1): Promise<any> {
    const response = await api.post(`/inventory/use/${itemId}`, { quantity });
    return response.data;
  },

  async deleteItem(itemId: number, quantity: number = 1): Promise<any> {
    const response = await api.delete(`/inventory/delete/${itemId}`, { data: { quantity } });
    return response.data;
  },

  async getShop(category?: string, rarity?: string, page: number = 1): Promise<any> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (rarity) params.append('rarity', rarity);
    params.append('page', page.toString());
    
    const response = await api.get(`/inventory/shop?${params.toString()}`);
    return response.data;
  },

  async buyItem(itemId: number, quantity: number = 1): Promise<any> {
    const response = await api.post('/inventory/shop/buy', {
      itemId,
      quantity
    });
    return response.data;
  },

  // Game features
  async getLeaderboard(type: string): Promise<any> {
    const response = await api.get(`/game/leaderboard/${type}`);
    return response.data;
  },

  async getRegions(): Promise<any> {
    const response = await api.get('/game/regions');
    return response.data;
  },

  async getRegionDetails(name: string): Promise<any> {
    const response = await api.get(`/game/regions/${name}`);
    return response.data;
  },



  async fightBoss(): Promise<any> {
    const response = await api.post('/game/boss');
    return response.data;
  },

  // Combat System
  async startPvECombat(): Promise<any> {
    const response = await api.post('/combat/pve');
    return response.data;
  },

  async challengePlayer(targetUsername: string): Promise<any> {
    const response = await api.post('/combat/challenge', {
      targetUsername
    });
    return response.data;
  },

  async healCharacter(): Promise<any> {
    const response = await api.post('/combat/heal');
    return response.data;
  },

  async getCombatStats(): Promise<any> {
    const response = await api.get('/combat/stats');
    return response.data;
  },

  // Update character position
  async updateCharacterPosition(region: string, x: number, y: number): Promise<any> {
    const response = await api.put('/character/position', {
      region,
      x,
      y
    });
    return response.data;
  },

  // Pet System
  async getPets(): Promise<any> {
    const response = await api.get('/pets');
    return response.data;
  },

  async getAvailablePets(): Promise<any> {
    const response = await api.get('/pets/available');
    return response.data;
  },

  async adoptPet(petId: number): Promise<any> {
    const response = await api.post(`/pets/adopt/${petId}`);
    return response.data;
  },

  async setActivePet(petId: number): Promise<any> {
    const response = await api.put(`/pets/active/${petId}`);
    return response.data;
  },

  async feedPet(petId: number, itemId: number): Promise<any> {
    const response = await api.post(`/pets/feed/${petId}`, {
      itemId
    });
    return response.data;
  },

  // Story System
  async generateStory(type: string = 'random', context?: any): Promise<any> {
    const response = await api.post('/story/generate', {
      type,
      context
    });
    return response.data;
  },

  async getStoryHistory(): Promise<any> {
    const response = await api.get('/story/history');
    return response.data;
  },

  // Apply game rewards from real-time gameplay
  async applyGameRewards(rewards: {
    xp_gained?: number;
    intent_gained?: number; // Changed from gold_gained
    items_collected?: number;
    enemies_defeated?: number;
  }): Promise<any> {
    const response = await api.post('/game/rewards', rewards);
    return response.data;
  },

  // Add collected item to inventory
  async addItemToInventory(itemName: string, itemType: string, intentValue: number = 0): Promise<any> {
    const response = await api.post('/inventory/add', {
      itemName,
      itemType,
      intentValue // Changed from goldValue
    });
    return response.data;
  }
};

export default gameService;
