import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { gameService } from '../../services/gameService';
import { useGame } from '../../contexts/GameContext';

interface RegionPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const RegionPanel: React.FC<RegionPanelProps> = ({ onClose, showToast }) => {
  const { character, currentRegion, moveToRegion } = useGame();
  const [regions, setRegions] = useState<any[]>([]);
  const [regionDetails, setRegionDetails] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [regionDialog, setRegionDialog] = useState(false);

  const loadRegions = useCallback(async () => {
    try {
      const response = await gameService.getRegions();
      if (response.success) {
        setRegions(response.regions);
      }
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  }, []);

  const loadCurrentRegionDetails = useCallback(async () => {
    try {
      const response = await gameService.getRegionDetails(currentRegion);
      if (response.success) {
        setRegionDetails(response);
      }
    } catch (error) {
      console.error('Failed to load region details:', error);
    }
  }, [currentRegion]);

  useEffect(() => {
    loadRegions();
    if (currentRegion) {
      loadCurrentRegionDetails();
    }
  }, [currentRegion, loadRegions, loadCurrentRegionDetails]);

  const handleRegionTravel = (regionName: string) => {
    moveToRegion(regionName);
    setRegionDialog(false);
  };

  const getDifficultyColor = (modifier: number) => {
    if (modifier <= 1.0) return '#4caf50';
    if (modifier <= 1.5) return '#ff9800';
    if (modifier <= 2.0) return '#f44336';
    return '#9c27b0';
  };

  const getDifficultyText = (modifier: number) => {
    if (modifier <= 1.0) return 'Safe';
    if (modifier <= 1.5) return 'Dangerous';
    if (modifier <= 2.0) return 'Deadly';
    return 'Nightmare';
  };

  return (
    <Paper sx={{ 
      p: 2, 
      height: '100%', 
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      overflow: 'visible',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'rgba(255,255,255,0.95)',
          fontWeight: 700,
          mb: 3,
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        🗺️ World Map
      </Typography>

      {/* Current Region Info */}
      <Card sx={{ 
        mb: 3, 
        background: 'rgba(255,255,255,0.08)', 
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '1rem' }}>
            📍 Current: {regionDetails?.region?.display_name || currentRegion}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {regionDetails?.region?.description}
          </Typography>
          
          {regionDetails?.region && (
            <Chip
              label={`${getDifficultyText(regionDetails.region.difficulty_modifier)} (${regionDetails.region.difficulty_modifier}x)`}
              size="small"
              sx={{
                mt: 1,
                backgroundColor: getDifficultyColor(regionDetails.region.difficulty_modifier),
                color: 'white'
              }}
            />
          )}
          
          {regionDetails?.players && regionDetails.players.length > 0 && (
            <Box mt={1}>
              <Typography variant="caption" sx={{ color: '#4caf50' }}>
                👥 {regionDetails.players.length} players online
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Available Regions */}
      <Typography variant="body2" gutterBottom sx={{ color: '#ff9800' }}>
        🌍 Available Regions
      </Typography>
      
      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
        {regions.slice(0, 8).map((region) => (
          <Card
            key={region.id}
            sx={{
              mb: 1,
              background: region.name === currentRegion ? 'rgba(156, 39, 176, 0.2)' : '#2a2a2a',
              border: region.name === currentRegion ? '1px solid #9c27b0' : '1px solid #444',
              cursor: region.name !== currentRegion ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (region.name !== currentRegion) {
                setSelectedRegion(region);
                setRegionDialog(true);
              }
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {region.display_name} {region.name === currentRegion && '📍'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {region.description?.substring(0, 40)}...
                  </Typography>
                </Box>
                <Chip
                  label={getDifficultyText(region.difficulty_modifier)}
                  size="small"
                  sx={{
                    backgroundColor: getDifficultyColor(region.difficulty_modifier),
                    color: 'white',
                    fontSize: '0.6rem'
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Travel Dialog */}
      <Dialog 
        open={regionDialog} 
        onClose={() => setRegionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          🗺️ Travel to Region
        </DialogTitle>
        <DialogContent>
          {selectedRegion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRegion.display_name}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {selectedRegion.description}
              </Typography>
              
              <Box mt={2}>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  ⚠️ Difficulty: {getDifficultyText(selectedRegion.difficulty_modifier)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Enemies will be {Math.round((selectedRegion.difficulty_modifier - 1) * 100)}% stronger
                </Typography>
                
                {character && character.level < 5 && selectedRegion.difficulty_modifier > 1.5 && (
                  <Typography variant="body2" sx={{ color: '#f44336', mt: 1 }}>
                    ⚠️ Warning: This region may be too dangerous for your current level!
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => selectedRegion && handleRegionTravel(selectedRegion.name)}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
            }}
          >
            🚀 Travel Here
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RegionPanel;
