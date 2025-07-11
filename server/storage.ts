import { users, gameStats, gameSessions, leaderboards, type User, type InsertUser, type GameStats, type InsertGameStats, type GameSession, type InsertGameSession, type Leaderboard, type InsertLeaderboard } from "../shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Game statistics operations
  getUserGameStats(userId: number, gameType: string): Promise<GameStats | undefined>;
  updateGameStats(userId: number, gameType: string, stats: Partial<InsertGameStats>): Promise<GameStats>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getUserGameSessions(userId: number, gameType?: string, limit?: number): Promise<GameSession[]>;
  
  // Leaderboard operations
  getLeaderboard(gameType: string, category: string, limit?: number): Promise<Leaderboard[]>;
  updateLeaderboard(entry: InsertLeaderboard): Promise<Leaderboard>;
  
  // Global statistics
  getGlobalStats(): Promise<{
    totalUsers: number;
    totalGames: number;
    topPlayers: User[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, lastSeen: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserGameStats(userId: number, gameType: string): Promise<GameStats | undefined> {
    const [stats] = await db
      .select()
      .from(gameStats)
      .where(and(eq(gameStats.userId, userId), eq(gameStats.gameType, gameType)));
    return stats || undefined;
  }

  async updateGameStats(userId: number, gameType: string, stats: Partial<InsertGameStats>): Promise<GameStats> {
    // Try to update existing stats
    const [existingStats] = await db
      .update(gameStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(and(eq(gameStats.userId, userId), eq(gameStats.gameType, gameType)))
      .returning();

    if (existingStats) {
      return existingStats;
    }

    // If no existing stats, create new ones
    const [newStats] = await db
      .insert(gameStats)
      .values({
        userId,
        gameType,
        ...stats,
      })
      .returning();

    return newStats;
  }

  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [gameSession] = await db
      .insert(gameSessions)
      .values(session)
      .returning();
    return gameSession;
  }

  async getUserGameSessions(userId: number, gameType?: string, limit: number = 50): Promise<GameSession[]> {
    let query = db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.playedAt))
      .limit(limit);

    if (gameType) {
      query = db
        .select()
        .from(gameSessions)
        .where(and(eq(gameSessions.userId, userId), eq(gameSessions.gameType, gameType)))
        .orderBy(desc(gameSessions.playedAt))
        .limit(limit);
    }

    return await query;
  }

  async getLeaderboard(gameType: string, category: string, limit: number = 10): Promise<Leaderboard[]> {
    return await db
      .select({
        id: leaderboards.id,
        userId: leaderboards.userId,
        gameType: leaderboards.gameType,
        category: leaderboards.category,
        value: leaderboards.value,
        difficulty: leaderboards.difficulty,
        achievedAt: leaderboards.achievedAt,
        username: users.username,
      })
      .from(leaderboards)
      .innerJoin(users, eq(leaderboards.userId, users.id))
      .where(and(eq(leaderboards.gameType, gameType), eq(leaderboards.category, category)))
      .orderBy(desc(leaderboards.value))
      .limit(limit);
  }

  async updateLeaderboard(entry: InsertLeaderboard): Promise<Leaderboard> {
    // Check if entry already exists
    const [existing] = await db
      .select()
      .from(leaderboards)
      .where(
        and(
          eq(leaderboards.userId, entry.userId),
          eq(leaderboards.gameType, entry.gameType),
          eq(leaderboards.category, entry.category),
          entry.difficulty ? eq(leaderboards.difficulty, entry.difficulty) : sql`difficulty IS NULL`
        )
      );

    if (existing && existing.value >= entry.value) {
      // Don't update if existing value is better (assuming higher is better)
      return existing;
    }

    if (existing) {
      // Update existing entry
      const [updated] = await db
        .update(leaderboards)
        .set({ value: entry.value, achievedAt: new Date() })
        .where(eq(leaderboards.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new entry
      const [newEntry] = await db
        .insert(leaderboards)
        .values(entry)
        .returning();
      return newEntry;
    }
  }

  async getGlobalStats(): Promise<{
    totalUsers: number;
    totalGames: number;
    topPlayers: User[];
  }> {
    // Get total users
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    // Get total games
    const [{ count: totalGames }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(gameSessions);

    // Get top players by total games played
    const topPlayers = await db
      .select()
      .from(users)
      .orderBy(desc(users.totalGamesPlayed))
      .limit(5);

    return {
      totalUsers: totalUsers || 0,
      totalGames: totalGames || 0,
      topPlayers,
    };
  }
}

export const storage = new DatabaseStorage();