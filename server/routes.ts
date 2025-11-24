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
import { insertSermonSchema, insertNoteSchema, insertJournalEntrySchema, duas, favoriteDuas, hadiths, favoriteHadiths, userPreferences } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { checkTranslationLimit, addTranslationMinutes, getUserUsageInfo, redeemAdCredit } from "./translation-limits";

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
  
  // Get translation usage info (authenticated users only)
  app.get("/api/translation/usage", requireAuth, async (req, res) => {
    try {
      const usage = await getUserUsageInfo(req.user!.id);
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Redeem ad credit: +30 minutes after watching ad (authenticated users only)
  app.post("/api/translation/redeem-ad", requireAuth, async (req, res) => {
    try {
      const usage = await redeemAdCredit(req.user!.id);
      res.json({
        success: true,
        message: "+30 minutes added to your account!",
        usage,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Transcribe and translate audio chunk
  // Free tier: 1 hour per month base (60 minutes) + up to 2 hours from ads (120 minutes)
  // Premium: unlimited
  // Anonymous users: unlimited (no tracking)
  app.post("/api/transcribe", upload.single("audio"), checkTranslationLimit, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      // Transcribe audio with auto-detection (supports Arabic, Urdu, Hindi, French, etc.)
      const transcription = await transcribeArabicAudio(req.file.buffer);
      
      // Translate from detected language to target language
      const translation = await translateArabicToEnglish(transcription.text);

      // Track usage for authenticated users (10 seconds per chunk = 0.167 minutes)
      if (req.user) {
        const chunkDurationMinutes = 10 / 60; // 10 seconds = 0.167 minutes
        await addTranslationMinutes(req.user.id, chunkDurationMinutes);
      }

      // If sermonId is provided, save the transcript
      if (req.body.sermonId) {
        await storage.createTranscript({
          sermonId: req.body.sermonId,
          arabicText: translation.originalText,
          englishTranslation: translation.translatedText,
          sequenceNumber: parseInt(req.body.sequenceNumber || "0"),
          timestampSeconds: req.body.timestampSeconds || "0",
        });
      }

      res.json({
        arabic: translation.originalText, // Original text in any detected language
        translation: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
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
      const method = (req.query.method as string)?.toUpperCase() || 'ISNA';
      const asrMethod = req.query.asrMethod === 'hanafi' ? 2 : 1;
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Valid latitude and longitude required" });
      }

      // Validate method
      const validMethods = ['ISNA', 'MWL', 'EGYPTIAN', 'KARACHI', 'MAKKAH', 'JAFARI', 'TEHRAN'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ error: "Invalid calculation method" });
      }
      
      const { calculatePrayerTimes, getTimeUntilNextPrayer } = await import("./prayer-times");
      const prayerTimes = calculatePrayerTimes({ 
        latitude, 
        longitude,
        method: method as any,
        asrMethod: asrMethod as 1 | 2,
      });
      const nextPrayerInfo = getTimeUntilNextPrayer(prayerTimes);
      
      res.json({
        ...prayerTimes,
        nextPrayer: nextPrayerInfo,
        method,
        asrMethod: asrMethod === 2 ? 'hanafi' : 'standard',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MOSQUES ROUTES ============
  
  // Get nearby mosques using OpenStreetMap Overpass API
  app.get("/api/mosques/nearby", async (req, res) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radius = parseInt(req.query.radius as string) || 5000; // default 5km
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Valid latitude and longitude required" });
      }
      
      // Query Overpass API for mosques within radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
          relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
        );
        out center;
      `;
      
      const overpassUrl = "https://overpass-api.de/api/interpreter";
      const response = await fetch(overpassUrl, {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch mosques from OpenStreetMap");
      }
      
      const data: any = await response.json();
      
      // Calculate distance using Haversine formula
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };
      
      // Process and format mosque data
      const mosques = data.elements.map((element: any) => {
        const lat = element.center?.lat || element.lat;
        const lon = element.center?.lon || element.lon;
        const distance = calculateDistance(latitude, longitude, lat, lon);
        
        return {
          id: element.id.toString(),
          name: element.tags?.name || "Unnamed Mosque",
          latitude: lat,
          longitude: lon,
          distance: distance.toFixed(2),
          address: [
            element.tags?.["addr:street"],
            element.tags?.["addr:housenumber"],
            element.tags?.["addr:city"],
            element.tags?.["addr:postcode"],
          ].filter(Boolean).join(", ") || "Address not available",
          denomination: element.tags?.denomination,
          website: element.tags?.website,
          phone: element.tags?.phone,
        };
      }).sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance));
      
      res.json(mosques);
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

  // ============ HADITH ROUTES ============
  
  // Get daily hadith (rotates daily based on date)
  app.get("/api/hadiths/daily", async (req, res) => {
    try {
      // Get all hadiths
      const allHadiths = await db.select().from(hadiths);
      
      if (allHadiths.length === 0) {
        return res.status(404).json({ error: "No hadiths available" });
      }
      
      // Use UTC date to deterministically select a hadith (consistent globally)
      const today = new Date();
      const utcDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const dayOfYear = Math.floor((utcDate.getTime() - Date.UTC(today.getUTCFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const index = dayOfYear % allHadiths.length;
      const dailyHadith = allHadiths[index];
      
      // If user is authenticated, check if it's favorited
      let isFavorited = false;
      if (req.isAuthenticated() && req.user) {
        const userId = (req.user as any).id;
        const favorite = await db
          .select()
          .from(favoriteHadiths)
          .where(and(
            eq(favoriteHadiths.userId, userId),
            eq(favoriteHadiths.hadithId, dailyHadith.id)
          ));
        isFavorited = favorite.length > 0;
      }
      
      res.json({ ...dailyHadith, isFavorited });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all hadiths
  app.get("/api/hadiths", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let query = db.select().from(hadiths);
      
      if (category) {
        query = query.where(eq(hadiths.category, category)) as any;
      }
      
      const allHadiths = await query;
      
      // If user is authenticated, include favorite status
      if (req.isAuthenticated() && req.user) {
        const userId = (req.user as any).id;
        const favorites = await db
          .select()
          .from(favoriteHadiths)
          .where(eq(favoriteHadiths.userId, userId));
        
        const favoriteIds = new Set(favorites.map(f => f.hadithId));
        const hadithsWithFavorites = allHadiths.map(h => ({
          ...h,
          isFavorited: favoriteIds.has(h.id),
        }));
        
        return res.json(hadithsWithFavorites);
      }
      
      res.json(allHadiths.map(h => ({ ...h, isFavorited: false })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user's favorited hadiths
  app.get("/api/hadiths/favorites", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const favorites = await db
        .select({
          id: hadiths.id,
          arabicText: hadiths.arabicText,
          englishTranslation: hadiths.englishTranslation,
          collection: hadiths.collection,
          bookNumber: hadiths.bookNumber,
          hadithNumber: hadiths.hadithNumber,
          narrator: hadiths.narrator,
          category: hadiths.category,
          reference: hadiths.reference,
          grade: hadiths.grade,
          favoriteId: favoriteHadiths.id,
          favoritedAt: favoriteHadiths.createdAt,
        })
        .from(favoriteHadiths)
        .innerJoin(hadiths, eq(favoriteHadiths.hadithId, hadiths.id))
        .where(eq(favoriteHadiths.userId, userId));
      
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Toggle favorite hadith
  app.post("/api/hadiths/:id/favorite", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const hadithId = req.params.id;
      
      // Check if already favorited
      const existing = await db
        .select()
        .from(favoriteHadiths)
        .where(and(
          eq(favoriteHadiths.userId, userId),
          eq(favoriteHadiths.hadithId, hadithId)
        ));
      
      if (existing.length > 0) {
        // Remove from favorites
        await db
          .delete(favoriteHadiths)
          .where(and(
            eq(favoriteHadiths.userId, userId),
            eq(favoriteHadiths.hadithId, hadithId)
          ));
        
        return res.json({ isFavorited: false });
      }
      
      // Add to favorites
      await db
        .insert(favoriteHadiths)
        .values({ userId, hadithId });
      
      res.json({ isFavorited: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ NOTIFICATION SETTINGS ROUTES ============
  
  // Get user notification preferences
  app.get("/api/notifications/settings", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      if (!prefs) {
        // Create default preferences if they don't exist
        const [newPrefs] = await db
          .insert(userPreferences)
          .values({ userId })
          .returning();
        return res.json(newPrefs);
      }
      
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update notification preferences
  app.patch("/api/notifications/settings", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Validate input with Zod schema
      const updateSchema = z.object({
        notificationsEnabled: z.boolean().optional(),
        dailyHadithEnabled: z.boolean().optional(),
        dailyHadithTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        prayerRemindersEnabled: z.boolean().optional(),
        prayerReminderMinutes: z.number().int().min(0).max(60).optional(),
        jummahReminderEnabled: z.boolean().optional(),
        jummahReminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
      });
      
      const validated = updateSchema.parse(req.body);
      
      // Check if preferences exist
      const [existing] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      if (!existing) {
        // Create new preferences
        const [newPrefs] = await db
          .insert(userPreferences)
          .values({ userId, ...validated })
          .returning();
        return res.json(newPrefs);
      }
      
      // Update existing preferences
      const [updated] = await db
        .update(userPreferences)
        .set(validated)
        .where(eq(userPreferences.userId, userId))
        .returning();
      
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Register push notification token
  app.post("/api/notifications/register-token", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { pushToken } = req.body;
      
      if (!pushToken) {
        return res.status(400).json({ error: "Push token required" });
      }
      
      await db
        .update(userPreferences)
        .set({ pushToken })
        .where(eq(userPreferences.userId, userId));
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
