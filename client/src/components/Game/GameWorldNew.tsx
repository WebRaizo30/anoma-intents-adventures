import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Dialog, Slide, Snackbar, Alert, Typography, Button } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import Phaser from 'phaser';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import GameScene from '../../game/GameScene';
import gameService from '../../services/gameService';

// Import all panels
import GameHUD from './GameHUD';
import CharacterPanelModal from './CharacterPanelModal';
import QuestPanel from './QuestPanel';
import InventoryPanel from './InventoryPanel';
import EconomyPanel from './EconomyPanel';
import CombatPanel from './CombatPanel';
import PetPanel from './PetPanel';
import ShrimpPanel from './ShrimpPanel';
import StoryPanel from './StoryPanel';
import ChatPanel from './ChatPanel';
import OnlinePlayersPanel from './OnlinePlayersPanel';
import RegionPanel from './RegionPanel';
import AudioPanel from './AudioPanel';
import LeaderboardPanel from './LeaderboardPanel';
import SettingsPanel from './SettingsPanel';
import TutorialSystem from '../Tutorial/TutorialSystem';

import MiniGuide from './MiniGuide';
import CharacterCard from './CharacterCard';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const GameWorldNew: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { character, currentRegion, updateCharacterData, notifications, clearNotification } = useGame();
  const { socket } = useSocket();

  // Panel states
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Tutorial states
  const [showTutorial, setShowTutorial] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  
  // Game context states
  const [gameContext, setGameContext] = useState<string>('exploration');
  const hasJoinedRegion = useRef(false);

  const displayToast = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
  }, []);

  const initializePhaser = useCallback(() => {
    if (!gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      backgroundColor: '#0a0a0a',
      scene: GameScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      }
    };

    phaserGameRef.current = new Phaser.Game(config);
    
           // Update game with character data when available (after a delay)
     setTimeout(() => {
       // Character data in GameWorldNew
       if (character && phaserGameRef.current) {
         // Emitting updatePlayerData event with character
         // Only send essential data to avoid unnecessary updates
         const essentialData = {
           name: character.name,
           race: character.race,
           class: character.class,
           level: character.level,
           experience: character.experience,
           intent: character.intent,
           health: character.health || 100,
           current_region: character.current_region,
           position_x: character.position_x,
           position_y: character.position_y
         };
         phaserGameRef.current.events.emit('updatePlayerData', essentialData);
       } else {
         // Cannot emit updatePlayerData - missing character or phaserGameRef
       }
     }, 1000);
    
    // Socket'i GameScene'e aktar
    setTimeout(() => {
      if (socket && phaserGameRef.current) {
        phaserGameRef.current.events.emit('setSocket', socket);
      }
    }, 1500);
     }, [character, socket]); // Include character dependency

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      initializePhaser();
    }

    // Check if tutorial should be shown
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (!tutorialCompleted && character) {
      setTimeout(() => {
        setShowTutorial(true);
      }, 2000); // Show tutorial 2 seconds after game loads
    }

    // Window resize handler
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight - 60);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
     }, [initializePhaser, character]); // Include character dependency

             // Update game when character data changes (but not intent/exp updates)
   useEffect(() => {
     if (phaserGameRef.current && character) {
       // Only update essential player data to avoid unnecessary re-renders
       const essentialData = {
         name: character.name,
         race: character.race,
         class: character.class,
         level: character.level,
         experience: character.experience,
         intent: character.intent,
         health: character.health || 100,
         current_region: character.current_region,
         position_x: character.position_x,
         position_y: character.position_y
       };
       phaserGameRef.current.events.emit('updatePlayerData', essentialData);
     }
   }, [character]); // Include character dependency

  // Set socket in GameScene when available
  useEffect(() => {
    if (!socket || !phaserGameRef.current) return;

    const setSocketInGameScene = () => {
      const gameScene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Setting socket in GameScene
        gameScene.setSocket(socket);
        return true;
      }
      return false;
    };

    // Try immediately
    if (setSocketInGameScene()) {
      return;
    }

    // If not ready, wait for scene to be created
    const gameInstance = phaserGameRef.current;
    const handleSceneCreated = (sceneKey: string) => {
      if (sceneKey === 'GameScene') {
        // GameScene created, setting socket
        // Small delay to ensure scene is fully initialized
        setTimeout(() => {
          if (setSocketInGameScene()) {
            gameInstance.events.off('sceneCreated', handleSceneCreated);
          }
        }, 100);
      }
    };

    const handleSceneStarted = (sceneKey: string) => {
      if (sceneKey === 'GameScene') {
        // GameScene started, setting socket
        if (setSocketInGameScene()) {
          gameInstance.events.off('sceneStarted', handleSceneStarted);
        }
      }
    };

    // Listen for scene creation and start events
    gameInstance.events.on('sceneCreated', handleSceneCreated);
    gameInstance.events.on('sceneStarted', handleSceneStarted);

    // Fallback: try periodically for a few seconds
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds with 100ms intervals
    const interval = setInterval(() => {
      attempts++;
      if (setSocketInGameScene()) {
        clearInterval(interval);
        gameInstance.events.off('sceneCreated', handleSceneCreated);
        gameInstance.events.off('sceneStarted', handleSceneStarted);
      } else if (attempts >= maxAttempts) {
        // Failed to set socket in GameScene after multiple attempts
        clearInterval(interval);
        gameInstance.events.off('sceneCreated', handleSceneCreated);
        gameInstance.events.off('sceneStarted', handleSceneStarted);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      gameInstance.events.off('sceneCreated', handleSceneCreated);
      gameInstance.events.off('sceneStarted', handleSceneStarted);
    };
  }, [socket]);

  // Update game when region changes
  useEffect(() => {
    if (phaserGameRef.current && currentRegion) {
      phaserGameRef.current.events.emit('changeRegion', currentRegion);
      // Reset join flag when region changes
      hasJoinedRegion.current = false;
    }
  }, [currentRegion]);

  // Listen for game context changes from Phaser
  useEffect(() => {
    const gameInstance = phaserGameRef.current;
    if (gameInstance) {
      const handleContextChange = (context: string) => {
        setGameContext(context);
      };

      gameInstance.events.on('contextChanged', handleContextChange);
      
      return () => {
        gameInstance.events.off('contextChanged', handleContextChange);
      };
    }
  }, []); // Empty dependency array since we handle the ref internally

  // Setup socket listeners for multiplayer
  useEffect(() => {
    if (!socket || !phaserGameRef.current) return;

    // Setting up multiplayer socket listeners

    // Player joined region
    const handlePlayerJoined = (data: any) => {
      // Player joined
      if (data.character && data.character.name !== character?.name) {
        const gameScene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene;
        if (gameScene) {
          // Add player with their current position if available
          const position = data.position || { x: 300 + Math.random() * 200, y: 250 + Math.random() * 100 };
          gameScene.addOtherPlayer(data.playerId, data.character, position);
        }
      }
    };

    // Handle chat messages with bubbles
    const handleChatMessage = (data: any) => {
      // Chat message received
      const gameScene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Only show bubble for other players' messages
        // Don't show bubble for our own message (due to optimistic update)
        if (data.player !== character?.name) {
          // For other players, show bubble
          gameScene.showMessageBubble('other', data.message, data.player);
        }
      }
    };

    // Player moved
    const handlePlayerMoved = (data: any) => {
      if (data.character && data.character.name !== character?.name) {
        const gameScene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene;
        if (gameScene) {
          gameScene.moveOtherPlayer(data.playerId, data.position);
        }
      }
      
      // Player movement handled silently
    };

    // Player left region
    const handlePlayerLeft = (data: any) => {
      // Player left
      const gameScene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        gameScene.removeOtherPlayer(data.playerId);
      }
    };

    // Current players already in the game
    const handleCurrentPlayers = (players: any[]) => {
      // Current players in game
      const gameScene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Clear existing other players first
        gameScene.clearOtherPlayers();
        
        players.forEach((playerData: any) => {
          if (playerData.character && playerData.character.name !== character?.name) {
            // Adding existing player
            // Add existing players with their current positions if available
            const position = playerData.position || { x: 300 + Math.random() * 200, y: 250 + Math.random() * 100 };
            gameScene.addOtherPlayer(playerData.playerId, playerData.character, position);
          }
        });
      }
    };

    // Join region when character is available FIRST
    if (character && currentRegion && !hasJoinedRegion.current) {
      // Use character's actual current_region from database if available
      const actualRegion = character.current_region || currentRegion;
      // Joining region
      
      // Update character's current_region if it's different from context
      if (character.current_region !== currentRegion) {
        // Syncing character.current_region with context currentRegion
        character.current_region = currentRegion;
      }
      hasJoinedRegion.current = true;
      
      const joinData = {
        region: actualRegion,
        character: {
          name: character.name,
          race: character.race,
          class: character.class,
          level: character.level,
          experience: character.experience,
          intent: character.intent,
          health: character.hp || 100,
          maxHealth: 100 // Default max health
        }
      };
      // Sending joinRegion data
      socket.emit('joinRegion', joinData);
      
      // Don't send initial position here - let GameScene handle it when player is ready
    }

    // THEN listen to socket events
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerMoved', handlePlayerMoved);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('currentPlayers', handleCurrentPlayers);
    socket.on('newChatMessage', handleChatMessage);

    return () => {
      // Cleaning up multiplayer socket listeners
      // Remove all event listeners
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerMoved', handlePlayerMoved);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('currentPlayers', handleCurrentPlayers);
      socket.off('newChatMessage', handleChatMessage);
      
      // Reset join flag
      hasJoinedRegion.current = false;
    };
     }, [socket, character, currentRegion]); // Include character dependency

  // Define event handlers outside useEffect
  const handleItemCollected = useCallback(async (data: any) => {
    // Item collected event received
    
    try {
      // Add item to inventory first
      const itemType = data.type || 'treasure';
      const itemName = data.name || 'Unknown Item';
      const intentValue = data.intent_gained || 0;
      
      // Processing item
      
      // Add to inventory
      await gameService.addItemToInventory(itemName, itemType, intentValue);
      
      // Apply intent rewards
      if (intentValue > 0) {
        const rewardsResult = await gameService.applyGameRewards({
          intent_gained: intentValue,
          xp_gained: 0,
          items_collected: 1
        });
        
        // Update character state locally with the response data
        if (rewardsResult.success && rewardsResult.character) {
          // Only update specific fields to avoid page refresh
          updateCharacterData({
            intent: rewardsResult.character.intent,
            experience: rewardsResult.character.experience,
            level: rewardsResult.character.level
          });
        }
      }
      
      displayToast(`📦 ${itemName} added to inventory! +${intentValue} Intent`, 'success');
    } catch (error) {
      console.error('❌ Failed to apply item rewards:', error);
      console.error('Error details:', error);
      console.error('Error stack:', (error as Error).stack);
      displayToast('Failed to collect item', 'error');
    }
  }, [updateCharacterData, displayToast]);

  const handleEnemyDefeated = useCallback(async (data: any) => {
    // Enemy defeated
    try {
      // Ensure we have valid reward values
      const xpGained = data.xp_gained || 0;
      const intentGained = data.intent_gained || 0;
      
      // Enemy rewards processed
      
      const rewardsResult = await gameService.applyGameRewards({
        xp_gained: xpGained,
        intent_gained: intentGained,
        enemies_defeated: 1
      });
      
      // Update character state locally with the response data
      if (rewardsResult.success && rewardsResult.character) {
        // Updating character state with enemy rewards
        // Only update specific fields to avoid page refresh
        updateCharacterData({
          intent: rewardsResult.character.intent,
          experience: rewardsResult.character.experience,
          level: rewardsResult.character.level
        });
      }
      
      displayToast(`🎉 +${xpGained} XP, +${intentGained} Intent!`, 'success');
    } catch (error) {
      console.error('Failed to apply combat rewards:', error);
    }
  }, [updateCharacterData, displayToast]);

  // Listen for game reward events
  useEffect(() => {
    if (!phaserGameRef.current) return;

    // Setting up game event listeners

    // Listen to game events - Remove existing listeners first to prevent duplicates
    phaserGameRef.current.events.off('itemCollected');
    phaserGameRef.current.events.off('enemyDefeated');
    
    // Add new listeners
    phaserGameRef.current.events.on('itemCollected', handleItemCollected);
    phaserGameRef.current.events.on('enemyDefeated', handleEnemyDefeated);
    
    // Game event listeners attached successfully

    return () => {
      if (phaserGameRef.current) {
        // Cleaning up game event listeners
        phaserGameRef.current.events.off('itemCollected', handleItemCollected);
        phaserGameRef.current.events.off('enemyDefeated', handleEnemyDefeated);
      }
    };
  }, [handleItemCollected, handleEnemyDefeated]);

  const handlePanelOpen = (panel: string) => {
    setActivePanel(panel);
    
    // Clear notifications when chat panel is opened
    if (panel === 'chat') {
      clearNotification('chat');
    }
    
    // Notify GameScene when chat panel is opened
    if (panel === 'chat' && phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Opening chat panel - disabling game controls
        gameScene.setChatPanelOpen(true);
      }
    }
    
    // Also notify GameScene when combat panel is opened
    if (panel === 'combat' && phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Opening combat panel - disabling game controls
        gameScene.setChatPanelOpen(true);
      }
    }
  };

  const handlePanelClose = () => {
    // Notify GameScene when chat panel is closed
    if (activePanel === 'chat' && phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Closing chat panel - enabling game controls
        gameScene.setChatPanelOpen(false);
      }
    }
    
    // Also notify GameScene when combat panel is closed
    if (activePanel === 'combat' && phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        // Closing combat panel - enabling game controls
        gameScene.setChatPanelOpen(false);
      }
    }
    
    setActivePanel(null);
  };

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
  };

  const handleTutorialHighlight = (element: string) => {
    setHighlightedElement(element);
    setTimeout(() => {
      setHighlightedElement(null);
    }, 3000); // Remove highlight after 3 seconds
  };

  // Keyboard event blocking removed - now controlled in GameScene

  const renderActivePanel = () => {
    const panelProps = {
      open: true,
      onClose: handlePanelClose,
      showToast
    };

    switch (activePanel) {
      case 'character':
        return <CharacterPanelModal {...panelProps} />;
      case 'quests':
        return <QuestPanel {...panelProps} />;
      case 'inventory':
        return <InventoryPanel {...panelProps} />;
      case 'economy':
        return <EconomyPanel {...panelProps} />;
      case 'combat':
        return <CombatPanel {...panelProps} />;
      case 'pets':
        return <PetPanel {...panelProps} />;
      case 'shrimp':
        return <ShrimpPanel {...panelProps} />;
      case 'story':
        return <StoryPanel {...panelProps} />;
      case 'chat':
        return <ChatPanel {...panelProps} />;
      case 'players':
        return <OnlinePlayersPanel {...panelProps} />;
      case 'map':
        return <RegionPanel {...panelProps} />;
      case 'audio':
        return <AudioPanel {...panelProps} />;
      case 'leaderboard':
        return <LeaderboardPanel {...panelProps} />;
      case 'settings':
        return <SettingsPanel {...panelProps} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Game HUD */}
      <GameHUD 
        onPanelOpen={handlePanelOpen} 
        notifications={notifications} 
        highlightedElement={highlightedElement}
      />

      {/* Phaser Game Canvas - Tam Ekran */}
      <Box
        ref={gameRef}
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #2a1a1a 50%, #1a0a0a 100%)',
          '& canvas': {
            width: '100% !important',
            height: '100% !important',
            display: 'block'
          }
        }}
      />

      {/* Ancient RPG Modal */}
      <Dialog
        open={!!activePanel}
        onClose={handlePanelClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        disableEscapeKeyDown={false}
        disableAutoFocus={false}
        sx={{
          '& .MuiDialog-container': {
            overflow: 'visible'
          },
          '& .MuiDialog-paper': {
            overflow: 'visible',
            maxWidth: '600px',
            width: '90vw'
          },
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(25,20,35,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxHeight: '80vh',
            maxWidth: '600px',
            position: 'relative',
            overflow: 'hidden',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }
        }}
      >

        {renderActivePanel()}
      </Dialog>

      {/* Ancient RPG Toast Notifications */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert 
          onClose={() => setToastMessage('')} 
          severity={toastSeverity}
          sx={{ 
            fontFamily: '"Cinzel", "Times New Roman", serif',
            background: toastSeverity === 'success' ? 'linear-gradient(45deg, #2e7d32 0%, #4caf50 100%)' : 
                       toastSeverity === 'error' ? 'linear-gradient(45deg, #c62828 0%, #f44336 100%)' :
                       toastSeverity === 'warning' ? 'linear-gradient(45deg, #ef6c00 0%, #ff9800 100%)' : 
                       'linear-gradient(45deg, #1565c0 0%, #2196f3 100%)',
            color: 'rgba(255,255,255,0.95)',
            border: `2px solid ${
              toastSeverity === 'success' ? '#4caf50' : 
              toastSeverity === 'error' ? '#f44336' :
              toastSeverity === 'warning' ? '#ff9800' : '#2196f3'
            }`,
            borderRadius: '12px',
            boxShadow: `0 8px 25px ${
              toastSeverity === 'success' ? 'rgba(76,175,80,0.4)' : 
              toastSeverity === 'error' ? 'rgba(244,67,54,0.4)' :
              toastSeverity === 'warning' ? 'rgba(255,152,0,0.4)' : 'rgba(33,150,243,0.4)'
            }`,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            '& .MuiAlert-icon': {
              color: 'rgba(255,255,255,0.95)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Ancient Welcome Scroll */}
      {character && (
        <Box
          sx={{
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            px: 4,
            py: 2.5,
            borderRadius: '15px',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            zIndex: 999,
            maxWidth: '750px'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <Box
              component="img"
              src="/assets/characters/boss_dragon_wyrmling.svg"
              alt="Dragon"
              sx={{
                width: 28,
                height: 28,
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))'
              }}
              onError={(e) => {
                console.warn('⚠️ Failed to load SVG in UI:', e.currentTarget.src);
              }}
              onLoad={() => {
                // SVG loaded successfully in UI
              }}
            />
            <Box textAlign="center" flex={1}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  fontWeight: 'bold',
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: 0.5,
                  mb: 1
                }}
              >
                Welcome back, {character.name}! 🎮 Level {character.level} - {character.experience} XP
              </Typography>
              <Box display="flex" gap={1} justifyContent="center">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowTutorial(true)}
                  sx={{
                    color: 'rgba(255,255,255,0.95)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '0.7rem',
                    fontFamily: '"Cinzel", serif',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.5)'
                    }
                  }}
                >
                  📚 Tutorial
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handlePanelOpen('quests')}
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                    fontSize: '0.7rem',
                    fontFamily: '"Cinzel", serif',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
                    }
                  }}
                >
                  ⚔️ First Quest
                </Button>
              </Box>
            </Box>
            <Box
              component="img"
              src="/assets/characters/boss_dragon_wyrmling.svg"
              alt="Dragon"
              sx={{
                width: 28,
                height: 28,
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))',
                transform: 'scaleX(-1)'
              }}
              onError={(e) => {
                // Failed to load SVG in UI
              }}
              onLoad={() => {
                // SVG loaded successfully in UI
              }}
            />
          </Box>
        </Box>
      )}

      {/* Tutorial System */}
      <TutorialSystem
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onHighlight={handleTutorialHighlight}
      />

      {/* Character Card */}
      <CharacterCard onCharacterClick={() => handlePanelOpen('character')} />

      {/* Mini Guide */}
      <MiniGuide 
        currentContext={gameContext}
        activePanel={activePanel}
        currentRegion={currentRegion}
      />

      {/* Toast notifications for rewards */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={toastSeverity} 
          onClose={() => setToastMessage('')}
          sx={{ minWidth: '300px' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GameWorldNew;
