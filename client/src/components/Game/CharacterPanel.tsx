import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { useGame } from '../../contexts/GameContext';
import { gameService } from '../../services/gameService';

const CharacterPanel: React.FC = () => {
  const { character, refreshCharacter } = useGame();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dailyDialog, setDailyDialog] = useState(false);
  const [workDialog, setWorkDialog] = useState(false);

  if (!character) {
    return (
      <Paper sx={{ p: 2, height: '100%', background: '#1a1a1a', border: '1px solid #9c27b0' }}>
        <Typography>Loading character...</Typography>
      </Paper>
    );
  }

  const handleDaily = async () => {
    setLoading(true);
    try {
      const response = await gameService.collectDaily();
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Daily collection failed');
    } finally {
      setLoading(false);
      setDailyDialog(false);
    }
  };

  const handleWork = async () => {
    setLoading(true);
    try {
      const response = await gameService.work();
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Work failed');
    } finally {
      setLoading(false);
      setWorkDialog(false);
    }
  };

  const getAlignmentColor = (alignment: string) => {
    const colors: { [key: string]: string } = {
      'lawful_good': '#4caf50',
      'neutral_good': '#8bc34a',
      'chaotic_good': '#cddc39',
      'lawful_neutral': '#ff9800',
      'neutral': '#9e9e9e',
      'chaotic_neutral': '#ff5722',
      'lawful_evil': '#f44336',
      'neutral_evil': '#e91e63',
      'chaotic_evil': '#9c27b0'
    };
    return colors[alignment] || '#9e9e9e';
  };

  return (
    <Paper sx={{ p: 2, height: '100%', background: '#1a1a1a', border: '1px solid #9c27b0', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        👤 Character Profile
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

      {/* Character Basic Info */}
      <Box mb={2}>
        <Typography variant="h6" sx={{ color: '#ff9800' }}>
          {character.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Level {character.level} {character.race.charAt(0).toUpperCase() + character.race.slice(1)} {character.class.charAt(0).toUpperCase() + character.class.slice(1)}
        </Typography>
        
        <Chip
          label={character.alignment.replace('_', ' ').toUpperCase()}
          size="small"
          sx={{
            mt: 1,
            backgroundColor: getAlignmentColor(character.alignment),
            color: 'white',
            fontSize: '0.7rem'
          }}
        />
      </Box>

      {/* Level Progress */}
      {character.levelProgress && (
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Experience: {character.levelProgress.current.toLocaleString()} / {character.levelProgress.required.toLocaleString()}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={character.levelProgress.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#333',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#9c27b0'
              }
            }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
            {character.levelProgress.percentage}% to next level
          </Typography>
        </Box>
      )}

      {/* Resources */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Paper sx={{ p: 1, background: '#2a2a2a', textAlign: 'center', flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#ffd700' }}>
            🎯 {character.intent.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Intent
          </Typography>
        </Paper>
        <Paper sx={{ p: 1, background: '#2a2a2a', textAlign: 'center', flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#e91e63' }}>
            💎 {character.racial_currency.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Racial Currency
          </Typography>
        </Paper>
      </Box>

      {/* Stats */}
      <Typography variant="body2" gutterBottom sx={{ color: '#ff9800' }}>
        📊 Stats
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
        <Typography variant="body2">STR: {character.strength}</Typography>
        <Typography variant="body2">DEX: {character.dexterity}</Typography>
        <Typography variant="body2">CON: {character.constitution}</Typography>
        <Typography variant="body2">INT: {character.intelligence}</Typography>
        <Typography variant="body2">WIS: {character.wisdom}</Typography>
        <Typography variant="body2">CHA: {character.charisma}</Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => setDailyDialog(true)}
          disabled={loading}
          sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
        >
          🎯 Daily
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => setWorkDialog(true)}
          disabled={loading}
          sx={{ borderColor: '#ff9800', color: '#ff9800' }}
        >
          🔨 Work
        </Button>
      </Box>

      {/* Daily Collection Dialog */}
      <Dialog open={dailyDialog} onClose={() => setDailyDialog(false)}>
        <DialogTitle sx={{ color: '#9c27b0' }}>🎯 Daily Intent Collection</DialogTitle>
        <DialogContent>
          <Typography>
            Collect your daily intent reward. Available once every 24 hours.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDailyDialog(false)}>Cancel</Button>
          <Button onClick={handleDaily} variant="contained" disabled={loading}>
            {loading ? 'Collecting...' : 'Collect Daily'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work Dialog */}
      <Dialog open={workDialog} onClose={() => setWorkDialog(false)}>
        <DialogTitle sx={{ color: '#ff9800' }}>🔨 Work for Intent</DialogTitle>
        <DialogContent>
          <Typography>
            Work to earn intent. Available once every hour. Earnings increase with level.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkDialog(false)}>Cancel</Button>
          <Button onClick={handleWork} variant="contained" disabled={loading}>
            {loading ? 'Working...' : 'Start Work'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CharacterPanel;
