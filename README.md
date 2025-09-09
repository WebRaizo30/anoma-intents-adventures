# 🏰 Anoma Intents Adventures

**A multiplayer roguelike RPG implementing Anoma's intent system**

[🎮 Play Live](https://playanoma.fun)

## Features

- **🎮 Intent Games** - Complete Anoma Discord implementation
- **🏆 16 Races & 15 Classes** - Character customization
- **🗺️ 21 Regions** - Explore magical landscapes
- **⚡ 105 Quests** - Quest system with intent rewards
- **🎲 750+ Items** - Item collection system
- **🌐 Multiplayer** - Real-time player interaction
- **💬 Chat System** - Region-based communication

## Tech Stack

- **Frontend**: React, TypeScript, Phaser.js
- **Backend**: Node.js, Express, PostgreSQL
- **Real-time**: Socket.io


## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/WebRaizo30/anoma-intents-adventures.git
cd anoma-intents-adventures

# Install dependencies
npm install
cd client && npm install

# Setup environment
cp env.example .env
# Edit .env with your database credentials

# Setup database
createdb anoma_intents_adventures
npm run setup-quests
npm run add-intent

# Start development
npm run dev    # Terminal 1
npm run client # Terminal 2
```

Visit [http://localhost:3000](http://localhost:3000)

## License

MIT License - see [LICENSE](LICENSE) file for details.
