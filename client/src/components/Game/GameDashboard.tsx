import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import { useGame } from '../../contexts/GameContext';
import { gameService } from '../../services/gameService';

const GameDashboard: React.FC = () => {
  const { character } = useGame();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardType, setLeaderboardType] = useState('level');
  const [questStats, setQuestStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
    loadQuestStats();
  }, [leaderboardType]);

  const loadLeaderboard = async () => {
    try {
      const response = await gameService.getLeaderboard(leaderboardType);
      if (response.success) {
        setLeaderboard(response.leaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const loadQuestStats = async () => {
    try {
      const response = await gameService.getQuestStats();
      if (response.success) {
        setQuestStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to load quest stats:', error);
    }
  };

  const handleBossFight = async () => {
    setLoading(true);
    try {
      const response = await gameService.fightBoss();
      if (response.success) {
        // Handle boss fight result
        // Boss fight result
      }
    } catch (error) {
      console.error('Boss fight failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: '100vh', overflow: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#9c27b0', textAlign: 'center' }}>
        🏰 Anoma Intents Adventures
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: '#FFD700',
            fontWeight: 'bold',
            ml: 1,
            fontSize: '0.6em',
            verticalAlign: 'top'
          }}
        >
          BETA
        </Typography>
        {' '}Dashboard
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Top Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Character Summary */}
          <Paper sx={{ p: 3, background: '#1a1a1a', border: '1px solid #9c27b0', flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
              👤 Character Summary
            </Typography>
            {character && (
              <Box>
                <Typography variant="h5" sx={{ color: '#ff9800' }}>
                  {character.name}
                </Typography>
                <Typography variant="body1">
                  Level {character.level} {character.race} {character.class}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  🎯 {character.intent.toLocaleString()} intent
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  📈 {character.experience.toLocaleString()} XP
                </Typography>

              </Box>
            )}
          </Paper>

          {/* Quest Statistics */}
          <Paper sx={{ p: 3, background: '#1a1a1a', border: '1px solid #9c27b0', flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
              📊 Quest Statistics
            </Typography>
            {questStats && (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Card sx={{ background: '#2a2a2a', flex: 1 }}>
                    <CardContent sx={{ textAlign: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="h6" sx={{ color: '#4caf50' }}>
                        {questStats.completed_quests}
                      </Typography>
                      <Typography variant="caption">Completed</Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ background: '#2a2a2a', flex: 1 }}>
                    <CardContent sx={{ textAlign: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="h6" sx={{ color: '#f44336' }}>
                        {questStats.failed_quests}
                      </Typography>
                      <Typography variant="caption">Failed</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    🎯 Total intent from quests: {questStats.total_intent_from_quests?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    📈 Total XP from quests: {questStats.total_xp_from_quests?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3, background: '#1a1a1a', border: '1px solid #9c27b0', flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
              🎮 Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleBossFight}
                disabled={loading || (character ? character.level < 5 : true)}
                sx={{
                  background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #d32f2f 30%, #f57c00 90%)',
                  }
                }}
              >
                🐉 Fight Boss
              </Button>
              <Button
                fullWidth
                variant="outlined"
                href="/game"
                sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
              >
                🗺️ Enter World
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Leaderboards */}
        <Box>
          <Paper sx={{ p: 3, background: '#1a1a1a', border: '1px solid #9c27b0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
              🏆 Leaderboards
            </Typography>

            <Tabs
              value={leaderboardType}
              onChange={(e, newValue) => setLeaderboardType(newValue)}
              sx={{
                mb: 2,
                '& .MuiTab-root': {
                  color: '#9c27b0',
                },
                '& .Mui-selected': {
                  color: '#ff9800 !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#9c27b0',
                },
              }}
            >
              <Tab label="📈 Level" value="level" />
              <Tab label="🎯 Intent" value="intent" />
              <Tab label="⚔️ Quests" value="quests" />
            </Tabs>

            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9c27b0', fontWeight: 'bold' }}>Rank</TableCell>
                    <TableCell sx={{ color: '#9c27b0', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: '#9c27b0', fontWeight: 'bold' }}>Race</TableCell>
                    <TableCell sx={{ color: '#9c27b0', fontWeight: 'bold' }}>Class</TableCell>
                    <TableCell sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                              {leaderboardType === 'level' ? 'Level' : 
         leaderboardType === 'intent' ? 'Intent' : 'Quests'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.slice(0, 10).map((player, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        backgroundColor: character && player.name === character.name ? 'rgba(156, 39, 176, 0.1)' : 'transparent'
                      }}
                    >
                      <TableCell sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                        #{player.rank || index + 1}
                      </TableCell>
                      <TableCell sx={{ color: character && player.name === character.name ? '#9c27b0' : '#ffffff' }}>
                        {player.name}
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {player.race}
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {player.class}
                      </TableCell>
                      <TableCell sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                        {leaderboardType === 'level' ? `Lv.${player.level}` :
                         leaderboardType === 'intent' ? `${player.intent?.toLocaleString()}` :
                         player.quests_completed}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default GameDashboard;
