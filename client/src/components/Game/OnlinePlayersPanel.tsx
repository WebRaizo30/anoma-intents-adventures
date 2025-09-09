import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import { gameService } from '../../services/gameService';

interface OnlinePlayersPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const OnlinePlayersPanel: React.FC<OnlinePlayersPanelProps> = ({ onClose, showToast }) => {
  const { character, currentRegion } = useGame();
  const { socket, onlineUsers } = useSocket();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerDialog, setPlayerDialog] = useState(false);
  const [challengeDialog, setChallengeDialog] = useState(false);
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [partyInvites, setPartyInvites] = useState<any[]>([]);
  const [tradeRequests, setTradeRequests] = useState<any[]>([]);

  // Real-time player list updates
  useEffect(() => {
    if (onlineUsers && character) {
      const regionPlayers = onlineUsers.filter(player => 
        player.region === currentRegion && player.character?.name !== character.name
      );
      // Region players for current region
      setPlayers(regionPlayers);
    }
  }, [onlineUsers, currentRegion, character]);

  useEffect(() => {
    // Setup socket listeners for party and trade events
    if (socket) {
      socket.on('partyInviteReceived', (data: any) => {
        setPartyInvites(prev => [...prev, data]);
        showToast(`🎉 ${data.message}`, 'info');
      });

      socket.on('partyInviteResult', (data: any) => {
        showToast(data.message, data.accepted ? 'success' : 'info');
        if (data.accepted) {
          setPartyMembers(prev => [...prev, data.player]);
        }
      });

      socket.on('partyMemberLeft', (data: any) => {
        showToast(`👋 ${data.message}`, 'warning');
        setPartyMembers(prev => prev.filter(p => p !== data.player));
      });

      socket.on('tradeRequestReceived', (data: any) => {
        setTradeRequests(prev => [...prev, data]);
        showToast(`💰 ${data.message}`, 'info');
      });

      return () => {
        socket.off('partyInviteReceived');
        socket.off('partyInviteResult');
        socket.off('partyMemberLeft');
        socket.off('tradeRequestReceived');
      };
    }
  }, [socket, showToast]);

  const handlePlayerClick = (player: any) => {
    setSelectedPlayer(player);
    setPlayerDialog(true);
  };

  const handleChallenge = async () => {
    if (!selectedPlayer) return;
    
    try {
      const response = await gameService.challengePlayer(selectedPlayer.name);
      if (response.success) {
        showToast(`✅ ${response.message}`, 'success');
      } else {
        showToast(`❌ ${response.message}`, 'error');
      }
    } catch (error) {
      showToast('❌ Challenge failed', 'error');
    } finally {
      setChallengeDialog(false);
      setPlayerDialog(false);
    }
  };

  const handlePartyInvite = () => {
    if (!selectedPlayer || !socket || !character) return;
    
    socket.emit('partyInvite', {
      targetUsername: selectedPlayer.username,
      fromPlayer: character.name
    });
    
    showToast(`🎉 Party invite sent to ${selectedPlayer.name}!`, 'success');
    setPlayerDialog(false);
  };

  const handleTradeRequest = () => {
    if (!selectedPlayer || !socket || !character) return;
    
    socket.emit('tradeRequest', {
      targetUsername: selectedPlayer.username,
      fromPlayer: character.name
    });
    
    showToast(`💰 Trade request sent to ${selectedPlayer.name}!`, 'success');
    setPlayerDialog(false);
  };

  const respondToPartyInvite = (invite: any, accepted: boolean) => {
    if (!socket || !character) return;
    
    socket.emit('partyInviteResponse', {
      targetSocketId: invite.fromSocketId,
      accepted: accepted,
      player: character.name
    });
    
    setPartyInvites(prev => prev.filter(i => i.fromSocketId !== invite.fromSocketId));
    
    if (accepted) {
      setPartyMembers(prev => [...prev, invite.from]);
    }
  };

  const leaveParty = () => {
    if (!socket || !character || partyMembers.length === 0) return;
    
    socket.emit('partyLeave', {
      player: character.name,
      partyMembers: partyMembers.map(m => m.socketId) // This would need to be tracked
    });
    
    setPartyMembers([]);
    showToast('👋 You left the party', 'info');
  };

  const getRaceEmoji = (race: string) => {
    const raceEmojis: { [key: string]: string } = {
      human: '👤', elf: '🧝', dwarf: '🧔', orc: '👹', halfling: '🧙',
      dragonborn: '🐲', tiefling: '😈', gnome: '👺', 'half-elf': '🧝‍♂️', 'half-orc': '👹',
      drow: '🕷️', duergar: '⚒️', svirfneblin: '🪨', derro: '🌀', quaggoth: '🐻',
      aasimar: '👼', kalashtar: '🧘', githzerai: '🧠', sylph: '💨', starborn: '⭐', githyanki: '⚔️'
    };
    return raceEmojis[race] || '👤';
  };

  const getClassColor = (characterClass: string) => {
    const classColors: { [key: string]: string } = {
      warrior: '#f44336', mage: '#2196f3', rogue: '#4caf50', cleric: '#ffd700',
      ranger: '#8bc34a', paladin: '#ff9800', warlock: '#9c27b0', bard: '#e91e63',
      monk: '#795548', druid: '#4caf50'
    };
    return classColors[characterClass] || '#9e9e9e';
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
        👥 Online Players
      </Typography>

      <Typography 
        variant="body2" 
        sx={{ 
          color: 'rgba(255,255,255,0.8)',
          mb: 2,
          fontSize: '0.9rem'
        }}
      >
        📍 {currentRegion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Typography>

      {/* Party Members */}
      {partyMembers.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" sx={{ color: '#4caf50' }}>
            🎉 Party Members ({partyMembers.length})
          </Typography>
          {partyMembers.map((member, index) => (
            <Chip
              key={index}
              label={member}
              size="small"
              sx={{ 
                mr: 0.5, 
                mb: 0.5, 
                backgroundColor: '#4caf50', 
                color: 'white' 
              }}
            />
          ))}
          <Button
            size="small"
            onClick={leaveParty}
            sx={{ ml: 1, color: '#f44336' }}
          >
            Leave Party
          </Button>
        </Box>
      )}

      {/* Party Invites */}
      {partyInvites.map((invite, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ mb: 1 }}
          action={
            <Box>
              <Button
                color="inherit"
                size="small"
                onClick={() => respondToPartyInvite(invite, true)}
              >
                Accept
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() => respondToPartyInvite(invite, false)}
              >
                Decline
              </Button>
            </Box>
          }
        >
          {invite.message}
        </Alert>
      ))}

      {/* Trade Requests */}
      {tradeRequests.map((trade, index) => (
        <Alert
          key={index}
          severity="warning"
          sx={{ mb: 1 }}
          action={
            <Box>
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  showToast('💰 Trade accepted! (Feature coming soon)', 'info');
                  setTradeRequests(prev => prev.filter((_, i) => i !== index));
                }}
              >
                Accept
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() => setTradeRequests(prev => prev.filter((_, i) => i !== index))}
              >
                Decline
              </Button>
            </Box>
          }
        >
          {trade.message}
        </Alert>
      ))}

      {players.length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center" mt={2}>
          No other players in this region.
          Travel to busier areas to meet adventurers!
        </Typography>
      ) : (
        <List dense sx={{ p: 0 }}>
          {players
            .filter(player => player.character?.name !== character?.name)
            .slice(0, 8)
            .map((player, index) => (
            <ListItem
              key={player.playerId || index}
              component="button"
              onClick={() => handlePlayerClick(player.character)}
              sx={{
                mb: 0.5,
                background: '#2a2a2a',
                borderRadius: 1,
                border: '1px solid #444',
                '&:hover': {
                  background: '#333',
                  borderColor: '#9c27b0'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  background: getClassColor(player.character?.class),
                  width: 32,
                  height: 32,
                  fontSize: '1rem'
                }}>
                  {getRaceEmoji(player.character?.race)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {player.character?.name}
                    </Typography>
                    <Circle sx={{ fontSize: 8, color: '#4caf50' }} />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      Lv.{player.character?.level} {player.character?.race} {player.character?.class}
                    </Typography>
                    <Chip
                      label={`🎯 ${player.character?.intent?.toLocaleString() || 0}`}
                      size="small"
                      sx={{ 
                        fontSize: '0.6rem',
                        height: 16,
                        backgroundColor: '#ffd700',
                        color: '#000'
                      }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Player Details Dialog */}
      <Dialog 
        open={playerDialog} 
        onClose={() => setPlayerDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          👤 Player Profile
        </DialogTitle>
        <DialogContent>
          {selectedPlayer && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ 
                  background: getClassColor(selectedPlayer.class),
                  width: 48,
                  height: 48,
                  fontSize: '1.5rem'
                }}>
                  {getRaceEmoji(selectedPlayer.race)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedPlayer.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Level {selectedPlayer.level} {selectedPlayer.race} {selectedPlayer.class}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={`🎯 ${selectedPlayer.intent?.toLocaleString() || 0} Intent`}
                  sx={{ backgroundColor: '#ffd700', color: '#000' }}
                />
                <Chip
                  label={`❤️ ${selectedPlayer.health || 100}/100`}
                  sx={{ backgroundColor: '#4caf50', color: 'white' }}
                />
              </Box>

              <Typography variant="body2" color="textSecondary">
                📍 Currently in: {currentRegion.replace(/_/g, ' ')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlayerDialog(false)}>
            Close
          </Button>
          <Button 
            onClick={handlePartyInvite}
            variant="contained"
            sx={{ background: '#4caf50', mr: 1 }}
          >
            🎉 Invite to Party
          </Button>
          <Button 
            onClick={handleTradeRequest}
            variant="contained"
            sx={{ background: '#ff9800', mr: 1 }}
          >
            💰 Trade Request
          </Button>
          <Button 
            onClick={() => setChallengeDialog(true)}
            variant="contained"
            sx={{ background: '#f44336' }}
          >
            ⚔️ Challenge to PvP
          </Button>
        </DialogActions>
      </Dialog>

      {/* Challenge Confirmation Dialog */}
      <Dialog 
        open={challengeDialog} 
        onClose={() => setChallengeDialog(false)}
      >
        <DialogTitle sx={{ color: '#f44336' }}>
          ⚔️ PvP Challenge
        </DialogTitle>
        <DialogContent>
          <Typography>
            Challenge {selectedPlayer?.name} to combat?
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Winner takes up to 100 intent from loser.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChallengeDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleChallenge}
            variant="contained"
            sx={{ background: '#f44336' }}
          >
            ⚔️ Fight!
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OnlinePlayersPanel;
