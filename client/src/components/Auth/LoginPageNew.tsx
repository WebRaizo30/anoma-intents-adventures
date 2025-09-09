import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Divider,
  Fade,
  Slide
} from '@mui/material';
import { Login, PersonAdd, Book } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPageNew: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result) {
        navigate('/game');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Floating Game Assets - More Assets */}
      {[
        { src: '/assets/characters/boss_dragon_wyrmling.svg', size: 45, delay: 0, x: 5, y: 10 },
        { src: '/assets/characters/mage_red.svg', size: 35, delay: 1, x: 85, y: 15 },
        { src: '/assets/items/sword.svg', size: 28, delay: 2, x: 10, y: 60 },
        { src: '/assets/items/shield.svg', size: 28, delay: 0.5, x: 90, y: 65 },
        { src: '/assets/items/gem.svg', size: 22, delay: 1.5, x: 15, y: 35 },
        { src: '/assets/characters/pet_phoenix_chick.svg', size: 32, delay: 2.5, x: 80, y: 40 },
        { src: '/assets/items/potion_health.svg', size: 24, delay: 3, x: 8, y: 80 },
        { src: '/assets/characters/elf_male.svg', size: 32, delay: 1.8, x: 88, y: 85 },
        { src: '/assets/characters/dwarf_male.svg', size: 32, delay: 0.8, x: 12, y: 25 },
        { src: '/assets/items/coin.svg', size: 20, delay: 2.2, x: 85, y: 25 },
        { src: '/assets/characters/orc_male.svg', size: 34, delay: 1.2, x: 20, y: 75 },
        { src: '/assets/characters/halfling_male.svg', size: 30, delay: 2.8, x: 75, y: 70 },
        { src: '/assets/characters/tiefling_male.svg', size: 33, delay: 0.3, x: 25, y: 50 },
        { src: '/assets/characters/dragonborn_male.svg', size: 36, delay: 1.7, x: 70, y: 55 },
        { src: '/assets/characters/pet_crystal_bat.svg', size: 26, delay: 2.1, x: 30, y: 20 },
        { src: '/assets/characters/pet_storm_eagle.svg', size: 28, delay: 0.9, x: 65, y: 30 },
        { src: '/assets/characters/skeleton.svg', size: 30, delay: 1.4, x: 35, y: 85 },
        { src: '/assets/characters/boss_stone_giant.svg', size: 42, delay: 2.6, x: 60, y: 80 }
      ].map((asset, i) => (
        <Box
          key={i}
          component="img"
          src={asset.src}
          sx={{
            position: 'absolute',
            width: asset.size,
            height: asset.size,
            opacity: 0.12,
            left: `${asset.x}%`,
            top: `${asset.y}%`,
            animation: `gentleFloat ${8 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${asset.delay}s`,
            zIndex: 3,
            filter: 'drop-shadow(0 0 10px rgba(204,0,0,0.4))',
            '@keyframes gentleFloat': {
              '0%, 100%': { 
                transform: 'translateY(0px) rotate(0deg) scale(1)', 
                opacity: 0.08 
              },
              '50%': { 
                transform: 'translateY(-12px) rotate(3deg) scale(1.05)', 
                opacity: 0.15 
              }
            }
          }}
        />
      ))}

      {/* Magic Circles and Effects */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 200,
          height: 200,
          border: '2px solid rgba(255,215,0,0.3)',
          borderRadius: '50%',
          animation: 'magicCircle1 12s linear infinite',
          zIndex: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '50%'
          },
          '@keyframes magicCircle1': {
            '0%': { transform: 'rotate(0deg)', opacity: 0.3 },
            '50%': { opacity: 0.6 },
            '100%': { transform: 'rotate(360deg)', opacity: 0.3 }
          }
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 150,
          height: 150,
          border: '2px solid rgba(204,0,0,0.4)',
          borderRadius: '50%',
          animation: 'magicCircle2 15s linear infinite reverse',
          zIndex: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            border: '1px solid rgba(204,0,0,0.3)',
            borderRadius: '50%'
          },
          '@keyframes magicCircle2': {
            '0%': { transform: 'rotate(0deg)', opacity: 0.4 },
            '50%': { opacity: 0.7 },
            '100%': { transform: 'rotate(-360deg)', opacity: 0.4 }
          }
        }}
      />

      {/* Floating Magic Particles */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={`magic-${i}`}
          sx={{
            position: 'absolute',
            width: 4,
            height: 4,
            background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF4444' : '#9932CC',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `magicFloat${i % 3} ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            zIndex: 4,
            boxShadow: `0 0 8px ${i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF4444' : '#9932CC'}`,
            '@keyframes magicFloat0': {
              '0%, 100%': { 
                transform: 'translateY(0px) scale(1)', 
                opacity: 0.6 
              },
              '25%': { 
                transform: 'translateY(-20px) scale(1.2)', 
                opacity: 1 
              },
              '50%': { 
                transform: 'translateY(-40px) scale(1.5)', 
                opacity: 0.8 
              },
              '75%': { 
                transform: 'translateY(-20px) scale(1.2)', 
                opacity: 1 
              }
            },
            '@keyframes magicFloat1': {
              '0%, 100%': { 
                transform: 'translateX(0px) translateY(0px) scale(1)', 
                opacity: 0.5 
              },
              '33%': { 
                transform: 'translateX(15px) translateY(-15px) scale(1.3)', 
                opacity: 0.9 
              },
              '66%': { 
                transform: 'translateX(-15px) translateY(-30px) scale(1.1)', 
                opacity: 0.7 
              }
            },
            '@keyframes magicFloat2': {
              '0%, 100%': { 
                transform: 'rotate(0deg) translateY(0px) scale(1)', 
                opacity: 0.4 
              },
              '50%': { 
                transform: 'rotate(180deg) translateY(-25px) scale(1.4)', 
                opacity: 0.8 
              }
            }
          }}
        />
      ))}

      {/* Magic Sparkles */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={`sparkle-${i}`}
          sx={{
            position: 'absolute',
            left: `${20 + i * 10}%`,
            top: `${15 + i * 8}%`,
            fontSize: '16px',
            color: '#FFD700',
            animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            zIndex: 5,
            textShadow: '0 0 10px rgba(255,215,0,0.8)',
            '@keyframes sparkle': {
              '0%, 100%': { 
                opacity: 0,
                transform: 'scale(0.5) rotate(0deg)'
              },
              '50%': { 
                opacity: 1,
                transform: 'scale(1.2) rotate(180deg)'
              }
            }
          }}
        >
          ✨
        </Box>
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          py={2}
        >
          <Fade in timeout={1000}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Ancient RPG Title */}
              <Slide direction="down" in timeout={1200}>
                <Box textAlign="center" mb={3}>
                  {/* Game Logo & Title */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      component="img"
                      src="/assets/ui/logo.svg"
                      sx={{
                        width: 80,
                        height: 80,
                        filter: 'drop-shadow(0 0 20px rgba(204,0,0,0.8))',
                        animation: 'logoGlow 3s ease-in-out infinite',
                        '@keyframes logoGlow': {
                          '0%, 100%': { 
                            filter: 'drop-shadow(0 0 20px rgba(204,0,0,0.8)) brightness(1)' 
                          },
                          '50%': { 
                            filter: 'drop-shadow(0 0 30px rgba(255,68,68,1)) brightness(1.2)' 
                          }
                        }
                      }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: '"Cinzel", "Times New Roman", serif',
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textShadow: '0 0 15px rgba(255,215,0,0.8)',
                        letterSpacing: 1
                      }}
                    >
                      ANOMA INTENTS
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Cinzel", "Times New Roman", serif',
                        color: '#FF4444',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(255,68,68,0.6)',
                        letterSpacing: 0.5
                      }}
                    >
                      ADVENTURES
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
                  </Box>
                  
                  {/* Minimal Divider */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 2,
                      mb: 2
                    }}
                  >
                    <Box sx={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #CC0000, transparent)' }} />
                    <Box
                      component="img"
                      src="/assets/characters/boss_dragon_wyrmling.svg"
                      sx={{
                        width: 24,
                        height: 24,
                        mx: 2,
                        filter: 'drop-shadow(0 0 8px rgba(204,0,0,0.6))'
                      }}
                    />
                    <Box sx={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #CC0000, transparent)' }} />
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      color: '#FF4444',
                      fontStyle: 'italic',
                      textShadow: '0 0 10px rgba(255,68,68,0.6)'
                    }}
                  >
                    ⚔️ Multiplayer Roguelike RPG ⚔️
                  </Typography>
                </Box>
              </Slide>

              {/* Ancient Tome Login Card */}
              <Slide direction="up" in timeout={1500}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(26,16,16,0.95) 0%, rgba(42,26,26,0.95) 50%, rgba(26,16,16,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid #8B4513',
                    borderRadius: '15px',
                    boxShadow: '0 15px 30px rgba(139,0,0,0.4), 0 0 40px rgba(255,215,0,0.1)',
                    maxWidth: 360,
                    width: '100%',
                    position: 'relative',
                    overflow: 'visible',
                    animation: 'cardGlow 6s ease-in-out infinite',
                    '@keyframes cardGlow': {
                      '0%, 100%': { 
                        boxShadow: '0 15px 30px rgba(139,0,0,0.4), 0 0 40px rgba(255,215,0,0.1)' 
                      },
                      '50%': { 
                        boxShadow: '0 20px 40px rgba(139,0,0,0.6), 0 0 60px rgba(255,215,0,0.2)' 
                      }
                    }
                  }}
                >
                  {/* Corner Asset Decorations */}
                  <Box
                    component="img"
                    src="/assets/items/sword.svg"
                    sx={{
                      position: 'absolute',
                      top: 15,
                      left: 15,
                      width: 20,
                      height: 20,
                      opacity: 0.6,
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
                      transform: 'rotate(-45deg)'
                    }}
                  />
                  <Box
                    component="img"
                    src="/assets/items/shield.svg"
                    sx={{
                      position: 'absolute',
                      top: 15,
                      right: 15,
                      width: 20,
                      height: 20,
                      opacity: 0.6,
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                    }}
                  />
                  <Box
                    component="img"
                    src="/assets/items/gem.svg"
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: 15,
                      width: 18,
                      height: 18,
                      opacity: 0.6,
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                    }}
                  />
                  <Box
                    component="img"
                    src="/assets/items/potion_health.svg"
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      right: 15,
                      width: 18,
                      height: 18,
                      opacity: 0.6,
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                    }}
                  />

                  <CardContent sx={{ p: 2.5 }}>
                    <Box textAlign="center" mb={1.5}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#FFD700', 
                          fontWeight: 'bold',
                          textShadow: '0 0 15px rgba(255,215,0,0.8)',
                          letterSpacing: 1
                        }}
                      >
                        🏰 Enter the Realm
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#CD853F', 
                          mt: 0.5,
                          fontStyle: 'italic',
                          textShadow: '0 0 8px rgba(205,133,63,0.6)'
                        }}
                      >
                        Login to continue your adventure
                      </Typography>
                    </Box>

                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 2,
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid #f44336',
                          '& .MuiAlert-icon': { color: '#f44336' }
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        name="username"
                        label="⚔️ Adventurer Name"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        inputProps={{
                          autoComplete: 'off',
                          spellCheck: 'false',
                          lang: 'en',
                          pattern: '.*'
                        }}
                        sx={{
                          mb: 1.5,
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
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        name="password"
                        label="🔒 Secret Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        inputProps={{
                          autoComplete: 'new-password',
                          spellCheck: 'false',
                          lang: 'en',
                          pattern: '.*'
                        }}
                        sx={{
                          mb: 1.5,
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
                          }
                        }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
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
                            transform: 'translateY(-3px) scale(1.02)',
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
                        startIcon={<Login sx={{ color: '#FFD700' }} />}
                      >
                        {loading ? '🔥 Entering Realm...' : '⚔️ START ADVENTURE'}
                      </Button>
                    </form>

                    <Divider sx={{ my: 2, borderColor: '#8B4513' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          color: '#CD853F',
                          fontWeight: 'bold'
                        }}
                      >
                        OR
                      </Typography>
                    </Divider>

                    <Button
                      component={Link}
                      to="/register"
                      fullWidth
                      variant="outlined"
                      sx={{
                        py: 1.2,
                        fontSize: '1rem',
                        fontFamily: '"Cinzel", "Times New Roman", serif',
                        borderColor: '#CD853F',
                        color: '#CD853F',
                        fontWeight: 'bold',
                        borderWidth: 1,
                        borderRadius: '8px',
                        background: 'rgba(139,69,19,0.1)',
                        '&:hover': {
                          borderColor: '#FFD700',
                          backgroundColor: 'rgba(255,215,0,0.15)',
                          color: '#FFD700',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 15px rgba(205,133,63,0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                      startIcon={<PersonAdd sx={{ color: 'inherit' }} />}
                    >
                      🧙‍♂️ CREATE NEW ADVENTURER
                    </Button>
                  </CardContent>
                </Card>
              </Slide>

                             {/* Game Features */}
               <Slide direction="up" in timeout={2000}>
                 <Box 
                   mt={3} 
                   sx={{
                     background: 'rgba(139,69,19,0.15)',
                     border: '1px solid #8B4513',
                     borderRadius: '12px',
                     p: 3,
                     backdropFilter: 'blur(10px)',
                     boxShadow: '0 8px 25px rgba(139,0,0,0.3)'
                   }}
                 >
                   <Box 
                     display="flex" 
                     justifyContent="center" 
                     gap={1.2} 
                     flexWrap="nowrap"
                     sx={{ 
                       maxWidth: '100%',
                       overflow: 'hidden'
                     }}
                   >
                     {[
                       { asset: '/assets/items/sword.svg', text: 'EPIC COMBAT', color: '#CC0000', icon: '⚔️' },
                       { asset: '/assets/tiles/grass.svg', text: '22 REGIONS', color: '#228B22', icon: '🗺️' },
                       { asset: '/assets/items/gem.svg', text: '750+ ITEMS', color: '#4169E1', icon: '💎' },
                       { asset: '/assets/characters/pet_phoenix_chick.svg', text: 'PET SYSTEM', color: '#FF4500', icon: '🐾' },
                       { asset: '/assets/characters/human_male.svg', text: 'MULTIPLAYER', color: '#DAA520', icon: '👥' },
                       { asset: '/assets/characters/mage_red.svg', text: 'STORY GEN', color: '#9932CC', icon: '📖' }
                     ].map((feature, index) => (
                       <Box
                         key={index}
                         sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           p: 1.5,
                           background: 'rgba(139,69,19,0.3)',
                           border: `2px solid ${feature.color}`,
                           borderRadius: '10px',
                           minWidth: 85,
                           maxWidth: 90,
                           flex: 1,
                           cursor: 'default',
                           position: 'relative',
                           overflow: 'hidden'
                         }}
                       >
                         <Box
                           component="img"
                           src={feature.asset}
                           sx={{
                             width: 26,
                             height: 26,
                             mb: 0.5,
                             filter: `drop-shadow(0 0 8px ${feature.color}80)`,
                             zIndex: 1,
                             position: 'relative'
                           }}
                         />
                         <Typography 
                           variant="caption" 
                           sx={{ 
                             fontFamily: '"Cinzel", "Times New Roman", serif',
                             color: feature.color, 
                             fontWeight: 'bold',
                             textAlign: 'center',
                             fontSize: '0.65rem',
                             lineHeight: 1.2,
                             textShadow: `0 0 5px ${feature.color}60`,
                             zIndex: 1,
                             position: 'relative'
                           }}
                         >
                           {feature.text}
                         </Typography>
                       </Box>
                     ))}
                   </Box>
                 </Box>
               </Slide>

              {/* Guide and Powered by Raizo Buttons */}
              <Box
                sx={{
                  position: 'fixed',
                  bottom: 25,
                  right: 25,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  zIndex: 1000
                }}
              >
                {/* Guide Link */}
                <Box
                  onClick={() => window.open('/guide', '_blank')}
                  sx={{
                    width: 130,
                    height: 42,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%)',
                    border: '2px solid #2E7D32',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.4), 0 0 10px rgba(76,175,80,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 50%, #45a049 100%)',
                      borderColor: '#81C784',
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(76,175,80,0.6), 0 0 15px rgba(76,175,80,0.4)'
                    }
                  }}
                >
                  <Book sx={{ color: '#FFFFFF', fontSize: 18, mr: 1, filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.6))' }} />
                  <Typography
                    sx={{
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      textShadow: '0 0 6px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.3)'
                    }}
                  >
                    GUIDE
                  </Typography>
                </Box>

                {/* Powered by Raizo Link */}
                <Box
                  onClick={() => window.open('https://x.com/WebRaizo', '_blank')}
                  sx={{
                    width: 130,
                    height: 42,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 50%, #F44336 100%)',
                    border: '2px solid #B71C1C',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px rgba(244,67,54,0.4), 0 0 10px rgba(244,67,54,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #D32F2F 0%, #F44336 50%, #D32F2F 100%)',
                      borderColor: '#EF5350',
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 20px rgba(244,67,54,0.6), 0 0 15px rgba(244,67,54,0.4)'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      color: '#FFFFFF',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      textShadow: '0 0 6px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.3)',
                      textAlign: 'center',
                      lineHeight: 1.1
                    }}
                  >
                    <Box component="span" sx={{ fontSize: '0.5rem' }}>POWERED BY</Box>
                    <Box component="div" sx={{ fontSize: '0.75rem', fontWeight: '900' }}>RAIZO</Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPageNew;
