// Language configuration for app variants
// This file determines which language the app will translate khutbahs into

export type SupportedLanguage = "english" | "hindi" | "french";

export interface LanguageConfig {
  code: SupportedLanguage;
  displayName: string;
  nativeName: string;
  targetLanguage: string; // What we tell OpenAI to translate to
  locale: string; // For app store listings
  flag: string;
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  english: {
    code: "english",
    displayName: "English",
    nativeName: "English",
    targetLanguage: "English",
    locale: "en",
    flag: "🇬🇧",
  },
  hindi: {
    code: "hindi",
    displayName: "Hindi/Urdu",
    nativeName: "हिन्दी / اردو",
    targetLanguage: "Hindi (Hindustani - using Devanagari script for Hindi speakers and Arabic script for Urdu speakers as appropriate)",
    locale: "hi",
    flag: "🇮🇳",
  },
  french: {
    code: "french",
    displayName: "French",
    nativeName: "Français",
    targetLanguage: "French",
    locale: "fr",
    flag: "🇫🇷",
  },
};

// THIS IS THE KEY SETTING - Change this value to create different app variants
// For English variant: export const DEFAULT_LANGUAGE: SupportedLanguage = "english";
// For Hindi variant: export const DEFAULT_LANGUAGE: SupportedLanguage = "hindi";
// For French variant: export const DEFAULT_LANGUAGE: SupportedLanguage = "french";
export const DEFAULT_LANGUAGE: SupportedLanguage = "english";

export function getLanguageConfig(): LanguageConfig {
  return LANGUAGE_CONFIGS[DEFAULT_LANGUAGE];
}
