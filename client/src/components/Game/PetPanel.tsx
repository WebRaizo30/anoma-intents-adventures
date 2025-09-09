import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { Pets, Star } from '@mui/icons-material';
import { gameService } from '../../services/gameService';

interface PetPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const PetPanel: React.FC<PetPanelProps> = ({ onClose, showToast }) => {
  const [pets, setPets] = useState<any[]>([]);
  const [availablePets, setAvailablePets] = useState<any[]>([]);
  const [activePet, setActivePet] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [petDialog, setPetDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedTab === 0) {
      loadPets();
    } else {
      loadAvailablePets();
    }
  }, [selectedTab]);

  const loadPets = async () => {
    try {
      const response = await gameService.getPets();
      if (response.success) {
        setPets(response.pets);
        setActivePet(response.activePet);
      }
    } catch (error) {
      console.error('Failed to load pets:', error);
    }
  };

  const loadAvailablePets = async () => {
    try {
      const response = await gameService.getAvailablePets();
      if (response.success && response.availablePets) {
        // Filter out null pets and ensure canUnlock property exists
        const validPets = response.availablePets
          .filter((pet: any) => pet !== null && pet.id && pet.name)
          .map((pet: any) => ({
            ...pet,
            canUnlock: pet.canUnlock === true
          }));
        setAvailablePets(validPets);
      } else {
        setAvailablePets([]);
      }
    } catch (error) {
      console.error('Failed to load available pets:', error);
      setAvailablePets([]);
    }
  };

  const handleAdoptPet = async (petId: number) => {
    setLoading(true);
    try {
      const response = await gameService.adoptPet(petId);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await loadAvailablePets();
        await loadPets();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Adoption failed');
    } finally {
      setLoading(false);
      setPetDialog(false);
    }
  };

  const handleSetActivePet = async (petId: number) => {
    setLoading(true);
    try {
      const response = await gameService.setActivePet(petId);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await loadPets();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to set active pet');
    } finally {
      setLoading(false);
      setPetDialog(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
      mythical: '#f44336'
    };
    return colors[rarity] || '#9e9e9e';
  };

  const getPetEmoji = (type: string) => {
    const typeEmojis: { [key: string]: string } = {
      companion: '🐺', scout: '🦇', utility: '🐍', stealth: '🐱', tank: '🗿',
      magic: '🔥', aerial: '🦅', shadow: '🌑', wisdom: '🐢', rebirth: '🔥',
      cosmic: '🐲', intent: '✨', growth: '🌱'
    };
    return typeEmojis[type] || '🐾';
  };

  const renderMyPetsTab = () => (
    <Box>
      {activePet && (
        <Card sx={{ mb: 2, background: '#2a2a2a', border: '2px solid #9c27b0' }}>
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
              ⭐ Active Pet
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1">
                {getPetEmoji(activePet.type)} {activePet.name}
              </Typography>
              <Chip
                label={`Lv.${activePet.level}`}
                size="small"
                sx={{ backgroundColor: '#ff9800', color: 'white' }}
              />
            </Box>
            <Typography variant="caption" color="textSecondary">
              {activePet.special_ability}
            </Typography>
          </CardContent>
        </Card>
      )}

      {pets.length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center">
          No pets yet. Adopt your first companion!
        </Typography>
      ) : (
        pets.map((pet) => (
          <Card
            key={pet.id}
            sx={{
              mb: 1,
              background: pet.is_active ? 'rgba(156, 39, 176, 0.2)' : '#2a2a2a',
              border: pet.is_active ? '1px solid #9c27b0' : '1px solid #444',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedPet({ ...pet, isOwned: true });
              setPetDialog(true);
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {getPetEmoji(pet.type)} {pet.name} {pet.is_active && '⭐'}
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip
                      label={pet.rarity}
                      size="small"
                      sx={{
                        backgroundColor: getRarityColor(pet.rarity),
                        color: 'white',
                        fontSize: '0.6rem'
                      }}
                    />
                    <Typography variant="caption">
                      Lv.{pet.level}
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" sx={{ color: '#4caf50' }}>
                    😊 {pet.happiness}/100
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  const renderAvailablePetsTab = () => (
    <Box>
      {availablePets.length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center">
          No new pets available to adopt right now.
        </Typography>
      ) : (
        availablePets.slice(0, 6).filter(pet => pet !== null).map((pet) => {
          const canUnlock = pet.canUnlock === true;
          return (
            <Card
              key={pet.id}
              sx={{
                mb: 1,
                background: canUnlock ? '#2a2a2a' : 'rgba(244, 67, 54, 0.1)',
                border: '1px solid #444',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedPet({ ...pet, isOwned: false, canUnlock });
                setPetDialog(true);
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {getPetEmoji(pet.type)} {pet.name}
                    </Typography>
                    <Chip
                      label={pet.rarity}
                      size="small"
                      sx={{
                        backgroundColor: getRarityColor(pet.rarity),
                        color: 'white',
                        fontSize: '0.6rem'
                      }}
                    />
                  </Box>
                  <Box textAlign="right">
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: canUnlock ? '#4caf50' : '#f44336',
                        fontSize: '0.7rem'
                      }}
                    >
                      {canUnlock ? '✅ Can Adopt' : '🔒 Locked'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );

  return (
    <Paper sx={{ p: 2, height: '100%', background: '#1a1a1a', border: '1px solid #9c27b0', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        🐾 Pet System
      </Typography>

      {message && (
        <Alert 
          severity={message.includes('✅') ? 'success' : 'error'} 
          sx={{ mb: 2, fontSize: '0.8rem' }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: '#9c27b0',
            minHeight: 35,
            fontSize: '0.7rem'
          },
          '& .Mui-selected': {
            color: '#ff9800 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#9c27b0',
          },
        }}
      >
        <Tab icon={<Pets fontSize="small" />} label="My Pets" />
        <Tab icon={<Star fontSize="small" />} label="Adopt" />
      </Tabs>

      {selectedTab === 0 ? renderMyPetsTab() : renderAvailablePetsTab()}

      {/* Pet Details Dialog */}
      <Dialog 
        open={petDialog} 
        onClose={() => setPetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          🐾 Pet Details
        </DialogTitle>
        <DialogContent>
          {selectedPet && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5">
                  {getPetEmoji(selectedPet.type)}
                </Typography>
                <Box>
                  <Typography variant="h6">
                    {selectedPet.name}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={selectedPet.rarity?.toUpperCase() || 'COMMON'}
                      sx={{
                        backgroundColor: getRarityColor(selectedPet.rarity || 'common'),
                        color: 'white'
                      }}
                    />
                    <Chip
                      label={selectedPet.type?.toUpperCase() || 'COMPANION'}
                      variant="outlined"
                      sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body2" paragraph>
                {selectedPet.description}
              </Typography>
              
              <Box mt={2}>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  ✨ Special Ability:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedPet.special_ability}
                </Typography>
              </Box>

              {selectedPet.isOwned && (
                <Box mt={2}>
                  <Typography variant="body2" sx={{ color: '#ff9800' }}>
                    📊 Pet Status:
                  </Typography>
                  <Typography variant="body2">
                    📈 Level: {selectedPet.level}
                  </Typography>
                  <Typography variant="body2">
                    😊 Happiness: {selectedPet.happiness}/100
                  </Typography>
                  <Typography variant="body2">
                    ⭐ Experience: {selectedPet.experience}
                  </Typography>
                </Box>
              )}

              {!selectedPet.isOwned && (
                <Box mt={2}>
                  <Typography variant="body2" sx={{ color: '#ff9800' }}>
                    🔓 Unlock Requirement:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedPet.unlock_requirement}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPetDialog(false)}>
            Close
          </Button>
          
          {selectedPet && selectedPet.isOwned ? (
            <Button 
              onClick={() => selectedPet && handleSetActivePet(selectedPet.id)}
              variant="contained"
              disabled={loading || !selectedPet || selectedPet.is_active}
              sx={{
                background: selectedPet && selectedPet.is_active ? '#666' : '#9c27b0',
              }}
            >
              {selectedPet && selectedPet.is_active ? '⭐ Active' : '🎯 Set Active'}
            </Button>
          ) : (
            <Button 
              onClick={() => selectedPet && handleAdoptPet(selectedPet.id)}
              variant="contained"
              disabled={loading || !selectedPet || !selectedPet.canUnlock}
              sx={{
                background: selectedPet && selectedPet.canUnlock ? '#4caf50' : '#f44336',
              }}
            >
              {loading ? 'Adopting...' : (selectedPet && selectedPet.canUnlock ? '🐾 Adopt' : '🔒 Locked')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PetPanel;
