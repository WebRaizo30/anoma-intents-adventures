-- Anoma Intents Adventures Database Schema
-- PostgreSQL Database Setup

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Characters table - main character data
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    race VARCHAR(20) NOT NULL,
    class VARCHAR(20) NOT NULL,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    gold BIGINT DEFAULT 100,
    racial_currency BIGINT DEFAULT 0,
    alignment VARCHAR(20) DEFAULT 'neutral',
    
    -- Stats
    strength INTEGER DEFAULT 10,
    dexterity INTEGER DEFAULT 10,
    constitution INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    wisdom INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    
    -- Current position
    current_region VARCHAR(20) DEFAULT 'forest',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    
    -- Timestamps
    last_daily TIMESTAMP,
    last_work TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id) -- One character per user
);

-- Items master table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    description TEXT,
    value INTEGER DEFAULT 0,
    
    -- Item stats bonuses
    strength_bonus INTEGER DEFAULT 0,
    dexterity_bonus INTEGER DEFAULT 0,
    constitution_bonus INTEGER DEFAULT 0,
    intelligence_bonus INTEGER DEFAULT 0,
    wisdom_bonus INTEGER DEFAULT 0,
    charisma_bonus INTEGER DEFAULT 0,
    
    -- Requirements
    level_requirement INTEGER DEFAULT 1,
    race_requirement VARCHAR(20),
    class_requirement VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character inventory
CREATE TABLE character_items (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests master table
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    region VARCHAR(20) NOT NULL,
    difficulty VARCHAR(10) NOT NULL,
    
    -- Rewards
    xp_reward INTEGER NOT NULL,
    gold_reward INTEGER NOT NULL,
    
    -- Requirements
    level_requirement INTEGER DEFAULT 1,
    alignment_requirement VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character quest history
CREATE TABLE character_quests (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(id),
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, failed
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Quest results
    xp_gained INTEGER DEFAULT 0,
    gold_gained INTEGER DEFAULT 0,
    items_gained JSONB DEFAULT '[]'
);

-- Regions table
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    description TEXT,
    difficulty_modifier FLOAT DEFAULT 1.0,
    
    -- Map data
    map_width INTEGER DEFAULT 800,
    map_height INTEGER DEFAULT 600,
    spawn_x FLOAT DEFAULT 400,
    spawn_y FLOAT DEFAULT 300,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regional adventures
CREATE TABLE regional_adventures (
    id SERIAL PRIMARY KEY,
    region VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    segments JSONB NOT NULL, -- Array of adventure segments
    rewards JSONB NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character regional adventure progress
CREATE TABLE character_adventures (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    adventure_id INTEGER REFERENCES regional_adventures(id),
    current_segment INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Pets table
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    level INTEGER DEFAULT 1,
    health INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 100,
    
    -- Pet stats
    strength INTEGER DEFAULT 5,
    dexterity INTEGER DEFAULT 5,
    constitution INTEGER DEFAULT 5,
    
    last_fed TIMESTAMP,
    last_trained TIMESTAMP,
    adopted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(character_id) -- One pet per character
);

-- Shrimp Farms table
CREATE TABLE shrimp_farms (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'My Shrimp Farm',
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),
    tank_capacity INTEGER NOT NULL DEFAULT 10,
    current_shrimp INTEGER NOT NULL DEFAULT 0,
    water_quality INTEGER NOT NULL DEFAULT 100 CHECK (water_quality >= 0 AND water_quality <= 100),
    food_level INTEGER NOT NULL DEFAULT 100 CHECK (food_level >= 0 AND food_level <= 100),
    last_harvest TIMESTAMP NULL,
    last_maintenance TIMESTAMP NULL,
    total_harvested INTEGER NOT NULL DEFAULT 0,
    experience INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(character_id) -- One farm per character
);

-- Army units
CREATE TABLE army_units (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    unit_type VARCHAR(30) NOT NULL,
    quantity INTEGER DEFAULT 1,
    level INTEGER DEFAULT 1,
    
    recruited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    region VARCHAR(20) NOT NULL,
    value INTEGER NOT NULL,
    income_per_day INTEGER DEFAULT 0,
    
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboards view
CREATE VIEW leaderboard_levels AS
SELECT 
    c.name,
    c.race,
    c.class,
    c.level,
    c.experience,
    ROW_NUMBER() OVER (ORDER BY c.level DESC, c.experience DESC) as rank
FROM characters c
ORDER BY c.level DESC, c.experience DESC
LIMIT 50;

CREATE VIEW leaderboard_gold AS
SELECT 
    c.name,
    c.race,
    c.class,
    c.gold,
    ROW_NUMBER() OVER (ORDER BY c.gold DESC) as rank
FROM characters c
ORDER BY c.gold DESC
LIMIT 50;

CREATE VIEW leaderboard_quests AS
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
LIMIT 50;

-- Indexes for performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_character_items_character_id ON character_items(character_id);
CREATE INDEX idx_character_quests_character_id ON character_quests(character_id);
CREATE INDEX idx_quests_region_difficulty ON quests(region, difficulty);
CREATE INDEX idx_characters_level ON characters(level);
CREATE INDEX idx_characters_gold ON characters(gold);

-- Insert initial regions
INSERT INTO regions (name, display_name, description) VALUES
('forest', 'Mystic Forest', 'A lush woodland filled with ancient magic and mysterious creatures'),
('mountain', 'Iron Peak Mountains', 'Treacherous peaks where dwarven clans mine precious metals'),
('desert', 'Scorching Sands', 'Vast desert wasteland with hidden oases and ancient ruins');

-- Insert sample items (we'll add more later)
INSERT INTO items (name, category, rarity, description, value, strength_bonus) VALUES
('Iron Sword', 'weapon', 'common', 'A sturdy iron blade for warriors', 100, 2),
('Leather Armor', 'armor', 'common', 'Basic protection for adventurers', 80, 0),
('Health Potion', 'consumable', 'common', 'Restores health when consumed', 25, 0);

-- Insert sample quests
INSERT INTO quests (name, description, region, difficulty, xp_reward, gold_reward) VALUES
('Forest Guardian', 'Help the ancient tree spirit protect the forest from dark creatures', 'forest', 'easy', 50, 25),
('Mountain Bandits', 'Clear the mountain pass of dangerous bandits threatening travelers', 'mountain', 'medium', 150, 75),
('Desert Tomb', 'Explore the mysterious pyramid and recover ancient artifacts', 'desert', 'hard', 400, 200);
