import React, { useState, useEffect } from 'react';
import { Box, Typography, Collapse, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { ExpandLess, ExpandMore, LocationOn, Info } from '@mui/icons-material';
import { useGame } from '../../contexts/GameContext';

interface MiniGuideProps {
  currentContext?: string;
  activePanel?: string | null;
  currentRegion?: string;
}

interface GuideInfo {
  location: string;
  action: string;
  hint: string;
  icon: string;
}

const MiniGuide: React.FC<MiniGuideProps> = ({ currentContext, activePanel, currentRegion }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [guideInfo, setGuideInfo] = useState<GuideInfo>({
    location: "Game World",
    action: "Explore and quest",
    hint: "Click floating buttons to access game features",
    icon: "🌍"
  });
  const { character } = useGame();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Update guide info based on context
  useEffect(() => {
    let newGuideInfo: GuideInfo;

    if (activePanel) {
      switch (activePanel) {
        case 'quests':
          newGuideInfo = {
            location: "Quest Panel",
            action: "Complete quests",
            hint: "Choose difficulty → Select quest → Start quest → Collect rewards",
            icon: "⚔️"
          };
          break;
        case 'inventory':
          newGuideInfo = {
            location: "Inventory",
            action: "Manage items",
            hint: "Equip items to boost stats, sell unwanted items for intent",
            icon: "🎒"
          };
          break;
        case 'economy':
          newGuideInfo = {
            location: "Economy Panel",
            action: "Earn intent",
            hint: "Collect daily rewards, work for intent, or trade with players",
            icon: "💰"
          };
          break;
        case 'combat':
          newGuideInfo = {
            location: "Combat Arena",
            action: "Fight battles",
            hint: "Challenge monsters or other players for XP and rewards",
            icon: "⚔️"
          };
          break;
        case 'pets':
          newGuideInfo = {
            location: "Pet System",
            action: "Manage pets",
            hint: "Adopt pets, feed them, and train them to help in adventures",
            icon: "🐾"
          };
          break;
        case 'shrimp':
          newGuideInfo = {
            location: "Shrimp Farm",
            action: "Farm shrimp",
            hint: "Manage your shrimp farm, harvest shrimp for profit",
            icon: "🦐"
          };
          break;
        case 'story':
          newGuideInfo = {
            location: "Story Generator",
            action: "Create stories",
            hint: "Generate personalized adventure stories based on your character",
            icon: "📖"
          };
          break;
        case 'chat':
          newGuideInfo = {
            location: "Region Chat",
            action: "Chat with players",
            hint: "Talk to other players in your current region",
            icon: "💬"
          };
          break;
        case 'players':
          newGuideInfo = {
            location: "Online Players",
            action: "View players",
            hint: "See who's online, send party invites or trade requests",
            icon: "👥"
          };
          break;
        case 'map':
          newGuideInfo = {
            location: "World Map",
            action: "Travel regions",
            hint: "Choose a region to travel to. Each region has unique quests",
            icon: "🗺️"
          };
          break;
        case 'audio':
          newGuideInfo = {
            location: "Audio Settings",
            action: "Control sound",
            hint: "Adjust music volume and sound effects settings",
            icon: "🔊"
          };
          break;
        default:
          newGuideInfo = {
            location: "Game Panel",
            action: "Use features",
            hint: "Explore the current panel's options and features",
            icon: "⚙️"
          };
      }
    } else if (currentContext === 'boss') {
      newGuideInfo = {
        location: "Boss Battle",
        action: "Defeat the boss",
        hint: "Use your best strategy and equipment to defeat this powerful enemy",
        icon: "👹"
      };
    } else if (currentContext === 'dungeon') {
      newGuideInfo = {
        location: "Dungeon Mode",
        action: "Explore dungeon",
        hint: "Navigate through rooms, fight enemies, and collect treasure chests",
        icon: "🏰"
      };
    } else if (currentRegion && currentRegion !== 'starting_meadows') {
      const regionNames: { [key: string]: { name: string, icon: string, hint: string } } = {
        whispering_woods: { 
          name: "Whispering Woods", 
          icon: "🌲", 
          hint: "Dark forest with mysterious creatures and ancient secrets" 
        },
        crystal_caverns: { 
          name: "Crystal Caverns", 
          icon: "💎", 
          hint: "Underground caves filled with magical crystals and rare minerals" 
        },
        ember_desert: { 
          name: "Ember Desert", 
          icon: "🏜️", 
          hint: "Scorching desert with fire elementals and hidden oases" 
        },
        frostpeak_mountains: { 
          name: "Frostpeak Mountains", 
          icon: "🏔️", 
          hint: "Icy peaks with frost giants and frozen treasures" 
        },
        shadowmere_swamps: { 
          name: "Shadowmere Swamps", 
          icon: "🌿", 
          hint: "Murky swamplands with poisonous creatures and dark magic" 
        }
      };

      const regionInfo = regionNames[currentRegion];
      if (regionInfo) {
        newGuideInfo = {
          location: regionInfo.name,
          action: "Explore region",
          hint: regionInfo.hint + ". Complete region-specific quests!",
          icon: regionInfo.icon
        };
      } else {
        // Use currentRegion if available, otherwise show unknown
        const regionDisplayName = currentRegion ? 
          currentRegion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
          "Unknown Region";
        
        newGuideInfo = {
          location: regionDisplayName,
          action: "Explore area",
          hint: "Discover what this mysterious region has to offer",
          icon: "❓"
        };
      }
    } else {
      // Default game world state
      const hints = [
        "Click the green quest button to start your adventure!",
        "Open your inventory to manage items and equipment",
        "Visit the economy panel to collect daily rewards",
        "Use WASD keys or click to move around the world",
        "Click on enemies in the game world to attack them"
      ];
      
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      
      newGuideInfo = {
        location: "Game World",
        action: "Begin your journey",
        hint: randomHint,
        icon: "🌍"
      };
    }

    setGuideInfo(newGuideInfo);
  }, [activePanel, currentContext, currentRegion]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: isMobile ? 80 : 120, // More space on mobile, adjusted for desktop
        left: 20,
        background: 'linear-gradient(135deg, rgba(139,69,19,0.95) 0%, rgba(160,82,45,0.95) 50%, rgba(139,69,19,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        border: '2px solid #FFD700',
        boxShadow: '0 8px 25px rgba(255,215,0,0.4)',
        zIndex: 998,
        maxWidth: isExpanded ? (isMobile ? '280px' : '320px') : (isMobile ? '180px' : '200px'),
        minWidth: isMobile ? '180px' : '200px',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={1.5}
        sx={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: '1.2rem' }}>{guideInfo.icon}</Typography>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Cinzel", "Times New Roman", serif',
                color: '#FFD700',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textShadow: '0 0 8px rgba(255,215,0,0.6)'
              }}
            >
              <LocationOn sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle' }} />
              {guideInfo.location}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#E0E0E0',
                fontSize: '0.7rem',
                display: 'block'
              }}
            >
              {guideInfo.action}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title={isExpanded ? "Collapse guide" : "Expand guide"}>
          <IconButton size="small" sx={{ color: '#FFD700' }}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Expanded Content */}
      <Collapse in={isExpanded}>
        <Box px={1.5} pb={1.5}>
          <Box
            sx={{
              background: 'rgba(255,215,0,0.1)',
              borderRadius: '8px',
              p: 1,
              border: '1px solid rgba(255,215,0,0.2)'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#E0E0E0',
                fontSize: '0.75rem',
                lineHeight: 1.3,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.5
              }}
            >
              <Info sx={{ fontSize: '0.9rem', color: '#4caf50', flexShrink: 0, mt: 0.1 }} />
              {guideInfo.hint}
            </Typography>
          </Box>

          {/* Character quick info */}
          {character && (
            <Box
              mt={1}
              sx={{
                background: 'rgba(76,175,80,0.1)',
                borderRadius: '6px',
                p: 0.8,
                border: '1px solid rgba(76,175,80,0.2)'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#4caf50',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              >
                {character.name} • Lv.{character.level} • {character.intent.toLocaleString()} intent
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default MiniGuide;
