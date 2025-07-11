import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import { eq, desc } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// User Management Routes
app.post('/api/users', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await storage.createUser({ username, email });
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await storage.updateUser(parseInt(id), updates);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Game Statistics Routes
app.get('/api/users/:userId/stats/:gameType', async (req, res) => {
  try {
    const { userId, gameType } = req.params;
    const stats = await storage.getUserGameStats(parseInt(userId), gameType);
    
    res.json(stats || {
      userId: parseInt(userId),
      gameType,
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: 0,
      currentStreak: 0,
      maxStreak: 0
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ error: 'Failed to fetch game stats' });
  }
});

app.put('/api/users/:userId/stats/:gameType', async (req, res) => {
  try {
    const { userId, gameType } = req.params;
    const stats = req.body;
    
    const updatedStats = await storage.updateGameStats(parseInt(userId), gameType, stats);
    res.json(updatedStats);
  } catch (error) {
    console.error('Error updating game stats:', error);
    res.status(500).json({ error: 'Failed to update game stats' });
  }
});

// Game Session Routes
app.post('/api/game-sessions', async (req, res) => {
  try {
    const session = req.body;
    const gameSession = await storage.createGameSession(session);
    
    // Update user's total games played
    const user = await storage.getUser(session.userId);
    if (user) {
      await storage.updateUser(user.id, {
        totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
        totalTimeSpent: (user.totalTimeSpent || 0) + Math.floor((session.timeSpent || 0) / 60)
      });
    }
    
    res.json(gameSession);
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({ error: 'Failed to create game session' });
  }
});

app.get('/api/users/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { gameType, limit } = req.query;
    
    const sessions = await storage.getUserGameSessions(
      parseInt(userId), 
      gameType as string, 
      limit ? parseInt(limit as string) : undefined
    );
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching game sessions:', error);
    res.status(500).json({ error: 'Failed to fetch game sessions' });
  }
});

// Leaderboard Routes
app.get('/api/leaderboards/:gameType/:category', async (req, res) => {
  try {
    const { gameType, category } = req.params;
    const { limit, difficulty } = req.query;
    
    const leaderboard = await storage.getLeaderboard(
      gameType, 
      category, 
      limit ? parseInt(limit as string) : undefined
    );
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/leaderboards', async (req, res) => {
  try {
    const entry = req.body;
    const leaderboardEntry = await storage.updateLeaderboard(entry);
    res.json(leaderboardEntry);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
});

// Global Statistics Route
app.get('/api/global-stats', async (req, res) => {
  try {
    const stats = await storage.getGlobalStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;