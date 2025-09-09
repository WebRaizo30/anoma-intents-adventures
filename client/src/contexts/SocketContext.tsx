import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: any[];
  leaveRegion: (regionName: string) => void;
  requestLeaderboard: (type: string) => void;
  requestAllLeaderboards: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Close existing socket if any
      if (socket) {
        socket.close();
        setSocket(null);
      }

      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          username: user.username,
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        
        // Authenticate user and join user room
        if (user && user.id) {
          newSocket.emit('authenticate', { userId: user.id });
        }
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('userJoined', (user) => {
        setOnlineUsers(prev => [...prev, user]);
      });

      newSocket.on('userLeft', (userId) => {
        setOnlineUsers(prev => prev.filter(u => u.playerId !== userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const leaveRegion = (regionName: string) => {
    if (socket) {
      socket.emit('leaveRegion', regionName);
    }
  };



  const requestLeaderboard = (type: string) => {
    if (socket) {
      socket.emit('requestLeaderboard', { type });
    }
  };

  const requestAllLeaderboards = () => {
    if (socket) {
      socket.emit('requestAllLeaderboards');
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    leaveRegion,
    requestLeaderboard,
    requestAllLeaderboards
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
