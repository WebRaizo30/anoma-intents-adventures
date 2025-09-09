import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  IconButton
} from '@mui/material';

import { Close, Work, CardGiftcard } from '@mui/icons-material';
import { useGame } from '../../contexts/GameContext';
import { gameService } from '../../services/gameService';

interface CharacterPanelModalProps {
  onClose: () => void;
  showToast: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const CharacterPanelModal: React.FC<CharacterPanelModalProps> = ({ onClose, showToast }) => {
  const { character, refreshCharacter } = useGame();
  const [loading, setLoading] = useState(false);

  const handleWork = async () => {
    setLoading(true);
    try {
      const response = await gameService.work();
      if (response.success) {
        showToast(response.message, 'success');
        await refreshCharacter();
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      showToast('Work failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDaily = async () => {
    setLoading(true);
    try {
      const response = await gameService.collectDaily();
      if (response.success) {
        showToast(response.message, 'success');
        await refreshCharacter();
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      showToast('Daily collection failed', 'error');
    } finally {
      setLoading(false);
    }
  };



  const getHealthColor = (health: number) => {
    if (health >= 70) return '#4caf50';
    if (health >= 30) return '#ff9800';
    return '#f44336';
  };

  const getExpProgress = () => {
    if (!character) return 0;
    const currentLevelExp = character.level * 100;
    const nextLevelExp = (character.level + 1) * 100;
    return ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
  };

  if (!character) {
    return (
      <>
        <DialogTitle>Character Loading...</DialogTitle>
        <DialogContent>
          <Typography>Please wait...</Typography>
        </DialogContent>
      </>
    );
  }

  return (
    <>


      <DialogContent sx={{ 
        p: 2.5, 
        background: 'linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(25,20,35,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        maxHeight: '70vh',
        overflow: 'auto',
        position: 'relative',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}>
        {/* Close Button */}
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'rgba(255,255,255,0.7)',
            zIndex: 10,
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.9)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <Close />
        </IconButton>

        {/* Health & Experience */}
        <Box display="flex" gap={2} mb={2.5}>
          <Box flex={1}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box
                    component="img"
                    src="/assets/items/potion_health.svg"
                    sx={{ width: 24, height: 24, opacity: 0.9 }}
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)', 
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Health
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ 
                  color: getHealthColor(character.health || character.hp || 0),
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  mb: 1.5
                }}>
                  {character.health || character.hp || 0}/100
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={character.health || character.hp || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getHealthColor(character.health || character.hp || 0),
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${getHealthColor(character.health || character.hp || 0)}, ${getHealthColor(character.health || character.hp || 0)}dd)`
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>

          <Box flex={1}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Typography sx={{ fontSize: '1.3rem' }}>⭐</Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)', 
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Experience
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="h5" sx={{ 
                    color: '#64B5F6',
                    fontWeight: 700,
                    fontSize: '1.4rem'
                  }}>
                    {character.experience}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem'
                  }}>
                    Next: {(character.level + 1) * 100}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getExpProgress()}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#64B5F6',
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #64B5F6, #42A5F5)'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 700,
            mb: 2.5,
            fontSize: '1.1rem'
          }}
        >
          📊 Character Stats
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1.5} mb={2.5}>
          {[
            { name: 'Strength', value: character.strength, color: '#F48FB1', icon: '💪' },
            { name: 'Dexterity', value: character.dexterity, color: '#81C784', icon: '🏃' },
            { name: 'Constitution', value: character.constitution, color: '#FFB74D', icon: '🛡️' },
            { name: 'Intelligence', value: character.intelligence, color: '#64B5F6', icon: '🧠' },
            { name: 'Wisdom', value: character.wisdom, color: '#BA68C8', icon: '🔮' },
            { name: 'Charisma', value: character.charisma, color: '#4FC3F7', icon: '✨' }
          ].map((stat) => (
            <Box key={stat.name} flex="1 1 calc(33.333% - 16px)" minWidth="120px">
              <Card sx={{ 
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                textAlign: 'center',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      mb: 1
                    }}
                  >
                    {stat.icon} {stat.name}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: stat.color, 
                      fontWeight: 700,
                      fontSize: '1.8rem'
                    }}
                  >
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Resources */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 700,
            mb: 2.5,
            fontSize: '1.1rem'
          }}
        >
          💰 Resources
        </Typography>
        
        <Box display="flex" gap={2} mb={1.5}>
          <Box flex={1}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              }
            }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Box
                  component="img"
                  src="/assets/items/coin.svg"
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    mb: 1.5,
                    opacity: 0.9
                  }}
                />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#FFD700', 
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    mb: 0.5
                  }}
                >
                  {character.intent.toLocaleString()}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.85rem'
                  }}
                >
                  Intent Points
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box flex={1}>
            <Card sx={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
              }
            }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: '2.2rem',
                    mb: 1.5,
                    opacity: 0.9
                  }}
                >
                  🏆
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#BA68C8', 
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    mb: 0.5
                  }}
                >
                  {character.completed_quests || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.85rem'
                  }}
                >
                  Quests Completed
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        background: 'linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(25,20,35,0.95) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        gap: 1.5,
        justifyContent: 'center'
      }}>
        <Button
          onClick={handleDaily}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: '12px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 20px rgba(102,126,234,0.3)',
            border: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2, #667eea)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(102,126,234,0.4)'
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)'
            }
          }}
          startIcon={<CardGiftcard />}
        >
          💰 Daily Reward
        </Button>
        
        <Button
          onClick={handleWork}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: '12px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 20px rgba(240,147,251,0.3)',
            border: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #f5576c, #f093fb)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 30px rgba(240,147,251,0.4)'
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)'
            }
          }}
          startIcon={<Work />}
        >
          🔨 Work for Intent
        </Button>
        
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ 
            borderColor: 'rgba(255,255,255,0.3)', 
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600,
            borderRadius: '12px',
            px: 3,
            py: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.1)',
              transform: 'translateY(-2px)',
              color: '#ffffff'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </>
  );
};

export default CharacterPanelModal;
