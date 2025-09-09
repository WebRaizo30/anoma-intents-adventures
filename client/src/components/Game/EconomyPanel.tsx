import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { AccountBalance, Send, Work } from '@mui/icons-material';
import { gameService } from '../../services/gameService';
import { useGame } from '../../contexts/GameContext';

interface EconomyPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const EconomyPanel: React.FC<EconomyPanelProps> = ({ onClose, showToast }) => {
  const { character, refreshCharacter } = useGame();
  const [selectedTab, setSelectedTab] = useState(0);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [transferDialog, setTransferDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedTab === 0) {
      loadBankInfo();
    }
  }, [selectedTab]);

  const loadBankInfo = async () => {
    try {
      const response = await gameService.getBankInfo();
      if (response.success) {
        setBankInfo(response.banking);
      }
    } catch (error) {
      console.error('Failed to load bank info:', error);
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget || !transferAmount) {
      setMessage('❌ Please enter both target username and amount');
      return;
    }

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('❌ Please enter a valid amount');
      return;
    }

    // Trim username and log for debugging
    const trimmedUsername = transferTarget.trim();
    // Attempting transfer

    setLoading(true);
    try {
      const response = await gameService.transferIntent(trimmedUsername, amount);
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        setTransferAmount('');
        setTransferTarget('');
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error: any) {
      console.error('Transfer error details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setMessage(`❌ ${error.response.data.message || 'Transfer failed'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setMessage('❌ Network error - please check your connection');
      } else {
        console.error('Error message:', error.message);
        setMessage('❌ Transfer failed - please try again');
      }
    } finally {
      setLoading(false);
      setTransferDialog(false);
    }
  };

  const handleWork = async () => {
    setLoading(true);
    try {
      const response = await gameService.work();
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Work failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDaily = async () => {
    setLoading(true);
    try {
      const response = await gameService.collectDaily();
      if (response.success) {
        setMessage(`✅ ${response.message}`);
        await refreshCharacter();
      } else {
        setMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setMessage('❌ Daily collection failed');
    } finally {
      setLoading(false);
    }
  };

  const renderBankTab = () => (
    <Box>
      {bankInfo ? (
        <Box>
          <Card sx={{ mb: 2, background: '#2a2a2a', border: '1px solid #ffd700' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body1" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
                🏦 {bankInfo.race.charAt(0).toUpperCase() + bankInfo.race.slice(1)} Bank
              </Typography>
              <Typography variant="body2">
                🎯 Intent: {bankInfo.intent.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                💎 {bankInfo.currency_name}: {bankInfo.racial_currency.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Exchange Rate: 1 intent = {bankInfo.exchange_rate} {bankInfo.currency_name}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="body2" gutterBottom sx={{ color: '#ff9800' }}>
            🏦 Banking Services
          </Typography>
          
          {bankInfo.services.map((service: string, index: number) => (
            <Typography key={index} variant="body2" color="textSecondary">
              • {service}
            </Typography>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          Loading bank information...
        </Typography>
      )}
    </Box>
  );

  const renderTransferTab = () => (
    <Box>
      <Typography variant="body2" gutterBottom sx={{ color: '#ff9800' }}>
        💸 Transfer Intent to Player
      </Typography>
      
      <Typography variant="body2" color="textSecondary" mb={2}>
        Your Intent: {character?.intent.toLocaleString() || 0}
      </Typography>

             <TextField
         fullWidth
         size="small"
         label="Target Username"
         value={transferTarget}
         onChange={(e) => setTransferTarget(e.target.value)}
                       onKeyDown={(e) => {
                // Special control for W A S D keys
                if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                  e.stopPropagation(); // Prevent event bubbling
                  // W A S D key captured in economy username field
                }
              }}
         sx={{ mb: 2 }}
       />

       <TextField
         fullWidth
         size="small"
         label="Amount"
         type="number"
         value={transferAmount}
         onChange={(e) => setTransferAmount(e.target.value)}
                   onKeyDown={(e) => {
            // Special control for W A S D keys
            if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
              e.stopPropagation(); // Prevent event bubbling
              // W A S D key captured in economy amount field
            }
          }}
         sx={{ mb: 2 }}
       />

      <Button
        fullWidth
        variant="contained"
        onClick={() => setTransferDialog(true)}
        disabled={loading || !transferTarget || !transferAmount}
        sx={{
          background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
          }
        }}
              >
          💸 Transfer Intent
        </Button>
    </Box>
  );

  const renderWorkTab = () => (
    <Box>
      <Typography variant="body2" gutterBottom sx={{ color: '#ff9800' }}>
        💼 Work & Income
      </Typography>
      
      <Card sx={{ mb: 2, background: '#2a2a2a' }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="body2" gutterBottom>
            🎯 Daily Intent: Available every 24 hours
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDaily}
            disabled={loading}
            sx={{ mb: 2, borderColor: '#ffd700', color: '#ffd700' }}
          >
            🎯 Collect Daily (100+ intent)
          </Button>
          
          <Typography variant="body2" gutterBottom>
            🔨 Work: Available every hour
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleWork}
            disabled={loading}
            sx={{ borderColor: '#ff9800', color: '#ff9800' }}
          >
            🔨 Work for Intent
          </Button>
        </CardContent>
      </Card>
      
      <Typography variant="caption" color="textSecondary">
        Work earnings increase with your level!
      </Typography>
    </Box>
  );

  return (
    <Paper 
      sx={{ p: 2, height: '100%', background: '#1a1a1a', border: '1px solid #9c27b0', overflow: 'auto' }}
      onKeyDown={(e) => {
        // Special control for W A S D keys
        if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
          e.stopPropagation(); // Prevent event bubbling
          // W A S D key captured in economy
        }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#9c27b0' }}>
        💰 Economy
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
            fontSize: '0.7rem',
            minWidth: 'auto'
          },
          '& .Mui-selected': {
            color: '#ff9800 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#9c27b0',
          },
        }}
      >
        <Tab icon={<AccountBalance fontSize="small" />} label="Bank" />
        <Tab icon={<Send fontSize="small" />} label="Transfer" />
        <Tab icon={<Work fontSize="small" />} label="Work" />
      </Tabs>

      {selectedTab === 0 && renderBankTab()}
      {selectedTab === 1 && renderTransferTab()}
      {selectedTab === 2 && renderWorkTab()}

      {/* Transfer Confirmation Dialog */}
      <Dialog 
        open={transferDialog} 
        onClose={() => setTransferDialog(false)}
      >
        <DialogTitle sx={{ color: '#9c27b0' }}>
          💸 Confirm Transfer
        </DialogTitle>
        <DialogContent>
          <Typography>
            Transfer {transferAmount} intent to {transferTarget}?
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer}
            variant="contained"
            disabled={loading}
            sx={{ background: '#4caf50' }}
          >
            {loading ? 'Transferring...' : 'Confirm Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EconomyPanel;
