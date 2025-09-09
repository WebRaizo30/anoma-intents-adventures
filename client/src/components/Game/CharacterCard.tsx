import React from 'react';
import { Box, Typography, LinearProgress, Tooltip, Avatar } from '@mui/material';
import { useGame } from '../../contexts/GameContext';

interface CharacterCardProps {
  onCharacterClick: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ onCharacterClick }) => {
  const { character } = useGame();

  if (!character) return null;

  // Calculate level progress
  const getXpForLevel = (level: number) => {
    if (level <= 1) return 0;
    return Math.pow(level, 3) * 25;
  };

  const currentLevelXp = getXpForLevel(character.level || 1);
  const nextLevelXp = getXpForLevel((character.level || 1) + 1);
  const progressXp = (character.experience || 0) - currentLevelXp;
  const requiredXp = nextLevelXp - currentLevelXp;
  const progressPercentage = Math.min((progressXp / requiredXp) * 100, 100);

  const getHealthColor = (health: number) => {
    if (health >= 70) return '#4caf50';
    if (health >= 30) return '#ff9800';
    return '#f44336';
  };

  const getClassColor = (characterClass: string) => {
    const colors: { [key: string]: string } = {
      'warrior': '#ff5722',
      'mage': '#9c27b0',
      'rogue': '#4caf50',
      'cleric': '#2196f3',
      'paladin': '#ff9800',
      'ranger': '#8bc34a',
      'warlock': '#673ab7',
      'druid': '#795548',
      'monk': '#607d8b',
      'bard': '#e91e63',
      'sorcerer': '#00bcd4',
      'wizard': '#3f51b5',
      'fighter': '#f44336',
      'barbarian': '#d32f2f',
      'artificer': '#ff5722',
      'blood_hunter': '#d81b60',
      'planar_mage': '#9c27b0'
    };
    return colors[characterClass.toLowerCase()] || '#9c27b0';
  };

  const getRaceIcon = (race: string) => {
    const raceIcons: { [key: string]: string } = {
      'human': '/assets/characters/human_male.svg',
      'elf': '/assets/characters/elf_male.svg',
      'dwarf': '/assets/characters/dwarf_male.svg',
      'halfling': '/assets/characters/halfling_male.svg',
      'dragonborn': '/assets/characters/dragonborn_male.svg',
      'tiefling': '/assets/characters/tiefling_male.svg',
      'orc': '/assets/characters/orc_male.svg',
      'goblin': '/assets/characters/goblin.svg',
      'drow': '/assets/characters/drow_male.svg',
      'githzerai': '/assets/characters/githzerai_male.svg',
      'svirfneblin': '/assets/characters/svirfneblin_male.svg'
    };
    return raceIcons[race.toLowerCase()] || '/assets/characters/player_default.svg';
  };

  // Get health value safely
  const health = character.health !== undefined ? character.health : 
                 character.hp !== undefined ? character.hp : 100;
  
  // Debug character data - removed for production
  
  const classColor = getClassColor(character.class || 'Unknown');

  return (
    <Tooltip 
      title="View Character Details" 
      placement="right"
      componentsProps={{
        tooltip: {
          sx: {
            fontFamily: '"Cinzel", "Times New Roman", serif',
            background: 'rgba(139,69,19,0.95)',
            border: '2px solid rgba(255,215,0,0.6)',
            borderRadius: '8px',
            color: '#FFD700',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }
        }
      }}
    >
              <Box
        onClick={onCharacterClick}
        sx={{
          position: 'fixed',
          top: 80,
          left: 20,
          background: `
            linear-gradient(135deg, 
              rgba(13,13,13,0.98) 0%, 
              rgba(26,26,26,0.98) 25%, 
              rgba(39,39,39,0.98) 50%, 
              rgba(52,52,52,0.98) 75%, 
              rgba(26,26,26,0.98) 100%
            )
          `,
          backdropFilter: 'blur(25px)',
          borderRadius: '4px',
          border: '2px solid rgba(255,215,0,0.4)',
          boxShadow: `
            0 8px 32px rgba(0,0,0,0.8),
            inset 0 1px 0 rgba(255,215,0,0.1),
            0 0 20px rgba(255,215,0,0.2)
          `,
          zIndex: 1001,
          width: '320px',
          height: '180px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,215,0,0.03) 50%, transparent 100%)',
            zIndex: -1,
            animation: 'subtleGlow 6s ease-in-out infinite'
          },
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: `
              0 12px 40px rgba(0,0,0,0.9),
              inset 0 1px 0 rgba(255,215,0,0.2),
              0 0 30px rgba(255,215,0,0.3)
            `,
            borderColor: 'rgba(255,215,0,0.6)'
          },
          '@keyframes subtleGlow': {
            '0%, 100%': { opacity: 0.5 },
            '50%': { opacity: 1 }
          }
        }}
      >
                 {/* Header with Character Info */}
                   <Box sx={{ p: 1.2, pb: 0.8 }}>
           <Box display="flex" alignItems="center" gap={1} mb={1}>
             {/* Character Avatar */}
             <Avatar
               src={getRaceIcon(character.race || 'human')}
               sx={{
                 width: 40,
                 height: 40,
                 border: '2px solid #FFD700',
                 boxShadow: '0 0 12px rgba(255,215,0,0.4)',
                 background: 'rgba(139,69,19,0.6)'
               }}
             />
             
             {/* Character Name and Level */}
             <Box flex={1}>
               <Typography
                 variant="h6"
                 sx={{
                   fontFamily: '"Cinzel", "Times New Roman", serif',
                   color: '#FFD700',
                   fontWeight: 'bold',
                   textShadow: '0 0 8px rgba(255,215,0,0.5)',
                   fontSize: '0.9rem',
                   lineHeight: 1.1,
                   mb: 0.3
                 }}
               >
                 {character.name || 'Unknown'}
               </Typography>
               <Typography
                 variant="body2"
                 sx={{
                   fontFamily: '"Cinzel", "Times New Roman", serif',
                   color: '#B8860B',
                   fontSize: '0.65rem',
                   fontStyle: 'italic',
                   mb: 0.2
                 }}
               >
                 Lv.{character.level || 1} • {character.race || 'Unknown'}
               </Typography>
               <Typography
                 variant="body2"
                 sx={{
                   fontFamily: '"Cinzel", "Times New Roman", serif',
                   color: '#CD853F',
                   fontSize: '0.6rem',
                   fontStyle: 'italic'
                 }}
               >
                 {character.class || 'Unknown'}
               </Typography>
             </Box>
           </Box>

           {/* Health and XP Bars */}
           <Box display="flex" gap={1} mb={1}>
             {/* Health Bar */}
             <Box flex={1}>
               <Box display="flex" alignItems="center" gap={0.3} mb={0.2}>
                 <Box
                   component="img"
                   src="/assets/items/potion_health.svg"
                   alt="Health"
                   sx={{ 
                     width: 12, 
                     height: 12,
                     filter: 'drop-shadow(0 0 3px rgba(244,67,54,0.5))'
                   }}
                 />
                 <Typography
                   variant="caption"
                   sx={{
                     fontFamily: '"Cinzel", "Times New Roman", serif',
                     color: getHealthColor(health),
                     fontWeight: 'bold',
                     fontSize: '0.6rem'
                   }}
                 >
                   HP: {health}/100
                 </Typography>
               </Box>
               <LinearProgress
                 variant="determinate"
                 value={health}
                 sx={{
                   height: 4,
                   borderRadius: 2,
                   backgroundColor: 'rgba(255,255,255,0.1)',
                   '& .MuiLinearProgress-bar': {
                     background: `linear-gradient(90deg, ${getHealthColor(health)}, ${getHealthColor(health)}80)`,
                     borderRadius: 2,
                     boxShadow: `0 0 6px ${getHealthColor(health)}40`
                   }
                 }}
               />
             </Box>

             {/* XP Bar */}
             <Box flex={1}>
               <Box display="flex" alignItems="center" gap={0.3} mb={0.2}>
                 <Box
                   component="img"
                   src="/assets/items/gem.svg"
                   alt="Experience"
                   sx={{ 
                     width: 12, 
                     height: 12,
                     filter: 'drop-shadow(0 0 3px rgba(76,175,80,0.5))'
                   }}
                 />
                 <Typography
                   variant="caption"
                   sx={{
                     fontFamily: '"Cinzel", "Times New Roman", serif',
                     color: '#4caf50',
                     fontWeight: 'bold',
                     fontSize: '0.6rem'
                   }}
                 >
                   XP: {Math.round(progressPercentage)}%
                 </Typography>
               </Box>
               <LinearProgress
                 variant="determinate"
                 value={progressPercentage}
                 sx={{
                   height: 4,
                   borderRadius: 2,
                   backgroundColor: 'rgba(255,255,255,0.1)',
                   '& .MuiLinearProgress-bar': {
                     background: 'linear-gradient(90deg, #4caf50, #8bc34a, #cddc39)',
                     borderRadius: 2,
                     boxShadow: '0 0 6px rgba(76,175,80,0.4)'
                   }
                 }}
               />
             </Box>
           </Box>

           {/* Character Stats */}
           <Box
             sx={{
               background: 'rgba(139,69,19,0.3)',
               borderRadius: '6px',
               p: 0.8,
               border: '1px solid rgba(255,215,0,0.2)'
             }}
           >
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
               <Typography
                 variant="caption"
                 sx={{
                   fontFamily: '"Cinzel", "Times New Roman", serif',
                   color: '#FFD700',
                   fontWeight: 'bold',
                   fontSize: '0.6rem'
                 }}
               >
                 Intent: {(character.intent || 0).toLocaleString()}
               </Typography>
               <Typography
                 variant="caption"
                 sx={{
                   fontFamily: '"Cinzel", "Times New Roman", serif',
                   color: '#e91e63',
                   fontWeight: 'bold',
                   fontSize: '0.6rem'
                 }}
               >
                 Currency: {(character.racial_currency || 0).toLocaleString()}
               </Typography>
             </Box>
             <Typography
               variant="caption"
               sx={{
                 fontFamily: '"Cinzel", "Times New Roman", serif',
                 color: '#CD853F',
                 fontSize: '0.55rem',
                 textAlign: 'center',
                 display: 'block'
               }}
             >
               {Math.round(progressPercentage)}% to Level {(character.level || 1) + 1}
             </Typography>
           </Box>
         </Box>

                 {/* Bottom Stats Bar */}
                   <Box
            sx={{
              background: 'rgba(0,0,0,0.4)',
              p: 0.6,
              borderTop: '1px solid rgba(255,215,0,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomLeftRadius: '2px',
              borderBottomRightRadius: '2px'
            }}
          >
           {/* Intent */}
           <Box display="flex" alignItems="center" gap={0.3}>
             <Box
               component="img"
               src="/assets/items/coin.svg"
               alt="Intent"
               sx={{ 
                 width: 10, 
                 height: 10,
                 filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.5))'
               }}
             />
             <Typography
               variant="caption"
               sx={{
                 fontFamily: '"Cinzel", "Times New Roman", serif',
                 color: '#FFD700',
                 fontWeight: 'bold',
                 fontSize: '0.6rem'
               }}
             >
               {(character.intent || 0).toLocaleString()}
             </Typography>
           </Box>

                       {/* Class Badge */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${classColor}, ${classColor}80)`,
                borderRadius: '6px',
                px: 0.6,
                py: 0.15,
                border: '1px solid rgba(255,255,255,0.2)',
                maxWidth: '80px',
                overflow: 'hidden'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: '0.5rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block'
                }}
              >
                {(character.class || 'Unknown').toUpperCase()}
              </Typography>
            </Box>

           {/* Racial Currency */}
           <Box display="flex" alignItems="center" gap={0.3}>
             <Box
               component="img"
               src="/assets/items/gem.svg"
               alt="Racial Currency"
               sx={{ 
                 width: 10, 
                 height: 10,
                 filter: 'drop-shadow(0 0 3px rgba(233,30,99,0.5))'
               }}
             />
             <Typography
               variant="caption"
               sx={{
                 fontFamily: '"Cinzel", "Times New Roman", serif',
                 color: '#e91e63',
                 fontWeight: 'bold',
                 fontSize: '0.6rem'
               }}
             >
               {(character.racial_currency || 0).toLocaleString()}
             </Typography>
           </Box>
         </Box>
      </Box>
    </Tooltip>
  );
};

export default CharacterCard;
