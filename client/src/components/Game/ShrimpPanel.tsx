import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  TextField,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  WaterDrop as WaterDropIcon,
  Restaurant as RestaurantIcon,
  CleaningServices as CleaningIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useGame } from '../../contexts/GameContext';

interface ShrimpPanelProps {
  open: boolean;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface ShrimpFarm {
  id: number;
  name: string;
  level: number;
  tank_capacity: number;
  current_shrimp: number;
  water_quality: number;
  food_level: number;
  total_harvested: number;
  experience: number;
  can_level_up: boolean;
  shrimp_value: number;
  harvest_yield: number;
}

const ShrimpPanel: React.FC<ShrimpPanelProps> = ({ open, onClose, showToast }) => {
  const [farm, setFarm] = useState<ShrimpFarm | null>(null);
  const [loading, setLoading] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(5);
  const { updateCharacterData } = useGame();

  const fetchFarmData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetching shrimp farm data
      
      const response = await fetch('/api/shrimp', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
              // Response details
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
              // Content-Type checked
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('🦐 Non-JSON response received:', text.substring(0, 200));
        showToast('Server returned non-JSON response', 'error');
        return;
      }
      
      const data = await response.json();
              // Response data received
      
      if (data.success) {
        setFarm(data.farm);
                  // Farm data set successfully
      } else {
        console.error('🦐 API returned error:', data.message);
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error('🦐 Fetch error:', error);
      showToast('Failed to load farm data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (open) {
      fetchFarmData();
    }
  }, [open, fetchFarmData]);

  const buyShrimp = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shrimp/buy-shrimp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity: buyQuantity })
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        // Update character intent immediately
        if (data.character && data.character.intent !== undefined) {
          updateCharacterData({ intent: data.character.intent });
        }
        fetchFarmData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to buy shrimp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const harvestShrimp = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shrimp/harvest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        // Update character intent immediately
        if (data.character && data.character.intent !== undefined) {
          updateCharacterData({ intent: data.character.intent });
        }
        fetchFarmData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to harvest shrimp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const feedShrimp = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shrimp/feed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        // Update character intent immediately
        if (data.character && data.character.intent !== undefined) {
          updateCharacterData({ intent: data.character.intent });
        }
        fetchFarmData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to feed shrimp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cleanTank = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shrimp/clean', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        // Update character intent immediately
        if (data.character && data.character.intent !== undefined) {
          updateCharacterData({ intent: data.character.intent });
        }
        fetchFarmData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to clean tank', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!farm) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="200px">
            <Box textAlign="center">
              <Box
                component="img"
                src="/assets/items/shrimp_tank.svg"
                alt="Loading"
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mb: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.6, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.1)' },
                    '100%': { opacity: 0.6, transform: 'scale(1)' }
                  }
                }}
              />
              <Typography variant="h6" color="primary.light">
                Loading farm data...
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 50%, #ff3838 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3,
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            component="img"
            src="/assets/items/shrimp_tank.svg"
            alt="Shrimp Farm"
            sx={{ 
              width: 40, 
              height: 40,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              🦐 {farm.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Level {farm.level} • Experience: {farm.experience}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton 
              onClick={fetchFarmData} 
              disabled={loading}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
          {/* Farm Overview */}
          <Box display="flex" flexDirection="row" gap={3} flexWrap="wrap" mb={3}>
            {/* Tank Status */}
            <Fade in timeout={500}>
              <Box flex="1" minWidth="300px">
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      color: '#ff6b6b',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <WaterDropIcon /> Tank Status
                    </Typography>
                    
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Shrimp Population
                        </Typography>
                        <Typography variant="body2" color="primary.light" fontWeight="bold">
                          {farm.current_shrimp}/{farm.tank_capacity}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(farm.current_shrimp / farm.tank_capacity) * 100}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': { 
                            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Water Quality
                        </Typography>
                        <Typography variant="body2" color="primary.light" fontWeight="bold">
                          {farm.water_quality}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={farm.water_quality}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': { 
                            background: farm.water_quality > 70 ? 'linear-gradient(45deg, #00d4ff, #0099cc)' : 
                                       farm.water_quality > 40 ? 'linear-gradient(45deg, #ffd700, #ffb347)' : 
                                       'linear-gradient(45deg, #ff4444, #cc0000)',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Food Level
                        </Typography>
                        <Typography variant="body2" color="primary.light" fontWeight="bold">
                          {farm.food_level}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={farm.food_level}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': { 
                            background: farm.food_level > 70 ? 'linear-gradient(45deg, #32cd32, #228b22)' : 
                                       farm.food_level > 40 ? 'linear-gradient(45deg, #ffd700, #ffb347)' : 
                                       'linear-gradient(45deg, #ff4444, #cc0000)',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Fade>

            {/* Farm Stats */}
            <Fade in timeout={700}>
              <Box flex="1" minWidth="300px">
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      color: '#4ecdc4',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <TrendingUpIcon /> Farm Statistics
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Farm Level:</Typography>
                      <Chip 
                        label={`Level ${farm.level}`} 
                        color="primary" 
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Total Harvested:</Typography>
                      <Typography variant="body2" color="primary.light" fontWeight="bold">
                        {farm.total_harvested} 🦐
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Shrimp Value:</Typography>
                      <Typography variant="body2" color="secondary.light" fontWeight="bold">
                        {farm.shrimp_value} intent each
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="textSecondary">Ready to Harvest:</Typography>
                      <Typography variant="body2" color="success.light" fontWeight="bold">
                        {farm.harvest_yield} 🦐
                      </Typography>
                    </Box>

                    {farm.can_level_up && (
                      <Alert severity="info" sx={{ 
                        mt: 2,
                        background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                        color: 'white',
                        '& .MuiAlert-icon': { color: 'white' }
                      }}>
                        🎉 Farm ready to level up!
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          </Box>

          {/* Actions */}
          <Fade in timeout={900}>
            <Box mb={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#ffa726',
                    fontWeight: 'bold',
                    mb: 3
                  }}>
                    🎮 Farm Actions
                  </Typography>
                  
                  <Box display="flex" flexDirection="row" gap={3} flexWrap="wrap">
                    {/* Buy Shrimp */}
                    <Zoom in timeout={1000}>
                      <Box flex="1" minWidth="200px">
                        <Card sx={{ 
                          background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(238,90,36,0.05) 100%)',
                          border: '1px solid rgba(255,107,107,0.2)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 25px rgba(255,107,107,0.2)'
                          }
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Box
                              component="img"
                              src="/assets/items/shrimp_baby.svg"
                              alt="Baby Shrimp"
                              sx={{ width: 40, height: 40, mb: 2 }}
                            />
                            <Typography variant="h6" gutterBottom color="primary.light">
                              Buy Juveniles
                            </Typography>
                            
                            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                              <IconButton 
                                size="small"
                                onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                                disabled={buyQuantity <= 1}
                                sx={{ color: 'primary.light' }}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <TextField
                                type="number"
                                value={buyQuantity}
                                onChange={(e) => setBuyQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                size="small"
                                inputProps={{
                                  min: 1,
                                  max: 50,
                                  step: 1,
                                  autoComplete: 'off',
                                  spellCheck: 'false',
                                  lang: 'en',
                                  pattern: '[0-9]*'
                                }}
                                sx={{ 
                                  width: '80px',
                                  '& .MuiOutlinedInput-root': {
                                    color: 'primary.light',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                                  }
                                }}
                              />
                              <IconButton 
                                size="small"
                                onClick={() => setBuyQuantity(Math.min(50, buyQuantity + 1))}
                                disabled={buyQuantity >= 50}
                                sx={{ color: 'primary.light' }}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                            
                            <Typography variant="caption" display="block" color="textSecondary" mb={2}>
                              Cost: {buyQuantity * 25} intent
                            </Typography>
                            <Button
                              variant="contained"
                              onClick={buyShrimp}
                              disabled={loading}
                              fullWidth
                              sx={{ 
                                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)'
                                }
                              }}
                            >
                              Buy Juveniles
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    </Zoom>

                    {/* Harvest */}
                    <Zoom in timeout={1200}>
                      <Box flex="1" minWidth="200px">
                        <Card sx={{ 
                          background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(46,125,50,0.05) 100%)',
                          border: '1px solid rgba(76,175,80,0.2)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 25px rgba(76,175,80,0.2)'
                          }
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Box
                              component="img"
                              src="/assets/items/shrimp_adult.svg"
                              alt="Adult Shrimp"
                              sx={{ width: 40, height: 40, mb: 2 }}
                            />
                            <Typography variant="h6" gutterBottom color="success.light">
                              Harvest
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom color="success.light" fontWeight="bold">
                              Ready: {farm.harvest_yield} 🦐
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" mb={2}>
                              Value: {farm.harvest_yield * farm.shrimp_value} intent
                            </Typography>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={harvestShrimp}
                              disabled={loading || farm.harvest_yield === 0}
                              fullWidth
                              sx={{ 
                                background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #2e7d32, #4caf50)'
                                }
                              }}
                            >
                              Harvest
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    </Zoom>

                    {/* Feed */}
                    <Zoom in timeout={1400}>
                      <Box flex="1" minWidth="200px">
                        <Card sx={{ 
                          background: 'linear-gradient(135deg, rgba(255,167,38,0.1) 0%, rgba(255,152,0,0.05) 100%)',
                          border: '1px solid rgba(255,167,38,0.2)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 25px rgba(255,167,38,0.2)'
                          }
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <RestaurantIcon sx={{ fontSize: 40, color: '#ffa726', mb: 2 }} />
                            <Typography variant="h6" gutterBottom color="warning.light">
                              Feed Shrimp
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom color="warning.light" fontWeight="bold">
                              Food: {farm.food_level}%
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" mb={2}>
                              Cost: 10 intent
                            </Typography>
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={feedShrimp}
                              disabled={loading || farm.food_level >= 90}
                              fullWidth
                              sx={{ 
                                background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #f57c00, #ff9800)'
                                }
                              }}
                            >
                              Feed Shrimp
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    </Zoom>

                    {/* Clean */}
                    <Zoom in timeout={1600}>
                      <Box flex="1" minWidth="200px">
                        <Card sx={{ 
                          background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(25,118,210,0.05) 100%)',
                          border: '1px solid rgba(33,150,243,0.2)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 25px rgba(33,150,243,0.2)'
                          }
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <CleaningIcon sx={{ fontSize: 40, color: '#2196f3', mb: 2 }} />
                            <Typography variant="h6" gutterBottom color="info.light">
                              Clean Tank
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom color="info.light" fontWeight="bold">
                              Water: {farm.water_quality}%
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary" mb={2}>
                              Cost: 15 intent
                            </Typography>
                            <Button
                              variant="contained"
                              color="info"
                              onClick={cleanTank}
                              disabled={loading || farm.water_quality >= 90}
                              fullWidth
                              sx={{ 
                                background: 'linear-gradient(45deg, #2196f3, #1976d2)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #1976d2, #2196f3)'
                                }
                              }}
                            >
                              Clean Tank
                            </Button>
                          </CardContent>
                        </Card>
                      </Box>
                    </Zoom>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {/* Farm Visual */}
          <Fade in timeout={1800}>
            <Box>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom textAlign="center" sx={{ 
                    color: '#4ecdc4',
                    fontWeight: 'bold',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <Box
                      component="img"
                      src="/assets/items/shrimp_tank.svg"
                      alt="Farm Icon"
                      sx={{ width: 24, height: 24 }}
                    />
                    Your Shrimp Farm
                  </Typography>
                  
                  {/* Enhanced Aquarium Display */}
                  <Box 
                    sx={{ 
                      minHeight: 300,
                      background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 25%, #90CAF9 50%, #64B5F6 75%, #42A5F5 100%)',
                      borderRadius: '20px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.3)',
                      border: '3px solid rgba(255,255,255,0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    {/* Water Surface Effect */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '20%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                        borderRadius: '17px 17px 0 0',
                        zIndex: 1
                      }}
                    />

                    {/* Main Aquarium Tank */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 200,
                        height: 160,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,248,255,0.8) 100%)',
                        borderRadius: '15px',
                        border: '4px solid #2C3E50',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.1)',
                        zIndex: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Tank Interior Water */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(180deg, #E1F5FE 0%, #B3E5FC 50%, #81D4FA 100%)',
                          borderRadius: '11px',
                          zIndex: 1
                        }}
                      />

                      {/* Tank Frame Details */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          zIndex: 4
                        }}
                      >
                        {Array.from({ length: 4 }).map((_, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#3498DB',
                              borderRadius: '50%',
                              opacity: 0.7
                            }}
                          />
                        ))}
                      </Box>

                      {/* Status Indicator */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: farm.water_quality > 70 && farm.food_level > 70 ? '#2ECC71' : '#E74C3C',
                          borderRadius: '50%',
                          boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                          zIndex: 4,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6, transform: 'scale(1)' },
                            '50%': { opacity: 1, transform: 'scale(1.1)' },
                            '100%': { opacity: 0.6, transform: 'scale(1)' }
                          }
                        }}
                      />

                      {/* Shrimp Inside Tank */}
                      {Array.from({ length: Math.min(farm.current_shrimp, 6) }).map((_, index) => (
                        <Box
                          key={`tank-shrimp-${index}`}
                          component="img"
                          src={index % 2 === 0 ? "/assets/items/shrimp_adult.svg" : "/assets/items/shrimp_baby.svg"}
                          alt="Shrimp"
                          sx={{
                            width: 24,
                            height: 24,
                            position: 'absolute',
                            left: `${20 + (index * 12)}%`,
                            top: `${30 + (index % 3) * 15}%`,
                            animation: 'swim 6s ease-in-out infinite',
                            animationDelay: `${index * 0.8}s`,
                            zIndex: 2,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            '@keyframes swim': {
                              '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                              '25%': { transform: 'translateY(-8px) translateX(5px) rotate(5deg)' },
                              '50%': { transform: 'translateY(-12px) translateX(0px) rotate(0deg)' },
                              '75%': { transform: 'translateY(-8px) translateX(-5px) rotate(-5deg)' }
                            }
                          }}
                        />
                      ))}

                      {/* Bubbles Inside Tank */}
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Box
                          key={`tank-bubble-${index}`}
                          sx={{
                            position: 'absolute',
                            right: `${15 + (index * 8)}%`,
                            top: `${20 + (index % 4) * 12}%`,
                            width: 4 + (index % 3) * 2,
                            height: 4 + (index % 3) * 2,
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            opacity: 0.8,
                            animation: 'tankBubble 4s ease-in-out infinite',
                            animationDelay: `${index * 0.6}s`,
                            zIndex: 2,
                            '@keyframes tankBubble': {
                              '0%': { transform: 'translateY(0px)', opacity: 0.8 },
                              '50%': { transform: 'translateY(-20px)', opacity: 1 },
                              '100%': { transform: 'translateY(-40px)', opacity: 0 }
                            }
                          }}
                        />
                      ))}
                    </Box>

                    {/* Shrimp Swimming Around Tank */}
                    {Array.from({ length: Math.min(farm.current_shrimp, 8) }).map((_, index) => (
                      <Box
                        key={`outside-shrimp-${index}`}
                        component="img"
                        src={index % 2 === 0 ? "/assets/items/shrimp_adult.svg" : "/assets/items/shrimp_baby.svg"}
                        alt="Shrimp"
                        sx={{
                          width: 18,
                          height: 18,
                          position: 'absolute',
                          left: `${10 + (index * 10)}%`,
                          top: `${15 + (index % 5) * 12}%`,
                          animation: 'float 5s ease-in-out infinite',
                          animationDelay: `${index * 0.7}s`,
                          zIndex: 2,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                            '25%': { transform: 'translateY(-12px) translateX(8px) rotate(8deg)' },
                            '50%': { transform: 'translateY(-20px) translateX(0px) rotate(0deg)' },
                            '75%': { transform: 'translateY(-12px) translateX(-8px) rotate(-8deg)' }
                          }
                        }}
                      />
                    ))}
                    
                    {/* Background Bubbles */}
                    {Array.from({ length: 12 }).map((_, index) => (
                      <Box
                        key={`bg-bubble-${index}`}
                        sx={{
                          position: 'absolute',
                          right: `${5 + (index * 7)}%`,
                          top: `${10 + (index % 6) * 10}%`,
                          width: 3 + (index % 4) * 2,
                          height: 3 + (index % 4) * 2,
                          backgroundColor: '#FFFFFF',
                          borderRadius: '50%',
                          opacity: 0.4 + (index % 3) * 0.2,
                          animation: 'backgroundBubble 6s ease-in-out infinite',
                          animationDelay: `${index * 0.5}s`,
                          zIndex: 1,
                          '@keyframes backgroundBubble': {
                            '0%': { transform: 'translateY(0px)', opacity: 0.4 },
                            '50%': { transform: 'translateY(-40px)', opacity: 0.8 },
                            '100%': { transform: 'translateY(-80px)', opacity: 0 }
                          }
                        }}
                      />
                    ))}

                    {/* Seaweed/Plants */}
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Box
                        key={`seaweed-${index}`}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: `${20 + (index * 25)}%`,
                          width: '3px',
                          height: '60px',
                          background: 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)',
                          borderRadius: '2px',
                          animation: 'sway 4s ease-in-out infinite',
                          animationDelay: `${index * 1.5}s`,
                          zIndex: 1,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '20px',
                            left: '-2px',
                            width: '7px',
                            height: '15px',
                            background: '#4CAF50',
                            borderRadius: '50% 50% 0 0',
                            transform: 'rotate(-15deg)'
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '35px',
                            right: '-2px',
                            width: '7px',
                            height: '12px',
                            background: '#2E7D32',
                            borderRadius: '50% 50% 0 0',
                            transform: 'rotate(15deg)'
                          },
                          '@keyframes sway': {
                            '0%, 100%': { transform: 'rotate(-2deg)' },
                            '50%': { transform: 'rotate(2deg)' }
                          }
                        }}
                      />
                    ))}

                    {/* Tank Label */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: '#2C3E50',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 4,
                        border: '2px solid rgba(255,255,255,0.5)'
                      }}
                    >
                      SHRIMP FARM
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ShrimpPanel;
