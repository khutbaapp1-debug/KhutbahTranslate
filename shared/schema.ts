import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, decimal, uuid, jsonb, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table with subscription support and OAuth integration
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // OAuth integration (Replit Auth)
  oidcSubject: varchar("oidc_subject").unique(), // OIDC sub claim for social login
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Email (required for OAuth users)
  email: text("email").unique(),
  // Subscription support
  subscriptionTier: text("subscription_tier").notNull().default("free"), // 'free' or 'premium'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Complimentary premium access (for friends/special users, bypasses payment)
  hasComplimentaryAccess: boolean("has_complimentary_access").notNull().default(false),
  // Translation usage tracking (free tier: 60 minutes/month base + ad credits)
  monthlyTranslationMinutesUsed: integer("monthly_translation_minutes_used").notNull().default(0),
  translationUsageResetDate: timestamp("translation_usage_reset_date").notNull().defaultNow(),
  // Ad credits system: watch 30-sec video to earn +30 minutes (max 2 hours/month)
  adCreditsMinutes: integer("ad_credits_minutes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  // Daily Hadith notifications
  dailyHadithEnabled: boolean("daily_hadith_enabled").notNull().default(true),
  dailyHadithTime: text("daily_hadith_time").notNull().default("08:00"), // HH:MM format
  // Prayer reminders (general - applies to all prayers unless individual prayer is disabled)
  prayerRemindersEnabled: boolean("prayer_reminders_enabled").notNull().default(true),
  prayerReminderMinutes: integer("prayer_reminder_minutes").notNull().default(15), // remind X minutes before
  // Individual prayer reminders (allows users to disable specific prayers)
  fajrReminderEnabled: boolean("fajr_reminder_enabled").notNull().default(true),
  dhuhrReminderEnabled: boolean("dhuhr_reminder_enabled").notNull().default(true),
  asrReminderEnabled: boolean("asr_reminder_enabled").notNull().default(true),
  maghribReminderEnabled: boolean("maghrib_reminder_enabled").notNull().default(true),
  ishaReminderEnabled: boolean("isha_reminder_enabled").notNull().default(true),
  // Jummah specific reminder
  jummahReminderEnabled: boolean("jummah_reminder_enabled").notNull().default(true),
  jummahReminderTime: text("jummah_reminder_time").notNull().default("12:00"), // HH:MM format
  // Quran reading reminders
  quranReminderEnabled: boolean("quran_reminder_enabled").notNull().default(true),
  quranReminderTime: text("quran_reminder_time").notNull().default("21:00"), // HH:MM format
  quranDailyGoalPages: integer("quran_daily_goal_pages").notNull().default(2), // pages per day
  // Tasbih/Dhikr reminders
  tasbihReminderEnabled: boolean("tasbih_reminder_enabled").notNull().default(false),
  tasbihReminderTime: text("tasbih_reminder_time").notNull().default("10:00"), // HH:MM format
  // Dua reminders (morning/evening)
  duaRemindersEnabled: boolean("dua_reminders_enabled").notNull().default(true),
  duaMorningTime: text("dua_morning_time").notNull().default("07:00"), // HH:MM format
  duaEveningTime: text("dua_evening_time").notNull().default("18:00"), // HH:MM format
  // Push notification token
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

// Khutbah guidelines (practical implementation suggestions)
export const khutbahGuidelines = pgTable("khutbah_guidelines", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sermonId: uuid("sermon_id").references(() => sermons.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull().default("Weekly Implementation Plan"),
  suggestions: jsonb("suggestions").notNull(), // array of {text, category, completed}
  weekStartDate: timestamp("week_start_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Missed prayers (Qada) tracking for makeup prayers
export const missedPrayers = pgTable("missed_prayers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  prayerType: text("prayer_type").notNull(), // 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'
  dateMissed: timestamp("date_missed").notNull(), // when the prayer was missed
  dateMadeUp: timestamp("date_made_up"), // when it was made up (null if not yet)
  madeUp: boolean("made_up").notNull().default(false),
  notes: text("notes"), // optional notes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Translation cache for reducing OpenAI API calls
export const translationCache = pgTable("translation_cache", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  normalizedText: text("normalized_text").notNull(), // Arabic text with diacritics stripped, lowercase
  originalText: text("original_text").notNull(), // Original Arabic text
  translatedText: text("translated_text").notNull(), // English translation
  sourceLanguage: text("source_language").notNull().default("Arabic"),
  targetLanguage: text("target_language").notNull().default("English"),
  isScripture: boolean("is_scripture").notNull().default(false),
  hitCount: integer("hit_count").notNull().default(1), // How many times this translation was used
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at").notNull().defaultNow(),
}, (table) => ({
  // Composite unique constraint: same text can have different translations for different target languages
  uniqueTextLanguage: unique().on(table.normalizedText, table.targetLanguage),
}));

// Islamic phrase dictionary for instant translations (no AI needed)
export const islamicPhrases = pgTable("islamic_phrases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  arabicText: text("arabic_text").notNull().unique(), // Original Arabic phrase
  normalizedText: text("normalized_text").notNull(), // Normalized for matching
  englishText: text("english_text").notNull(), // English translation
  category: text("category").notNull(), // 'dhikr', 'greetings', 'quran', 'hadith_formula', 'honorific'
  frequency: text("frequency").notNull().default("common"), // 'common', 'frequent', 'rare'
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sermons: many(sermons),
  notes: many(notes),
  analytics: many(userAnalytics),
  preferences: one(userPreferences),
  actionPoints: many(actionPoints),
  khutbahGuidelines: many(khutbahGuidelines),
  missedPrayers: many(missedPrayers),
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
  actionPoints: many(actionPoints),
  khutbahGuidelines: many(khutbahGuidelines),
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

export const khutbahGuidelinesRelations = relations(khutbahGuidelines, ({ one }) => ({
  user: one(users, {
    fields: [khutbahGuidelines.userId],
    references: [users.id],
  }),
  sermon: one(sermons, {
    fields: [khutbahGuidelines.sermonId],
    references: [sermons.id],
  }),
}));

export const missedPrayersRelations = relations(missedPrayers, ({ one }) => ({
  user: one(users, {
    fields: [missedPrayers.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subscriptionTier: true,
  subscriptionExpiresAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  hasComplimentaryAccess: true,
  monthlyTranslationMinutesUsed: true,
  translationUsageResetDate: true,
  adCreditsMinutes: true,
});

// UpsertUser type for OAuth authentication
export type UpsertUser = {
  oidcSubject: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

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

export const insertKhutbahGuidelineSchema = createInsertSchema(khutbahGuidelines).omit({
  id: true,
  createdAt: true,
});

export const insertMissedPrayerSchema = createInsertSchema(missedPrayers).omit({
  id: true,
  createdAt: true,
});

export const insertTranslationCacheSchema = createInsertSchema(translationCache).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
  hitCount: true,
});

export const insertIslamicPhraseSchema = createInsertSchema(islamicPhrases).omit({
  id: true,
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

export type KhutbahGuideline = typeof khutbahGuidelines.$inferSelect;
export type InsertKhutbahGuideline = z.infer<typeof insertKhutbahGuidelineSchema>;

export type MissedPrayer = typeof missedPrayers.$inferSelect;
export type InsertMissedPrayer = z.infer<typeof insertMissedPrayerSchema>;

export type TranslationCacheEntry = typeof translationCache.$inferSelect;
export type InsertTranslationCache = z.infer<typeof insertTranslationCacheSchema>;

export type IslamicPhrase = typeof islamicPhrases.$inferSelect;
export type InsertIslamicPhrase = z.infer<typeof insertIslamicPhraseSchema>;
