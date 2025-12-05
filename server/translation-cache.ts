// Translation cache service for reducing OpenAI API calls
// Implements hybrid caching: phrase dictionary + segment cache
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import { translationCache, islamicPhrases } from "@shared/schema";

// Arabic diacritics (tashkeel) to remove for normalization
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670]/g;

// Normalize Arabic text for consistent matching
// Removes diacritics, trims whitespace, normalizes unicode
export function normalizeArabicText(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, '') // Remove tashkeel (diacritics)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .toLowerCase();
}

// Cache statistics for monitoring
export interface CacheStats {
  totalPhrases: number;
  totalCached: number;
  totalHits: number;
  estimatedSavings: number; // Estimated API calls saved
}

// Translation cache service
export class TranslationCacheService {
  // Check Islamic phrase dictionary first (instant, free)
  async checkPhraseDictionary(arabicText: string): Promise<string | null> {
    const normalized = normalizeArabicText(arabicText);
    
    try {
      const [phrase] = await db
        .select()
        .from(islamicPhrases)
        .where(eq(islamicPhrases.normalizedText, normalized))
        .limit(1);
      
      return phrase?.englishText || null;
    } catch (error) {
      console.error('Phrase dictionary lookup failed:', error);
      return null;
    }
  }

  // Check translation cache (previously translated segments)
  async checkTranslationCache(arabicText: string, targetLanguage: string = "English"): Promise<string | null> {
    const normalized = normalizeArabicText(arabicText);
    
    try {
      // Query by both normalizedText AND targetLanguage for proper multi-language support
      const [cached] = await db
        .select()
        .from(translationCache)
        .where(
          and(
            eq(translationCache.normalizedText, normalized),
            eq(translationCache.targetLanguage, targetLanguage)
          )
        )
        .limit(1);
      
      if (cached) {
        // Update hit count and last used timestamp
        await db
          .update(translationCache)
          .set({ 
            hitCount: sql`${translationCache.hitCount} + 1`,
            lastUsedAt: new Date()
          })
          .where(eq(translationCache.id, cached.id));
        
        return cached.translatedText;
      }
      
      return null;
    } catch (error) {
      console.error('Translation cache lookup failed:', error);
      return null;
    }
  }

  // Save a new translation to cache
  async saveToCache(
    originalText: string,
    translatedText: string,
    sourceLanguage: string = "Arabic",
    targetLanguage: string = "English"
  ): Promise<void> {
    const normalized = normalizeArabicText(originalText);
    
    // Skip caching very short or empty text
    if (normalized.length < 3 || !translatedText.trim()) {
      return;
    }
    
    try {
      // Use raw SQL for proper composite key upsert
      await db.execute(sql`
        INSERT INTO translation_cache (normalized_text, original_text, translated_text, source_language, target_language, hit_count, created_at, last_used_at)
        VALUES (${normalized}, ${originalText}, ${translatedText}, ${sourceLanguage}, ${targetLanguage}, 1, NOW(), NOW())
        ON CONFLICT (normalized_text, target_language) DO UPDATE SET
          translated_text = EXCLUDED.translated_text,
          source_language = EXCLUDED.source_language,
          hit_count = translation_cache.hit_count + 1,
          last_used_at = NOW()
      `);
    } catch (error) {
      console.error('Failed to save to translation cache:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats> {
    try {
      const [phraseCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(islamicPhrases);
      
      const [cacheCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(translationCache);
      
      const [hitSum] = await db
        .select({ total: sql<number>`coalesce(sum(${translationCache.hitCount}), 0)` })
        .from(translationCache);
      
      return {
        totalPhrases: Number(phraseCount?.count || 0),
        totalCached: Number(cacheCount?.count || 0),
        totalHits: Number(hitSum?.total || 0),
        estimatedSavings: Number(hitSum?.total || 0), // Each hit = 1 API call saved
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { totalPhrases: 0, totalCached: 0, totalHits: 0, estimatedSavings: 0 };
    }
  }

  // Add a new phrase to the dictionary
  async addPhrase(
    arabicText: string,
    englishText: string,
    category: string,
    frequency: string = "common"
  ): Promise<void> {
    const normalized = normalizeArabicText(arabicText);
    
    try {
      await db
        .insert(islamicPhrases)
        .values({
          arabicText: arabicText,
          normalizedText: normalized,
          englishText: englishText,
          category: category,
          frequency: frequency,
        })
        .onConflictDoNothing();
    } catch (error) {
      console.error('Failed to add phrase:', error);
    }
  }

  // Bulk add phrases to dictionary (for seeding)
  async seedPhrases(phrases: Array<{
    arabic: string;
    english: string;
    category: string;
    frequency?: string;
  }>): Promise<number> {
    let added = 0;
    
    for (const phrase of phrases) {
      try {
        const normalized = normalizeArabicText(phrase.arabic);
        await db
          .insert(islamicPhrases)
          .values({
            arabicText: phrase.arabic,
            normalizedText: normalized,
            englishText: phrase.english,
            category: phrase.category,
            frequency: phrase.frequency || "common",
          })
          .onConflictDoNothing();
        added++;
      } catch (error) {
        // Continue on conflict
      }
    }
    
    return added;
  }
}

export const translationCacheService = new TranslationCacheService();
