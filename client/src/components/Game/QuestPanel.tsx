import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import { useGame } from '../../contexts/GameContext';
import { gameService, Quest } from '../../services/gameService';

interface QuestPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const QuestPanel: React.FC<QuestPanelProps> = ({ onClose, showToast }) => {
  const { currentRegion, refreshCharacter } = useGame();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questDialog, setQuestDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAvailableQuests();
  }, [currentRegion, selectedDifficulty]);

  const loadAvailableQuests = async () => {
    try {
      const response = await gameService.getAvailableQuests(currentRegion, selectedDifficulty);
      if (response.success) {
        setQuests(response.quests);
      }
    } catch (error) {
      console.error('Failed to load quests:', error);
    }
  };

  const handleStartQuest = async () => {
    if (!selectedQuest) return;

    setLoading(true);
    try {
      const response = await gameService.startQuest(selectedDifficulty, currentRegion);
      
      if (response.success) {
        const outcome = response.outcome;
        let resultMessage = `🎯 Quest: ${response.quest.name}\n`;
        resultMessage += `${outcome.message}\n`;
        resultMessage += `📈 +${outcome.xp_gained} XP, 🎯 +${outcome.intent_gained} intent`;
        
        if (outcome.leveledUp) {
          resultMessage += `\n🎉 LEVEL UP! Now level ${outcome.newLevel}!`;
          showToast(`🎉 Congratulations! You reached level ${outcome.newLevel}!`, 'success');
        }
        
        if (outcome.itemDropped) {
          resultMessage += `\n🎁 Item found: ${outcome.itemDropped.name}`;
        }
        
        if (outcome.anomage_encounter) {
          resultMessage += `\n✨ Anomage appeared! Special rewards await...`;
        }

        setMessage(resultMessage);
        await refreshCharacter();
        await loadAvailableQuests();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Quest failed');
    } finally {
      setLoading(false);
      setQuestDialog(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: '#4caf50',
      medium: '#ff9800',
      hard: '#f44336'
    };
    return colors[difficulty] || '#9e9e9e';
  };

  return (
    <Paper sx={{ 
      p: 2, 
      height: '100%', 
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      overflow: 'visible',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'rgba(255,255,255,0.95)',
          fontWeight: 700,
          mb: 3,
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        ⚔️ Quests - Earn XP & Intent!
      </Typography>
      
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3, 
          fontSize: '0.85rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          '& .MuiAlert-icon': {
            color: '#64B5F6'
          }
        }}
      >
        💡 <strong>How to Play:</strong> Choose difficulty → Select quest → Press "Start Quest" → Collect rewards!<br/>
        🎯 Every quest gives XP, intent and 60% chance for items. Collect XP to level up!
      </Alert>

      {message && (
        <Alert 
          severity={message.includes('✅') || message.includes('🎯') ? 'success' : 'error'} 
          sx={{ 
            mb: 3, 
            fontSize: '0.85rem', 
            whiteSpace: 'pre-line',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: message.includes('✅') || message.includes('🎯') ? '#81C784' : '#F48FB1'
            }
          }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Difficulty Selector */}
      <FormControl 
        fullWidth 
        size="small" 
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.9)',
            '& fieldset': {
              border: 'none'
            },
            '&:hover': {
              background: 'rgba(255,255,255,0.12)'
            }
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255,255,255,0.7)',
            '&.Mui-focused': {
              color: '#64B5F6'
            }
          }
        }}
      >
        <InputLabel>Difficulty</InputLabel>
        <Select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          label="Difficulty"
          sx={{
            '& .MuiSelect-icon': {
              color: 'rgba(255,255,255,0.7)'
            }
          }}
        >
          <MenuItem value="easy">🟢 Easy</MenuItem>
          <MenuItem value="medium">🟡 Medium</MenuItem>
          <MenuItem value="hard">🔴 Hard</MenuItem>
        </Select>
      </FormControl>

      {/* Available Quests */}
      <Box mb={2}>
        <Typography 
          variant="body2" 
          gutterBottom 
          sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            fontWeight: 600,
            mb: 2
          }}
        >
          📍 Available in {currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1)}
        </Typography>
        
        {quests.length === 0 ? (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              py: 3
            }}
          >
            No quests available for your level
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 250, overflow: 'visible' }}>
            {quests.slice(0, 3).map((quest) => (
              <Card
                key={quest.id}
                sx={{
                  mb: 1.5,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    background: 'rgba(255,255,255,0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                  }
                }}
                onClick={() => {
                  setSelectedQuest(quest);
                  setQuestDialog(true);
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {quest.name}
                    </Typography>
                    <Chip
                      label={quest.difficulty}
                      size="small"
                      sx={{
                        backgroundColor: getDifficultyColor(quest.difficulty),
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: '8px'
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.8rem',
                      display: 'block',
                      mb: 1
                    }}
                  >
                    {quest.description.substring(0, 60)}...
                  </Typography>
                  <Box mt={0.5}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#FFD700',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      🎯 {quest.calculated_rewards?.intent || quest.intent_reward} intent
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9c27b0', ml: 1 }}>
                      📈 {quest.calculated_rewards?.xp || quest.xp_reward} XP
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      <Box>
        <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={() => {
              if (quests.length > 0) {
                setSelectedQuest(quests[0]);
                setQuestDialog(true);
              }
            }}
            disabled={loading || quests.length === 0}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
              }
            }}
          >
            🗡️ Quick Quest
          </Button>
      </Box>

      {/* Quest Details Dialog */}
      <Dialog 
        open={questDialog} 
        onClose={() => setQuestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          ⚔️ Quest Details
        </DialogTitle>
        <DialogContent>
          {selectedQuest && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedQuest.name}
              </Typography>
              
              <Chip
                label={selectedQuest.difficulty.toUpperCase()}
                sx={{
                  backgroundColor: getDifficultyColor(selectedQuest.difficulty),
                  color: 'white',
                  mb: 2
                }}
              />
              
              <Typography variant="body2" paragraph>
                {selectedQuest.description}
              </Typography>
              
              <Box mt={2}>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  📍 Region: {selectedQuest.region.charAt(0).toUpperCase() + selectedQuest.region.slice(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9c27b0' }}>
                  📈 XP Reward: {selectedQuest.calculated_rewards?.xp || selectedQuest.xp_reward}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffd700' }}>
                  🎯 Intent Reward: {selectedQuest.calculated_rewards?.intent || selectedQuest.intent_reward}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  🎯 60% chance for item drop
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ✨ 15% chance for Anomage encounter
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartQuest} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
            }}
          >
            {loading ? 'Starting...' : '🚀 Start Quest'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default QuestPanel;
