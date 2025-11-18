import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  transcribeArabicAudio,
  translateArabicToEnglish,
  generateActionPoints,
  generateSermonSummary,
  generateJournalPrompt,
} from "./openai-service";
import { insertSermonSchema, insertNoteSchema, insertJournalEntrySchema, duas, favoriteDuas } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Middleware for authenticated routes
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Middleware for premium users
function requirePremium(req: any, res: any, next: any) {
  if (!req.user || req.user.subscriptionTier !== "premium") {
    return res.status(403).json({ error: "Premium subscription required" });
  }
  next();
}

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // ============ SERMON ROUTES ============
  
  // Get user's sermons
  app.get("/api/sermons", requireAuth, async (req, res) => {
    try {
      const sermons = await storage.getUserSermons(req.user!.id);
      res.json(sermons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get public sermons (premium only)
  app.get("/api/sermons/public", requireAuth, requirePremium, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const sermons = await storage.getPublicSermons(limit);
      res.json(sermons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single sermon
  app.get("/api/sermons/:id", requireAuth, async (req, res) => {
    try {
      const sermon = await storage.getSermon(req.params.id);
      if (!sermon) {
        return res.status(404).json({ error: "Sermon not found" });
      }
      // Only allow access if user owns the sermon or it's public
      if (sermon.userId !== req.user!.id && !sermon.isPublic) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(sermon);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get sermon transcripts
  app.get("/api/sermons/:id/transcripts", requireAuth, async (req, res) => {
    try {
      const sermon = await storage.getSermon(req.params.id);
      if (!sermon || (sermon.userId !== req.user!.id && !sermon.isPublic)) {
        return res.status(404).json({ error: "Sermon not found" });
      }
      const transcripts = await storage.getSermonTranscripts(req.params.id);
      res.json(transcripts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new sermon
  app.post("/api/sermons", requireAuth, async (req, res) => {
    try {
      const validated = insertSermonSchema.parse(req.body);
      const sermon = await storage.createSermon({
        ...validated,
        userId: req.user!.id,
      });
      res.status(201).json(sermon);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update sermon
  app.patch("/api/sermons/:id", requireAuth, async (req, res) => {
    try {
      const sermon = await storage.getSermon(req.params.id);
      if (!sermon || sermon.userId !== req.user!.id) {
        return res.status(404).json({ error: "Sermon not found" });
      }
      await storage.updateSermon(req.params.id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete sermon
  app.delete("/api/sermons/:id", requireAuth, async (req, res) => {
    try {
      const sermon = await storage.getSermon(req.params.id);
      if (!sermon || sermon.userId !== req.user!.id) {
        return res.status(404).json({ error: "Sermon not found" });
      }
      await storage.deleteSermon(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ AUDIO TRANSCRIPTION & TRANSLATION ============
  
  // Transcribe and translate audio chunk
  app.post("/api/transcribe", requireAuth, upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      // Transcribe Arabic audio
      const transcription = await transcribeArabicAudio(req.file.buffer);
      
      // Translate to English
      const translation = await translateArabicToEnglish(transcription.text);

      // If sermonId is provided, save the transcript
      if (req.body.sermonId) {
        await storage.createTranscript({
          sermonId: req.body.sermonId,
          arabicText: translation.arabicOriginal,
          englishTranslation: translation.english,
          sequenceNumber: parseInt(req.body.sequenceNumber || "0"),
          timestampSeconds: req.body.timestampSeconds || "0",
        });
      }

      res.json({
        arabic: translation.arabicOriginal,
        english: translation.english,
        duration: transcription.duration,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PREMIUM AI FEATURES ============

  // Generate action points (premium only)
  app.post("/api/sermons/:id/action-points", requireAuth, requirePremium, async (req, res) => {
    try {
      const sermon = await storage.getSermon(req.params.id);
      if (!sermon) {
        return res.status(404).json({ error: "Sermon not found" });
      }

      // Get sermon transcripts to generate action points
      const transcripts = await storage.getSermonTranscripts(sermon.id);
      const fullContent = transcripts.map(t => t.englishTranslation).join(" ");

      const actionPoints = await generateActionPoints(fullContent, sermon.title);
      res.json({ actionPoints });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate sermon summary (premium only)
  app.post("/api/sermons/:id/summary", requireAuth, requirePremium, async (req, res) => {
    try {
      const sermon = await storage.getSermon(req.params.id);
      if (!sermon) {
        return res.status(404).json({ error: "Sermon not found" });
      }

      const transcripts = await storage.getSermonTranscripts(sermon.id);
      const fullContent = transcripts.map(t => t.englishTranslation).join(" ");

      const summary = await generateSermonSummary(fullContent);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ NOTES ROUTES ============

  // Get user notes
  app.get("/api/notes", requireAuth, async (req, res) => {
    try {
      const sermonId = req.query.sermonId as string;
      const notes = sermonId
        ? await storage.getSermonNotes(req.user!.id, sermonId)
        : await storage.getUserNotes(req.user!.id);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create note
  app.post("/api/notes", requireAuth, async (req, res) => {
    try {
      const validated = insertNoteSchema.parse(req.body);
      const note = await storage.createNote({
        ...validated,
        userId: req.user!.id,
      });
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update note
  app.patch("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      await storage.updateNote(req.params.id, req.body.content);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete note
  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ JOURNAL ROUTES (Premium) ============

  // Get journal entries
  app.get("/api/journal", requireAuth, requirePremium, async (req, res) => {
    try {
      const entries = await storage.getUserJournalEntries(req.user!.id);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create journal entry with AI-generated prompt
  app.post("/api/journal", requireAuth, requirePremium, async (req, res) => {
    try {
      const validated = insertJournalEntrySchema.parse(req.body);
      
      // Generate AI prompt if sermon is provided
      let prompt = validated.prompt;
      if (validated.sermonId && !prompt) {
        const sermon = await storage.getSermon(validated.sermonId);
        if (sermon) {
          prompt = await generateJournalPrompt(sermon.title, sermon.mainTheme || "spiritual growth");
        }
      }

      const entry = await storage.createJournalEntry({
        ...validated,
        userId: req.user!.id,
        prompt: prompt || "What lesson from today's khutbah will you apply this week?",
      });
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update journal entry
  app.patch("/api/journal/:id", requireAuth, requirePremium, async (req, res) => {
    try {
      await storage.updateJournalEntry(req.params.id, req.body.content, req.body.mood);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete journal entry
  app.delete("/api/journal/:id", requireAuth, requirePremium, async (req, res) => {
    try {
      await storage.deleteJournalEntry(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ ANALYTICS ROUTES (Premium) ============

  // Get user analytics
  app.get("/api/analytics", requireAuth, requirePremium, async (req, res) => {
    try {
      const analytics = await storage.getUserAnalytics(req.user!.id);
      res.json(analytics || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update analytics
  app.patch("/api/analytics", requireAuth, requirePremium, async (req, res) => {
    try {
      await storage.updateUserAnalytics(req.user!.id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PREFERENCES ROUTES ============

  // Get preferences
  app.get("/api/preferences", requireAuth, async (req, res) => {
    try {
      const prefs = await storage.getUserPreferences(req.user!.id);
      res.json(prefs || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update preferences
  app.patch("/api/preferences", requireAuth, async (req, res) => {
    try {
      await storage.updateUserPreferences(req.user!.id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PRAYER TIMES ROUTES ============
  
  // Get prayer times for a location
  app.get("/api/prayer-times", async (req, res) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Valid latitude and longitude required" });
      }
      
      const { calculatePrayerTimes, getTimeUntilNextPrayer } = await import("./prayer-times");
      const prayerTimes = calculatePrayerTimes({ latitude, longitude });
      const nextPrayerInfo = getTimeUntilNextPrayer(prayerTimes);
      
      res.json({
        ...prayerTimes,
        nextPrayer: nextPrayerInfo,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ QURAN ROUTES ============
  
  // Get all surahs (index)
  app.get("/api/quran/surahs", async (req, res) => {
    try {
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/en/index.json"
      );
      const surahs = await response.json();
      res.json(surahs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get specific surah with verses
  app.get("/api/quran/surah/:id", async (req, res) => {
    try {
      const surahId = parseInt(req.params.id);
      if (isNaN(surahId) || surahId < 1 || surahId > 114) {
        return res.status(400).json({ error: "Surah ID must be between 1 and 114" });
      }
      
      const response = await fetch(
        `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/en/${surahId}.json`
      );
      const surah = await response.json();
      res.json(surah);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DUAS ROUTES ============
  
  // Get all duas (optionally filtered by category)
  app.get("/api/duas", async (req, res) => {
    try {
      const { category } = req.query;
      
      if (category && typeof category === "string") {
        const categoryDuas = await db
          .select()
          .from(duas)
          .where(eq(duas.category, category));
        return res.json(categoryDuas);
      }
      
      const allDuas = await db.select().from(duas);
      res.json(allDuas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user's favorited duas
  app.get("/api/duas/favorites", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const favorites = await db
        .select({
          id: duas.id,
          arabicText: duas.arabicText,
          transliteration: duas.transliteration,
          translation: duas.translation,
          category: duas.category,
          occasion: duas.occasion,
          reference: duas.reference,
          favoriteId: favoriteDuas.id,
          favoritedAt: favoriteDuas.createdAt,
        })
        .from(favoriteDuas)
        .innerJoin(duas, eq(favoriteDuas.duaId, duas.id))
        .where(eq(favoriteDuas.userId, userId));
      
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Add a dua to favorites
  app.post("/api/duas/:id/favorite", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const duaId = req.params.id;
      
      // Check if already favorited
      const existing = await db
        .select()
        .from(favoriteDuas)
        .where(and(
          eq(favoriteDuas.userId, userId),
          eq(favoriteDuas.duaId, duaId)
        ));
      
      if (existing.length > 0) {
        return res.status(409).json({ error: "Dua already favorited" });
      }
      
      const [favorite] = await db
        .insert(favoriteDuas)
        .values({ userId, duaId })
        .returning();
      
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Remove a dua from favorites
  app.delete("/api/duas/:id/favorite", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const duaId = req.params.id;
      
      await db
        .delete(favoriteDuas)
        .where(and(
          eq(favoriteDuas.userId, userId),
          eq(favoriteDuas.duaId, duaId)
        ));
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
