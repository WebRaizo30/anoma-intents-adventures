import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Components
import LoginPageNew from './components/Auth/LoginPageNew';
import RegisterPageNew from './components/Auth/RegisterPageNew';
import GameDashboard from './components/Game/GameDashboard';
import GameWorldNew from './components/Game/GameWorldNew';
import CharacterCreation from './components/Character/CharacterCreation';
import GuidePage from './components/Guide/GuidePage';
import { GameProvider } from './contexts/GameContext';
import { SocketProvider } from './contexts/SocketContext';
import { AudioProvider } from './contexts/AudioContext';

// Services
import { authService } from './services/authService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create fantasy theme to match project visuals
const fantasyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#CC0000', // Kırmızı (logo'dan)
    },
    secondary: {
      main: '#00FF00', // Yeşil (karakter gözlerinden)
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(20, 20, 20, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC'
    }
  },
  typography: {
    fontFamily: '"Cinzel", "Georgia", serif', // Fantasy font
    h4: {
      fontWeight: 'bold',
    },
    h5: {
      fontWeight: 'bold',
    }
  },
});

// Main App component
function App() {
  return (
    <ThemeProvider theme={fantasyTheme}>
      <CssBaseline />
      <AuthProvider>
        <AudioProvider>
          <Router>
            <Box sx={{ height: '100vh', overflow: 'hidden' }}>
              <AppRoutes />
            </Box>
          </Router>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Routes component
function AppRoutes() {
  const { user, loading } = useAuth();
  const [hasCharacter, setHasCharacter] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkCharacterExists();
    }
  }, [user]);

  const checkCharacterExists = async () => {
    try {
      const response = await authService.getProfile();
      setHasCharacter(response.success);
    } catch (error) {
      setHasCharacter(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        sx={{ background: 'linear-gradient(45deg, #0a0a0a 30%, #1a1a1a 90%)' }}
      >
        <div style={{ color: '#9c27b0', fontSize: '24px' }}>
          🌟 Loading Anoma Intents Adventures BETA...
        </div>
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!user ? <LoginPageNew /> : <Navigate to="/game" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <RegisterPageNew /> : <Navigate to="/game" replace />} 
      />

      {/* Protected routes */}
      <Route 
        path="/character/create" 
        element={
          user ? (
            hasCharacter === false ? (
              <CharacterCreation onCharacterCreated={() => setHasCharacter(true)} />
            ) : (
              <Navigate to="/game" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/game" 
        element={
          user ? (
            hasCharacter === true ? (
              <SocketProvider>
                <GameProvider>
                  <GameWorldNew />
                </GameProvider>
              </SocketProvider>
            ) : hasCharacter === false ? (
              <Navigate to="/character/create" replace />
            ) : (
              <div>Loading character...</div>
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          user ? (
            hasCharacter === true ? (
              <SocketProvider>
                <GameProvider>
                  <GameDashboard />
                </GameProvider>
              </SocketProvider>
            ) : (
              <Navigate to="/character/create" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route 
        path="/guide" 
        element={<GuidePage />} 
      />

      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          user ? (
            hasCharacter === true ? (
              <Navigate to="/game" replace />
            ) : hasCharacter === false ? (
              <Navigate to="/character/create" replace />
            ) : (
              <div>Loading...</div>
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;