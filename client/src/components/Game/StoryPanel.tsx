import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import { MenuBook, Refresh } from '@mui/icons-material';
import { gameService } from '../../services/gameService';
import { useGame } from '../../contexts/GameContext';

interface StoryPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const StoryPanel: React.FC<StoryPanelProps> = ({ onClose, showToast }) => {
  const { character, currentRegion } = useGame();
  const [currentStory, setCurrentStory] = useState<any>(null);
  const [storyDialog, setStoryDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateStory = async (type: string = 'random') => {
    setLoading(true);
    try {
      const response = await gameService.generateStory(type, {
        region: currentRegion,
        character: character?.name
      });
      
      if (response.success) {
        setCurrentStory(response.story);
        setStoryDialog(true);
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Story generation failed');
    } finally {
      setLoading(false);
    }
  };

  const getStoryTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      adventure: '#4caf50',
      combat: '#f44336',
      discovery: '#2196f3',
      social: '#ff9800',
      random: '#9c27b0'
    };
    return colors[type] || '#9e9e9e';
  };

  const getStoryTypeEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      adventure: '🗺️',
      combat: '⚔️',
      discovery: '🔍',
      social: '👥',
      random: '🎲'
    };
    return emojis[type] || '📖';
  };

  return (
    <Paper sx={{ p: 2, height: '100%', background: '#1a1a1a', border: '1px solid #9c27b0', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        📚 Story Generator
      </Typography>

      {message && (
        <Alert 
          severity={message.includes('✅') ? 'success' : 'error'} 
          sx={{ mb: 2, fontSize: '0.8rem' }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Typography variant="body2" color="textSecondary" mb={2}>
        Generate personalized stories based on your adventures!
      </Typography>

      {/* Story Type Buttons */}
      <Box display="flex" flexDirection="column" gap={1}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleGenerateStory('random')}
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
            }
          }}
          startIcon={<Refresh />}
        >
          🎲 Random Story
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleGenerateStory('adventure')}
          disabled={loading}
          sx={{
            borderColor: '#4caf50',
            color: '#4caf50',
            '&:hover': {
              borderColor: '#388e3c',
              backgroundColor: 'rgba(76, 175, 80, 0.1)'
            }
          }}
          startIcon={<MenuBook />}
        >
          🗺️ Adventure Tale
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleGenerateStory('combat')}
          disabled={loading}
          sx={{
            borderColor: '#f44336',
            color: '#f44336',
            '&:hover': {
              borderColor: '#d32f2f',
              backgroundColor: 'rgba(244, 67, 54, 0.1)'
            }
          }}
        >
          ⚔️ Battle Story
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleGenerateStory('discovery')}
          disabled={loading}
          sx={{
            borderColor: '#2196f3',
            color: '#2196f3',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(33, 150, 243, 0.1)'
            }
          }}
        >
          🔍 Discovery Story
        </Button>
      </Box>

      {/* Current Story Preview */}
      {currentStory && (
        <Card sx={{ mt: 2, background: '#2a2a2a', border: '1px solid #9c27b0' }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                📖 Latest Story
              </Typography>
              <Chip
                label={currentStory.type}
                size="small"
                sx={{
                  backgroundColor: getStoryTypeColor(currentStory.type),
                  color: 'white',
                  fontSize: '0.6rem'
                }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {currentStory.content.substring(0, 100)}...
            </Typography>
            <Button
              size="small"
              onClick={() => setStoryDialog(true)}
              sx={{ mt: 1, color: '#9c27b0' }}
            >
              📖 Read Full Story
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Story Dialog */}
      <Dialog 
        open={storyDialog} 
        onClose={() => setStoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          📚 {currentStory?.title}
        </DialogTitle>
        <DialogContent>
          {currentStory && (
            <Box>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  icon={<span>{getStoryTypeEmoji(currentStory.type)}</span>}
                  label={currentStory.type.toUpperCase()}
                  sx={{
                    backgroundColor: getStoryTypeColor(currentStory.type),
                    color: 'white'
                  }}
                />
                <Chip
                  label={`Level ${currentStory.character_level}`}
                  variant="outlined"
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                />
              </Box>
              
              <Paper sx={{ p: 2, background: '#2a2a2a', border: '1px solid #444' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {currentStory.content}
                </Typography>
              </Paper>
              
              <Typography variant="caption" color="textSecondary" mt={2} display="block">
                Generated on {new Date(currentStory.timestamp).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStoryDialog(false)}>
            Close
          </Button>
          <Button 
            onClick={() => handleGenerateStory('random')}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
            }}
          >
            🎲 Generate New Story
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default StoryPanel;
