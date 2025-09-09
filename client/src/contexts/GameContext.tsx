import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { gameService, Character } from '../services/gameService';
import { useSocket } from './SocketContext';

interface GameContextType {
  character: Character | null;
  currentRegion: string;
  chatMessages: any[];
  loading: boolean;
  notifications: any[];
  refreshCharacter: () => Promise<void>;
  updateCharacterData: (newData: Partial<Character>) => void;
  sendChatMessage: (message: string) => void;
  moveToRegion: (region: string) => void;
  clearNotification: (type: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentRegion, setCurrentRegion] = useState('starting_meadows');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { socket, isConnected, leaveRegion } = useSocket();

  const refreshCharacter = useCallback(async () => {
    try {
      const response = await gameService.getCharacterProfile();
      
      if (response.success) {
        const newCharacterData = response.character;
        // Character data received silently
        
        // Only update if there are actual changes to avoid unnecessary re-renders
        if (!character || 
            character.intent !== newCharacterData.intent ||
            character.experience !== newCharacterData.experience ||
            character.level !== newCharacterData.level ||
            character.hp !== newCharacterData.hp ||
            character.health !== newCharacterData.health ||
            character.current_region !== newCharacterData.current_region ||
            character.gold !== newCharacterData.gold) {
          
          setCharacter(newCharacterData);
          
          // Only update region if it actually changed
          if (newCharacterData.current_region !== currentRegion) {
            setCurrentRegion(newCharacterData.current_region);
            // Region updated silently
            
            // Region joining is now handled by GameWorldNew.tsx
            // No need to emit joinRegion here
          }
        } else {
          // No changes detected, skipping update
        }
      } else {
        console.error('❌ GameContext - Failed to get character profile:', response.message);
      }
    } catch (error) {
      console.error('❌ GameContext - Failed to refresh character:', error);
      console.error('Error details:', error);
    }
  }, [character, currentRegion]); // Add character and currentRegion dependencies

  const initializeGame = useCallback(async () => {
    try {
      await refreshCharacter();
    } catch (error) {
      console.error('Game initialization failed:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshCharacter]);

  const setupSocketListeners = useCallback(() => {
    if (!socket) return;

    // Clear existing listeners to prevent duplicates
    socket.off('newChatMessage');
    socket.off('questEvent');
    socket.off('playerMoved');
    socket.off('characterUpdate');

    // New chat message
    socket.on('newChatMessage', (data) => {
      setChatMessages(prev => {
        // Kendi mesajımızı tekrar eklemeyelim (optimistic update'den dolayı)
        if (character && data.player === character.name) {
          // Kendi mesajımız zaten var mı kontrol et
          const ownMessageExists = prev.some(msg => 
            msg.player === data.player && 
            msg.message === data.message && 
            Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 2000
          );
          
          if (ownMessageExists) {
            return prev; // Kendi mesajımızı tekrar ekleme
          }
        }
        
        // Başka oyuncuların mesajları için duplicate kontrolü
        const messageExists = prev.some(msg => 
          msg.player === data.player && 
          msg.message === data.message && 
          Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 1000
        );
        
        if (messageExists) {
          return prev; // Don't add duplicate
        }
        
        return [...prev, data];
      });
      
      // Add chat notification if message is from another player
      if (character && data.player !== character.name) {
        const newNotification = {
          id: Date.now(),
          type: 'chat',
          message: `New message from ${data.player}`,
          timestamp: new Date(),
          data: data
        };
        setNotifications(prev => [...prev, newNotification]);
      }
    });

    // Quest events
    socket.on('questEvent', (data) => {
      // Quest event handled silently
    });

    // Player movement - handled by GameWorld component
    socket.on('playerMoved', (data) => {
      // This is now handled directly in GameWorld.tsx
    });

    // Character updates (from transfers, etc.)
    socket.on('characterUpdate', (data) => {
      if (data.character) {
        setCharacter(data.character);
      }
    });
  }, [socket, character]); // character dependency'sini ekledik

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (socket && isConnected) {
      setupSocketListeners();
      
      // Cleanup function
      return () => {
        if (socket) {
          socket.off('newChatMessage');
          socket.off('questEvent');
          socket.off('playerMoved');
          socket.off('characterUpdate');
        }
      };
    }
  }, [socket, isConnected, setupSocketListeners]);

  const sendChatMessage = (message: string) => {
    if (character && socket && message.trim()) {
      // Mesajı önce local state'e ekle (optimistic update)
      const newMessage = {
        player: character.name,
        message: message.trim(),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      
      // Sonra socket'e gönder
      socket.emit('chatMessage', {
        message: message.trim(),
        region: currentRegion,
        player: character.name,
        timestamp: newMessage.timestamp
      });
    }
  };

  const updateCharacterData = (newData: Partial<Character>) => {
    if (character) {
      // Only update specific fields that should trigger UI updates
      const fieldsToUpdate = ['intent', 'experience', 'level', 'hp', 'health'];
      const shouldUpdate = Object.keys(newData).some(key => fieldsToUpdate.includes(key));
      
      if (shouldUpdate) {
        // Create a new character object with only the updated fields
        const updatedCharacter = { ...character };
        Object.keys(newData).forEach(key => {
          if (fieldsToUpdate.includes(key)) {
            (updatedCharacter as any)[key] = (newData as any)[key];
          }
        });
        
        setCharacter(updatedCharacter);
        // Character data updated locally
      } else {
        // Skipping character update for non-UI fields
      }
    }
  };

  const moveToRegion = async (region: string) => {
    try {
      // Leave current region
      leaveRegion(currentRegion);
      
      // Set new region (joining will be handled by GameWorldNew.tsx)
      setCurrentRegion(region);
      
      // Update character position in database
      await gameService.updateCharacterPosition(region, 0, 0);
      
      // Clear chat messages for new region
      setChatMessages([]);
    } catch (error) {
      console.error('Failed to move to region:', error);
    }
  };

  const clearNotification = (type: string) => {
    setNotifications(prev => prev.filter(n => n.type !== type));
  };

  const value = {
    character,
    currentRegion,
    chatMessages,
    loading,
    notifications,
    refreshCharacter,
    updateCharacterData,
    sendChatMessage,
    moveToRegion,
    clearNotification
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
