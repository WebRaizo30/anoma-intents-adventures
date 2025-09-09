import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings,
  Logout,
  VolumeUp,
  Book
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { useAudio } from '../../contexts/AudioContext';
import CharacterCard from './CharacterCard';

interface GameHUDProps {
  onPanelOpen: (panel: string) => void;
  notifications: any[];
  highlightedElement?: string | null;
}

const GameHUD: React.FC<GameHUDProps> = ({ onPanelOpen, notifications, highlightedElement }) => {
  const { logout } = useAuth();
  const { character } = useGame();
  const { toggleMusic, isMusicPlaying } = useAudio();

  const getHighlightStyle = (elementId: string) => {
    if (highlightedElement === elementId) {
      return {
        boxShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700',
        border: '3px solid #FFD700',
        animation: 'tutorialPulse 2s infinite',
        '@keyframes tutorialPulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        }
      };
    }
    return {};
  };



  // Log character changes for debugging - removed for production
  React.useEffect(() => {
    if (character) {
      // Character data updated silently
    }
  }, [character]);

  // Character data will be updated through GameContext automatically
  // No need for interval-based updates

  return (
    <>
      {/* Character Card - Bottom Right */}
      <CharacterCard onCharacterClick={() => onPanelOpen('character')} />

      {/* Ancient RPG Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: `
            linear-gradient(90deg, 
              rgba(26,16,16,0.75) 0%, 
              rgba(42,26,26,0.8) 15%, 
              rgba(101,67,33,0.85) 30%, 
              rgba(139,69,19,0.85) 50%, 
              rgba(101,67,33,0.85) 70%, 
              rgba(42,26,26,0.8) 85%, 
              rgba(26,16,16,0.75) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          borderBottom: '4px solid transparent',
          borderImage: 'linear-gradient(90deg, #8B4513, #CD853F, #FFD700, #DAA520, #FFD700, #CD853F, #8B4513) 1',
          height: 55,
          boxShadow: `
            0 8px 30px rgba(139,69,19,0.6),
            inset 0 -2px 10px rgba(255,215,0,0.1),
            0 0 20px rgba(218,165,32,0.3)
          `,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.05) 25%, rgba(255,215,0,0.1) 50%, rgba(255,215,0,0.05) 75%, transparent 100%)',
            zIndex: -1,
            animation: 'headerGlow 12s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #8B4513, #CD853F, #FFD700, #DAA520, #B8860B, #FFD700, #CD853F, #8B4513)',
            backgroundSize: '300% 100%',
            animation: 'borderFlow 15s linear infinite'
          },
          '@keyframes headerGlow': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 }
          },
          '@keyframes borderFlow': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '300% 50%' }
          }
        }}
      >
        <Toolbar sx={{ minHeight: '55px !important', px: 3 }}>
          {/* Ancient Game Title with Mystical Logo */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Box
              component="img"
              src="/assets/ui/logo.svg"
              alt="Anoma Logo"
              sx={{
                width: 35,
                height: 35,
                mr: 2,
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6))',
                animation: 'logoMystic 6s ease-in-out infinite',
                '@keyframes logoMystic': {
                  '0%, 100%': { 
                    filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.6)) brightness(1)',
                    transform: 'scale(1)'
                  },
                  '50%': { 
                    filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8)) brightness(1.1)',
                    transform: 'scale(1.03)'
                  }
                }
              }}
            />
            <Box display="flex" flexDirection="column">
              <Typography 
                variant="h5" 
                sx={{ 
              fontWeight: 'bold',
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  background: 'linear-gradient(45deg, #FFD700 0%, #FFF 25%, #FFD700 50%, #DAA520 75%, #FFD700 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 15px rgba(255,215,0,0.6)',
                  letterSpacing: 0.5,
                  lineHeight: 1,
                  backgroundSize: '200% 100%',
                  animation: 'titleShine 8s ease-in-out infinite',
                  '@keyframes titleShine': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                  }
                }}
              >
                ANOMA INTENTS ADVENTURES
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", "Times New Roman", serif',
                    color: '#FFD700',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(255,215,0,0.8)',
                    letterSpacing: 0.5,
                    ml: 1,
                    fontSize: '0.6em',
                    verticalAlign: 'top'
                  }}
                >
                  BETA
                </Typography>
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  color: '#CD853F',
                  fontStyle: 'italic',
                  textShadow: '0 0 6px rgba(205,133,63,0.4)',
                  letterSpacing: 1,
                  fontSize: '0.6rem',
                  mt: -0.3
                }}
              >
                ~ REALM OF ENDLESS QUESTS ~
            </Typography>
            </Box>
          </Box>



          {/* Current Region Display - Top Right */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 2,
              background: 'linear-gradient(135deg, rgba(139,69,19,0.3) 0%, rgba(160,82,45,0.3) 100%)',
              borderRadius: '20px',
              px: 2,
              py: 1,
              border: '1px solid rgba(255,215,0,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              component="img"
              src="/assets/items/gem.svg"
              alt="Location"
              sx={{
                width: 16,
                height: 16,
                filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Cinzel", "Times New Roman", serif',
                color: '#FFD700',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textShadow: '0 0 6px rgba(255,215,0,0.4)'
              }}
            >
              {character?.current_region || 'Starting Meadows'}
            </Typography>
          </Box>

          {/* World Map Button - Top Right */}
          <Tooltip 
            title="World Map & Regions" 
            placement="bottom"
            componentsProps={{
              tooltip: {
                sx: {
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  background: 'rgba(139,69,19,0.9)',
                  border: '1px solid rgba(255,215,0,0.5)',
                  borderRadius: '6px',
                  color: '#FFD700',
                  fontSize: '0.8rem'
                }
              }
            }}
          >
            <IconButton 
              onClick={() => onPanelOpen('map')} 
              sx={{ 
                color: '#795548',
                background: 'linear-gradient(135deg, rgba(121,85,72,0.4) 0%, rgba(160,82,45,0.4) 100%)',
                border: '2px solid rgba(121,85,72,0.3)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                mr: 2,
                transition: 'all 0.4s ease',
                ...getHighlightStyle('map'),
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(121,85,72,0.6) 0%, rgba(160,82,45,0.6) 100%)',
                  borderColor: '#795548',
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 15px rgba(121,85,72,0.4)'
                }
              }}
            >
              {/* World Map Icon */}
              <Box
                component="img"
                src="/assets/icons/worldmap.png"
                alt="World Map"
                sx={{
                  width: 20,
                  height: 20,
                  filter: 'drop-shadow(0 0 4px rgba(121,85,72,0.6))'
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Ancient Control Runes */}
          <Box display="flex" gap={1}>
          <IconButton 
            onClick={() => onPanelOpen('settings')} 
            sx={{ 
                color: '#FFD700',
                background: 'linear-gradient(135deg, rgba(139,69,19,0.4) 0%, rgba(160,82,45,0.4) 100%)',
                border: '2px solid rgba(255,215,0,0.3)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                transition: 'all 0.4s ease',
              '&:hover': {
                  background: 'linear-gradient(135deg, rgba(160,82,45,0.6) 0%, rgba(139,69,19,0.6) 100%)',
                  borderColor: '#FFD700',
                  transform: 'scale(1.1) rotate(90deg)',
                  boxShadow: '0 6px 15px rgba(255,215,0,0.4)'
                }
              }}
            >
              <Settings sx={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))', fontSize: '1.1rem' }} />
          </IconButton>
          
          <IconButton 
            onClick={toggleMusic} 
            sx={{ 
                color: isMusicPlaying ? '#4CAF50' : '#FFD700',
                background: 'linear-gradient(135deg, rgba(139,69,19,0.4) 0%, rgba(160,82,45,0.4) 100%)',
                border: '2px solid rgba(255,215,0,0.3)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                transition: 'all 0.4s ease',
                mr: 1,
              '&:hover': {
                  background: 'linear-gradient(135deg, rgba(160,82,45,0.6) 0%, rgba(139,69,19,0.6) 100%)',
                  borderColor: '#FFD700',
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 15px rgba(255,215,0,0.4)'
                }
              }}
            >
              <VolumeUp sx={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))', fontSize: '1.1rem' }} />
          </IconButton>
          
          <IconButton 
            onClick={logout} 
            sx={{ 
                color: '#FF6B6B',
                background: 'linear-gradient(135deg, rgba(139,0,0,0.4) 0%, rgba(204,0,0,0.4) 100%)',
                border: '2px solid rgba(255,107,107,0.3)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                transition: 'all 0.4s ease',
              '&:hover': {
                  background: 'linear-gradient(135deg, rgba(204,0,0,0.6) 0%, rgba(139,0,0,0.6) 100%)',
                  borderColor: '#FF6B6B',
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 15px rgba(255,107,107,0.4)'
                }
              }}
            >
              <Logout sx={{ filter: 'drop-shadow(0 0 4px rgba(255,107,107,0.6))', fontSize: '1.1rem' }} />
          </IconButton>
          </Box>
        </Toolbar>
      </AppBar>



      {/* Minimal RPG Left Panel */}
      <Box
        sx={{
          position: 'fixed',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000,
          background: 'rgba(139,69,19,0.6)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '12px 6px',
          border: '2px solid rgba(255,215,0,0.5)',
          boxShadow: '0 8px 25px rgba(139,69,19,0.6)'
        }}
      >
        {/* Character Profile Button */}
        <Tooltip 
          title="Character Profile" 
          placement="right"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('character')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(139,0,0,0.4)',
              border: '1px solid rgba(255,215,0,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(139,0,0,0.4)',
                borderColor: 'rgba(255,215,0,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(139,0,0,0.4)'
              }
            }}
          >
            {/* Character Icon */}
            <Box
              component="img"
              src="/assets/icons/character.png"
              alt="Character"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
              }}
            />
          </Box>
        </Tooltip>

        {/* Quests Button */}
        <Tooltip 
          title="Quests & Adventures" 
          placement="right"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('quests')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(0,139,0,0.4)',
              border: '1px solid rgba(0,255,0,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              position: 'relative',
              ...getHighlightStyle('quests'),
              '&:hover': {
                background: 'rgba(0,139,0,0.4)',
                borderColor: 'rgba(0,255,0,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(0,139,0,0.4)'
              }
            }}
          >
            {/* Quest Icon */}
            <Box
              component="img"
              src="/assets/icons/quest.png"
              alt="Quest"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(0,255,0,0.6))'
              }}
            />
            {notifications.filter(n => n.type === 'quest').length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#FF4444',
                  border: '1px solid #FFF',
                  fontSize: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {notifications.filter(n => n.type === 'quest').length}
              </Box>
            )}
          </Box>
        </Tooltip>

        {/* Inventory Button */}
        <Tooltip 
          title="Inventory & Items" 
          placement="right"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('inventory')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(76,175,80,0.4)',
              border: '1px solid rgba(76,175,80,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              ...getHighlightStyle('inventory'),
              '&:hover': {
                background: 'rgba(76,175,80,0.4)',
                borderColor: 'rgba(76,175,80,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(76,175,80,0.4)'
              }
            }}
          >
            {/* Inventory Icon */}
            <Box
              component="img"
              src="/assets/icons/inventory.png"
              alt="Inventory"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(76,175,80,0.6))'
              }}
            />
          </Box>
        </Tooltip>

        {/* Combat Button */}
        <Tooltip 
          title="Combat & Battle" 
          placement="right"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('combat')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(244,67,54,0.4)',
              border: '1px solid rgba(244,67,54,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(244,67,54,0.4)',
                borderColor: 'rgba(244,67,54,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(244,67,54,0.4)'
              }
            }}
          >
            {/* Combat Icon */}
            <Box
              component="img"
              src="/assets/icons/combat.png"
              alt="Combat"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(244,67,54,0.6))'
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Minimal RPG Right Panel */}
      <Box
        sx={{
          position: 'fixed',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000,
          background: 'rgba(139,69,19,0.6)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '12px 6px',
          border: '2px solid rgba(255,215,0,0.5)',
          boxShadow: '0 8px 25px rgba(139,69,19,0.6)'
        }}
      >
        {/* Economy Button */}
        <Tooltip 
          title="Economy & Banking" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('economy')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(255,215,0,0.4)',
              border: '1px solid rgba(255,215,0,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              ...getHighlightStyle('economy'),
              '&:hover': {
                background: 'rgba(255,215,0,0.4)',
                borderColor: 'rgba(255,215,0,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(255,215,0,0.4)'
              }
            }}
          >
            {/* Economy Icon */}
            <Box
              component="img"
              src="/assets/icons/economy.png"
              alt="Economy"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
              }}
            />
          </Box>
        </Tooltip>

        {/* Pet System Button */}
        <Tooltip 
          title="Pet System" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('pets')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(233,30,99,0.2)',
              border: '1px solid rgba(233,30,99,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(233,30,99,0.4)',
                borderColor: 'rgba(233,30,99,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(233,30,99,0.4)'
              }
            }}
          >
            {/* Pet Icon */}
            <Box
              component="img"
              src="/assets/icons/pet.png"
              alt="Pet"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(255,105,180,0.6))'
              }}
            />
          </Box>
        </Tooltip>

        {/* Shrimp Farming Button */}
        <Tooltip 
          title="Shrimp Farming" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('shrimp')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(255,99,71,0.2)',
              border: '1px solid rgba(255,99,71,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(255,99,71,0.4)',
                borderColor: 'rgba(255,99,71,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(255,99,71,0.4)'
              }
            }}
          >
            {/* Shrimp Icon */}
            <Box
              component="img"
              src="/assets/icons/shrimp.png"
              alt="Shrimp"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(255,99,71,0.6))'
              }}
            />
          </Box>
        </Tooltip>

        {/* Story Generator Button */}
        <Tooltip 
          title="Story Generator" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('story')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(103,58,183,0.2)',
              border: '1px solid rgba(103,58,183,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(103,58,183,0.4)',
                borderColor: 'rgba(103,58,183,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(103,58,183,0.4)'
              }
            }}
          >
            {/* Story Generator Icon */}
            <Box
              component="img"
              src="/assets/icons/storygenerator.png"
              alt="Story Generator"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(103,58,183,0.6))'
              }}
            />
          </Box>
        </Tooltip>



        {/* Audio Controls Button */}
        <Tooltip 
          title="Audio & Music Controls" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('audio')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(156,39,176,0.2)',
              border: '1px solid rgba(156,39,176,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(156,39,176,0.4)'
              }
            }}
          >
            <VolumeUp 
              sx={{ 
                fontSize: 18, 
                color: '#E1BEE7',
                filter: 'drop-shadow(0 0 4px rgba(156,39,176,0.8))'
              }} 
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Minimal RPG Bottom Panel */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 1000,
          background: 'rgba(139,69,19,0.6)',
          backdropFilter: 'blur(15px)',
          borderRadius: '25px',
          padding: '12px 20px',
          border: '2px solid rgba(255,215,0,0.5)',
          boxShadow: '0 8px 25px rgba(139,69,19,0.6)'
        }}
      >
        {/* Chat Button */}
        <Tooltip 
          title="Region Chat" 
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('chat')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(33,150,243,0.2)',
              border: '1px solid rgba(33,150,243,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              position: 'relative',
              ...getHighlightStyle('chat'),
              '&:hover': {
                background: 'rgba(33,150,243,0.4)',
                borderColor: 'rgba(33,150,243,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(33,150,243,0.4)'
              }
            }}
          >
            {/* Chat Icon */}
            <Box
              component="img"
              src="/assets/icons/chat.png"
              alt="Chat"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(33,150,243,0.6))'
              }}
            />
            {notifications.filter(n => n.type === 'chat').length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#FF4444',
                  border: '1px solid #FFF',
                  fontSize: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {notifications.filter(n => n.type === 'chat').length}
              </Box>
            )}
          </Box>
        </Tooltip>

        {/* Players Button */}
        <Tooltip 
          title="Online Players" 
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('players')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(0,188,212,0.2)',
              border: '1px solid rgba(0,188,212,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(0,188,212,0.4)',
                borderColor: 'rgba(0,188,212,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(0,188,212,0.4)'
              }
            }}
          >
            {/* Online Players Icon */}
            <Box
              component="img"
              src="/assets/icons/onlineplayer.png"
              alt="Online Players"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(0,188,212,0.6))'
              }}
            />
          </Box>
        </Tooltip>

        {/* Leaderboard Button */}
        <Tooltip 
          title="Lider Tablosu" 
          placement="top"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => onPanelOpen('leaderboard')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: 'rgba(255,215,0,0.2)',
              border: '1px solid rgba(255,215,0,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: 'rgba(255,215,0,0.4)',
                borderColor: 'rgba(255,215,0,0.6)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(255,215,0,0.4)'
              }
            }}
          >
            {/* Leaderboard Icon */}
            <Box
              component="img"
              src="/assets/icons/leaderboard.png"
              alt="Leaderboard"
              sx={{
                width: 24,
                height: 24,
                filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
              }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Guide and Powered by Raizo Buttons - Bottom Right */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 999
        }}
      >
        {/* Guide Link */}
        <Tooltip 
          title="Oyun Rehberi" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => window.open('/guide', '_blank')}
            sx={{
              width: 140,
              height: 45,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%)',
              border: '3px solid #2E7D32',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 6px 20px rgba(76,175,80,0.4), 0 0 15px rgba(76,175,80,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 50%, #45a049 100%)',
                borderColor: '#81C784',
                transform: 'scale(1.08)',
                boxShadow: '0 8px 25px rgba(76,175,80,0.6), 0 0 20px rgba(76,175,80,0.4)'
              }
            }}
          >
            <Book sx={{ color: '#FFFFFF', fontSize: 20, mr: 1.5, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                textShadow: '0 0 8px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              GUIDE
            </Typography>
          </Box>
        </Tooltip>

        {/* Powered by Raizo Link */}
        <Tooltip 
          title="WebRaizo Twitter" 
          placement="left"
          componentsProps={{
            tooltip: {
              sx: {
                fontFamily: '"Cinzel", "Times New Roman", serif',
                background: 'rgba(139,69,19,0.9)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '0.8rem'
              }
            }
          }}
        >
          <Box
            onClick={() => window.open('https://x.com/WebRaizo', '_blank')}
            sx={{
              width: 140,
              height: 45,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 50%, #F44336 100%)',
              border: '3px solid #B71C1C',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 6px 20px rgba(244,67,54,0.4), 0 0 15px rgba(244,67,54,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 50%, #D32F2F 100%)',
                borderColor: '#EF5350',
                transform: 'scale(1.08)',
                boxShadow: '0 8px 25px rgba(244,67,54,0.6), 0 0 20px rgba(244,67,54,0.4)'
              }
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                textShadow: '0 0 8px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.3)',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              <Box component="span" sx={{ fontSize: '0.55rem' }}>POWERED BY</Box>
              <Box component="div" sx={{ fontSize: '0.8rem', fontWeight: '900' }}>RAIZO</Box>
            </Typography>
          </Box>
        </Tooltip>
      </Box>

    </>
  );
};

export default GameHUD;
