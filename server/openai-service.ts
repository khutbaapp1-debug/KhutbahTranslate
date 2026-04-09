// AI service for khutbah transcription, translation, and AI features
// Uses Groq (free tier) when GROQ_API_KEY is set, falls back to OpenAI
import OpenAI from "openai";
import Groq from "groq-sdk";
import { getLanguageConfig } from "@shared/language-config";
import { translationCacheService } from "./translation-cache";

// Groq models (free tier)
const GROQ_TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";
const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";

// OpenAI fallback models
const OPENAI_TRANSCRIPTION_MODEL = "whisper-1";
const OPENAI_CHAT_MODEL_FAST = "gpt-4o-mini";
const OPENAI_CHAT_MODEL_QUALITY = "gpt-4o";

function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return new Groq({ apiKey: key });
}

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Translation cache statistics
let cacheHits = 0;
let cacheMisses = 0;

export function getTranslationStats() {
  return { cacheHits, cacheMisses, hitRate: cacheHits / (cacheHits + cacheMisses) || 0 };
}

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface TranslationResult {
  translatedText: string;
  originalText: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface ActionPoint {
  content: string;
  category: string;
}

export interface SermonSummary {
  mainThemes: string[];
  keyPoints: string[];
  shortSummary: string;
  detailedSummary: string;
}

// Transcribe audio — uses Groq whisper-large-v3-turbo (free) or OpenAI whisper-1
export async function transcribeArabicAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  try {
    const blob = new Blob([audioBuffer], { type: "audio/wav" });
    const audioFile = new File([blob], "audio.wav", { type: "audio/wav" });

    const groq = getGroqClient();

    if (groq) {
      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: GROQ_TRANSCRIPTION_MODEL,
      });
      return { text: transcription.text };
    }

    // Fallback to OpenAI
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: OPENAI_TRANSCRIPTION_MODEL,
    });
    return { text: transcription.text };
  } catch (error: any) {
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}

// Chat completion helper — uses Groq Llama (free) or OpenAI
async function chatComplete(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts: { json?: boolean; quality?: "fast" | "quality" } = {}
): Promise<string> {
  const groq = getGroqClient();

  if (groq) {
    const response = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      messages,
      ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
    });
    return response.choices[0].message.content || "";
  }

  // Fallback to OpenAI
  const openai = getOpenAIClient();
  const model = opts.quality === "quality" ? OPENAI_CHAT_MODEL_QUALITY : OPENAI_CHAT_MODEL_FAST;
  const response = await openai.chat.completions.create({
    model,
    messages,
    ...(opts.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return response.choices[0].message.content || "";
}

// Translate text from any language — uses cache first, then Groq Llama or OpenAI
export async function translateArabicToEnglish(sourceText: string): Promise<TranslationResult> {
  try {
    const languageConfig = getLanguageConfig();
    const targetLanguage = languageConfig.targetLanguage;

    if (!sourceText || sourceText.trim().length < 2) {
      return { translatedText: "", originalText: sourceText, targetLanguage: languageConfig.displayName };
    }

    // STEP 1: Check Islamic phrase dictionary (instant, free)
    const phraseMatch = await translationCacheService.checkPhraseDictionary(sourceText);
    if (phraseMatch) {
      cacheHits++;
      return { translatedText: phraseMatch, originalText: sourceText, sourceLanguage: "Arabic", targetLanguage: languageConfig.displayName };
    }

    // STEP 2: Check translation cache
    const cachedTranslation = await translationCacheService.checkTranslationCache(sourceText, targetLanguage);
    if (cachedTranslation) {
      cacheHits++;
      return { translatedText: cachedTranslation, originalText: sourceText, sourceLanguage: "Arabic", targetLanguage: languageConfig.displayName };
    }

    // STEP 3: Call AI
    cacheMisses++;
    const provider = getGroqClient() ? "Groq" : "OpenAI";
    console.log(`[AI] Cache miss — calling ${provider} for: "${sourceText.substring(0, 30)}..."`);

    const prompt = `You are translating a live khutbah (Islamic sermon) in real-time. Each audio chunk is a short fragment of a longer sermon.

The source text may be in ANY language (Arabic, Urdu, Hindi, French, English, etc). Auto-detect the source language and translate to ${targetLanguage}.

TRANSLATE EXACTLY WHAT IS SAID - nothing more, nothing less.

RULES:
1. Auto-detect source language
2. Preserve Islamic terminology: keep "Allah", "SubhanAllah", "Alhamdulillah", "Insha'Allah", "salah", "jannah", "iman"
3. Add (SAW) or (PBUH) after Prophet Muhammad mentions
4. Add (AS) after other prophet mentions
5. If text is empty or just background noise, return empty translation
6. NEVER add commentary, requests for context, or explanations
7. Remove social media phrases (subscribe, like, share, follow)
8. NEVER include translator names or attributions
9. If source is already in target language, return it as-is

Text to translate:
${sourceText}

Respond in JSON: { "translation": "the translation only", "detectedLanguage": "detected source language name" }`;

    const content = await chatComplete(
      [
        {
          role: "system",
          content: `You are a real-time multilingual-to-${targetLanguage} translator for Islamic sermons. Translate ONLY what is said, no commentary.`,
        },
        { role: "user", content: prompt },
      ],
      { json: true, quality: "fast" }
    );

    const result = JSON.parse(content || "{}");
    let translation = result.translation || "";
    const detectedLanguage = result.detectedLanguage || "Unknown";

    // Filter out unwanted AI commentary phrases
    const unwantedPhrases = [
      /subscribe to (the|our) channel/gi,
      /like and subscribe/gi,
      /follow us on/gi,
      /share this video/gi,
      /don't forget to subscribe/gi,
      /hit the bell icon/gi,
      /turn on notifications/gi,
      /please provide (the )?full sermon/gi,
      /this (is|appears to be) (only )?(a )?fragment/gi,
      /I need more context/gi,
      /could you provide more/gi,
      /this is incomplete/gi,
      /^thank you\.?$/gi,
      /^thanks\.?$/gi,
      /translated by [a-z\s]+$/gi,
      /translation by [a-z\s]+$/gi,
      /translator:?\s*[a-z\s]+$/gi,
    ];
    for (const regex of unwantedPhrases) {
      translation = translation.replace(regex, "").trim();
    }
    translation = translation.replace(/\s{2,}/g, " ").trim();
    translation = translation.replace(/^[,.\s]+|[,.\s]+$/g, "").trim();

    // STEP 4: Save to cache
    if (translation.length > 0) {
      await translationCacheService.saveToCache(sourceText, translation, detectedLanguage, targetLanguage);
    }

    return { translatedText: translation, originalText: sourceText, sourceLanguage: detectedLanguage, targetLanguage: languageConfig.displayName };
  } catch (error: any) {
    throw new Error("Failed to translate: " + error.message);
  }
}

// Generate weekly action points from sermon content
export async function generateActionPoints(sermonContent: string, sermonTitle: string): Promise<ActionPoint[]> {
  try {
    const prompt = `Based on the following Friday khutbah (sermon), generate 3-5 practical action points that listeners can implement in their daily lives this week.

Sermon Title: ${sermonTitle}

Sermon Content:
${sermonContent}

Generate specific, actionable items that:
1. Are achievable within one week
2. Connect directly to the sermon's teachings
3. Have clear, measurable outcomes
4. Are spiritually meaningful

Respond in JSON format: { "actionPoints": [{"content": "specific action", "category": "spiritual/social/personal"}] }`;

    const content = await chatComplete(
      [
        { role: "system", content: "You are an Islamic scholar helping Muslims implement khutbah teachings in their daily lives." },
        { role: "user", content: prompt },
      ],
      { json: true, quality: "quality" }
    );

    const result = JSON.parse(content || "{}");
    return result.actionPoints || [];
  } catch (error: any) {
    throw new Error("Failed to generate action points: " + error.message);
  }
}

// Generate sermon summary with main themes
export async function generateSermonSummary(sermonContent: string): Promise<SermonSummary> {
  try {
    const prompt = `Analyze this Friday khutbah (sermon) and provide a comprehensive summary.

Sermon Content:
${sermonContent}

Extract:
1. Main themes (2-4 major topics)
2. Key points (4-6 important teachings)
3. Short summary (2-3 sentences)
4. Detailed summary (2-3 paragraphs)

Respond in JSON format: {
  "mainThemes": ["theme1", "theme2"],
  "keyPoints": ["point1", "point2"],
  "shortSummary": "brief overview",
  "detailedSummary": "comprehensive summary"
}`;

    const content = await chatComplete(
      [
        { role: "system", content: "You are an Islamic scholar specializing in khutbah analysis and summarization." },
        { role: "user", content: prompt },
      ],
      { json: true, quality: "quality" }
    );

    const result = JSON.parse(content || "{}");
    return {
      mainThemes: result.mainThemes || [],
      keyPoints: result.keyPoints || [],
      shortSummary: result.shortSummary || "",
      detailedSummary: result.detailedSummary || "",
    };
  } catch (error: any) {
    throw new Error("Failed to generate summary: " + error.message);
  }
}

// Generate personalized sermon recommendations
export async function generateSermonRecommendations(userInterests: string[], recentSermons: string[]): Promise<string[]> {
  try {
    const prompt = `Based on a user's interests and recently attended khutbahs, recommend 5 relevant sermon topics they might find beneficial.

User Interests: ${userInterests.join(", ")}
Recent Sermons: ${recentSermons.join(", ")}

Respond in JSON format: { "recommendations": ["topic1", "topic2", ...] }`;

    const content = await chatComplete(
      [
        { role: "system", content: "You are an Islamic education advisor helping Muslims discover relevant religious content." },
        { role: "user", content: prompt },
      ],
      { json: true, quality: "quality" }
    );

    const result = JSON.parse(content || "{}");
    return result.recommendations || [];
  } catch (error: any) {
    throw new Error("Failed to generate recommendations: " + error.message);
  }
}

// Generate practical implementation guidelines for khutbah
export async function generateKhutbahGuidelines(sermonTitle: string, mainTheme?: string, summary?: string): Promise<Array<{ text: string; category: string }>> {
  try {
    const themeInfo = mainTheme ? `Main Theme: ${mainTheme}` : "";
    const summaryInfo = summary ? `Summary: ${summary}` : "";

    const prompt = `Generate 5-7 practical implementation suggestions for a Muslim who attended a khutbah titled "${sermonTitle}".

${themeInfo}
${summaryInfo}

For each suggestion:
1. Make it specific and actionable for the coming week
2. Connect it directly to the khutbah's teachings
3. Make it realistic and achievable
4. Assign a category: "Family", "Work", "Spiritual Practice", "Community", or "Personal Growth"

Respond in JSON format: { "suggestions": [{"text": "...", "category": "..."}, ...] }`;

    const content = await chatComplete(
      [
        { role: "system", content: "You are an Islamic counselor helping Muslims apply religious teachings to their daily lives in practical, achievable ways." },
        { role: "user", content: prompt },
      ],
      { json: true, quality: "fast" }
    );

    const result = JSON.parse(content || "{}");
    return result.suggestions || [];
  } catch (error: any) {
    throw new Error("Failed to generate khutbah guidelines: " + error.message);
  }
}
