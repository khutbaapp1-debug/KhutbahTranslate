import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, decimal, uuid, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with subscription support
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("free"), // 'free' or 'premium'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Complimentary premium access (for friends/special users, bypasses payment)
  // Admin grants this via secure API endpoints using ADMIN_API_KEY environment variable
  hasComplimentaryAccess: boolean("has_complimentary_access").notNull().default(false),
  // Translation usage tracking (free tier: 60 minutes/month base + ad credits)
  monthlyTranslationMinutesUsed: integer("monthly_translation_minutes_used").notNull().default(0),
  translationUsageResetDate: timestamp("translation_usage_reset_date").notNull().defaultNow(),
  // Ad credits system: watch 30-sec video to earn +30 minutes (max 2 hours/month)
  adCreditsMinutes: integer("ad_credits_minutes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sermons table
export const sermons = pgTable("sermons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  mosqueName: text("mosque_name"),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // in seconds
  arabicTranscript: text("arabic_transcript"),
  englishTranslation: text("english_translation"),
  audioUrl: text("audio_url"),
  isPublic: boolean("is_public").notNull().default(false),
  topic: text("topic"), // for categorization
  mainTheme: text("main_theme"), // primary theme for AI processing
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transcript segments for real-time display
export const transcriptSegments = pgTable("transcript_segments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sermonId: uuid("sermon_id").references(() => sermons.id, { onDelete: "cascade" }).notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  arabicText: text("arabic_text").notNull(),
  englishTranslation: text("english_translation").notNull(),
  timestampSeconds: decimal("timestamp_seconds"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notes (premium feature)
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sermonId: uuid("sermon_id").references(() => sermons.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  timestampSeconds: decimal("timestamp_seconds"),
  highlights: jsonb("highlights"), // array of {text, color}
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Journal entries (premium feature)
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sermonId: uuid("sermon_id").references(() => sermons.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  prompt: text("prompt"), // the AI-generated prompt
  mood: text("mood"), // e.g., "grateful", "reflective", "inspired"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User analytics
export const userAnalytics = pgTable("user_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").notNull(),
  sermonsAttended: integer("sermons_attended").notNull().default(0),
  dhikrCount: integer("dhikr_count").notNull().default(0),
  prayersOnTime: integer("prayers_on_time").notNull().default(0),
  quranPagesRead: integer("quran_pages_read").notNull().default(0),
});

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  location: jsonb("location"), // {latitude, longitude, city}
  prayerCalculationMethod: text("prayer_calculation_method").notNull().default("MuslimWorldLeague"),
  fontSize: text("font_size").notNull().default("medium"), // small, medium, large
  theme: text("theme").notNull().default("light"), // light, dark
  language: text("language").notNull().default("en"), // en, ar, ur, etc.
  // Notification preferences
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  dailyHadithEnabled: boolean("daily_hadith_enabled").notNull().default(true),
  dailyHadithTime: text("daily_hadith_time").notNull().default("08:00"), // HH:MM format
  prayerRemindersEnabled: boolean("prayer_reminders_enabled").notNull().default(true),
  prayerReminderMinutes: integer("prayer_reminder_minutes").notNull().default(15), // remind X minutes before
  jummahReminderEnabled: boolean("jummah_reminder_enabled").notNull().default(true),
  jummahReminderTime: text("jummah_reminder_time").notNull().default("12:00"), // HH:MM format
  pushToken: text("push_token"), // for push notifications
});

// Hadiths collection (Sahih Bukhari, Sahih Muslim, etc.)
export const hadiths = pgTable("hadiths", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  arabicText: text("arabic_text").notNull(),
  englishTranslation: text("english_translation").notNull(),
  collection: text("collection").notNull(), // 'bukhari', 'muslim', 'tirmidhi', etc.
  bookNumber: integer("book_number"),
  hadithNumber: integer("hadith_number"),
  narrator: text("narrator"), // e.g., "Abu Huraira"
  category: text("category"), // 'faith', 'prayer', 'charity', 'character', etc.
  reference: text("reference").notNull(), // full reference e.g., "Sahih Bukhari 1:2:8"
  grade: text("grade"), // 'sahih', 'hasan', 'daif', etc.
});

// Favorited hadiths (user-specific)
export const favoriteHadiths = pgTable("favorite_hadiths", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  hadithId: uuid("hadith_id").references(() => hadiths.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate favorites
  userHadithUnique: unique().on(table.userId, table.hadithId),
}));

// Duas (supplications) collection
export const duas = pgTable("duas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  arabicText: text("arabic_text").notNull(),
  transliteration: text("transliteration").notNull(),
  translation: text("translation").notNull(),
  category: text("category").notNull(), // 'morning', 'evening', 'daily', 'travel', 'food', etc.
  occasion: text("occasion"), // specific occasion or situation
  reference: text("reference"), // hadith or Quran reference
});

// Favorited duas (user-specific)
export const favoriteDuas = pgTable("favorite_duas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  duaId: uuid("dua_id").references(() => duas.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI-generated action points (premium feature)
export const actionPoints = pgTable("action_points", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sermonId: uuid("sermon_id").references(() => sermons.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  weekNumber: integer("week_number").notNull(), // week of the year
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sermons: many(sermons),
  notes: many(notes),
  journalEntries: many(journalEntries),
  analytics: many(userAnalytics),
  preferences: one(userPreferences),
  actionPoints: many(actionPoints),
  favoriteDuas: many(favoriteDuas),
  favoriteHadiths: many(favoriteHadiths),
}));

export const sermonsRelations = relations(sermons, ({ one, many }) => ({
  user: one(users, {
    fields: [sermons.userId],
    references: [users.id],
  }),
  segments: many(transcriptSegments),
  notes: many(notes),
  journalEntries: many(journalEntries),
  actionPoints: many(actionPoints),
}));

export const transcriptSegmentsRelations = relations(transcriptSegments, ({ one }) => ({
  sermon: one(sermons, {
    fields: [transcriptSegments.sermonId],
    references: [sermons.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  sermon: one(sermons, {
    fields: [notes.sermonId],
    references: [sermons.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  sermon: one(sermons, {
    fields: [journalEntries.sermonId],
    references: [sermons.id],
  }),
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userAnalytics.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const actionPointsRelations = relations(actionPoints, ({ one }) => ({
  user: one(users, {
    fields: [actionPoints.userId],
    references: [users.id],
  }),
  sermon: one(sermons, {
    fields: [actionPoints.sermonId],
    references: [sermons.id],
  }),
}));

export const hadithsRelations = relations(hadiths, ({ many }) => ({
  favorites: many(favoriteHadiths),
}));

export const favoriteHadithsRelations = relations(favoriteHadiths, ({ one }) => ({
  user: one(users, {
    fields: [favoriteHadiths.userId],
    references: [users.id],
  }),
  hadith: one(hadiths, {
    fields: [favoriteHadiths.hadithId],
    references: [hadiths.id],
  }),
}));

export const duasRelations = relations(duas, ({ many }) => ({
  favorites: many(favoriteDuas),
}));

export const favoriteDuasRelations = relations(favoriteDuas, ({ one }) => ({
  user: one(users, {
    fields: [favoriteDuas.userId],
    references: [users.id],
  }),
  dua: one(duas, {
    fields: [favoriteDuas.duaId],
    references: [duas.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  subscriptionTier: true,
  subscriptionExpiresAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertSermonSchema = createInsertSchema(sermons).omit({
  id: true,
  createdAt: true,
});

export const insertTranscriptSegmentSchema = createInsertSchema(transcriptSegments).omit({
  id: true,
  createdAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export const insertActionPointSchema = createInsertSchema(actionPoints).omit({
  id: true,
  createdAt: true,
});

export const insertDuaSchema = createInsertSchema(duas).omit({
  id: true,
});

export const insertHadithSchema = createInsertSchema(hadiths).omit({
  id: true,
});

export const insertFavoriteHadithSchema = createInsertSchema(favoriteHadiths).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteDuaSchema = createInsertSchema(favoriteDuas).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hadith = typeof hadiths.$inferSelect;
export type InsertHadith = z.infer<typeof insertHadithSchema>;

export type FavoriteHadith = typeof favoriteHadiths.$inferSelect;
export type InsertFavoriteHadith = z.infer<typeof insertFavoriteHadithSchema>;

export type Sermon = typeof sermons.$inferSelect;
export type InsertSermon = z.infer<typeof insertSermonSchema>;

export type TranscriptSegment = typeof transcriptSegments.$inferSelect;
export type InsertTranscriptSegment = z.infer<typeof insertTranscriptSegmentSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type ActionPoint = typeof actionPoints.$inferSelect;
export type InsertActionPoint = z.infer<typeof insertActionPointSchema>;

export type Dua = typeof duas.$inferSelect;
export type InsertDua = z.infer<typeof insertDuaSchema>;

export type FavoriteDua = typeof favoriteDuas.$inferSelect;
export type InsertFavoriteDua = z.infer<typeof insertFavoriteDuaSchema>;
