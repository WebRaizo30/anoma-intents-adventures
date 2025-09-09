import React, { useState, useEffect, useCallback } from 'react';
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
import { Inventory, ShoppingCart } from '@mui/icons-material';
import { gameService } from '../../services/gameService';
import { useGame } from '../../contexts/GameContext';

interface InventoryPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ onClose, showToast }) => {
  const { character, refreshCharacter } = useGame();
  const [inventory, setInventory] = useState<any>({});
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemDialog, setItemDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadInventory = useCallback(async () => {
    try {
      const response = await gameService.getInventory();
      if (response.success) {
        setInventory(response.inventory);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  }, []);

  const loadShop = useCallback(async () => {
    try {
      const response = await gameService.getShop();
      if (response.success && response.items) {
        // Filter out null items and ensure all items have required properties
        const validItems = response.items
          .filter((item: any) => item !== null && item.id && item.name)
          .map((item: any) => {
            const shopPrice = item.shop_price || item.value || 0;
            const canAfford = character && character.intent >= shopPrice;
            return {
              ...item,
              can_afford: canAfford,
              shop_price: shopPrice
            };
          });
        setShopItems(validItems);
      } else {
        setShopItems([]);
      }
    } catch (error) {
      console.error('Failed to load shop:', error);
      setShopItems([]);
    }
  }, []);

  useEffect(() => {
    if (selectedTab === 0) {
      loadInventory();
    } else {
      loadShop();
    }
  }, [selectedTab, loadInventory, loadShop]);

  const handleEquipItem = async (itemId: number, equip: boolean) => {
    setLoading(true);
    try {
      const response = await gameService.equipItem(itemId, equip);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await loadInventory();
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Equipment failed');
    } finally {
      setLoading(false);
      setItemDialog(false);
    }
  };

  const handleBuyItem = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await gameService.buyItem(itemId, 1);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await loadShop();
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Purchase failed');
    } finally {
      setLoading(false);
      setItemDialog(false);
    }
  };

  const handleSellItem = async (itemId: number, quantity: number = 1) => {
    setLoading(true);
    try {
      const response = await gameService.sellItem(itemId, quantity);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await loadInventory();
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Sale failed');
    } finally {
      setLoading(false);
      setItemDialog(false);
    }
  };

  const handleUseItem = async (itemId: number, quantity: number = 1) => {
    setLoading(true);
    try {
      const response = await gameService.useItem(itemId, quantity);
      if (response.success) {
        setMessage(`✅ ${response.message} - ${response.effect}`);
        await loadInventory();
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Use failed');
    } finally {
      setLoading(false);
      setItemDialog(false);
    }
  };

  const handleDeleteItem = async (itemId: number, quantity: number = 1) => {
    setLoading(true);
    try {
      const response = await gameService.deleteItem(itemId, quantity);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await loadInventory();
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Delete failed');
    } finally {
      setLoading(false);
      setItemDialog(false);
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

  const renderInventoryTab = () => (
    <Box>
      {Object.keys(inventory).length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Your inventory is empty. Complete quests or visit the shop to get items!
        </Typography>
      ) : (
        Object.keys(inventory).map((category) => (
          <Box key={category} mb={2}>
            <Typography variant="body2" sx={{ color: '#ff9800', textTransform: 'capitalize', mb: 1 }}>
              📦 {category} ({inventory[category].length})
            </Typography>
            
            {inventory[category].map((item: any) => (
              <Card
                key={item.id}
                sx={{
                  mb: 1,
                  background: item.equipped ? 'rgba(156, 39, 176, 0.2)' : '#2a2a2a',
                  border: item.equipped ? '1px solid #9c27b0' : '1px solid #444',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedItem({ ...item, isInventory: true });
                  setItemDialog(true);
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.name} {item.equipped && '⚡'}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={item.rarity}
                          size="small"
                          sx={{
                            backgroundColor: getRarityColor(item.rarity),
                            color: 'white',
                            fontSize: '0.6rem'
                          }}
                        />
                        {item.quantity > 1 && (
                          <Typography variant="caption">
                            x{item.quantity}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                                      <Typography variant="caption" sx={{ color: '#ffd700' }}>
                    🎯 {item.value}
                  </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ))
      )}
    </Box>
  );

  const renderShopTab = () => (
    <Box>
      <Typography variant="body2" color="textSecondary" mb={2}>
        🎯 Your Intent: {character?.intent.toLocaleString() || 0}
      </Typography>
      
      {shopItems.length === 0 ? (
        <Typography variant="body2" color="textSecondary" textAlign="center">
          Shop is empty or loading...
        </Typography>
      ) : (
        shopItems.filter(item => item !== null && item.can_afford !== undefined).map((item) => (
          <Card
            key={item.id}
            sx={{
              mb: 1,
              background: item.can_afford ? '#2a2a2a' : 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #444',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedItem({ 
                ...item, 
                isInventory: false,
                can_afford: item.can_afford === true,
                shop_price: item.shop_price || item.value || 0
              });
              setItemDialog(true);
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.name}
                  </Typography>
                  <Chip
                    label={item.rarity}
                    size="small"
                    sx={{
                      backgroundColor: getRarityColor(item.rarity),
                      color: 'white',
                      fontSize: '0.6rem'
                    }}
                  />
                </Box>
                <Box textAlign="right">
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: item.can_afford ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}
                  >
                    🎯 {item.shop_price}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Lv.{item.level_requirement}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  return (
    <Paper sx={{ 
      p: 2, 
      height: '100%', 
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      overflow: 'auto',
      maxHeight: '70vh',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '4px',
        '&:hover': {
          background: 'rgba(255,255,255,0.5)'
        }
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
        🎒 Inventory & Shop
      </Typography>

      {message && (
        <Alert 
          severity={message.includes('✅') ? 'success' : 'error'} 
          sx={{ 
            mb: 3, 
            fontSize: '0.85rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: message.includes('✅') ? '#81C784' : '#F48FB1'
            }
          }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: 'rgba(255,255,255,0.7)',
            minHeight: 48,
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'rgba(255,255,255,0.9)'
            }
          },
          '& .Mui-selected': {
            color: '#64B5F6 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#64B5F6',
            height: 3,
            borderRadius: '2px'
          },
        }}
      >
        <Tab icon={<Inventory />} label="Inventory" />
        <Tab icon={<ShoppingCart />} label="Shop" />
      </Tabs>

      {selectedTab === 0 ? renderInventoryTab() : renderShopTab()}

      {/* Item Details Dialog */}
      <Dialog 
        open={itemDialog} 
        onClose={() => setItemDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          🎒 Item Details
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  label={selectedItem.rarity?.toUpperCase() || 'COMMON'}
                  sx={{
                    backgroundColor: getRarityColor(selectedItem.rarity || 'common'),
                    color: 'white'
                  }}
                />
                <Chip
                  label={selectedItem.category?.toUpperCase() || 'ITEM'}
                  variant="outlined"
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                />
              </Box>
              
              <Typography variant="body2" paragraph>
                {selectedItem.description}
              </Typography>
              
              {/* Item Stats */}
              <Box mt={2}>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  📊 Stats & Requirements:
                </Typography>
                <Typography variant="body2">
                  🎯 Value: {selectedItem.value} intent
                </Typography>
                <Typography variant="body2">
                  📈 Level Required: {selectedItem.level_requirement}
                </Typography>
                
                {/* Stat bonuses */}
                {selectedItem.strength_bonus > 0 && (
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    💪 +{selectedItem.strength_bonus} Strength
                  </Typography>
                )}
                {selectedItem.dexterity_bonus > 0 && (
                  <Typography variant="body2" sx={{ color: '#4caf50' }}>
                    🏃 +{selectedItem.dexterity_bonus} Dexterity
                  </Typography>
                )}
                {selectedItem.constitution_bonus > 0 && (
                  <Typography variant="body2" sx={{ color: '#ff9800' }}>
                    🛡️ +{selectedItem.constitution_bonus} Constitution
                  </Typography>
                )}
                {selectedItem.intelligence_bonus > 0 && (
                  <Typography variant="body2" sx={{ color: '#2196f3' }}>
                    🧠 +{selectedItem.intelligence_bonus} Intelligence
                  </Typography>
                )}
                {selectedItem.wisdom_bonus > 0 && (
                  <Typography variant="body2" sx={{ color: '#9c27b0' }}>
                    🔮 +{selectedItem.wisdom_bonus} Wisdom
                  </Typography>
                )}
                {selectedItem.charisma_bonus > 0 && (
                  <Typography variant="body2" sx={{ color: '#e91e63' }}>
                    ✨ +{selectedItem.charisma_bonus} Charisma
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog(false)}>
            Close
          </Button>
          
                     {selectedItem && selectedItem.isInventory ? (
             // Inventory item - equip/unequip, use, and sell
             <Box display="flex" gap={1} flexWrap="wrap">
               {/* Equipment button - only for equipment items */}
               {['weapon', 'armor', 'accessory'].includes(selectedItem.category) && (
                 <Button 
                   onClick={() => selectedItem && handleEquipItem(selectedItem.id, !selectedItem.equipped)}
                   variant="contained"
                   disabled={loading || !selectedItem}
                   sx={{
                     background: selectedItem && selectedItem.equipped ? '#f44336' : '#4caf50',
                     '&:hover': {
                       background: selectedItem && selectedItem.equipped ? '#d32f2f' : '#388e3c',
                     }
                   }}
                 >
                   {loading ? 'Processing...' : (selectedItem && selectedItem.equipped ? '❌ Unequip' : '⚡ Equip')}
                 </Button>
               )}
               
               {/* Use button - only for potions and usable items */}
               {['potion'].includes(selectedItem.category) && (
                 <Button 
                   onClick={() => selectedItem && handleUseItem(selectedItem.id, 1)}
                   variant="contained"
                   disabled={loading || !selectedItem}
                   sx={{
                     background: '#9c27b0',
                     '&:hover': {
                       background: '#7b1fa2',
                     }
                   }}
                 >
                   🧪 Use
                 </Button>
               )}
               
                               {/* Sell button - for all items */}
                <Button 
                  onClick={() => selectedItem && handleSellItem(selectedItem.id, 1)}
                  variant="outlined"
                  disabled={loading || !selectedItem}
                  sx={{
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    '&:hover': {
                      borderColor: '#f57c00',
                      backgroundColor: 'rgba(255, 152, 0, 0.1)'
                    }
                  }}
                >
                  💰 Sell
                </Button>
                
                {/* Delete button - for all items */}
                <Button 
                  onClick={() => selectedItem && handleDeleteItem(selectedItem.id, 1)}
                  variant="outlined"
                  disabled={loading || !selectedItem}
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)'
                    }
                  }}
                >
                  🗑️ Delete
                </Button>
             </Box>
           ) : (
            // Shop item - buy
            <Button 
              onClick={() => selectedItem && handleBuyItem(selectedItem.id)}
              variant="contained"
              disabled={loading || !selectedItem || !(selectedItem.can_afford === true)}
              sx={{
                background: selectedItem && selectedItem.can_afford === true ? '#4caf50' : '#f44336',
                '&:hover': {
                  background: selectedItem && selectedItem.can_afford === true ? '#388e3c' : '#d32f2f',
                }
              }}
            >
              {loading ? 'Buying...' : `🎯 Buy (${selectedItem?.shop_price || 0} intent)`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InventoryPanel;
