import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated, authStorage } from "./replit_integrations/auth";
import {
  transcribeArabicAudio,
  translateArabicToEnglish,
  generateActionPoints,
  generateSermonSummary,
  generateKhutbahGuidelines,
} from "./openai-service";
import { insertSermonSchema, insertNoteSchema, insertKhutbahGuidelineSchema, insertMissedPrayerSchema, duas, favoriteDuas, hadiths, favoriteHadiths, userPreferences, users, khutbahGuidelines, missedPrayers, sermons } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { checkTranslationLimit, addTranslationMinutes, getUserUsageInfo, redeemAdCredit } from "./translation-limits";

// Middleware for authenticated routes - gets full user from database
async function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user?.claims?.sub) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Get full user from database using OIDC subject
  const user = await authStorage.getUserByOidcSubject(req.user.claims.sub);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  
  // Attach full user to request
  req.dbUser = user;
  next();
}

// Middleware for admin users only (requires admin API key)
function requireAdmin(req: any, res: any, next: any) {
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  // If no admin API key is set, deny all admin requests for security
  if (!adminApiKey) {
    return res.status(403).json({ error: "Admin functionality not configured" });
  }
  
  // Check for admin API key in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Admin authentication required. Provide admin API key in Authorization header." });
  }
  
  const providedKey = authHeader.slice(7); // Remove 'Bearer ' prefix
  
  if (providedKey !== adminApiKey) {
    return res.status(403).json({ error: "Invalid admin API key" });
  }
  
  next();
}

// Middleware for premium users — app is free, all features open to everyone
function requirePremium(_req: any, _res: any, next: any) {
  return next();
}

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth routes: /api/login, /api/logout, /api/callback
  await setupAuth(app);
  // Register /api/auth/user endpoint
  registerAuthRoutes(app);

  // ============ SERMON ROUTES ============
  
  // Get user's sermons
  app.get("/api/sermons", requireAuth, async (req, res) => {
    try {
      const sermons = await storage.getUserSermons(req.dbUser.id);
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
      if (sermon.userId !== req.dbUser.id && !sermon.isPublic) {
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
      if (!sermon || (sermon.userId !== req.dbUser.id && !sermon.isPublic)) {
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
        userId: req.dbUser.id,
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
      if (!sermon || sermon.userId !== req.dbUser.id) {
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
      if (!sermon || sermon.userId !== req.dbUser.id) {
        return res.status(404).json({ error: "Sermon not found" });
      }
      await storage.deleteSermon(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ ACCOUNT MANAGEMENT ============

  // Delete the authenticated user's account and all associated data
  app.delete("/api/account", requireAuth, async (req, res) => {
    try {
      const userId = req.dbUser.id;
      await storage.deleteUser(userId);
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ error: "Account deleted but logout failed" });
        }
        req.session.destroy(() => {
          res.clearCookie("connect.sid");
          res.json({ success: true });
        });
      });
    } catch (error: any) {
      console.error("Account deletion error:", error);
      res.status(500).json({ error: error.message || "Failed to delete account" });
    }
  });

  // ============ AUDIO TRANSCRIPTION & TRANSLATION ============
  
  // Get translation usage info (authenticated users only)
  app.get("/api/translation/usage", requireAuth, async (req, res) => {
    try {
      const usage = await getUserUsageInfo(req.dbUser.id);
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Redeem ad credit: +30 minutes after watching ad (authenticated users only)
  app.post("/api/translation/redeem-ad", requireAuth, async (req, res) => {
    try {
      const usage = await redeemAdCredit(req.dbUser.id);
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
        ? await storage.getSermonNotes(req.dbUser.id, sermonId)
        : await storage.getUserNotes(req.dbUser.id);
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
        userId: req.dbUser.id,
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

  // ============ ANALYTICS ROUTES (Premium) ============

  // Get user analytics
  app.get("/api/analytics", requireAuth, requirePremium, async (req, res) => {
    try {
      const analytics = await storage.getUserAnalytics(req.dbUser.id);
      res.json(analytics || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update analytics
  app.patch("/api/analytics", requireAuth, requirePremium, async (req, res) => {
    try {
      await storage.updateUserAnalytics(req.dbUser.id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ PREFERENCES ROUTES ============

  // Get preferences
  app.get("/api/preferences", requireAuth, async (req, res) => {
    try {
      const prefs = await storage.getUserPreferences(req.dbUser.id);
      res.json(prefs || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update preferences
  app.patch("/api/preferences", requireAuth, async (req, res) => {
    try {
      await storage.updateUserPreferences(req.dbUser.id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ KHUTBAH GUIDELINES ROUTES ============

  // Get all guidelines for user
  app.get("/api/khutbah-guidelines", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const guidelines = await db.select()
        .from(khutbahGuidelines)
        .where(eq(khutbahGuidelines.userId, userId))
        .orderBy(sql`${khutbahGuidelines.createdAt} DESC`);
      res.json(guidelines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get guidelines for a specific sermon
  app.get("/api/khutbah-guidelines/sermon/:sermonId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { sermonId } = req.params;
      const guidelines = await db.select()
        .from(khutbahGuidelines)
        .where(and(
          eq(khutbahGuidelines.userId, userId),
          eq(khutbahGuidelines.sermonId, sermonId)
        ));
      res.json(guidelines[0] || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate new guidelines
  app.post("/api/khutbah-guidelines", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Validate only client-provided fields
      const schema = z.object({
        sermonId: z.string(),
        title: z.string().optional(),
      });
      const validated = schema.parse(req.body);
      
      // Fetch sermon details for AI generation
      const [sermon] = await db.select().from(sermons).where(eq(sermons.id, validated.sermonId));
      if (!sermon) {
        return res.status(404).json({ error: "Sermon not found" });
      }

      // Generate suggestions using AI
      const suggestions = await generateKhutbahGuidelines(
        sermon.title,
        sermon.mainTheme || undefined,
        sermon.englishTranslation || undefined
      );

      // Add completed flag to each suggestion
      const suggestionsWithFlags = suggestions.map(s => ({ ...s, completed: false }));

      // Create guideline
      const [guideline] = await db.insert(khutbahGuidelines).values({
        userId,
        sermonId: validated.sermonId,
        title: validated.title || "Weekly Implementation Plan",
        suggestions: suggestionsWithFlags as any,
        weekStartDate: new Date(),
      }).returning();

      res.status(201).json(guideline);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update guidelines (mark suggestions as completed)
  app.patch("/api/khutbah-guidelines/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      
      // Validate PATCH payload - only allow suggestions updates
      const schema = z.object({
        suggestions: z.array(z.object({
          category: z.string(),
          suggestion: z.string(),
          completed: z.boolean(),
        })),
      });
      const validated = schema.parse(req.body);

      const [updated] = await db.update(khutbahGuidelines)
        .set({ suggestions: validated.suggestions as any })
        .where(and(
          eq(khutbahGuidelines.id, id),
          eq(khutbahGuidelines.userId, userId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Guideline not found" });
      }

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete guidelines
  app.delete("/api/khutbah-guidelines/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;

      await db.delete(khutbahGuidelines)
        .where(and(
          eq(khutbahGuidelines.id, id),
          eq(khutbahGuidelines.userId, userId)
        ));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MISSED PRAYERS (QADA) ROUTES ============

  // Get all missed prayers for user
  app.get("/api/missed-prayers", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const prayers = await db.select()
        .from(missedPrayers)
        .where(eq(missedPrayers.userId, userId))
        .orderBy(sql`${missedPrayers.dateMissed} DESC`);
      res.json(prayers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get statistics and makeup plan
  app.get("/api/missed-prayers/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Count total missed and made-up prayers
      const [stats] = await db.select({
        total: sql<number>`COUNT(*)`,
        madeUp: sql<number>`COUNT(*) FILTER (WHERE ${missedPrayers.madeUp} = true)`,
        remaining: sql<number>`COUNT(*) FILTER (WHERE ${missedPrayers.madeUp} = false)`,
      }).from(missedPrayers).where(eq(missedPrayers.userId, userId));

      // Calculate makeup plan (assuming 1 makeup prayer per day)
      const daysNeeded = Math.ceil(stats.remaining / 1);
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + daysNeeded);

      res.json({
        ...stats,
        daysNeeded,
        estimatedCompletionDate: completionDate,
        makeupPerDay: 1,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Log a new missed prayer
  app.post("/api/missed-prayers", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Validate only client-provided fields
      const schema = z.object({
        prayerType: z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
        dateMissed: z.string().or(z.date()),
        notes: z.string().optional(),
      });
      const validated = schema.parse(req.body);

      const [prayer] = await db.insert(missedPrayers).values({
        userId,
        prayerType: validated.prayerType,
        dateMissed: new Date(validated.dateMissed),
        notes: validated.notes,
        madeUp: false,
      }).returning();

      res.status(201).json(prayer);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Mark a prayer as made up
  app.patch("/api/missed-prayers/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      
      // Validate PATCH payload
      const schema = z.object({
        madeUp: z.boolean(),
        notes: z.string().optional(),
      });
      const validated = schema.parse(req.body);

      const updateData: any = {
        madeUp: validated.madeUp,
        dateMadeUp: validated.madeUp ? new Date() : null,
      };
      if (validated.notes !== undefined) {
        updateData.notes = validated.notes;
      }

      const [updated] = await db.update(missedPrayers)
        .set(updateData)
        .where(and(
          eq(missedPrayers.id, id),
          eq(missedPrayers.userId, userId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Prayer not found" });
      }

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a missed prayer entry
  app.delete("/api/missed-prayers/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;

      await db.delete(missedPrayers)
        .where(and(
          eq(missedPrayers.id, id),
          eq(missedPrayers.userId, userId)
        ));

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
        asrMethod: asrMethod === 2 ? 'hanafi' : 'standard',
      });
      const nextPrayerInfo = getTimeUntilNextPrayer(prayerTimes, prayerTimes.timezone);
      
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
        // Daily Hadith
        dailyHadithEnabled: z.boolean().optional(),
        dailyHadithTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        // Prayer reminders
        prayerRemindersEnabled: z.boolean().optional(),
        prayerReminderMinutes: z.number().int().min(0).max(60, "Minutes must be between 0 and 60").optional(),
        fajrReminderEnabled: z.boolean().optional(),
        dhuhrReminderEnabled: z.boolean().optional(),
        asrReminderEnabled: z.boolean().optional(),
        maghribReminderEnabled: z.boolean().optional(),
        ishaReminderEnabled: z.boolean().optional(),
        // Jummah
        jummahReminderEnabled: z.boolean().optional(),
        jummahReminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        // Quran
        quranReminderEnabled: z.boolean().optional(),
        quranReminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        quranDailyGoalPages: z.number().int().min(1).max(30, "Daily goal must be between 1 and 30 pages").optional(),
        // Tasbih/Dhikr
        tasbihReminderEnabled: z.boolean().optional(),
        tasbihReminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        // Duas
        duaRemindersEnabled: z.boolean().optional(),
        duaMorningTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        duaEveningTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM").optional(),
        // Push notification token
        pushToken: z.string().optional(),
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

  // ============ ADMIN ROUTES ============
  
  // Grant complimentary premium access to a user
  app.post("/api/admin/grant-complimentary-access", requireAdmin, async (req, res) => {
    try {
      // Validate input with Zod
      const inputSchema = z.object({
        email: z.string().email("Valid email is required")
      });
      
      const validated = inputSchema.parse(req.body);
      const { email } = validated;
      
      // Use transaction to ensure atomic operation
      const result = await db.transaction(async (tx) => {
        // Find user by email (case-insensitive for consistency)
        const [user] = await tx
          .select()
          .from(users)
          .where(sql`LOWER(${users.email}) = LOWER(${email})`);
        
        if (!user) {
          throw new Error("User not found");
        }
        
        if (user.hasComplimentaryAccess) {
          throw new Error("User already has complimentary access");
        }
        
        // Atomically grant access only if count is below 15
        // This subquery ensures the limit is never exceeded even with concurrent requests
        const updateResult = await tx.execute(sql`
          UPDATE ${users}
          SET has_complimentary_access = true
          WHERE id = ${user.id}
          AND (
            SELECT COUNT(*) FROM ${users} WHERE has_complimentary_access = true
          ) < 15
          RETURNING *
        `);
        
        if (!updateResult.rows || updateResult.rows.length === 0) {
          throw new Error("Complimentary access limit reached. Maximum 15 users allowed.");
        }
        
        const updated = updateResult.rows[0] as any;
        
        // Get final count for response
        const [countResult] = await tx
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.hasComplimentaryAccess, true));
        
        const newCount = countResult?.count || 0;
        
        return { updated, newCount };
      });
      
      res.json({ 
        success: true, 
        message: `Granted complimentary access to ${email}`,
        user: {
          id: result.updated.id,
          email: result.updated.email,
          hasComplimentaryAccess: result.updated.has_complimentary_access
        },
        remainingSlots: 15 - result.newCount
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // Revoke complimentary premium access from a user
  app.post("/api/admin/revoke-complimentary-access", requireAdmin, async (req, res) => {
    try {
      // Validate input with Zod
      const inputSchema = z.object({
        email: z.string().email("Valid email is required")
      });
      
      const validated = inputSchema.parse(req.body);
      const { email } = validated;
      
      // Find user by email (case-insensitive for consistency)
      const [user] = await db
        .select()
        .from(users)
        .where(sql`LOWER(${users.email}) = LOWER(${email})`);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.hasComplimentaryAccess) {
        return res.status(400).json({ error: "User does not have complimentary access" });
      }
      
      // Revoke complimentary access
      const [updated] = await db
        .update(users)
        .set({ hasComplimentaryAccess: false })
        .where(eq(users.id, user.id))
        .returning();
      
      res.json({ 
        success: true, 
        message: `Revoked complimentary access from ${email}`,
        user: {
          id: updated.id,
          email: updated.email,
          hasComplimentaryAccess: updated.hasComplimentaryAccess
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });
  
  // List all users with complimentary access
  app.get("/api/admin/complimentary-users", requireAdmin, async (req, res) => {
    try {
      const complimentaryUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          hasComplimentaryAccess: users.hasComplimentaryAccess,
          createdAt: users.createdAt
        })
        .from(users)
        .where(eq(users.hasComplimentaryAccess, true));
      
      res.json({ 
        users: complimentaryUsers,
        count: complimentaryUsers.length,
        remainingSlots: 15 - complimentaryUsers.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ TRANSLATION CACHE ROUTES ============
  
  // Get translation cache statistics (public, for monitoring)
  app.get("/api/translation-cache/stats", async (req, res) => {
    try {
      const { translationCacheService } = await import("./translation-cache");
      const { getTranslationStats } = await import("./openai-service");
      
      const cacheStats = await translationCacheService.getCacheStats();
      const sessionStats = getTranslationStats();
      
      res.json({
        database: cacheStats,
        session: sessionStats,
        estimatedCostSavings: `$${(cacheStats.totalHits * 0.0001).toFixed(4)}` // Rough estimate
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Seed Islamic phrase dictionary (admin only)
  app.post("/api/admin/seed-phrases", requireAdmin, async (req, res) => {
    try {
      const { seedIslamicPhrases } = await import("./islamic-phrases-seed");
      const count = await seedIslamicPhrases();
      
      res.json({ 
        success: true, 
        message: `Seeded ${count} Islamic phrases to the dictionary`,
        phrasesAdded: count
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ STRIPE ROUTES ============

  // Create a checkout session for premium subscription
  app.post("/api/stripe/checkout", requireAuth, async (req, res) => {
    try {
      const { getStripeClient } = await import("./stripeClient");
      const stripe = getStripeClient();

      const user = req.dbUser;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Find or create Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
          metadata: { userId: user.id },
        });
        await db.update(users)
          .set({ stripeCustomerId: customer.id })
          .where(eq(users.id, user.id));
        customerId = customer.id;
      }

      // Find the premium price in Stripe
      const prices = await stripe.prices.list({
        active: true,
        type: "recurring",
        limit: 10,
      });

      // Look for the $4.99/month price
      let priceId = prices.data.find(p => p.unit_amount === 499)?.id;
      
      if (!priceId) {
        // Create the product and price if it doesn't exist
        const product = await stripe.products.create({
          name: "Khutbah Companion Premium",
          description: "Unlimited AI features, khutbah database access, analytics dashboard, and more.",
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 499,
          currency: "usd",
          recurring: { interval: "month" },
        });
        priceId = price.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
        metadata: { userId: user.id },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify checkout session and upgrade user to premium
  app.post("/api/stripe/verify-session", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const { getStripeClient } = await import("./stripeClient");
      const stripe = getStripeClient();

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });

      if (session.payment_status === "paid" || session.status === "complete") {
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

        // Upgrade user to premium
        await db.update(users)
          .set({
            subscriptionTier: "premium",
            stripeSubscriptionId: subscriptionId || null,
            subscriptionExpiresAt: null, // Ongoing subscription
          })
          .where(eq(users.id, req.dbUser.id));

        return res.json({ success: true, status: "premium" });
      }

      res.json({ success: false, status: session.payment_status });
    } catch (error: any) {
      console.error("Stripe verify-session error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook handler (raw body required — registered in index.ts before express.json)
  // The route /api/stripe/webhook is registered in server/index.ts

  // Get subscription status for logged-in user
  app.get("/api/stripe/subscription", requireAuth, async (req, res) => {
    try {
      const user = req.dbUser;
      if (!user.stripeSubscriptionId) {
        return res.json({ subscription: null, tier: user.subscriptionTier });
      }

      const { getStripeClient } = await import("./stripeClient");
      const stripe = getStripeClient();
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      res.json({ subscription, tier: user.subscriptionTier });
    } catch (error: any) {
      console.error("Stripe subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Customer portal — manage billing
  app.post("/api/stripe/portal", requireAuth, async (req, res) => {
    try {
      const user = req.dbUser;
      if (!user.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }

      const { getStripeClient } = await import("./stripeClient");
      const stripe = getStripeClient();
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/premium`,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error("Stripe portal error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
