import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as IntentIcon,
  Assignment as QuestIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

interface LeaderboardEntry {
  name: string;
  race: string;
  class: string;
  level?: number;
  experience?: number;
  intent?: number;
  quests_completed?: number;
  rank: number;
}

type LeaderboardType = 'level' | 'intent' | 'quests';

interface LeaderboardPanelProps {
  open: boolean;
  onClose: () => void;
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [leaderboards, setLeaderboards] = useState<Record<LeaderboardType, LeaderboardEntry[]>>({
    level: [],
    intent: [],
    quests: []
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { socket } = useSocket();

  const tabTypes: LeaderboardType[] = ['level', 'intent', 'quests'];
  const tabLabels = ['Level', 'Intent', 'Quests'];
  const tabIcons = [TrendingUpIcon, IntentIcon, QuestIcon];
  const tabColors = ['#4CAF50', '#FF9800', '#9C27B0'];

  const loadAllLeaderboards = useCallback(async () => {
    setLoading(true);
    try {
      socket?.emit('requestAllLeaderboards');
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    if (open) {
      loadAllLeaderboards();
    }
  }, [open, loadAllLeaderboards]);

  useEffect(() => {
    if (!socket) return;

    const handleLeaderboardUpdate = (data: { type: LeaderboardType; leaderboard: LeaderboardEntry[] }) => {
      setLeaderboards(prev => ({
        ...prev,
        [data.type]: data.leaderboard
      }));
      setLastUpdate(new Date());
    };

    socket.on('leaderboardUpdate', handleLeaderboardUpdate);

    return () => {
      socket.off('leaderboardUpdate', handleLeaderboardUpdate);
    };
  }, [socket]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return {
        background: '#FFD700',
        color: '#000',
        border: '2px solid #FFD700',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
      };
    }
    if (rank === 2) {
      return {
        background: '#C0C0C0',
        color: '#000',
        border: '2px solid #C0C0C0',
        boxShadow: '0 0 8px rgba(192, 192, 192, 0.4)'
      };
    }
    if (rank === 3) {
      return {
        background: '#CD7F32',
        color: '#000',
        border: '2px solid #CD7F32',
        boxShadow: '0 0 6px rgba(205, 127, 50, 0.3)'
      };
    }
    return {
      background: 'rgba(255, 215, 0, 0.1)',
      color: '#FFD700',
      border: '1px solid rgba(255, 215, 0, 0.3)'
    };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon sx={{ fontSize: 20 }} />;
    if (rank === 2) return <StarIcon sx={{ fontSize: 18 }} />;
    if (rank === 3) return <DiamondIcon sx={{ fontSize: 16 }} />;
    return null;
  };

  const formatValue = (type: LeaderboardType, entry: LeaderboardEntry) => {
    switch (type) {
      case 'level':
        return `Level ${entry.level} (${entry.experience?.toLocaleString()} XP)`;
      case 'intent':
        return `${entry.intent?.toLocaleString()} Intent`;
      case 'quests':
        return `${entry.quests_completed} Quests`;
      default:
        return '';
    }
  };

  const handleRefresh = () => {
    loadAllLeaderboards();
  };

  const getRaceClassColor = (race: string, className: string) => {
    const raceColors: Record<string, string> = {
      human: '#8B4513',
      elf: '#228B22',
      dwarf: '#A0522D',
      orc: '#556B2F',
      halfling: '#DAA520',
      dragonborn: '#DC143C',
      tiefling: '#4B0082',
      gnome: '#20B2AA',
      'half-elf': '#FF69B4',
      'half-orc': '#8B0000',
      drow: '#191970',
      duergar: '#696969',
      svirfneblin: '#B0C4DE',
      derro: '#9370DB',
      quaggoth: '#2F4F4F',
      aasimar: '#FFD700',
      kalashtar: '#E6E6FA',
      githzerai: '#98FB98',
      sylph: '#87CEEB',
      starborn: '#FF1493',
      githyanki: '#32CD32'
    };

    const classColors: Record<string, string> = {
      warrior: '#DC143C',
      mage: '#4B0082',
      rogue: '#228B22',
      cleric: '#FFD700',
      ranger: '#8B4513',
      paladin: '#FF69B4',
      warlock: '#4B0082',
      bard: '#FF1493',
      monk: '#FF4500',
      druid: '#228B22',
      shadowmancer: '#191970',
      voidpriest: '#4B0082',
      gloomhunter: '#2F4F4F',
      crystalsmith: '#20B2AA',
      mindflayer: '#9370DB',
      'astral monk': '#87CEEB',
      'planar mage': '#FF1493',
      'dream walker': '#E6E6FA',
      'star weaver': '#FFD700',
      'mind sage': '#98FB98'
    };

    return {
      raceColor: raceColors[race] || '#FFD700',
      classColor: classColors[className] || '#FFD700'
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95) 0%, rgba(20, 15, 35, 0.95) 50%, rgba(10, 10, 20, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '3px solid',
          borderImage: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700) 1',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }
        }
      }}
    >
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '20px',
          height: '20px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)',
          animation: 'sparkle 3s ease-in-out infinite',
          '@keyframes sparkle': {
            '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.5)' }
          }
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '15px',
          height: '15px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
          animation: 'sparkle 4s ease-in-out infinite 1s'
        }
      }} />

      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
        borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
        pb: 3,
        pt: 3,
        px: 4,
        position: 'relative'
      }}>
        <Typography variant="h5" sx={{ 
          fontFamily: '"Cinzel", "Times New Roman", serif',
          fontWeight: 'bold',
          color: '#FFD700',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
        }}>
          Leaderboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh Leaderboard" arrow>
            <IconButton 
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                color: '#FFD700',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 215, 0, 0.2)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: '#FFD700',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              '&:hover': {
                background: 'rgba(255, 215, 0, 0.2)',
                transform: 'scale(1.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Tab Navigation */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%)',
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: '#FFD700',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                minHeight: '60px',
                '&.Mui-selected': {
                  color: tabColors[activeTab],
                  textShadow: `0 0 15px ${tabColors[activeTab]}`,
                  background: `linear-gradient(135deg, ${tabColors[activeTab]}20 0%, ${tabColors[activeTab]}10 100%)`
                },
                '&:hover': {
                  background: 'rgba(255, 215, 0, 0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              },
              '& .MuiTabs-indicator': {
                background: `linear-gradient(45deg, ${tabColors[activeTab]}, ${tabColors[activeTab]}80)`,
                height: '4px',
                borderRadius: '2px'
              }
            }}
          >
            {tabLabels.map((label, index) => {
              const IconComponent = tabIcons[index];
              return (
                <Tab
                  key={label}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <IconComponent sx={{ fontSize: 24 }} />
                      <Typography variant="h6">{label}</Typography>
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Leaderboard Content */}
        <Box sx={{ p: 2, minHeight: '400px', maxHeight: '500px', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '300px',
              gap: 2
            }}>
              <CircularProgress 
                size={40}
                thickness={4}
                sx={{ 
                  color: tabColors[activeTab],
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }} 
              />
              <Typography sx={{ 
                color: '#FFD700', 
                fontFamily: '"Cinzel", serif',
                fontSize: '1rem'
              }}>
                Loading...
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {leaderboards[tabTypes[activeTab]]?.map((entry, index) => {
                const rankStyle = getRankStyle(entry.rank);
                const { raceColor, classColor } = getRaceClassColor(entry.race, entry.class);
                
                return (
                  <Fade in={true} timeout={300 + index * 100} key={`${entry.name}-${entry.rank}`}>
                                         <Paper
                       elevation={entry.rank <= 3 ? 4 : 1}
                       sx={{
                         mb: 1,
                         background: rankStyle.background,
                         border: rankStyle.border,
                         borderRadius: '8px',
                         overflow: 'hidden',
                         position: 'relative',
                         transition: 'all 0.2s ease',
                         '&:hover': {
                           transform: 'translateY(-2px)',
                           boxShadow: entry.rank <= 3 
                             ? rankStyle.boxShadow 
                             : '0 4px 12px rgba(255, 215, 0, 0.2)'
                         }
                       }}
                     >
                       <ListItem sx={{ 
                         p: 2,
                         background: 'rgba(0, 0, 0, 0.2)',
                         backdropFilter: 'blur(5px)'
                       }}>
                         <ListItemAvatar>
                           <Avatar 
                             sx={{ 
                               ...rankStyle,
                               width: entry.rank <= 3 ? 40 : 35,
                               height: entry.rank <= 3 ? 40 : 35,
                               fontSize: entry.rank <= 3 ? '1.1rem' : '1rem',
                               fontWeight: 'bold'
                             }}
                           >
                             {getRankIcon(entry.rank) || entry.rank}
                           </Avatar>
                         </ListItemAvatar>
                         
                         <ListItemText
                           primary={
                             <Typography sx={{ 
                               fontFamily: '"Cinzel", "Times New Roman", serif',
                               fontWeight: 'bold',
                               fontSize: entry.rank <= 3 ? '1.1rem' : '1rem',
                               color: rankStyle.color,
                               mb: 0.5
                             }}>
                               {entry.name}
                             </Typography>
                           }
                           secondary={
                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                 <Chip
                                   label={entry.race}
                                   size="small"
                                   sx={{
                                     background: `${raceColor}20`,
                                     color: raceColor,
                                     border: `1px solid ${raceColor}`,
                                     fontFamily: '"Cinzel", serif',
                                     fontWeight: 'bold',
                                     fontSize: '0.7rem',
                                     height: '20px'
                                   }}
                                 />
                                 <Chip
                                   label={entry.class}
                                   size="small"
                                   sx={{
                                     background: `${classColor}20`,
                                     color: classColor,
                                     border: `1px solid ${classColor}`,
                                     fontFamily: '"Cinzel", serif',
                                     fontWeight: 'bold',
                                     fontSize: '0.7rem',
                                     height: '20px'
                                   }}
                                 />
                               </Box>
                               <Typography 
                                 variant="body2" 
                                 sx={{ 
                                   color: rankStyle.color,
                                   fontFamily: '"Cinzel", serif',
                                   fontWeight: 'bold',
                                   fontSize: '0.9rem'
                                 }}
                               >
                                 {formatValue(tabTypes[activeTab], entry)}
                               </Typography>
                             </Box>
                           }
                         />
                       </ListItem>
                     </Paper>
                  </Fade>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer */}
        {lastUpdate && (
          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(255, 215, 0, 0.2)',
            background: 'rgba(255, 215, 0, 0.05)',
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ 
              color: '#FFD700', 
              opacity: 0.7,
              fontFamily: '"Cinzel", serif',
              fontSize: '0.8rem'
            }}>
              Last updated: {lastUpdate.toLocaleTimeString('en-US')} | 
              Total: {leaderboards[tabTypes[activeTab]]?.length || 0}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardPanel;
