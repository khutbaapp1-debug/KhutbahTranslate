# Building Language-Specific App Variants

This guide explains how to build different language variants of Khutbah Companion for different regional markets.

## Overview

The app **auto-detects the source language** using OpenAI Whisper (supports 99+ languages including Arabic, Urdu, Hindi, French, English) and translates to the target language for that market.

**Three separate apps** for different regional markets:

| Variant | Target Markets | App ID | Source Languages | Target |
|---------|---------------|--------|------------------|--------|
| **English** | UK, USA, Canada, Australia | `com.khutbahtranslate.english` | Auto-detect (Arabic/Urdu/Hindi/French/etc) | 🇬🇧 English |
| **Hindi/Urdu** | India, Pakistan | `com.khutbahtranslate.hindi` | Auto-detect (Arabic/English/etc) | 🇮🇳 हिन्दी / اردو |
| **French** | France, Morocco, Algeria, Tunisia | `com.khutbahtranslate.french` | Auto-detect (Arabic/etc) | 🇫🇷 Français |

**Use Cases:**
- **UK**: Khutbahs in Arabic/Urdu/Hindi/French → Auto-detect → English
- **India**: Khutbahs in Arabic/English → Auto-detect → Hindi/Urdu
- **France**: Khutbahs in Arabic → Auto-detect → French

## Why Separate Apps?

✅ **Simpler UX** - App opens in the user's language, no selector needed  
✅ **Regional Marketing** - Target specific communities with localized App Store listings  
✅ **Regional Pricing** - Different subscription prices for different markets (e.g., $4.99 in USA, ₹149 in India)  
✅ **Better SEO** - App store keywords and descriptions in local languages  
✅ **Same codebase** - All variants built from the same code

## Building Each Variant

**IMPORTANT:** You must manually change `DEFAULT_LANGUAGE` in `shared/language-config.ts` before each build. Double-check this setting to avoid building the wrong variant!

### 1. English Variant (Default)

**Target Markets:** USA, UK, Canada, Australia, New Zealand

```bash
# Step 1: CRITICAL - Set the language in shared/language-config.ts
# Open shared/language-config.ts and change line 46 to:
export const DEFAULT_LANGUAGE: SupportedLanguage = "english";

# Step 2: Verify the setting is correct
grep "DEFAULT_LANGUAGE" shared/language-config.ts
# Should output: export const DEFAULT_LANGUAGE: SupportedLanguage = "english";

# Step 3: Build the web app
npm run build

# Step 4: Sync Capacitor with English config
npx cap sync --config capacitor.config.english.ts

# Step 5: Regenerate app icons/splash for this bundle ID (if needed)
npx @capacitor/assets generate --config capacitor.config.english.ts

# Step 6: Verify native config files are correct
# iOS: Check ios/App/App/Info.plist for correct bundle ID and app name
# Android: Check android/app/src/main/AndroidManifest.xml for correct package name

# Step 7: Open native projects
npx cap open ios --config capacitor.config.english.ts
npx cap open android --config capacitor.config.english.ts

# Step 8: Build for App Store / Play Store from Xcode / Android Studio
# iOS: Product > Archive in Xcode
# Android: Build > Generate Signed Bundle in Android Studio
```

### 2. Hindi/Urdu Variant

**Target Markets:** India, Pakistan, Bangladesh

```bash
# Step 1: CRITICAL - Set the language in shared/language-config.ts
# Open shared/language-config.ts and change line 46 to:
export const DEFAULT_LANGUAGE: SupportedLanguage = "hindi";

# Step 2: Verify the setting is correct
grep "DEFAULT_LANGUAGE" shared/language-config.ts
# Should output: export const DEFAULT_LANGUAGE: SupportedLanguage = "hindi";

# Step 3: Build the web app
npm run build

# Step 4: Sync Capacitor with Hindi config
npx cap sync --config capacitor.config.hindi.ts

# Step 5: Regenerate app icons/splash for this bundle ID (if needed)
npx @capacitor/assets generate --config capacitor.config.hindi.ts

# Step 6: Verify native config files are correct
# iOS: Check ios/App/App/Info.plist for correct bundle ID and app name
# Android: Check android/app/src/main/AndroidManifest.xml for correct package name

# Step 7: Open native projects
npx cap open ios --config capacitor.config.hindi.ts
npx cap open android --config capacitor.config.hindi.ts

# Step 8: Build for App Store / Play Store from Xcode / Android Studio
# iOS: Product > Archive in Xcode
# Android: Build > Generate Signed Bundle in Android Studio
```

### 3. French Variant

**Target Markets:** France, Morocco, Algeria, Tunisia, Senegal, Belgium

```bash
# Step 1: CRITICAL - Set the language in shared/language-config.ts
# Open shared/language-config.ts and change line 46 to:
export const DEFAULT_LANGUAGE: SupportedLanguage = "french";

# Step 2: Verify the setting is correct
grep "DEFAULT_LANGUAGE" shared/language-config.ts
# Should output: export const DEFAULT_LANGUAGE: SupportedLanguage = "french";

# Step 3: Build the web app
npm run build

# Step 4: Sync Capacitor with French config
npx cap sync --config capacitor.config.french.ts

# Step 5: Regenerate app icons/splash for this bundle ID (if needed)
npx @capacitor/assets generate --config capacitor.config.french.ts

# Step 6: Verify native config files are correct
# iOS: Check ios/App/App/Info.plist for correct bundle ID and app name
# Android: Check android/app/src/main/AndroidManifest.xml for correct package name

# Step 7: Open native projects
npx cap open ios --config capacitor.config.french.ts
npx cap open android --config capacitor.config.french.ts

# Step 8: Build for App Store / Play Store from Xcode / Android Studio
# iOS: Product > Archive in Xcode
# Android: Build > Generate Signed Bundle in Android Studio
```

## App Store Submission

### English Variant
- **App Name:** "Khutbah Companion"
- **Subtitle:** "Real-time Friday Sermon Translation"
- **Description:** Focus on English-speaking Muslims in mosques
- **Keywords:** khutbah, sermon, translation, Friday, mosque, Islamic, prayer
- **Countries:** USA, UK, Canada, Australia, New Zealand

### Hindi/Urdu Variant
- **App Name:** "Khutbah Companion - हिन्दी"
- **Subtitle:** "जुमा के ख़ुतबे का अनुवाद" (Friday Khutbah Translation)
- **Description:** Focus on Hindi/Urdu speaking Muslims
- **Keywords:** khutbah, خطبہ, नमाज़, jumma, masjid, Islamic
- **Countries:** India, Pakistan, Bangladesh

### French Variant
- **App Name:** "Khutbah Companion - Français"
- **Subtitle:** "Traduction du sermon du vendredi"
- **Description:** Focus on French-speaking Muslims in mosques
- **Keywords:** khutbah, sermon, traduction, vendredi, mosquée, islamique
- **Countries:** France, Morocco, Algeria, Tunisia, Senegal, Belgium

## Regional Pricing Strategy

Adjust subscription prices based on purchasing power:

| Market | Monthly Price | Annual Price |
|--------|--------------|--------------|
| 🇺🇸 USA | $4.99 | $39.99 |
| 🇬🇧 UK | £4.49 | £34.99 |
| 🇮🇳 India | ₹149 | ₹1,199 |
| 🇵🇰 Pakistan | Rs 499 | Rs 3,999 |
| 🇫🇷 France | €4.99 | €39.99 |
| 🇲🇦 Morocco | MAD 49 | MAD 399 |

## Important Notes

1. **Same Codebase** - All three apps are built from the same source code
2. **Only Change** - The `DEFAULT_LANGUAGE` in `shared/language-config.ts` before building
3. **Different Bundle IDs** - Each variant has its own unique bundle ID
4. **Translation Quality** - GPT-4o is excellent at Hindi/Urdu and French translations
5. **API Costs** - Same cost (~$4.68 per 30-min khutbah) regardless of target language
6. **Test Thoroughly** - Test each variant's translation quality before release

## Development Testing

To test different language variants locally:

1. Change `DEFAULT_LANGUAGE` in `shared/language-config.ts`
2. Restart the dev server: `npm run dev`
3. The app will now translate to the selected language
4. Test with sample Arabic audio to verify translation quality

## Asset Generation

Each variant uses the same app icons and splash screens. If you need to customize per variant:

```bash
# Generate assets for a specific variant
npx @capacitor/assets generate --config capacitor.config.english.ts
npx @capacitor/assets generate --config capacitor.config.hindi.ts
npx @capacitor/assets generate --config capacitor.config.french.ts
```

## Deployment Checklist

Before releasing each variant:

- [ ] **VERIFY** `DEFAULT_LANGUAGE` in `shared/language-config.ts` matches the variant you're building
- [ ] **RUN VERIFICATION**: `grep "DEFAULT_LANGUAGE" shared/language-config.ts` and confirm output
- [ ] Build the web app: `npm run build`
- [ ] Sync Capacitor with correct config file: `npx cap sync --config capacitor.config.{variant}.ts`
- [ ] **VERIFY NATIVE CONFIGS**: Check Info.plist and AndroidManifest.xml for correct bundle IDs
- [ ] Regenerate assets if needed: `npx @capacitor/assets generate --config capacitor.config.{variant}.ts`
- [ ] **TEST TRANSLATION**: Open the app and test with sample Arabic audio to verify it translates to the correct language
- [ ] Verify app name and bundle ID in native projects
- [ ] Update App Store listing with localized description
- [ ] Set regional pricing
- [ ] Submit for App Store / Play Store review
- [ ] **RESET** `DEFAULT_LANGUAGE` to "english" after completing build (to avoid accidental mixed builds)

## Questions?

- **Q: Can users switch languages?**  
  A: No, each app is locked to one language. This simplifies UX and allows regional marketing.

- **Q: What if I want to add more languages?**  
  A: Add the language to `LANGUAGE_CONFIGS` in `shared/language-config.ts`, create a new `capacitor.config.{lang}.ts` file, and follow the same build process.

- **Q: Do I need to maintain separate code?**  
  A: No! All variants use the same codebase. Just change the config and rebuild.
