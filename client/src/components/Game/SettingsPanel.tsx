import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Close as CloseIcon,
  VolumeUp as VolumeUpIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose, showToast }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 70,
    musicVolume: 50,
    notificationsEnabled: true,
    darkMode: true,
    language: 'en',
    autoSave: true,
    combatAnimations: true,
    particleEffects: true,
    chatFilter: true,
  });

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('gameSettings', JSON.stringify({
      ...settings,
      [setting]: value
    }));
    
    showToast(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`, 'success');
  };

  const resetSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 70,
      musicVolume: 50,
      notificationsEnabled: true,
      darkMode: true,
      language: 'en',
      autoSave: true,
      combatAnimations: true,
      particleEffects: true,
      chatFilter: true,
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('gameSettings', JSON.stringify(defaultSettings));
    showToast('Settings reset to default', 'success');
  };

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
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3,
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <SettingsIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              ⚙️ Game Settings
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Customize your gaming experience
            </Typography>
          </Box>
        </Box>
        
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
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
          
          {/* Audio Settings */}
          <Fade in timeout={500}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              mb: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#667eea',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}>
                  <VolumeUpIcon /> Audio Settings
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={3}>
                  {/* Sound Toggle */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" color="primary.light" fontWeight="bold">
                        Sound Effects
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Enable game sound effects
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#667eea',
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Sound Volume */}
                  {settings.soundEnabled && (
                    <Zoom in timeout={300}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Sound Volume: {settings.soundVolume}%
                        </Typography>
                        <Slider
                          value={settings.soundVolume}
                          onChange={(_, value) => handleSettingChange('soundVolume', value)}
                          sx={{
                            color: '#667eea',
                            '& .MuiSlider-thumb': {
                              backgroundColor: '#667eea',
                            },
                          }}
                        />
                      </Box>
                    </Zoom>
                  )}
                  
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  
                  {/* Music Toggle */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" color="primary.light" fontWeight="bold">
                        Background Music
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Enable ambient music
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.musicEnabled}
                      onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#667eea',
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Music Volume */}
                  {settings.musicEnabled && (
                    <Zoom in timeout={300}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Music Volume: {settings.musicVolume}%
                        </Typography>
                        <Slider
                          value={settings.musicVolume}
                          onChange={(_, value) => handleSettingChange('musicVolume', value)}
                          sx={{
                            color: '#667eea',
                            '& .MuiSlider-thumb': {
                              backgroundColor: '#667eea',
                            },
                          }}
                        />
                      </Box>
                    </Zoom>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Gameplay Settings */}
          <Fade in timeout={700}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              mb: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#4caf50',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}>
                  <SecurityIcon /> Gameplay Settings
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationsEnabled}
                        onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" color="primary.light" fontWeight="bold">
                          Notifications
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Show game notifications
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" color="primary.light" fontWeight="bold">
                          Auto Save
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Automatically save progress
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.combatAnimations}
                        onChange={(e) => handleSettingChange('combatAnimations', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" color="primary.light" fontWeight="bold">
                          Combat Animations
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Show battle animations
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.particleEffects}
                        onChange={(e) => handleSettingChange('particleEffects', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4caf50',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" color="primary.light" fontWeight="bold">
                          Particle Effects
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Show visual effects
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Interface Settings */}
          <Fade in timeout={900}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              mb: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#ff9800',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}>
                  <LanguageIcon /> Interface Settings
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#ff9800',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#ff9800',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" color="primary.light" fontWeight="bold">
                          Dark Mode
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Use dark theme
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.chatFilter}
                        onChange={(e) => handleSettingChange('chatFilter', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#ff9800',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#ff9800',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" color="primary.light" fontWeight="bold">
                          Chat Filter
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Filter inappropriate messages
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Actions */}
          <Fade in timeout={1100}>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={resetSettings}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#d32f2f',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                Reset to Default
              </Button>
              
              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2 0%, #667eea 100%)'
                  }
                }}
              >
                Save & Close
              </Button>
            </Box>
          </Fade>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
