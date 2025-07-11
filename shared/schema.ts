import { pgTable, serial, varchar, integer, timestamp, boolean, text, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow(),
  totalGamesPlayed: integer('total_games_played').default(0),
  totalTimeSpent: integer('total_time_spent').default(0), // in minutes
  favoriteGame: varchar('favorite_game', { length: 50 }),
  achievements: text('achievements').default('[]'), // JSON array of achievement IDs
});

// Game statistics table
export const gameStats = pgTable('game_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  gameType: varchar('game_type', { length: 50 }).notNull(), // 'snake', 'tictactoe', etc.
  gamesPlayed: integer('games_played').default(0),
  gamesWon: integer('games_won').default(0),
  bestScore: integer('best_score').default(0),
  bestTime: integer('best_time'), // in seconds
  bestMoves: integer('best_moves'),
  currentStreak: integer('current_streak').default(0),
  maxStreak: integer('max_streak').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Individual game sessions
export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  gameType: varchar('game_type', { length: 50 }).notNull(),
  score: integer('score').default(0),
  timeSpent: integer('time_spent'), // in seconds
  moves: integer('moves'),
  won: boolean('won').default(false),
  difficulty: varchar('difficulty', { length: 20 }),
  playedAt: timestamp('played_at').defaultNow().notNull(),
});

// Leaderboards
export const leaderboards = pgTable('leaderboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  gameType: varchar('game_type', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // 'high_score', 'best_time', etc.
  value: real('value').notNull(),
  difficulty: varchar('difficulty', { length: 20 }),
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  gameStats: many(gameStats),
  gameSessions: many(gameSessions),
  leaderboards: many(leaderboards),
}));

export const gameStatsRelations = relations(gameStats, ({ one }) => ({
  user: one(users, {
    fields: [gameStats.userId],
    references: [users.id],
  }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = typeof gameStats.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = typeof leaderboards.$inferInsert;