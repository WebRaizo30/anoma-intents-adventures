import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Book, Link as LinkIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData.username, formData.email, formData.password);
      
      if (success) {
        navigate('/character/create');
      } else {
        setError('Registration failed. Username or email may already exist.');
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
        background: 'linear-gradient(45deg, #0a0a0a 30%, #1a1a1a 90%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '1px solid #9c27b0'
          }}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
              🌟 Join the Adventure
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Create your account and begin your journey
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              helperText="3-50 characters, alphanumeric only"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#9c27b0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#9c27b0',
                },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#9c27b0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#9c27b0',
                },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              helperText="Minimum 6 characters"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#9c27b0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#9c27b0',
                },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#9c27b0',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#9c27b0',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7b1fa2 30%, #c2185b 90%)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : '🛡️ Create Account'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#9c27b0', 
                    textDecoration: 'none',
                    fontWeight: 'bold'
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

export default RegisterPage;
