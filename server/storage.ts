// Complete storage implementation using PostgreSQL database
// Based on javascript_database and javascript_auth_all_persistance blueprints
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";
import {
  users,
  sermons,
  transcriptSegments,
  notes,
  userAnalytics,
  userPreferences,
  type User,
  type InsertUser,
  type Sermon,
  type InsertSermon,
  type TranscriptSegment,
  type InsertTranscriptSegment,
  type Note,
  type InsertNote,
  type UserAnalytics as UserAnalyticsType,
  type InsertUserAnalytics,
  type UserPreferences as UserPreferencesType,
  type InsertUserPreferences,
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: string, tier: string, expiresAt: Date | null): Promise<void>;

  // Sermon management
  getSermon(id: string): Promise<Sermon | undefined>;
  getUserSermons(userId: string): Promise<Sermon[]>;
  getPublicSermons(limit?: number): Promise<Sermon[]>;
  createSermon(sermon: InsertSermon): Promise<Sermon>;
  updateSermon(id: string, updates: Partial<InsertSermon>): Promise<void>;
  deleteSermon(id: string): Promise<void>;

  // Transcript management
  getSermonTranscripts(sermonId: string): Promise<TranscriptSegment[]>;
  createTranscript(transcript: InsertTranscriptSegment): Promise<TranscriptSegment>;

  // Notes management
  getUserNotes(userId: string): Promise<Note[]>;
  getSermonNotes(userId: string, sermonId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, content: string): Promise<void>;
  deleteNote(id: string): Promise<void>;

  // Analytics
  getUserAnalytics(userId: string): Promise<UserAnalyticsType | undefined>;
  updateUserAnalytics(userId: string, updates: Partial<InsertUserAnalytics>): Promise<void>;

  // Preferences
  getUserPreferences(userId: string): Promise<UserPreferencesType | undefined>;
  updateUserPreferences(userId: string, updates: Partial<InsertUserPreferences>): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserSubscription(userId: string, tier: string, expiresAt: Date | null): Promise<void> {
    await db.update(users)
      .set({ subscriptionTier: tier, subscriptionExpiresAt: expiresAt })
      .where(eq(users.id, userId));
  }

  // Sermon methods
  async getSermon(id: string): Promise<Sermon | undefined> {
    const [sermon] = await db.select().from(sermons).where(eq(sermons.id, id));
    return sermon || undefined;
  }

  async getUserSermons(userId: string): Promise<Sermon[]> {
    return await db.select()
      .from(sermons)
      .where(eq(sermons.userId, userId))
      .orderBy(desc(sermons.createdAt));
  }

  async getPublicSermons(limit: number = 20): Promise<Sermon[]> {
    return await db.select()
      .from(sermons)
      .where(eq(sermons.isPublic, true))
      .orderBy(desc(sermons.createdAt))
      .limit(limit);
  }

  async createSermon(sermon: InsertSermon): Promise<Sermon> {
    const [newSermon] = await db.insert(sermons).values(sermon).returning();
    return newSermon;
  }

  async updateSermon(id: string, updates: Partial<InsertSermon>): Promise<void> {
    await db.update(sermons).set(updates).where(eq(sermons.id, id));
  }

  async deleteSermon(id: string): Promise<void> {
    // Delete associated transcripts first
    await db.delete(transcriptSegments).where(eq(transcriptSegments.sermonId, id));
    await db.delete(sermons).where(eq(sermons.id, id));
  }

  // Transcript methods
  async getSermonTranscripts(sermonId: string): Promise<TranscriptSegment[]> {
    return await db.select()
      .from(transcriptSegments)
      .where(eq(transcriptSegments.sermonId, sermonId))
      .orderBy(transcriptSegments.sequenceNumber);
  }

  async createTranscript(transcript: InsertTranscriptSegment): Promise<TranscriptSegment> {
    const [newTranscript] = await db.insert(transcriptSegments).values(transcript).returning();
    return newTranscript;
  }

  // Notes methods
  async getUserNotes(userId: string): Promise<Note[]> {
    return await db.select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async getSermonNotes(userId: string, sermonId: string): Promise<Note[]> {
    return await db.select()
      .from(notes)
      .where(and(
        eq(notes.userId, userId),
        eq(notes.sermonId, sermonId)
      ))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(id: string, content: string): Promise<void> {
    await db.update(notes).set({ content }).where(eq(notes.id, id));
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // Analytics methods
  async getUserAnalytics(userId: string): Promise<UserAnalyticsType | undefined> {
    const [analytics] = await db.select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId));
    return analytics || undefined;
  }

  async updateUserAnalytics(userId: string, updates: Partial<InsertUserAnalytics>): Promise<void> {
    const existing = await this.getUserAnalytics(userId);
    if (existing) {
      await db.update(userAnalytics).set(updates).where(eq(userAnalytics.userId, userId));
    } else {
      await db.insert(userAnalytics).values({ userId, date: new Date(), ...updates });
    }
  }

  // Preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferencesType | undefined> {
    const [prefs] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || undefined;
  }

  async updateUserPreferences(userId: string, updates: Partial<InsertUserPreferences>): Promise<void> {
    const existing = await this.getUserPreferences(userId);
    if (existing) {
      await db.update(userPreferences).set(updates).where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({ userId, ...updates });
    }
  }
}

export const storage = new DatabaseStorage();
