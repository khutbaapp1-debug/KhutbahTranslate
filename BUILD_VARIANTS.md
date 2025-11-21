# Building Language-Specific App Variants

This guide explains how to build different language variants of Khutbah Translate for different regional markets.

## Overview

We create **three separate apps** for different markets:

| Variant | Target Markets | App ID | Languages |
|---------|---------------|--------|-----------|
| **English** | USA, UK, Canada, Australia | `com.khutbahtranslate.english` | 🇬🇧 English |
| **Hindi/Urdu** | India, Pakistan | `com.khutbahtranslate.hindi` | 🇮🇳 हिन्दी / اردو |
| **French** | France, Morocco, Algeria, Tunisia, Senegal | `com.khutbahtranslate.french` | 🇫🇷 Français |

## Why Separate Apps?

✅ **Simpler UX** - App opens in the user's language, no selector needed  
✅ **Regional Marketing** - Target specific communities with localized App Store listings  
✅ **Regional Pricing** - Different subscription prices for different markets (e.g., $9.99 in USA, ₹299 in India)  
✅ **Better SEO** - App store keywords and descriptions in local languages  
✅ **Same codebase** - All variants built from the same code

## Building Each Variant

### 1. English Variant (Default)

**Target Markets:** USA, UK, Canada, Australia, New Zealand

```bash
# Step 1: Set the language in shared/language-config.ts
# Change line 46 to:
export const DEFAULT_LANGUAGE: SupportedLanguage = "english";

# Step 2: Build the web app
npm run build

# Step 3: Sync Capacitor with English config
npx cap sync --config capacitor.config.english.ts

# Step 4: Open native projects
npx cap open ios --config capacitor.config.english.ts
npx cap open android --config capacitor.config.english.ts

# Now build for App Store / Play Store from Xcode / Android Studio
```

### 2. Hindi/Urdu Variant

**Target Markets:** India, Pakistan, Bangladesh

```bash
# Step 1: Set the language in shared/language-config.ts
# Change line 46 to:
export const DEFAULT_LANGUAGE: SupportedLanguage = "hindi";

# Step 2: Build the web app
npm run build

# Step 3: Sync Capacitor with Hindi config
npx cap sync --config capacitor.config.hindi.ts

# Step 4: Open native projects
npx cap open ios --config capacitor.config.hindi.ts
npx cap open android --config capacitor.config.hindi.ts

# Now build for App Store / Play Store from Xcode / Android Studio
```

### 3. French Variant

**Target Markets:** France, Morocco, Algeria, Tunisia, Senegal, Belgium

```bash
# Step 1: Set the language in shared/language-config.ts
# Change line 46 to:
export const DEFAULT_LANGUAGE: SupportedLanguage = "french";

# Step 2: Build the web app
npm run build

# Step 3: Sync Capacitor with French config
npx cap sync --config capacitor.config.french.ts

# Step 4: Open native projects
npx cap open ios --config capacitor.config.french.ts
npx cap open android --config capacitor.config.french.ts

# Now build for App Store / Play Store from Xcode / Android Studio
```

## App Store Submission

### English Variant
- **App Name:** "Khutbah Translate"
- **Subtitle:** "Real-time Friday Sermon Translation"
- **Description:** Focus on English-speaking Muslims in mosques
- **Keywords:** khutbah, sermon, translation, Friday, mosque, Islamic, prayer
- **Countries:** USA, UK, Canada, Australia, New Zealand

### Hindi/Urdu Variant
- **App Name:** "Khutbah Translate - हिन्दी"
- **Subtitle:** "जुमा के ख़ुतबे का अनुवाद" (Friday Khutbah Translation)
- **Description:** Focus on Hindi/Urdu speaking Muslims
- **Keywords:** khutbah, خطبہ, नमाज़, jumma, masjid, Islamic
- **Countries:** India, Pakistan, Bangladesh

### French Variant
- **App Name:** "Khutbah Translate - Français"
- **Subtitle:** "Traduction du sermon du vendredi"
- **Description:** Focus on French-speaking Muslims in mosques
- **Keywords:** khutbah, sermon, traduction, vendredi, mosquée, islamique
- **Countries:** France, Morocco, Algeria, Tunisia, Senegal, Belgium

## Regional Pricing Strategy

Adjust subscription prices based on purchasing power:

| Market | Monthly Price | Annual Price |
|--------|--------------|--------------|
| 🇺🇸 USA | $9.99 | $79.99 |
| 🇬🇧 UK | £8.99 | £69.99 |
| 🇮🇳 India | ₹299 | ₹2,399 |
| 🇵🇰 Pakistan | Rs 999 | Rs 7,999 |
| 🇫🇷 France | €9.99 | €79.99 |
| 🇲🇦 Morocco | MAD 99 | MAD 799 |

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

- [ ] Set `DEFAULT_LANGUAGE` correctly in `shared/language-config.ts`
- [ ] Build the web app: `npm run build`
- [ ] Sync Capacitor with correct config file
- [ ] Test translation quality with real Arabic audio
- [ ] Update App Store listing with localized description
- [ ] Set regional pricing
- [ ] Submit for App Store / Play Store review
- [ ] Reset `DEFAULT_LANGUAGE` before building next variant

## Questions?

- **Q: Can users switch languages?**  
  A: No, each app is locked to one language. This simplifies UX and allows regional marketing.

- **Q: What if I want to add more languages?**  
  A: Add the language to `LANGUAGE_CONFIGS` in `shared/language-config.ts`, create a new `capacitor.config.{lang}.ts` file, and follow the same build process.

- **Q: Do I need to maintain separate code?**  
  A: No! All variants use the same codebase. Just change the config and rebuild.
