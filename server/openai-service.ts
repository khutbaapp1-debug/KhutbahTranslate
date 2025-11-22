// OpenAI service for khutbah transcription, translation, and AI features
// Based on javascript_openai blueprint
import OpenAI from "openai";
import { getLanguageConfig } from "@shared/language-config";

// Using gpt-4o model for reliable translations
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface TranslationResult {
  translatedText: string; // Language-agnostic - could be English, Hindi, French, etc.
  originalText: string; // Original text in any detected language
  sourceLanguage?: string; // Detected source language (if available)
  targetLanguage: string; // Which language this was translated to
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

// Transcribe audio using Whisper with auto-detection
// Can detect Arabic, Urdu, Hindi, French, English, and many other languages
export async function transcribeArabicAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  try {
    // Create a Blob from buffer for OpenAI (works in Node.js with proper polyfills)
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const audioFile = new File([blob], "audio.mp3", { type: "audio/mpeg" });
    
    // Let Whisper auto-detect the language - supports 99+ languages
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      // No language specified - Whisper will auto-detect
    });

    return {
      text: transcription.text,
    };
  } catch (error: any) {
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}

// Translate text from any language to target language with Islamic terminology preservation
// Supports Arabic, Urdu, Hindi, French, and other languages → English/Hindi/French
export async function translateArabicToEnglish(sourceText: string): Promise<TranslationResult> {
  try {
    const languageConfig = getLanguageConfig();
    const targetLanguage = languageConfig.targetLanguage;
    
    const prompt = `You are translating a live khutbah (Islamic sermon) in real-time. Each audio chunk is 5 seconds, so the text will be a fragment of a longer sermon.

The source text may be in ANY language (Arabic, Urdu, Hindi, French, English, etc). Auto-detect the source language and translate to ${targetLanguage}.

TRANSLATE EXACTLY WHAT IS SAID - nothing more, nothing less.

TARGET LANGUAGE: ${targetLanguage}

RULES:
1. Auto-detect source language (could be Arabic, Urdu, Hindi, French, English, or any language)
2. Preserve Islamic terminology (keep "Allah", "SubhanAllah", "Alhamdulillah", "Insha'Allah", "salah", "jannah", "iman")
3. Add (SAW) or (PBUH) after Prophet Muhammad mentions
4. Add (AS) after other prophet mentions
5. If the text is empty or just background noise, return empty translation
6. NEVER add commentary like "please provide the full sermon" or "this is only a fragment"
7. NEVER add explanations or requests for more context
8. Remove social media phrases (subscribe, like, share, follow, channel)
9. Translate ONLY the actual words spoken - no extra text
10. NEVER include translator names, attributions, or credits
11. NEVER add phrases like "translated by", "translation by", or any names at the end
12. If source is already in target language, return it as-is (no translation needed)

Text to translate:
${sourceText}

Respond in JSON: { "translation": "the translation only - no other text", "detectedLanguage": "detected source language name" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 16x cheaper than GPT-4o, excellent for translation
      messages: [
        {
          role: "system",
          content: `You are a real-time multilingual-to-${targetLanguage} translator for Islamic sermons. You auto-detect the source language and translate ONLY what is said, with no commentary, explanations, or requests for more context. You are processing live audio chunks, so fragments are expected and normal.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    let translation = result.translation || "";
    const detectedLanguage = result.detectedLanguage || "Unknown";
    
    // Filter out unwanted phrases and AI commentary
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
      /\band the translation (of|by) [a-z\s]+$/gi,
      /nancy kankar/gi,
    ];
    
    for (const regex of unwantedPhrases) {
      translation = translation.replace(regex, '').trim();
    }
    
    // Clean up extra spaces and punctuation artifacts
    translation = translation.replace(/\s{2,}/g, ' ').trim();
    translation = translation.replace(/^[,.\s]+|[,.\s]+$/g, '').trim();
    
    return {
      translatedText: translation,
      originalText: sourceText,
      sourceLanguage: detectedLanguage,
      targetLanguage: languageConfig.displayName,
    };
  } catch (error: any) {
    throw new Error("Failed to translate: " + error.message);
  }
}

// Generate weekly action points from sermon content
export async function generateActionPoints(
  sermonContent: string,
  sermonTitle: string
): Promise<ActionPoint[]> {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an Islamic scholar helping Muslims implement khutbah teachings in their daily lives."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an Islamic scholar specializing in khutbah analysis and summarization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
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
export async function generateSermonRecommendations(
  userInterests: string[],
  recentSermons: string[]
): Promise<string[]> {
  try {
    const prompt = `Based on a user's interests and recently attended khutbahs, recommend 5 relevant sermon topics they might find beneficial.

User Interests: ${userInterests.join(", ")}
Recent Sermons: ${recentSermons.join(", ")}

Respond in JSON format: { "recommendations": ["topic1", "topic2", ...] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an Islamic education advisor helping Muslims discover relevant religious content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || [];
  } catch (error: any) {
    throw new Error("Failed to generate recommendations: " + error.message);
  }
}

// Generate reflection journal prompt
export async function generateJournalPrompt(sermonTitle: string, mainTheme: string): Promise<string> {
  try {
    const prompt = `Create a thoughtful reflection prompt for a Muslim who attended a khutbah titled "${sermonTitle}" with the main theme of "${mainTheme}". 

The prompt should:
1. Encourage deep personal reflection
2. Connect the teaching to daily life
3. Be specific and actionable
4. Inspire spiritual growth

Respond in JSON format: { "prompt": "your reflection question here" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a spiritual guide helping Muslims reflect on Islamic teachings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.prompt || "How will you apply this teaching in your life this week?";
  } catch (error: any) {
    throw new Error("Failed to generate journal prompt: " + error.message);
  }
}
