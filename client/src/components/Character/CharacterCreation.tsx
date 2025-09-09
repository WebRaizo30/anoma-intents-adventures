import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Book } from '@mui/icons-material';
import { gameService } from '../../services/gameService';

interface CharacterCreationProps {
  onCharacterCreated: () => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    characterClass: ''
  });
  const [options, setOptions] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRaceType, setSelectedRaceType] = useState('standard');
  const [selectedClassType, setSelectedClassType] = useState('standard');

  useEffect(() => {
    loadCharacterOptions();
  }, []);

  const loadCharacterOptions = async () => {
    try {
      const response = await gameService.getCharacterOptions();
      if (response.success) {
        setOptions(response);
      }
    } catch (error) {
      setError('Failed to load character options');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await gameService.createCharacter(
        formData.name,
        formData.race,
        formData.characterClass
      );
      
      if (response.success) {
        onCharacterCreated();
      } else {
        setError(response.message || 'Character creation failed');
      }
    } catch (error) {
      setError('Character creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRaceDescription = (race: string) => {
    const descriptions: { [key: string]: string } = {
      human: 'Balanced and versatile, good at everything',
      elf: 'Graceful and magical, high dexterity and intelligence',
      dwarf: 'Hardy and strong, excellent constitution',
      orc: 'Powerful warriors with high strength',
      halfling: 'Lucky and stealthy, great dexterity',
      dragonborn: 'Draconic heritage with breath weapons',
      tiefling: 'Infernal heritage with charisma bonuses',
      gnome: 'Small but clever, tinker abilities',
      drow: 'Dark elves with superior darkvision',
      aasimar: 'Celestial-touched with divine powers',
      githyanki: 'Psionic warriors from the Astral Plane'
    };
    return descriptions[race] || 'Mysterious origins';
  };

  const getClassDescription = (characterClass: string) => {
    const descriptions: { [key: string]: string } = {
      warrior: 'Melee combat specialist with high strength',
      mage: 'Arcane spellcaster with powerful magic',
      rogue: 'Stealth expert with high dexterity',
      cleric: 'Divine healer with wisdom',
      ranger: 'Nature warrior and tracker',
      paladin: 'Holy warrior with divine powers',
      shadowmancer: 'Master of shadow magic',
      'astral monk': 'Meditation and astral projection',
      mindflayer: 'Psionic domination abilities'
    };
    return descriptions[characterClass] || 'Unique abilities';
  };

  if (!options) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 25%, #2a1a1a 50%, #1a0a0a 75%, #0a0a0a 100%)',
        position: 'relative',
        overflow: 'hidden',
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
      {/* Floating Character Assets */}
      {[
        { src: '/assets/characters/dragonborn_male.svg', size: 35, x: 5, y: 15 },
        { src: '/assets/characters/elf_male.svg', size: 32, x: 90, y: 20 },
        { src: '/assets/characters/dwarf_male.svg', size: 32, x: 10, y: 70 },
        { src: '/assets/characters/tiefling_male.svg', size: 33, x: 85, y: 75 },
        { src: '/assets/characters/mage_red.svg', size: 30, x: 15, y: 45 },
        { src: '/assets/characters/orc_male.svg', size: 34, x: 80, y: 50 },
        { src: '/assets/items/sword.svg', size: 25, x: 25, y: 25 },
        { src: '/assets/items/shield.svg', size: 25, x: 70, y: 30 },
        { src: '/assets/items/gem.svg', size: 20, x: 30, y: 80 },
        { src: '/assets/items/potion_health.svg', size: 22, x: 75, y: 85 }
      ].map((asset, i) => (
        <Box
          key={i}
          component="img"
          src={asset.src}
          sx={{
            position: 'absolute',
            width: asset.size,
            height: asset.size,
            opacity: 0.1,
            left: `${asset.x}%`,
            top: `${asset.y}%`,
            animation: `gentleFloat ${8 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            zIndex: 2,
            filter: 'drop-shadow(0 0 8px rgba(204,0,0,0.3))',
            '@keyframes gentleFloat': {
              '0%, 100%': { 
                transform: 'translateY(0px) rotate(0deg) scale(1)', 
                opacity: 0.08 
              },
              '50%': { 
                transform: 'translateY(-10px) rotate(2deg) scale(1.05)', 
                opacity: 0.12 
              }
            }
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 4 }}>
        <Paper
          elevation={10}
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, rgba(26,16,16,0.95) 0%, rgba(42,26,26,0.95) 50%, rgba(26,16,16,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #8B4513',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(139,0,0,0.4), inset 0 0 30px rgba(255,215,0,0.1)'
          }}
        >
          <Box textAlign="center" mb={4}>
            <Box
              component="img"
              src="/assets/ui/logo.svg"
              sx={{
                width: 60,
                height: 60,
                mb: 2,
                filter: 'drop-shadow(0 0 15px rgba(204,0,0,0.8))'
              }}
            />
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontFamily: '"Cinzel", "Times New Roman", serif',
                color: '#FFD700', 
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(255,215,0,0.8)',
                letterSpacing: 1
              }}
            >
              ⚔️ Create Your Character
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Cinzel", "Times New Roman", serif',
                color: '#CD853F',
                fontStyle: 'italic',
                textShadow: '0 0 10px rgba(205,133,63,0.6)'
              }}
            >
              Choose your race, class, and begin your adventure
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Character Name */}
              <Box>
                <TextField
                  fullWidth
                  name="name"
                  label="⚔️ Character Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  helperText="Choose a unique name for your character"
                  inputProps={{
                    autoComplete: 'off',
                    spellCheck: 'false',
                    lang: 'en',
                    pattern: '.*'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(139,69,19,0.2)',
                      border: '1px solid #8B4513',
                      borderRadius: '8px',
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD700',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: '#CD853F'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      color: '#CD853F',
                      '&.Mui-focused': {
                        color: '#FFD700'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#FFD700'
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#CD853F',
                      fontFamily: '"Cinzel", "Times New Roman", serif'
                    }
                  }}
                />
              </Box>

              {/* Race and Class Selection */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Race Selection */}
                <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontFamily: '"Cinzel", "Times New Roman", serif',
                    color: '#FFD700',
                    textShadow: '0 0 15px rgba(255,215,0,0.6)'
                  }}
                >
                  🏰 Choose Race
                </Typography>
                
                {/* Race Type Selector */}
                <Box mb={2}>
                  {Object.keys(options.races).map((type) => (
                    <Chip
                      key={type}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                      onClick={() => setSelectedRaceType(type)}
                      variant={selectedRaceType === type ? 'filled' : 'outlined'}
                      sx={{ 
                        mr: 1, 
                        mb: 1,
                        fontFamily: '"Cinzel", "Times New Roman", serif',
                        backgroundColor: selectedRaceType === type ? '#CC0000' : 'rgba(139,69,19,0.2)',
                        borderColor: selectedRaceType === type ? '#FFD700' : '#8B4513',
                        color: selectedRaceType === type ? '#FFD700' : '#CD853F',
                        '&:hover': {
                          backgroundColor: selectedRaceType === type ? '#FF4444' : 'rgba(205,133,63,0.2)',
                          borderColor: '#FFD700'
                        }
                      }}
                    />
                  ))}
                </Box>

                <FormControl 
                  fullWidth 
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(139,69,19,0.2)',
                      border: '1px solid #8B4513',
                      borderRadius: '8px',
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD700',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      color: '#CD853F',
                      '&.Mui-focused': {
                        color: '#FFD700'
                      }
                    }
                  }}
                >
                  <InputLabel>Race</InputLabel>
                  <Select
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    required
                    disabled={loading}
                    sx={{
                      color: '#FFD700',
                      fontFamily: '"Cinzel", "Times New Roman", serif'
                    }}
                  >
                    {options.races[selectedRaceType]?.map((race: string) => (
                      <MenuItem key={race} value={race}>
                        <Box>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {race.replace('-', ' ')}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getRaceDescription(race)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </Box>

                {/* Class Selection */}
                <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontFamily: '"Cinzel", "Times New Roman", serif',
                    color: '#FFD700',
                    textShadow: '0 0 15px rgba(255,215,0,0.6)'
                  }}
                >
                  ⚔️ Choose Class
                </Typography>
                
                {/* Class Type Selector */}
                <Box mb={2}>
                  {Object.keys(options.classes).map((type) => (
                    <Chip
                      key={type}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                      onClick={() => setSelectedClassType(type)}
                      variant={selectedClassType === type ? 'filled' : 'outlined'}
                      sx={{ 
                        mr: 1, 
                        mb: 1,
                        fontFamily: '"Cinzel", "Times New Roman", serif',
                        backgroundColor: selectedClassType === type ? '#CC0000' : 'rgba(139,69,19,0.2)',
                        borderColor: selectedClassType === type ? '#FFD700' : '#8B4513',
                        color: selectedClassType === type ? '#FFD700' : '#CD853F',
                        '&:hover': {
                          backgroundColor: selectedClassType === type ? '#FF4444' : 'rgba(205,133,63,0.2)',
                          borderColor: '#FFD700'
                        }
                      }}
                    />
                  ))}
                </Box>

                <FormControl 
                  fullWidth 
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(139,69,19,0.2)',
                      border: '1px solid #8B4513',
                      borderRadius: '8px',
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD700',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      color: '#CD853F',
                      '&.Mui-focused': {
                        color: '#FFD700'
                      }
                    }
                  }}
                >
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={formData.characterClass}
                    onChange={(e) => setFormData({ ...formData, characterClass: e.target.value })}
                    required
                    disabled={loading}
                    sx={{
                      color: '#FFD700',
                      fontFamily: '"Cinzel", "Times New Roman", serif'
                    }}
                  >
                    {options.classes[selectedClassType]?.map((characterClass: string) => (
                      <MenuItem key={characterClass} value={characterClass}>
                        <Box>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {characterClass.replace('-', ' ')}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getClassDescription(characterClass)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </Box>
              </Box>

              {/* Character Preview */}
              {formData.race && formData.characterClass && (
                <Box>
                  <Card 
                    sx={{ 
                      background: 'linear-gradient(135deg, rgba(139,69,19,0.3) 0%, rgba(160,82,45,0.2) 100%)',
                      border: '2px solid #FFD700',
                      borderRadius: '12px',
                      boxShadow: '0 8px 20px rgba(255,215,0,0.3)'
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#FFD700',
                          textShadow: '0 0 15px rgba(255,215,0,0.8)'
                        }}
                      >
                        📋 Character Preview
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#CD853F'
                        }}
                      >
                        <strong>Name:</strong> {formData.name || 'Unnamed Hero'}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#CD853F'
                        }}
                      >
                        <strong>Race:</strong> {formData.race.charAt(0).toUpperCase() + formData.race.slice(1)}
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#CD853F'
                        }}
                      >
                        <strong>Class:</strong> {formData.characterClass.charAt(0).toUpperCase() + formData.characterClass.slice(1)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#8B4513', 
                          mt: 1,
                          fontStyle: 'italic'
                        }}
                      >
                        Starting location: Mystic Forest
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>

            <Box mt={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.name || !formData.race || !formData.characterClass}
                sx={{
                  py: 2,
                  fontSize: '1.2rem',
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #8B0000 0%, #CC0000 50%, #FF4444 100%)',
                  border: '2px solid #FFD700',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(139,0,0,0.6), inset 0 0 20px rgba(255,215,0,0.2)',
                  color: '#FFD700',
                  textShadow: '0 0 15px rgba(255,215,0,0.8)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #CC0000 0%, #FF4444 50%, #FF6666 100%)',
                    boxShadow: '0 12px 35px rgba(204,0,0,0.8), inset 0 0 25px rgba(255,215,0,0.3)',
                    transform: 'translateY(-2px)',
                    borderColor: '#FFF'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #444 0%, #666 100%)',
                    boxShadow: 'none',
                    color: '#999',
                    borderColor: '#666'
                  },
                  transition: 'all 0.4s ease'
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#FFD700' }} /> : '🌟 Create Character & Start Adventure'}
              </Button>
            </Box>

            <Box textAlign="center" mt={2}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"Cinzel", "Times New Roman", serif',
                  color: '#CD853F'
                }}
              >
                Already have a character?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#FFD700', 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(255,215,0,0.6)'
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>

        {/* Guide and Powered by Raizo Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 1000
          }}
        >
          {/* Guide Link */}
          <Box
            onClick={() => window.open('/guide', '_blank')}
            sx={{
              width: 140,
              height: 45,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%)',
              border: '3px solid #2E7D32',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 6px 20px rgba(76,175,80,0.4), 0 0 15px rgba(76,175,80,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 50%, #45a049 100%)',
                borderColor: '#81C784',
                transform: 'scale(1.08)',
                boxShadow: '0 8px 25px rgba(76,175,80,0.6), 0 0 20px rgba(76,175,80,0.4)'
              }
            }}
          >
            <Book sx={{ color: '#FFFFFF', fontSize: 20, mr: 1.5, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                textShadow: '0 0 8px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              GUIDE
            </Typography>
          </Box>

          {/* Powered by Raizo Link */}
          <Box
            onClick={() => window.open('https://x.com/WebRaizo', '_blank')}
            sx={{
              width: 140,
              height: 45,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 50%, #F44336 100%)',
              border: '3px solid #B71C1C',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 6px 20px rgba(244,67,54,0.4), 0 0 15px rgba(244,67,54,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 50%, #D32F2F 100%)',
                borderColor: '#EF5350',
                transform: 'scale(1.08)',
                boxShadow: '0 8px 25px rgba(244,67,54,0.6), 0 0 20px rgba(244,67,54,0.4)'
              }
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                fontFamily: '"Cinzel", "Times New Roman", serif',
                textShadow: '0 0 8px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.3)',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              <Box component="span" sx={{ fontSize: '0.55rem' }}>POWERED BY</Box>
              <Box component="div" sx={{ fontSize: '0.8rem', fontWeight: '900' }}>RAIZO</Box>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CharacterCreation;
