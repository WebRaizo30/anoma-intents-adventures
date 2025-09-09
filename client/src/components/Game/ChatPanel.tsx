import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useGame } from '../../contexts/GameContext';

interface ChatPanelProps {
  onClose: () => void;
  showToast: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose, showToast }) => {
  const [message, setMessage] = useState('');
  const { chatMessages, sendChatMessage, currentRegion } = useGame();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Focus on input when panel opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message.trim());
      setMessage('');
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Paper sx={{ 
      height: '100%', 
      background: '#1a1a1a', 
      border: '1px solid #9c27b0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Chat Header */}
      <Box sx={{ p: 1, borderBottom: '1px solid #333' }}>
        <Typography variant="h6" sx={{ color: '#9c27b0', fontSize: '1rem' }}>
          💬 Region Chat - {currentRegion.charAt(0).toUpperCase() + currentRegion.slice(1)}
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 150 }}>
        <List dense sx={{ p: 0 }}>
          {chatMessages.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    No messages yet. Say hello to other adventurers!
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            chatMessages.map((msg, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box>
                      <Typography 
                        component="span" 
                        variant="body2" 
                        sx={{ 
                          color: '#ff9800', 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      >
                        [{formatTimestamp(msg.timestamp)}] {msg.player}:
                      </Typography>
                      <Typography 
                        component="span" 
                        variant="body2" 
                        sx={{ 
                          ml: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {msg.message}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 1, borderTop: '1px solid #333' }}>
        <form onSubmit={handleSendMessage}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                // Key pressed in chat
                
                // Send message when Enter is pressed
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (message.trim()) {
                    sendChatMessage(message.trim());
                    setMessage('');
                  }
                  return; // Early exit
                }
                
                // Close popup when Escape is pressed
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  return; // Early exit
                }
                
                // Special control for W A S D keys
                if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                  e.stopPropagation(); // Prevent event bubbling
                  // W A S D key captured in chat
                }
                
                // Special control for Space key - allow typing
                if (e.key === ' ') {
                  e.stopPropagation(); // Prevent event bubbling but allow typing
                  // Space key captured in chat
                }
                
                // Allow normal behavior for all other keys
                // Don't call preventDefault()!
              }}
              inputRef={inputRef}
              inputProps={{
                autoComplete: 'off',
                spellCheck: 'false',
                lang: 'en',
                pattern: '.*'
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#9c27b0',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#ffffff',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1
                  }
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!message.trim()}
              sx={{
                background: '#9c27b0',
                '&:hover': {
                  background: '#7b1fa2',
                },
                minWidth: 'auto',
                px: 2
              }}
            >
              📤
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default ChatPanel;
