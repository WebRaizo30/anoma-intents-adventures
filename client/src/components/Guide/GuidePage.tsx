import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';

import {
  Person,
  Psychology,
  EmojiEvents,
  Pets,
  Inventory,
  Map,
  School,
  Star,
  Shield,
  LocalFireDepartment
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`guide-tabpanel-${index}`}
      aria-labelledby={`guide-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GuidePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Force scroll to be enabled
  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 25%, #2a1a1a 50%, #1a0a0a 75%, #0a0a0a 100%)',
        position: 'relative',
        overflow: 'auto',
        height: '100vh',
        '&::-webkit-scrollbar': {
          width: '12px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(26,16,16,0.8)',
          borderRadius: '6px',
          border: '1px solid #8B4513',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF4444 100%)',
          borderRadius: '6px',
          border: '1px solid #8B4513',
          '&:hover': {
            background: 'linear-gradient(180deg, #FFA500 0%, #FF4444 50%, #CC0000 100%)',
          }
        },
        '&::-webkit-scrollbar-corner': {
          background: 'rgba(26,16,16,0.8)',
        },
        // Firefox scroll styles
        scrollbarWidth: 'thin',
        scrollbarColor: '#FFD700 rgba(26,16,16,0.8)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(204,0,0,0.15) 0%, transparent 30%),
            radial-gradient(circle at 80% 70%, rgba(255,68,68,0.1) 0%, transparent 30%),
            radial-gradient(circle at 50% 50%, rgba(139,0,0,0.08) 0%, transparent 50%)
          `,
          zIndex: 1
        }
      }}
    >
      {/* Ancient Stone Texture Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139,0,0,0.02) 10px,
              rgba(139,0,0,0.02) 20px
            )
          `,
          zIndex: 2
        }}
      />

      <Container maxWidth="xl" sx={{ 
        position: 'relative', 
        zIndex: 10, 
        py: 4, 
        height: '100%', 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '12px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(26,16,16,0.8)',
          borderRadius: '6px',
          border: '1px solid #8B4513',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF4444 100%)',
          borderRadius: '6px',
          border: '1px solid #8B4513',
          '&:hover': {
            background: 'linear-gradient(180deg, #FFA500 0%, #FF4444 50%, #CC0000 100%)',
          }
        },
        '&::-webkit-scrollbar-corner': {
          background: 'rgba(26,16,16,0.8)',
        },
        // Firefox scroll styles
        scrollbarWidth: 'thin',
        scrollbarColor: '#FFD700 rgba(26,16,16,0.8)',
      }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Cinzel", "Times New Roman", serif',
              fontWeight: 'bold',
              color: '#FFD700',
              textShadow: '0 0 20px rgba(255,215,0,0.8)',
              letterSpacing: 2,
              mb: 2
            }}
          >
            🏰 ANOMA INTENTS ADVENTURES
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
            variant="h5"
            sx={{
              fontFamily: '"Cinzel", "Times New Roman", serif',
              color: '#FF4444',
              fontWeight: 'bold',
              textShadow: '0 0 15px rgba(255,68,68,0.6)',
              letterSpacing: 1
            }}
          >
            COMPLETE GAME GUIDE
          </Typography>
        </Box>

        {/* Main Content */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(26,16,16,0.95) 0%, rgba(42,26,26,0.95) 50%, rgba(26,16,16,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #8B4513',
            borderRadius: '15px',
            boxShadow: '0 15px 30px rgba(139,0,0,0.4), 0 0 40px rgba(255,215,0,0.1)',
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(26,16,16,0.8)',
              borderRadius: '6px',
              border: '1px solid #8B4513',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF4444 100%)',
              borderRadius: '6px',
              border: '1px solid #8B4513',
              '&:hover': {
                background: 'linear-gradient(180deg, #FFA500 0%, #FF4444 50%, #CC0000 100%)',
              }
            },
            '&::-webkit-scrollbar-corner': {
              background: 'rgba(26,16,16,0.8)',
            },
            // Firefox scroll styles
            scrollbarWidth: 'thin',
            scrollbarColor: '#FFD700 rgba(26,16,16,0.8)',
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: '#FFD700',
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: '#FF4444',
                    textShadow: '0 0 10px rgba(255,68,68,0.6)'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FF4444',
                  boxShadow: '0 0 10px rgba(255,68,68,0.6)'
                }
              }}
            >
              <Tab icon={<Person />} label="Getting Started" />
              <Tab icon={<Psychology />} label="Races & Classes" />
              <Tab icon={<EmojiEvents />} label="Combat & Quests" />
              <Tab icon={<Pets />} label="Pet System" />
              <Tab icon={<Inventory />} label="Items & Economy" />
              <Tab icon={<Map />} label="Regions & Exploration" />
              <Tab icon={<School />} label="Advanced Systems" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              🚀 Getting Started
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    🎮 What is Anoma Intents Adventures?
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Anoma Intents Adventures is a multiplayer roguelike RPG where you create a character, choose your race and class, 
                    and embark on epic adventures across mystical realms. The game features a unique "Intent" system that represents 
                    your character's determination and willpower.
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Key Features:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                      <ListItemText primary="Multiplayer RPG with real-time interactions" />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                      <ListItemText primary="Unique Intent system for character progression" />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                      <ListItemText primary="Pet companion system with magical creatures" />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                      <ListItemText primary="Shrimp farming mini-game for economy" />
                    </ListItem>
                  </List>
                </Paper>
                
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    📊 Core Stats System
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Your character has six core attributes that determine their capabilities:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Shield sx={{ color: '#FF4444' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Strength" 
                        secondary="Physical power, melee damage, carrying capacity" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Shield sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Dexterity" 
                        secondary="Agility, ranged attacks, stealth, dodging" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Shield sx={{ color: '#2196F3' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Constitution" 
                        secondary="Health, stamina, resistance to disease" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Shield sx={{ color: '#9C27B0' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Intelligence" 
                        secondary="Magic power, spell casting, knowledge" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Shield sx={{ color: '#FF9800' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Wisdom" 
                        secondary="Intuition, perception, divine magic" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Shield sx={{ color: '#E91E63' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Charisma" 
                        secondary="Social skills, leadership, magical influence" 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
              
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  🎯 The Intent System
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                  Intent is a unique currency that represents your character's determination and willpower. It's earned through:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                  <Chip 
                    label="Quest Completion" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      color: '#000',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Chip 
                    label="Combat Victories" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #FF4444, #CC0000)',
                      color: '#FFF',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Chip 
                    label="Daily Activities" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                      color: '#FFF',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                <Typography variant="body1" sx={{ color: '#E0E0E0', mt: 2 }}>
                  Intent can be used for special abilities, enhanced quest rewards, and unlocking unique content throughout your adventure.
                </Typography>
              </Paper>
            </Box>
          </TabPanel>

          {/* Placeholder for other tabs */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              ⚔️ Races & Classes
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Standard Races */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  🏰 Standard Races
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        👤 Human
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Balanced and versatile, good at everything
                      </Typography>
                      <Chip label="+1 to all stats" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🧝 Elf
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Graceful and magical, high dexterity and intelligence
                      </Typography>
                      <Chip label="+2 Dex, +2 Int, +1 Wis" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        ⛏️ Dwarf
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Hardy and strong, excellent constitution
                      </Typography>
                      <Chip label="+3 Con, +2 Str" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🗡️ Orc
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Powerful warriors with high strength
                      </Typography>
                      <Chip label="+3 Str, +2 Con" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🍀 Halfling
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Lucky and stealthy, great dexterity
                      </Typography>
                      <Chip label="+2 Dex, +2 Cha, +1 Wis" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🐉 Dragonborn
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Draconic heritage with breath weapons
                      </Typography>
                      <Chip label="+2 Str, +2 Cha, +1 Con" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                </Box>
              </Paper>

              {/* Standard Classes */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  ⚔️ Standard Classes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🗡️ Warrior
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Melee combat specialist with high strength
                      </Typography>
                      <Chip label="+3 Str, +2 Con" size="small" sx={{ background: '#FF4444', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🔮 Mage
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Arcane spellcaster with powerful magic
                      </Typography>
                      <Chip label="+3 Int, +2 Wis" size="small" sx={{ background: '#9C27B0', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🥷 Rogue
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Stealth expert with high dexterity
                      </Typography>
                      <Chip label="+3 Dex, +2 Cha" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        ✝️ Cleric
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Divine healer with wisdom
                      </Typography>
                      <Chip label="+3 Wis, +2 Cha" size="small" sx={{ background: '#FF9800', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              ⚔️ Combat & Quests
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Combat System */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    ⚔️ Combat System
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Combat in Anoma Intents Adventures is based on your character's stats and equipment.
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#FF4444', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Combat Power Calculation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Your combat power is calculated as: <strong>Strength + Dexterity + Level</strong>
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#FF4444', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Equipment Bonuses
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Equipped items provide stat bonuses that directly increase your combat effectiveness.
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#FF4444', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Boss Battles
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Special boss encounters offer greater challenges and rewards, including:
                  </Typography>
                  <List dense>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><LocalFireDepartment sx={{ color: '#FF4444' }} /></ListItemIcon>
                      <ListItemText primary="Ancient Treant" secondary="Forest guardian with nature magic" />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><LocalFireDepartment sx={{ color: '#FF4444' }} /></ListItemIcon>
                      <ListItemText primary="Dragon Wyrmling" secondary="Young dragon with fire breath" />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><LocalFireDepartment sx={{ color: '#FF4444' }} /></ListItemIcon>
                      <ListItemText primary="Shadow Wolf Alpha" secondary="Pack leader with stealth abilities" />
                    </ListItem>
                  </List>
                </Paper>

                {/* Quest System */}
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    📜 Quest System
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Quests are the primary way to gain experience, intent, and valuable items.
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#4CAF50', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Quest Difficulties
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, mb: 2 }}>
                    <Chip 
                      label="Easy" 
                      size="small" 
                      sx={{ background: '#4CAF50', color: '#FFF', flex: 1 }} 
                    />
                    <Chip 
                      label="Medium" 
                      size="small" 
                      sx={{ background: '#FF9800', color: '#FFF', flex: 1 }} 
                    />
                    <Chip 
                      label="Hard" 
                      size="small" 
                      sx={{ background: '#F44336', color: '#FFF', flex: 1 }} 
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ color: '#4CAF50', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Quest Success Rate
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Base success rate: 50% (reduced from 70% in v2.1)
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#4CAF50', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Success Modifiers
                  </Typography>
                  <List dense>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Level Difference" 
                        secondary="+2% per level above requirement (max 20%)" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#FF9800' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Difficulty Bonus" 
                        secondary="Easy: +20%, Medium: +0%, Hard: -20%" 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>

              {/* Experience System */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  📈 Experience & Leveling System
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                  Experience is earned through quests and combat. The leveling system uses a cumulative formula that becomes progressively harder.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                      Level Requirements (Cumulative)
                    </Typography>
                    <List dense>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Level 1-10" 
                          secondary="500 × level² per level" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FF9800' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Level 11-20" 
                          secondary="1000 × level² per level" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#F44336' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Level 21-30" 
                          secondary="1500 × level² per level" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#9C27B0' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Level 31-40" 
                          secondary="2000 × level² per level" 
                        />
                      </ListItem>
                    </List>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                      Level Up Bonuses
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 2 }}>
                      When you level up, you receive stat bonuses based on your race and class:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Racial Bonuses" 
                          secondary="Half of your race's starting bonus" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Class Bonuses" 
                          secondary="Half of your class's starting bonus" 
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              🐾 Pet System
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Pet Overview */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  🐾 Pet Companions
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                  Pets are magical companions that provide various bonuses and abilities to aid you in your adventures. 
                  Each pet has unique stats, special abilities, and unlock requirements.
                </Typography>
              </Paper>

              {/* Pet Rarities and Types */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    💎 Pet Rarities
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#C0C0C0', fontFamily: '"Cinzel", serif' }}>
                          ⚪ Common
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Basic pets with simple abilities
                        </Typography>
                        <Chip label="Easy to obtain" size="small" sx={{ background: '#C0C0C0', color: '#000' }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#4CAF50', fontFamily: '"Cinzel", serif' }}>
                          🟢 Uncommon
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Enhanced pets with better abilities
                        </Typography>
                        <Chip label="Moderate difficulty" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#2196F3', fontFamily: '"Cinzel", serif' }}>
                          🔵 Rare
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Powerful pets with unique abilities
                        </Typography>
                        <Chip label="Hard to obtain" size="small" sx={{ background: '#2196F3', color: '#FFF' }} />
                      </CardContent>
                    </Card>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    🎯 Pet Types
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                          🐺 Companion
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          General purpose pets with balanced abilities
                        </Typography>
                        <Chip label="Versatile" size="small" sx={{ background: '#FFD700', color: '#000' }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                          🥷 Stealth
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Pets specialized in stealth and evasion
                        </Typography>
                        <Chip label="Sneaky" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                          🔮 Magic
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Pets with magical abilities and spellcasting
                        </Typography>
                        <Chip label="Magical" size="small" sx={{ background: '#9C27B0', color: '#FFF' }} />
                      </CardContent>
                    </Card>
                  </Box>
                </Paper>
              </Box>

              {/* Example Pets */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  🐾 Example Pets
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(33% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🐺 Forest Wolf
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        A loyal wolf companion from the forest
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#C0C0C0', display: 'block', mb: 1 }}>
                        Type: Companion | Rarity: Common
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1 }}>
                        Special Ability: Pack Hunter - +10% combat damage
                      </Typography>
                      <Chip label="Complete 5 quests" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(33% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🦅 Storm Eagle
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        A majestic eagle that commands the storms
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#C0C0C0', display: 'block', mb: 1 }}>
                        Type: Aerial | Rarity: Rare
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1 }}>
                        Special Ability: Lightning Strike - 25% chance for bonus lightning damage
                      </Typography>
                      <Chip label="Reach level 15" size="small" sx={{ background: '#2196F3', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(33% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🔥 Flame Sprite
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        A tiny elemental being of pure flame
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#C0C0C0', display: 'block', mb: 1 }}>
                        Type: Magic | Rarity: Uncommon
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1 }}>
                        Special Ability: Fire Burst - Deals fire damage to enemies
                      </Typography>
                      <Chip label="Cast 25 fire spells" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              💎 Items & Economy
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Currency System */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    💰 Currency System
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Anoma Intents Adventures features multiple currency types for different purposes.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                          🪙 Gold
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Primary universal currency (now scarce in v2.1)
                        </Typography>
                        <Chip label="Universal" size="small" sx={{ background: '#FFD700', color: '#000' }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                          🎯 Intent
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Special currency representing determination and willpower
                        </Typography>
                        <Chip label="Special abilities" size="small" sx={{ background: '#FF4444', color: '#FFF' }} />
                      </CardContent>
                    </Card>
                    <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                          🏛️ Racial Currency
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                          Race-specific currencies with unique names and uses
                        </Typography>
                        <Chip label="Race-specific" size="small" sx={{ background: '#9C27B0', color: '#FFF' }} />
                      </CardContent>
                    </Card>
                  </Box>
                </Paper>

                {/* Shrimp Farming */}
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    🦐 Shrimp Farming System
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    A unique mini-game where you can farm shrimp for profit and experience.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                        🏗️ Farm Management
                      </Typography>
                      <List dense>
                        <ListItem sx={{ color: '#E0E0E0' }}>
                          <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Tank Capacity" 
                            secondary="Increases by 5 per farm level" 
                          />
                        </ListItem>
                        <ListItem sx={{ color: '#E0E0E0' }}>
                          <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Water Quality" 
                            secondary="Decays by 5 points daily" 
                          />
                        </ListItem>
                        <ListItem sx={{ color: '#E0E0E0' }}>
                          <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Food Level" 
                            secondary="Decays by 10 points daily" 
                          />
                        </ListItem>
                      </List>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                        💰 Profit System
                      </Typography>
                      <List dense>
                        <ListItem sx={{ color: '#E0E0E0' }}>
                          <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Base Value" 
                            secondary="50 gold per shrimp" 
                          />
                        </ListItem>
                        <ListItem sx={{ color: '#E0E0E0' }}>
                          <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Quality Bonus" 
                            secondary="Based on water quality" 
                          />
                        </ListItem>
                        <ListItem sx={{ color: '#E0E0E0' }}>
                          <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Level Bonus" 
                            secondary="+5 gold per farm level" 
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              🗺️ Regions & Exploration
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Standard Regions */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  🌍 Standard Regions
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                  These are the primary regions where most adventures begin and take place.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(33% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#4CAF50', fontFamily: '"Cinzel", serif' }}>
                        🌲 Forest
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Starting region with mystical creatures and ancient trees
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#C0C0C0', display: 'block', mb: 1 }}>
                        Difficulty: Easy | Spawn Point: Default
                      </Typography>
                      <Chip label="Beginner Friendly" size="small" sx={{ background: '#4CAF50', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(33% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FF9800', fontFamily: '"Cinzel", serif' }}>
                        🏔️ Mountain
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Rugged terrain with dangerous creatures and valuable minerals
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#C0C0C0', display: 'block', mb: 1 }}>
                        Difficulty: Medium | Mining Opportunities
                      </Typography>
                      <Chip label="Resource Rich" size="small" sx={{ background: '#FF9800', color: '#FFF' }} />
                    </CardContent>
                  </Card>
                  <Card sx={{ background: 'rgba(42,26,26,0.6)', border: '1px solid #8B4513', flex: { xs: '1 1 100%', md: '1 1 calc(33% - 8px)' } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🏜️ Desert
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#E0E0E0', mb: 1 }}>
                        Harsh environment with ancient ruins and hidden treasures
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#C0C0C0', display: 'block', mb: 1 }}>
                        Difficulty: Hard | Treasure Hunting
                      </Typography>
                      <Chip label="Treasure Rich" size="small" sx={{ background: '#FFD700', color: '#000' }} />
                    </CardContent>
                  </Card>
                </Box>
              </Paper>

              {/* Regional Features */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    🎯 Regional Features
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Each region offers unique opportunities and challenges.
                  </Typography>
                  
                  <List dense>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Unique Quests" 
                        secondary="Region-specific quest pools with themed rewards" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Special NPCs" 
                        secondary="Location-based characters with unique interactions" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Environmental Challenges" 
                        secondary="Region-appropriate obstacles and hazards" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Cultural Elements" 
                        secondary="Race-specific regional interactions and bonuses" 
                      />
                    </ListItem>
                  </List>
                </Paper>

                {/* Racial Currency by Region */}
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    🏛️ Racial Currencies
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Each race has its own unique currency with special names and uses.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip 
                      label="Human: Imperial Coins" 
                      size="small" 
                      sx={{ background: '#FFD700', color: '#000', width: '100%' }} 
                    />
                    <Chip 
                      label="Elf: Moonstone Shards" 
                      size="small" 
                      sx={{ background: '#4CAF50', color: '#FFF', width: '100%' }} 
                    />
                    <Chip 
                      label="Dwarf: Iron Tokens" 
                      size="small" 
                      sx={{ background: '#FF9800', color: '#FFF', width: '100%' }} 
                    />
                    <Chip 
                      label="Orc: Blood Marks" 
                      size="small" 
                      sx={{ background: '#F44336', color: '#FFF', width: '100%' }} 
                    />
                    <Chip 
                      label="Drow: Shadow Crystals" 
                      size="small" 
                      sx={{ background: '#9C27B0', color: '#FFF', width: '100%' }} 
                    />
                    <Chip 
                      label="Aasimar: Light Fragments" 
                      size="small" 
                      sx={{ background: '#2196F3', color: '#FFF', width: '100%' }} 
                    />
                  </Box>
                </Paper>
              </Box>

              {/* Exploration Tips */}
              <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513' }}>
                <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                  🧭 Exploration Tips
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                      🎯 Quest Strategy
                    </Typography>
                    <List dense>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Start with Easy Quests" 
                          secondary="Build experience before tackling harder challenges" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FF9800' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Check Requirements" 
                          secondary="Ensure you meet level and alignment requirements" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#F44336' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Manage Resources" 
                          secondary="Keep track of health, intent, and equipment" 
                        />
                      </ListItem>
                    </List>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                      💰 Economic Strategy
                    </Typography>
                    <List dense>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Diversify Income" 
                          secondary="Combine quests, farming, and trading" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Invest in Equipment" 
                          secondary="Better gear improves quest success rates" 
                        />
                      </ListItem>
                      <ListItem sx={{ color: '#E0E0E0' }}>
                        <ListItemIcon><Star sx={{ color: '#FFD700' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Save Intent" 
                          secondary="Use for special abilities and rare opportunities" 
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 3, fontFamily: '"Cinzel", serif' }}>
              🔮 Advanced Systems
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Multiplayer Features */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    👥 Multiplayer Features
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Connect with other players and experience the world together.
                  </Typography>
                  
                  <List dense>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Real-time Chat" 
                        secondary="Communicate with other adventurers" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Leaderboards" 
                        secondary="Compete for top rankings" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Online Players" 
                        secondary="See who else is exploring the world" 
                      />
                    </ListItem>
                    <ListItem sx={{ color: '#E0E0E0' }}>
                      <ListItemIcon><Star sx={{ color: '#4CAF50' }} /></ListItemIcon>
                      <ListItemText 
                        primary="Shared World" 
                        secondary="Experience the same world as other players" 
                      />
                    </ListItem>
                  </List>
                </Paper>

                {/* Story Generation */}
                <Paper sx={{ p: 3, background: 'rgba(26,16,16,0.8)', border: '1px solid #8B4513', flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700', mb: 2, fontFamily: '"Cinzel", serif' }}>
                    📖 Story Generation System
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#E0E0E0', mb: 2 }}>
                    Dynamic story generation creates unique adventures for each player.
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 1, fontFamily: '"Cinzel", serif' }}>
                    Story Types
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Dungeon Adventure" 
                      size="small" 
                      sx={{ background: '#9C27B0', color: '#FFF' }} 
                    />
                    <Chip 
                      label="Wilderness Expedition" 
                      size="small" 
                      sx={{ background: '#4CAF50', color: '#FFF' }} 
                    />
                    <Chip 
                      label="Urban Adventure" 
                      size="small" 
                      sx={{ background: '#FF9800', color: '#FFF' }} 
                    />
                    <Chip 
                      label="Mystical Encounter" 
                      size="small" 
                      sx={{ background: '#2196F3', color: '#FFF' }} 
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: '#E0E0E0', mt: 2 }}>
                    Stories are personalized based on your character's race, class, and choices.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
};

export default GuidePage;
