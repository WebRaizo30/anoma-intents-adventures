import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Slider,
  Tooltip
} from '@mui/material';
import {
  VolumeUp,
  VolumeDown,
  VolumeMute,
  PlayArrow,
  Pause,
  MusicNote
} from '@mui/icons-material';
import { useAudio } from '../../contexts/AudioContext';

interface AudioPanelProps {
  onClose?: () => void;
  showToast?: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AudioPanel: React.FC<AudioPanelProps> = ({ onClose, showToast }) => {
  const { 
    backgroundMusic,
    isMusicPlaying, 
    musicVolume, 
    isMuted, 
    toggleMusic, 
    setMusicVolume, 
    toggleMute,
    testMusic
  } = useAudio();

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volume = Array.isArray(newValue) ? newValue[0] : newValue;
    setMusicVolume(volume / 100);
  };

  const handleMusicToggle = () => {
    toggleMusic();
    showToast?.(
      isMusicPlaying ? '🎵 Music paused' : '🎵 Music playing', 
      'info'
    );
  };

  const handleMuteToggle = () => {
    toggleMute();
    showToast?.(
      isMuted ? '🔊 Audio unmuted' : '🔇 Audio muted', 
      'info'
    );
  };

  return (
    <Paper sx={{ 
      height: '100%', 
      background: '#1a1a1a', 
      border: '1px solid #9c27b0',
      display: 'flex',
      flexDirection: 'column',
      p: 1
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <MusicNote sx={{ color: '#9c27b0', mr: 1 }} />
        <Typography variant="h6" sx={{ color: '#9c27b0', fontSize: '1rem' }}>
          🎵 Audio Controls
        </Typography>
      </Box>

      {/* Music Controls */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 1 }}>
          Background Music
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isMusicPlaying ? "Pause Music" : "Play Music"}>
            <IconButton
              onClick={handleMusicToggle}
              sx={{ 
                color: isMusicPlaying ? '#4caf50' : '#9e9e9e',
                '&:hover': { color: '#9c27b0' }
              }}
            >
              {isMusicPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton
              onClick={handleMuteToggle}
              sx={{ 
                color: isMuted ? '#f44336' : '#ffffff',
                '&:hover': { color: '#9c27b0' }
              }}
            >
              {isMuted ? <VolumeMute /> : <VolumeUp />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Volume Control */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#ffffff', mb: 1 }}>
          Volume: {Math.round(musicVolume * 100)}%
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeDown sx={{ color: '#9e9e9e', fontSize: 18 }} />
          
          <Slider
            value={musicVolume * 100}
            onChange={handleVolumeChange}
            disabled={isMuted}
            min={0}
            max={100}
            step={5}
            sx={{
              color: '#9c27b0',
              '& .MuiSlider-thumb': {
                backgroundColor: '#9c27b0',
                '&:hover': {
                  boxShadow: '0px 0px 0px 8px rgba(156, 39, 176, 0.16)',
                },
              },
              '& .MuiSlider-track': {
                backgroundColor: '#9c27b0',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#333',
              },
            }}
          />
          
          <VolumeUp sx={{ color: '#9e9e9e', fontSize: 18 }} />
        </Box>
      </Box>

      {/* Music Info */}
      <Box sx={{ 
        mt: 'auto', 
        p: 1, 
        background: '#2a2a2a', 
        borderRadius: 1,
        border: '1px solid #333'
      }}>
        <Typography variant="caption" sx={{ color: '#9e9e9e', display: 'block' }}>
          🎼 Now Playing:
        </Typography>
        <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
          Journey Theme
        </Typography>
        <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
          Status: {isMusicPlaying ? (isMuted ? 'Muted' : 'Playing') : 'Paused'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.6rem', mt: 0.5 }}>
          Debug: ReadyState {backgroundMusic?.readyState || 'N/A'} | 
          Volume {Math.round((backgroundMusic?.volume || 0) * 100)}% |
          Paused {backgroundMusic?.paused ? 'Yes' : 'No'} |
          Muted {backgroundMusic?.muted ? 'Yes' : 'No'}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Tooltip title="Test Music File">
            <IconButton
              size="small"
              onClick={testMusic}
              sx={{ 
                color: '#9c27b0',
                fontSize: '0.7rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              Test
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
        <Tooltip title="Set to 20% (Default)">
          <IconButton
            size="small"
            onClick={() => setMusicVolume(0.2)}
            sx={{ 
              color: musicVolume === 0.2 ? '#9c27b0' : '#9e9e9e',
              fontSize: '0.7rem',
              minWidth: 'auto',
              px: 1
            }}
          >
            20%
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Set to 50%">
          <IconButton
            size="small"
            onClick={() => setMusicVolume(0.5)}
            sx={{ 
              color: musicVolume === 0.5 ? '#9c27b0' : '#9e9e9e',
              fontSize: '0.7rem',
              minWidth: 'auto',
              px: 1
            }}
          >
            50%
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Set to 100%">
          <IconButton
            size="small"
            onClick={() => setMusicVolume(1.0)}
            sx={{ 
              color: musicVolume === 1.0 ? '#9c27b0' : '#9e9e9e',
              fontSize: '0.7rem',
              minWidth: 'auto',
              px: 1
            }}
          >
            100%
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default AudioPanel;
