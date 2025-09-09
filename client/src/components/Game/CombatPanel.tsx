import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import { Security, LocalHospital, Person } from '@mui/icons-material';
import { gameService } from '../../services/gameService';
import { useGame } from '../../contexts/GameContext';

interface CombatPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const CombatPanel: React.FC<CombatPanelProps> = ({ onClose, showToast }) => {
  const { character, refreshCharacter } = useGame();
  const [combatStats, setCombatStats] = useState<any>(null);
  const [pvpTarget, setPvpTarget] = useState('');
  const [combatDialog, setCombatDialog] = useState(false);
  const [combatResult, setCombatResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCombatStats();
    // Panel açıldığında input'a focus ol
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Combat input focused
        
        // Input'a focus olduktan sonra da tekrar dene
        const focusTimer = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            // Combat input re-focused
          }
        }, 200);
        
        return () => clearTimeout(focusTimer);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [character]);

  const loadCombatStats = async () => {
    try {
      const response = await gameService.getCombatStats();
      if (response.success) {
        setCombatStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load combat stats:', error);
    }
  };

  const handlePvECombat = async () => {
    setLoading(true);
    try {
      const response = await gameService.startPvECombat();
      setCombatResult(response);
      setCombatDialog(true);
      
      if (response.success) {
        await refreshCharacter();
        await loadCombatStats();
      }
    } catch (error) {
      setMessage('❌ Combat failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePvPCombat = async () => {
    if (!pvpTarget) {
      setMessage('❌ Please enter target username');
      return;
    }

    setLoading(true);
    try {
      const response = await gameService.challengePlayer(pvpTarget);
      
      if (response.success) {
        setCombatResult(response);
        setCombatDialog(true);
        setPvpTarget('');
        await refreshCharacter();
        await loadCombatStats();
      } else {
        // Backend'den gelen hata mesajını göster
        setMessage(`❌ ${response.message || 'PvP challenge failed'}`);
      }
    } catch (error) {
      console.error('PvP challenge error:', error);
      setMessage('❌ PvP challenge failed - Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleHeal = async () => {
    setLoading(true);
    try {
      const response = await gameService.healCharacter();
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await refreshCharacter();
        await loadCombatStats();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Healing failed');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 70) return '#4caf50';
    if (health >= 30) return '#ff9800';
    return '#f44336';
  };

  return (
    <Paper sx={{ p: 2, height: '100%', background: '#1a1a1a', border: '1px solid #9c27b0', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        ⚔️ Combat
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

      {/* Health Status */}
      <Card sx={{ mb: 2, background: '#2a2a2a' }}>
        <CardContent sx={{ p: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" sx={{ color: '#ff9800' }}>
              ❤️ Health
            </Typography>
                                <Typography variant="body2" sx={{ color: getHealthColor(character?.health || 0) }}>
          {character?.health || 0}/100
        </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={character?.health || 0}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: '#444',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getHealthColor(character?.health || 0)
              }
            }}
          />
          
          {combatStats && (
            <Box mt={1}>
              <Typography variant="caption" color="textSecondary">
                💪 Combat Power: {combatStats.combatPower}
              </Typography>
              {combatStats.healCost > 0 && (
                <Typography variant="caption" display="block" sx={{ color: '#ffd700' }}>
                  🎯 Heal Cost: {combatStats.healCost} intent
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Combat Actions */}
      <Box display="flex" flexDirection="column" gap={1}>
        {/* PvE Combat */}
        <Button
          fullWidth
          variant="contained"
          onClick={handlePvECombat}
          disabled={loading || !combatStats?.canFight}
          sx={{
            background: 'linear-gradient(45deg, #f44336 30%, #ff5722 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #d32f2f 30%, #e64a19 90%)',
            },
            '&:disabled': {
              background: '#666'
            }
          }}
          startIcon={<Security />}
        >
          ⚔️ Fight Monster
        </Button>

        {/* Heal */}
        {combatStats?.healCost > 0 && (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleHeal}
            disabled={loading || (character?.intent || 0) < combatStats.healCost}
            sx={{
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderColor: '#388e3c',
                backgroundColor: 'rgba(76, 175, 80, 0.1)'
              }
            }}
            startIcon={<LocalHospital />}
          >
            💚 Heal ({combatStats.healCost} intent)
          </Button>
        )}

        {/* PvP Section */}
        <Box mt={1}>
          <Typography variant="body2" gutterBottom sx={{ color: '#ff9800' }}>
            ⚔️ Player vs Player
          </Typography>
          
          <TextField
            fullWidth
            size="small"
            label="Target Username"
            value={pvpTarget}
            onChange={(e) => setPvpTarget(e.target.value)}
            onKeyDown={(e) => {
              // Key pressed in combat
              
              // Enter tuşuna basıldığında PvP savaşı başlat
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation(); // Added
                if (pvpTarget.trim()) {
                  handlePvPCombat();
                }
              }
              // Escape tuşuna basıldığında popup'ı kapat
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation(); // Added
                onClose();
              }
              
              // W A S D tuşları için özel kontrol
              if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                e.stopPropagation(); // Added
                // W A S D key captured in combat
              }
              
              // Diğer tüm tuşlar için normal davranışa izin ver
              // preventDefault() çağırma!
            }}
            inputProps={{
              autoComplete: 'off',
              spellCheck: 'false',
              lang: 'en',
              pattern: '.*'
            }}
            sx={{ 
              mb: 1,
              '& .MuiOutlinedInput-input': {
                color: '#ffffff'
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#9c27b0'
                }
              }
            }}
            inputRef={inputRef}
          />
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handlePvPCombat}
            disabled={loading || !pvpTarget || !combatStats?.canFight}
            sx={{
              borderColor: '#9c27b0',
              color: '#9c27b0',
              '&:hover': {
                borderColor: '#7b1fa2',
                backgroundColor: 'rgba(156, 39, 176, 0.1)'
              }
            }}
            startIcon={<Person />}
          >
            ⚔️ Challenge Player
          </Button>
        </Box>
      </Box>

      {/* Combat Result Dialog */}
      <Dialog 
        open={combatDialog} 
        onClose={() => setCombatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          ⚔️ Combat Result
        </DialogTitle>
        <DialogContent>
          {combatResult && (
            <Box>
              <Box textAlign="center" mb={2}>
                <Typography variant="h4">
                  {combatResult.victory ? '🎉' : '💀'}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: combatResult.victory ? '#4caf50' : '#f44336',
                  fontWeight: 'bold'
                }}>
                  {combatResult.victory ? 'VICTORY!' : 'DEFEAT!'}
                </Typography>
              </Box>

              <Card sx={{ mb: 2, background: '#2a2a2a' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    ⚔️ Combat Summary:
                  </Typography>
                  <Typography variant="body2">
                    💪 Your Power: {combatResult.playerPower}
                  </Typography>
                  <Typography variant="body2">
                    👹 Enemy Power: {combatResult.enemyPower}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    💔 Damage Taken: {combatResult.damage}
                  </Typography>
                  
                  {combatResult.victory && (
                    <Box mt={1}>
                      <Typography variant="body2" sx={{ color: '#ffd700' }}>
                        🎯 Intent Earned: {combatResult.intentReward || combatResult.intentStake}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2196f3' }}>
                        ⭐ XP Gained: {combatResult.expReward || 10}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Alert severity={combatResult.victory ? 'success' : 'warning'}>
                {combatResult.message}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCombatDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CombatPanel;
