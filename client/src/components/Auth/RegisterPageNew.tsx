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
import { PersonAdd, Login, Book } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const RegisterPageNew: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        setSuccess('✅ Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
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
      {/* Floating Registration Assets */}
      {[
        { src: '/assets/characters/human_male.svg', size: 35, x: 8, y: 15 },
        { src: '/assets/characters/elf_male.svg', size: 32, x: 88, y: 20 },
        { src: '/assets/characters/dwarf_male.svg', size: 32, x: 12, y: 70 },
        { src: '/assets/characters/halfling_male.svg', size: 30, x: 85, y: 75 },
        { src: '/assets/characters/pet_phoenix_chick.svg', size: 28, x: 15, y: 45 },
        { src: '/assets/characters/pet_crystal_bat.svg', size: 26, x: 80, y: 50 },
        { src: '/assets/items/gem.svg', size: 22, x: 25, y: 25 },
        { src: '/assets/items/coin.svg', size: 20, x: 70, y: 30 },
        { src: '/assets/items/potion.svg', size: 24, x: 30, y: 80 },
        { src: '/assets/items/shield.svg', size: 26, x: 75, y: 85 }
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
            animationDelay: `${i * 0.6}s`,
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
              {/* Title */}
              <Slide direction="down" in timeout={1200}>
                <Box textAlign="center" mb={3}>
                  <Box
                    component="img"
                    src="/assets/ui/logo.svg"
                    sx={{
                      width: 60,
                      height: 60,
                      mb: 2,
                      filter: 'drop-shadow(0 0 15px rgba(204,0,0,0.8))',
                      animation: 'logoGlow 3s ease-in-out infinite',
                      '@keyframes logoGlow': {
                        '0%, 100%': { 
                          filter: 'drop-shadow(0 0 15px rgba(204,0,0,0.8)) brightness(1)' 
                        },
                        '50%': { 
                          filter: 'drop-shadow(0 0 25px rgba(255,68,68,1)) brightness(1.2)' 
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
                      textShadow: '0 0 20px rgba(255,215,0,0.8)',
                      letterSpacing: 1
                    }}
                  >
                    🌟 JOIN THE ADVENTURE
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Cinzel", "Times New Roman", serif',
                      color: '#FF4444', 
                      mt: 1,
                      fontStyle: 'italic',
                      textShadow: '0 0 10px rgba(255,68,68,0.6)'
                    }}
                  >
                    Create your legendary character
                  </Typography>
                </Box>
              </Slide>

              {/* Registration Card */}
              <Slide direction="up" in timeout={1500}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(26,16,16,0.95) 0%, rgba(42,26,26,0.95) 50%, rgba(26,16,16,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid #8B4513',
                    borderRadius: '15px',
                    boxShadow: '0 20px 40px rgba(139,0,0,0.4), inset 0 0 30px rgba(255,215,0,0.1)',
                    maxWidth: 400,
                    width: '100%'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 2,
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid #f44336'
                        }}
                      >
                        {error}
                      </Alert>
                    )}

                    {success && (
                      <Alert 
                        severity="success" 
                        sx={{ 
                          mb: 2,
                          background: 'rgba(76, 175, 80, 0.1)',
                          border: '1px solid #4caf50'
                        }}
                      >
                        {success}
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                          name="email"
                          label="📧 Email Address"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
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
                            }
                          }}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                            name="confirmPassword"
                            label="🔐 Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            inputProps={{
                              autoComplete: 'new-password',
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
                              }
                            }}
                          />
                        </Box>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                          mt: 2,
                          py: 1.8,
                          fontSize: '1.1rem',
                          fontFamily: '"Cinzel", "Times New Roman", serif',
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #8B0000 0%, #CC0000 50%, #FF4444 100%)',
                          border: '2px solid #FFD700',
                          borderRadius: '10px',
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
                        startIcon={<PersonAdd sx={{ color: '#FFD700' }} />}
                      >
                        {loading ? '🌟 Creating Adventurer...' : '⚡ CREATE ACCOUNT'}
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
                      to="/login"
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
                      startIcon={<Login sx={{ color: 'inherit' }} />}
                    >
                      Already have an account? Sign In
                    </Button>
                  </CardContent>
                </Card>
              </Slide>

              {/* Features Grid */}
              <Slide direction="up" in timeout={2500}>
                <Box mt={2}>
                  <Box display="flex" justifyContent="center" gap={1.5} flexWrap="wrap">
                    {[
                      { asset: '/assets/characters/dragonborn_male.svg', title: '21 RACES', desc: 'Choose your heritage', color: '#CC0000' },
                      { asset: '/assets/items/sword.svg', title: '20 CLASSES', desc: 'Master your profession', color: '#228B22' },
                      { asset: '/assets/characters/mage_red.svg', title: '105 QUESTS', desc: 'Epic adventures await', color: '#4169E1' },
                      { asset: '/assets/items/coin.svg', title: 'ECONOMY', desc: 'Trade and prosper', color: '#DAA520' }
                    ].map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          p: 1,
                          background: 'rgba(139,69,19,0.2)',
                          border: `1px solid ${feature.color}`,
                          borderRadius: '8px',
                          minWidth: 85,
                          maxWidth: 95,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 15px ${feature.color}40`,
                            borderColor: '#FFD700'
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={feature.asset}
                          sx={{
                            width: 20,
                            height: 20,
                            mb: 0.3,
                            filter: `drop-shadow(0 0 6px ${feature.color}60)`
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Cinzel", "Times New Roman", serif',
                            color: feature.color, 
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '0.65rem'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: '"Cinzel", "Times New Roman", serif',
                            color: '#8B4513',
                            textAlign: 'center',
                            fontSize: '0.55rem',
                            fontStyle: 'italic'
                          }}
                        >
                          {feature.desc}
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
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPageNew;
