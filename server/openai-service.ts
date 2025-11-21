// OpenAI service for khutbah transcription, translation, and AI features
// Based on javascript_openai blueprint
import OpenAI from "openai";

// Using gpt-4o model for reliable translations
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface TranslationResult {
  english: string;
  arabicOriginal: string;
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

// Transcribe Arabic audio using Whisper
export async function transcribeArabicAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  try {
    // Create a Blob from buffer for OpenAI (works in Node.js with proper polyfills)
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    const audioFile = new File([blob], "audio.mp3", { type: "audio/mpeg" });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ar", // Arabic
    });

    return {
      text: transcription.text,
    };
  } catch (error: any) {
    throw new Error("Failed to transcribe audio: " + error.message);
  }
}

// Translate Arabic text to English with Islamic terminology preservation
export async function translateArabicToEnglish(arabicText: string): Promise<TranslationResult> {
  try {
    const prompt = `Translate the following Arabic khutbah (sermon) text to English. 
    
IMPORTANT RULES:
1. Preserve Islamic terminology (e.g., keep "Allah", "SubhanAllah", "Alhamdulillah", "Insha'Allah")
2. Add (SAW) or (PBUH) after mentions of Prophet Muhammad
3. Add (AS) after mentions of other prophets
4. Maintain respectful, formal tone appropriate for Islamic sermon
5. If Qur'anic verses are detected, provide clear translation
6. Keep the spiritual and religious context intact
7. REMOVE any phrases related to social media like "subscribe", "like", "share", "follow", "channel" - these are NOT part of the sermon
8. ONLY translate the actual sermon content, ignore any background noise or non-sermon phrases

Arabic text:
${arabicText}

Respond in JSON format with: { "translation": "English translation here" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Arabic-to-English translator specializing in Islamic religious content, khutbahs, and sermons. You preserve Islamic terminology and maintain the spiritual essence of the text. You filter out any non-sermon content like social media requests or background noise."
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
    
    // Additional filtering to remove common social media phrases
    const unwantedPhrases = [
      /subscribe to (the|our) channel/gi,
      /like and subscribe/gi,
      /follow us on/gi,
      /share this video/gi,
      /don't forget to subscribe/gi,
      /hit the bell icon/gi,
      /turn on notifications/gi,
    ];
    
    for (const regex of unwantedPhrases) {
      translation = translation.replace(regex, '').trim();
    }
    
    // Clean up extra spaces
    translation = translation.replace(/\s{2,}/g, ' ').trim();
    
    return {
      english: translation,
      arabicOriginal: arabicText,
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
