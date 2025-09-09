const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5000",
    methods: ["GET", "POST"]
  }
});

// Global players listesi - server scope'unda tut
const connectedPlayers = new Map();

// Inactivity timeout system
const inactivityTimeouts = new Map();
const INACTIVITY_TIMEOUT = process.env.INACTIVITY_TIMEOUT ? parseInt(process.env.INACTIVITY_TIMEOUT) : 5 * 60 * 1000; // Default 5 minutes

// Inactivity timeout function
const handleInactivityTimeout = (socketId) => {
  if (connectedPlayers.has(socketId)) {
    const playerData = connectedPlayers.get(socketId);
    connectedPlayers.delete(socketId);
    inactivityTimeouts.delete(socketId);
    
    // Remove player from game
    io.to(socketId).emit('forceLogout', {
      reason: 'inactivity',
      message: 'You have been logged out due to inactivity.'
    });
    
    // Notify other players
    socket.to('global_map').emit('playerLeft', {
      playerId: socketId,
      character: playerData.character
    });
    
    // Update online users list
    const allPlayers = Array.from(connectedPlayers.values());
    io.emit('onlineUsers', allPlayers);
    
    logger.info(`🔒 Player ${playerData.character?.name || socketId} logged out due to inactivity (timeout: ${INACTIVITY_TIMEOUT/1000}s)`);
  }
};

// Activity reset function
const resetInactivityTimeout = (socketId) => {
  // Clear existing timeout
  if (inactivityTimeouts.has(socketId)) {
    clearTimeout(inactivityTimeouts.get(socketId));
  }
  
  // Set new timeout
  const timeoutId = setTimeout(() => handleInactivityTimeout(socketId), INACTIVITY_TIMEOUT);
  inactivityTimeouts.set(socketId, timeoutId);
};

// Leaderboard cache and update system
const leaderboardCache = {
  level: [],
  intent: [],
  quests: [],
  lastUpdate: null
};

// Leaderboard update function
const updateLeaderboard = async (type) => {
  try {
    const { sequelize } = require('./config/database/connection');
    let query;
    
    switch (type) {
      case 'level':
        query = `
          SELECT 
            c.name,
            c.race,
            c.class,
            c.level,
            c.experience,
            ROW_NUMBER() OVER (ORDER BY c.level DESC, c.experience DESC) as rank
          FROM characters c
          ORDER BY c.level DESC, c.experience DESC
          LIMIT 50
        `;
        break;
        
      case 'intent':
        query = `
          SELECT 
            c.name,
            c.race,
            c.class,
            c.intent,
            ROW_NUMBER() OVER (ORDER BY c.intent DESC) as rank
          FROM characters c
          ORDER BY c.intent DESC
          LIMIT 50
        `;
        break;
        
      case 'quests':
        query = `
          SELECT 
            c.name,
            c.race,
            c.class,
            COUNT(cq.id) as quests_completed,
            ROW_NUMBER() OVER (ORDER BY COUNT(cq.id) DESC) as rank
          FROM characters c
          LEFT JOIN character_quests cq ON c.id = cq.character_id AND cq.status = 'completed'
          GROUP BY c.id, c.name, c.race, c.class
          ORDER BY quests_completed DESC
          LIMIT 50
        `;
        break;
        
      default:
        return;
    }

    const [leaderboard] = await sequelize.query(query);
    leaderboardCache[type] = leaderboard;
    leaderboardCache.lastUpdate = new Date();
    
    // Send real-time update to all connected players
    io.emit('leaderboardUpdate', {
      type: type,
      leaderboard: leaderboard,
      timestamp: new Date()
    });
    
    // Leaderboard updated silently
  } catch (error) {
    logger.error(`❌ Error updating leaderboard ${type}:`, error);
  }
};

// Update all leaderboards
const updateAllLeaderboards = async () => {
  await Promise.all(['level', 'intent', 'quests'].map(type => updateLeaderboard(type)));
};

// Security middleware
app.use(helmet());

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://playanoma.fun'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error: 'Rate limit exceeded',
    message: 'Please wait a moment before trying again. You can continue collecting items shortly.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
const { initializeDatabase } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const questRoutes = require('./routes/quest');
const inventoryRoutes = require('./routes/inventory');
const economyRoutes = require('./routes/economy');
const gameRoutes = require('./routes/game');
const combatRoutes = require('./routes/combat');
const petRoutes = require('./routes/pets');
const shrimpRoutes = require('./routes/shrimp');
const storyRoutes = require('./routes/story');

// Routes loaded silently

// Initialize database on startup
initializeDatabase();

// API Routes
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/combat', combatRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/shrimp', shrimpRoutes);
app.use('/api/story', storyRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  // New client connected silently

  // Handle user authentication and join user room
  socket.on('authenticate', (data) => {
    if (data.userId) {
      socket.userId = data.userId;
      socket.join(`user_${data.userId}`);
      // User authenticated silently
    }
  });

  // Join region room - optimized for performance
  socket.on('joinRegion', (data) => {
    
    const regionName = typeof data === 'string' ? data : data.region;
    const character = typeof data === 'object' ? data.character : null;
    
    // Player joining region silently
    
    // Join region-specific room for better performance
    socket.join(`region_${regionName}`);
    
    // Store character data in socket - update if we have more complete data
    if (character && (!socket.character || character.name)) {
      socket.character = character;
      // Character data updated silently
    }
    socket.currentRegion = regionName;
    
    // Set initial position
    socket.lastPosition = { x: 400, y: 300 };
    
    // Player joined region silently
    
    // Update or add player to global list
    connectedPlayers.set(socket.id, {
      playerId: socket.id,
      region: regionName,
      character: socket.character, // Use the stored character data
      position: { x: 400, y: 300 } // Default position
    });
    
    // Start inactivity timeout
    resetInactivityTimeout(socket.id);
    
    // Send updated list to all players
    const allPlayers = Array.from(connectedPlayers.values());
    io.emit('onlineUsers', allPlayers);
    
    // Notify other players in the same region about new player
    if (socket.character) {
      socket.to(`region_${regionName}`).emit('playerJoined', {
        playerId: socket.id,
        region: regionName,
        character: socket.character,
        position: socket.lastPosition || { x: 400, y: 300 } // Use last known position or default
      });
    }
    
    // Send current players in the same region to new player
    const currentPlayers = [];
    io.sockets.sockets.forEach((clientSocket) => {
      if (clientSocket.id !== socket.id && 
          clientSocket.character && 
          clientSocket.currentRegion === regionName) {
        currentPlayers.push({
          playerId: clientSocket.id,
          region: clientSocket.currentRegion,
          character: clientSocket.character,
          position: clientSocket.lastPosition || { x: 400, y: 300 } // Use last known position or default
        });
      }
    });
    
    // Sending current players to new player silently
    socket.emit('currentPlayers', currentPlayers);
  });

  // Handle player movement - optimized for performance
  socket.on('playerMove', (data) => {
    
    // Update character data if provided
    if (data.character) {
      socket.character = data.character;
    }
    
    // Update region if provided
    if (data.region && data.region !== socket.currentRegion) {
      // Leave old region room if different
      if (socket.currentRegion) {
        socket.leave(`region_${socket.currentRegion}`);
        console.log(`🔄 Player ${socket.id} left region ${socket.currentRegion}`);
      }
      
      // Join new region room
      socket.join(`region_${data.region}`);
      socket.currentRegion = data.region;
      console.log(`🔄 Player ${socket.id} joined region ${data.region}`);
    }
    
    if (data.position) {
      // Store the last position for this player
      socket.lastPosition = data.position;
      
      // Update connected players map
      if (connectedPlayers.has(socket.id)) {
        const playerData = connectedPlayers.get(socket.id);
        playerData.position = data.position;
        playerData.region = data.region || socket.currentRegion;
        // Update character data if we have it
        if (socket.character) {
          playerData.character = socket.character;
        }
        
        // Reset inactivity timeout (player moved)
        resetInactivityTimeout(socket.id);
      }
      
      // Only broadcast if we have character data
      if (socket.character) {
        // Player moved silently
        
        // Broadcast to other players in the same region only with improved reliability
        const playerMovedData = {
          playerId: socket.id,
          position: data.position,
          character: socket.character,
          region: socket.currentRegion,
          timestamp: Date.now() // Add timestamp for better sync
        };
        
        socket.to(`region_${socket.currentRegion}`).emit('playerMoved', playerMovedData);
        
        // Log occasionally for debugging
        if (Math.random() < 0.05) { // 5% chance to log
          console.log(`📍 Player ${socket.id} moved to:`, data.position);
          console.log(`📤 Broadcasting playerMoved to region ${socket.currentRegion}:`, playerMovedData);
        }
      } else {
        // Player movement received but no character data - position stored but not broadcast
        console.log(`⚠️ Player movement without character data: ${socket.id}`);
        console.log(`⚠️ Available data:`, { position: data.position, region: data.region, character: socket.character });
      }
    } else {
      // Player movement received but no position data
      console.log(`⚠️ Player movement without position data: ${socket.id}`);
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (data) => {
    // Chat message handled silently
    
    // Send chat message to players in the same region only
    io.to(`region_${data.region}`).emit('newChatMessage', {
      player: data.player,
      message: data.message,
      timestamp: data.timestamp || new Date()
    });
  });

  // Handle region leaving
  socket.on('leaveRegion', (regionName) => {
    // Leave the region room
    socket.leave(`region_${regionName}`);
    
    // Remove player from connected players list
    connectedPlayers.delete(socket.id);
    
    // Notify other players in the region that this player left
    socket.to(`region_${regionName}`).emit('playerLeft', {
      playerId: socket.id,
      region: regionName
    });
    
    // Update online users list
    const allPlayers = Array.from(connectedPlayers.values());
    io.emit('onlineUsers', allPlayers);
  });

  // Handle quest events
  socket.on('questStarted', (data) => {
    socket.to(`region_${data.region}`).emit('questEvent', {
      type: 'started',
      player: data.player,
      quest: data.quest
    });
  });

  // Handle player stats updates (from boss fights, etc.)
  socket.on('updatePlayerStats', async (data) => {
    // Player stats update handled silently
    
    try {
      if (socket.character && socket.character.id) {
        // Update character in database
        const { Character } = require('./models');
        const character = await Character.findByPk(socket.character.id);
        
        if (character) {
          // Update health and gold if provided
          if (data.health !== undefined) {
            character.health = Math.max(0, data.health);
          }
          if (data.gold !== undefined) {
            character.gold = Math.max(0, data.gold);
          }
          
          await character.save();
          // Character stats updated silently
          
          // Update socket character data
          socket.character = character.toJSON();
        }
      }
    } catch (error) {
      logger.error('❌ Error updating player stats:', error);
    }
  });

  // Party system events
  socket.on('partyInvite', (data) => {
    // Party invite handled silently
    // Find target player's socket and send invite
    const targetSocket = [...io.sockets.sockets.values()]
      .find(s => s.handshake.auth.username === data.targetUsername);
    
    if (targetSocket) {
      targetSocket.emit('partyInviteReceived', {
        from: data.fromPlayer,
        fromSocketId: socket.id,
        message: `${data.fromPlayer} invited you to join their party!`
      });
    } else {
      // Target player not found
    }
  });

  socket.on('partyInviteResponse', (data) => {
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    if (targetSocket) {
      targetSocket.emit('partyInviteResult', {
        accepted: data.accepted,
        player: data.player,
        message: data.accepted 
          ? `${data.player} joined your party!` 
          : `${data.player} declined your party invite.`
      });
    }
  });

  socket.on('partyLeave', (data) => {
    // Notify party members
    data.partyMembers.forEach(memberSocketId => {
      const memberSocket = io.sockets.sockets.get(memberSocketId);
      if (memberSocket && memberSocket.id !== socket.id) {
        memberSocket.emit('partyMemberLeft', {
          player: data.player,
          message: `${data.player} left the party.`
        });
      }
    });
  });

  // Trade system events
  socket.on('tradeRequest', (data) => {
    // Trade request handled silently
    const targetSocket = [...io.sockets.sockets.values()]
      .find(s => s.handshake.auth.username === data.targetUsername);
    
    if (targetSocket) {
      targetSocket.emit('tradeRequestReceived', {
        from: data.fromPlayer,
        fromSocketId: socket.id,
        message: `${data.fromPlayer} wants to trade with you!`
      });
    } else {
      // Target player not found for trade
    }
  });

  socket.on('tradeResponse', (data) => {
    const targetSocket = io.sockets.sockets.get(data.targetSocketId);
    if (targetSocket) {
      targetSocket.emit('tradeResponseResult', {
        accepted: data.accepted,
        player: data.player,
        tradeId: data.tradeId
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logger.log(`🔌 Player ${socket.id} disconnected: ${reason}`);
    
    // Remove from connected players immediately
    if (connectedPlayers.has(socket.id)) {
      const playerData = connectedPlayers.get(socket.id);
      const region = playerData.region;
      
      // Remove from connected players
      connectedPlayers.delete(socket.id);
      logger.log(`🗑️ Removed player ${socket.id} from connected players`);
      
      // Clear inactivity timeout
      if (inactivityTimeouts.has(socket.id)) {
        clearTimeout(inactivityTimeouts.get(socket.id));
        inactivityTimeouts.delete(socket.id);
      }
      
      // Notify other players in the same region immediately
      if (region) {
        socket.to(`region_${region}`).emit('playerLeft', {
          playerId: socket.id,
          region: region,
          character: playerData.character
        });
        logger.log(`📤 Notified region ${region} about player ${socket.id} leaving`);
      }
      
      // Update online users list immediately
      const allPlayers = Array.from(connectedPlayers.values());
      io.emit('onlineUsers', allPlayers);
      logger.log(`📊 Updated online users list, total players: ${allPlayers.length}`);
    }
  });

  // Leaderboard events
  socket.on('requestLeaderboard', async (data) => {
    const { type } = data;
    // Leaderboard request handled silently
    
    // Send data from cache if available, otherwise update
    if (leaderboardCache[type] && leaderboardCache[type].length > 0) {
      socket.emit('leaderboardUpdate', {
        type: type,
        leaderboard: leaderboardCache[type],
        timestamp: leaderboardCache.lastUpdate
      });
    } else {
      await updateLeaderboard(type);
    }
  });

  socket.on('requestAllLeaderboards', async () => {
    // All leaderboards requested silently
    
    // Send all data from cache
    ['level', 'intent', 'quests'].forEach(type => {
      if (leaderboardCache[type] && leaderboardCache[type].length > 0) {
        socket.emit('leaderboardUpdate', {
          type: type,
          leaderboard: leaderboardCache[type],
          timestamp: leaderboardCache.lastUpdate
        });
      }
    });
    
    // Update if cache is empty
    if (!leaderboardCache.lastUpdate) {
      await updateAllLeaderboards();
    }
  });

  // Remove duplicate disconnect handler - this one is redundant
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  // Server started silently
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`⏰ Inactivity timeout set to ${INACTIVITY_TIMEOUT/1000} seconds`);
  
  // Load initial leaderboard data
  await updateAllLeaderboards();
  
  // Update leaderboards every 30 minutes
  setInterval(async () => {
    await updateAllLeaderboards();
  }, 30 * 60 * 1000); // 30 minutes
});

module.exports = { app, io };
