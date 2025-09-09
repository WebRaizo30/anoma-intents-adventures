import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Close,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
  School,
  EmojiEvents
} from '@mui/icons-material';
import { useGame } from '../../contexts/GameContext';

interface TutorialStep {
  title: string;
  content: string;
  action?: string;
  highlight?: string;
  image?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "🎮 Welcome to Anoma Intents Adventures! BETA",
    content: "In this multiplayer RPG game, develop your character, complete quests, and interact with other players. Let's get started!",
    action: "Continue",
    image: "🏰"
  },
  {
    title: "⚔️ Start Your First Quest",
            content: "Click the green 'Quests' button on the left side to see available quests. Each quest gives XP, intent, and item rewards.",
    action: "Open quest panel",
    highlight: "quests"
  },
  {
    title: "🎯 How to Complete Quests",
    content: "1. Choose difficulty level (Easy, Medium, Hard)\n2. Select a quest and read its details\n3. Press 'Start Quest' button\n4. Wait for results and collect your rewards!",
    action: "Got it"
  },
  {
    title: "🎒 Inventory & Equipment",
    content: "Click the green backpack icon on the left to open your inventory. Here you can manage your items and change your equipment.",
    action: "Inventory",
    highlight: "inventory"
  },
  {
    title: "🎮 Game World",
    content: "Use WASD keys or arrow keys to move. You can also click to move. Click on enemies to attack them!",
    action: "Move around"
  },
  {
    title: "💰 Economy System",
          content: "Click the golden treasure chest button on the right to collect daily rewards, work for intent, and transfer intent to other players.",
    action: "Economy",
    highlight: "economy"
  },
  {
    title: "💬 Chat & Multiplayer",
    content: "Click the blue chat bubble at the bottom to chat with other players in your region. Real-time multiplayer experience!",
    action: "Chat",
    highlight: "chat"
  },
  {
    title: "🗺️ Travel Between Regions",
    content: "Click the map button on the right to travel to different regions. Each region has its own unique quests and challenges.",
    action: "Map",
    highlight: "map"
  },
  {
    title: "🎉 Tutorial Complete!",
    content: "You're now ready to play the game! Good luck, adventurer. Remember: Log in daily to collect rewards and develop your character.",
    action: "Start Playing!"
  }
];

interface TutorialSystemProps {
  open: boolean;
  onClose: () => void;
  onHighlight?: (element: string) => void;
}

const TutorialSystem: React.FC<TutorialSystemProps> = ({ open, onClose, onHighlight }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { character } = useGame();

  const handleNext = () => {
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
      const nextStep = tutorialSteps[activeStep + 1];
      if (nextStep.highlight && onHighlight) {
        onHighlight(nextStep.highlight);
      }
    } else {
      setCompleted(true);
      localStorage.setItem('tutorial_completed', 'true');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial_completed', 'true');
    onClose();
  };

  const currentStep = tutorialSteps[activeStep];

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(25,20,35,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontFamily: '"Cinzel", "Times New Roman", serif',
        color: 'rgba(255,255,255,0.95)',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        pb: 2
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <School sx={{ color: '#9c27b0', filter: 'drop-shadow(0 0 8px rgba(156,39,176,0.8))' }} />
          Tutorial - Step {activeStep + 1}/{tutorialSteps.length}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip 
            label={`${Math.round(((activeStep + 1) / tutorialSteps.length) * 100)}%`}
            size="small"
            sx={{
              backgroundColor: '#9c27b0',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Tooltip title="Skip Tutorial">
            <IconButton onClick={handleSkip} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ minHeight: '300px' }}>
        {!completed ? (
          <Box>
            {/* Progress Bar */}
            <Box mb={3}>
              <Box 
                sx={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${((activeStep + 1) / tutorialSteps.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>

            {/* Current Step Content */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              {currentStep.image && (
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: '4rem', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8))'
                  }}
                >
                  {currentStep.image}
                </Typography>
              )}
              
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {currentStep.title}
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{
                  color: '#FFFFFF',
                  lineHeight: 1.6,
                  fontSize: '1.1rem',
                  whiteSpace: 'pre-line',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  fontWeight: 500
                }}
              >
                {currentStep.content}
              </Typography>

              {character && activeStep === 0 && (
                <Box mt={2} p={2} sx={{ 
                  background: 'rgba(76,175,80,0.2)', 
                  borderRadius: '10px',
                  border: '1px solid rgba(76,175,80,0.3)' 
                }}>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    👋 Welcome, {character.name}!
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#81c784' }}>
                    Level {character.level} {character.race} {character.class}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        ) : (
          <Box textAlign="center">
            <EmojiEvents sx={{ 
              fontSize: '5rem', 
              color: '#9c27b0',
              filter: 'drop-shadow(0 0 20px rgba(156,39,176,0.8))',
              mb: 2
            }} />
            <Typography 
              variant="h4" 
              sx={{
                fontFamily: '"Cinzel", "Times New Roman", serif',
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              🎉 Tutorial Complete!
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#FFFFFF', 
              mb: 2,
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              fontWeight: 500
            }}>
              You're now ready to explore the world of Anoma Intents Adventures!
            </Typography>
            <Chip 
              label="Begin Adventure!"
              sx={{
                backgroundColor: '#9c27b0',
                color: 'white',
                fontWeight: 'bold',
                px: 2,
                py: 1,
                fontSize: '1rem'
              }}
            />
          </Box>
        )}
      </DialogContent>

      {!completed && (
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<NavigateBefore />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontFamily: '"Cinzel", "Times New Roman", serif',
              '&:hover': {
                color: 'rgba(255,255,255,0.9)'
              }
            }}
          >
            Back
          </Button>

          <Box display="flex" gap={1}>
            <Button
              onClick={handleSkip}
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                '&:hover': {
                  color: 'rgba(255,255,255,0.8)'
                }
              }}
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={activeStep === tutorialSteps.length - 1 ? <PlayArrow /> : <NavigateNext />}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
                }
              }}
            >
              {currentStep.action || 'Continue'}
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TutorialSystem;
