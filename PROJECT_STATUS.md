# PROJECT_STATUS.md

> **For Claude:** Read this file at the start of every session before suggesting any work. It contains the canonical state of the project — features that exist, decisions made, and what's pending. Do not assume features exist or don't exist based on memory; this file is the source of truth. After reading, summarize what you understand and confirm with the user before proceeding.

---

## App Overview

**Name:** Khutbah Companion
**Package ID:** `com.khutbahcompanion.app` (matches across Android and iOS)
**Live URL:** https://khutbah-translate.replit.app
**GitHub:** https://github.com/khutbaapp1-debug/KhutbahTranslate
**Local working directory:** `C:\Users\Dell\KhutbahTranslate`

**What it does:** Full-stack Islamic companion app. Core feature is real-time Arabic-to-English (and Hindi/Urdu, French) translation of Friday khutbahs (sermons). Bundled with a suite of Islamic utilities.

**Who it's for:** Muslims in non-Arabic-speaking countries who attend mosques where the khutbah is delivered in Arabic but want to follow along in their own language. Second-generation immigrants, converts, and anyone who doesn't understand spoken Arabic fluently.

**Monetization model:** Free, ad-supported (AdMob banners on selected pages). No auth, no subscriptions, no in-app purchases. Anonymous usage.

**Owner:** Akber Khan (`khutba.app1@gmail.com`, GitHub `khutbaapp1-debug`, based UK / Dubai). Non-technical; works with AI tools (Claude Code, Replit AI, Claude in chat) to develop the app. Hanafi/South Asian Islamic background.

---

## Implemented Features

These features are **actually built and working in the app today**. Permission declarations and store descriptions should reference these.

### Core feature

- **Live Khutbah Translation** — User records audio at the mosque, app sends 10-second chunks to Groq Whisper for transcription, then to Groq Llama for translation. OpenAI is the fallback. Real-time transcript with translation appears on screen.

### Islamic utilities (bottom nav and home grid)

- **Prayer Times** — Calculates Fajr, Dhuhr, Asr, Maghrib, Isha based on user's location. Multiple calculation methods supported.
- **Qibla Compass** — Shows direction to the Kaaba in Makkah from user's current location.
- **Quran Reader** — Reads the full Quran. Translation choice not yet finalized for v1 (Saheeh International / Pickthall / Yusuf Ali — pending decision).
- **Tasbih Counter** — Digital prayer bead counter.
- **Daily Duas** — Collection of duas (supplications), based loosely on Hisn al-Muslim. Religious content review pending.
- **Daily Hadith** — Hadith reader. Source not yet finalized (likely sunnah.com). Religious content review pending.
- **99 Names of Allah** — Reference page with the 99 Names. Translation choices and presentation review pending.
- **Mosque Finder** — Map-based mosque locator. **Has a known data quality issue:** missing major mosques in some locations. Investigation deferred from earlier session — not yet diagnosed (could be hardcoded list, or API like Google Places / OpenStreetMap with bad query).
- **Hijri Calendar** — Islamic calendar with date conversion.
- **Salah Guide** — Step-by-step guide to performing prayer. **Major rebuild completed today (May 1, 2026)** — see "Salah Guide" section below.

### Other technical features

- Disclaimer modal on Salah Guide first visit, dismissible
- BannerAd component renders AdMob banners on 6 pages (Home, Daily Hadith, Duas, Tasbih, Salah Guide, Mosque Finder) — returns null in browser/dev preview
- Rate limiter on `/api/transcribe` (60 req/min, 2000 req/day per IP)
- Translation cache to reduce AI costs

---

## Features Planned But NOT Yet Built

These features have been **discussed or wanted but are not in the app**. Do not declare these in App Store / Google Play permission strings or feature lists.

- **Background prayer-time notifications** (would require `NSLocationAlwaysUsageDescription` — currently declared in Info.plist but feature is not built; should be removed before submission)
- **Background audio playback** (currently `UIBackgroundModes` declares `audio` but app likely does not actually play audio in background; needs verification before submission)
- **Personalized ads via App Tracking Transparency** — Path B chosen: skip ATT, use non-personalized ads only. Could be added in v1.1 for revenue testing.
- **Donation / "Support this app" link** — Discussed for future addition; not built.
- **Bring-your-own-API-key for power users** — Discussed; deferred indefinitely.
- **Anatomically correct posture silhouette images** for the Salah Guide — Reserved for v1.1; current `salah-posture.tsx` component is unused but kept in the repo for future use.

---

## Tech Stack Snapshot

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, shadcn/ui, lucide-react icons
- **Backend:** Express on Node.js (TypeScript via tsx), Drizzle ORM
- **Database:** Neon Postgres (DATABASE_URL env var)
- **Mobile:** Capacitor (iOS and Android wrappers)
- **AI:** Groq (Whisper for transcription, Llama for translation) — primary; OpenAI as fallback
- **Ads:** Google AdMob via `@capacitor-community/admob`
- **Hosting:** Replit (auto-deploys from GitHub main branch)

### Important environment variables

- `DATABASE_URL` — Neon Postgres connection (Replit Secret)
- `GROQ_API_KEY` — Primary AI provider
- `OPENAI_API_KEY` — Fallback AI provider

---

## AdMob Configuration

| Platform | Type | ID |
|----------|------|----|
| Android | App ID | `ca-app-pub-6514143339893635~7248812544` |
| Android | Banner Ad Unit | `ca-app-pub-6514143339893635/4741009217` |
| iOS | App ID | `ca-app-pub-6514143339893635~4866191788` |
| iOS | Banner Ad Unit | `ca-app-pub-6514143339893635/7057240855` |

**Status:** "Limited ad serving" until the app is published (this is normal and expected).

**Sensitive categories blocked:** gambling, dating, alcohol, tobacco, religion-other, astrology, get-rich-quick, sex/sexuality, weight loss, politics.

**Content rating:** G (general audiences).

---

## Salah Guide (rebuilt May 1, 2026)

A complete content review and rebuild was completed in a single session. Architecture:

- **Tab structure:** Wudu / How to Pray / Per-Prayer (replaced the old Postures / Recitations / Per-Prayer)
- **Default tab:** Wudu (so first-time learners land on Wudu first)
- **Wudu tab:** 10 steps with verified Arabic from Sahih Muslim, Tirmidhi
- **How to Pray tab:** 4-button selector (2 Rakat / 4 Rakat / Maghrib / Witr)
  - 2-rakat flow: 18 cards
  - 4-rakat flow: 31 cards
  - Maghrib flow: 25 cards (3 rakat with First Tashahhud)
  - Witr flow: 24 cards (3 rakat with one sitting only, includes Dua Qunoot — Shafi'i version per user's tradition, sourced from Alim.org)
- **FlowCard component:** Reusable card with "View Meaning" popup using shadcn Dialog
- **Hybrid recitation display:** Arabic + transliteration on cards, English meaning shown via "View Meaning" popup
- **Religious positioning:** "General Sunni positions; avoid madhab-specific details" with disclaimer modal on first visit

### Data architecture

- `client/src/data/wudu-steps.ts` — 10 wudu steps
- `client/src/data/prayer-flows.ts` — 4 prayer flows (98 total cards) with shared constants pattern (BISMILLAH, SURAH_FATIHAH, SURAH_IKHLAS, etc.) for clean reuse
- `client/src/components/flow-card.tsx` — Reusable rendering component

### Sources

- Postures and recitations: https://www.noorulislam.org.uk/how-to-perform-prayer-salah/
- Witr structure: https://mathabah.org/witr-3-rakaahs-with-one-salam/
- Dua Qunoot: https://www.alim.org/duas/masnoon-duas/dua-e-qunoot-recited-in-witr-prayer/

---

## Tooling Notes

### Critical: Arabic text requires Replit AI, NOT Claude Code

**Discovered during the Salah Guide rebuild.** Claude Code corrupts Arabic text when writing to files (letters reversed, spaces inserted, diacriticals scrambled). Replit AI handles Arabic correctly.

**Working pipeline:**
- Replit AI: anything that contains Arabic text
- Claude Code: pure code (no Arabic), config files, structural refactors
- Claude in chat: planning, review, decision-making, file verification

### File sync

- Editing on Replit → push from Replit's Git pane → `git pull` on Windows
- Editing on Windows / Claude Code → `git push` from PowerShell → Replit auto-pulls (sometimes needs explicit Pull in Replit's Git pane)
- Replit auto-deploys from GitHub main branch (live URL updates within ~30-60 seconds of push)

---

## Decisions Log

Major decisions, locked in unless explicitly revisited:

- **App name:** Khutbah Companion (not Khutbah Translate). Locked May 1, 2026.
- **Package ID:** `com.khutbahcompanion.app` (Android applicationId, namespace, and iOS bundle identifier — all matched).
- **Monetization:** Free, ad-supported (banners on 6 pages). No auth, no IAP, no subscriptions.
- **AdMob ATT:** Path B — skip ATT, non-personalized ads only.
- **Religious framing:** General Sunni positions, Hanafi-leaning where relevant; disclaimer modal warns users that practices vary.
- **Salah Guide tab structure:** Wudu / How to Pray / Per-Prayer.
- **Witr structure:** 3 rakat with 1 sitting (final Tashahhud only), Shafi'i Dua Qunoot version (per user's tradition).
- **Witr congregation note:** Universal note on all Qiyam cards: *"Recite silently. If you are leading the prayer in congregation, recite Surah al-Fatihah and the surah aloud during Fajr, Maghrib, and the first two rakat of Isha."*
- **Quran translation:** **NOT YET DECIDED** for v1. Pending choice between Saheeh International / Pickthall / Yusuf Ali.

---

## Known Issues

Bugs we've identified but haven't fixed:

- **Old leaked Google API key:** Earlier in the project a Google API key was leaked. Revocation status not yet confirmed.

---

## Launch Checklist

Tracking items required for Google Play and App Store submission.

### Done

- [x] Premium UI cleanup (450 lines removed, May earlier sessions)
- [x] Translation-limit modal removed
- [x] Rate limiter on `/api/transcribe` (60/min, 2000/day per IP)
- [x] AdMob ATT integration (Path B: skip ATT)
- [x] BannerAd component built and applied to 6 pages
- [x] AdMob console fully configured (production IDs, blocked categories, content rating G)
- [x] Salah Guide content review (108 individual content items)
- [x] Salah Guide page restructure (Wudu / How to Pray / Per-Prayer tabs)
- [x] All four prayer flows populated with verified Arabic (98 cards total)
- [x] App icons regenerated for both platforms via @capacitor/assets (123 Android files + 10 iOS files)
- [x] iOS bundle identifier fixed to match Android (`com.khutbahcompanion.app`)
- [x] Server-side cleanup: 14 auth-protected route groups commented out, type check now clean (zero TypeScript errors)

### Pending

- [ ] iOS Info.plist permissions audit (NSLocationAlwaysUsageDescription, UIBackgroundModes audio, SKAdNetworkItems)
- [ ] Android AndroidManifest.xml permissions verification (ACCESS_FINE_LOCATION, RECORD_AUDIO, ACCESS_COARSE_LOCATION)
- [ ] Improved iOS permission usage descriptions (in progress — partial fix applied for location and microphone)
- [ ] Mosque finder data quality investigation
- [ ] Privacy policy hosted at a real public URL (must mention AdMob, advertising ID, location data, microphone audio sent to Groq/OpenAI, translation cache)
- [ ] Other religious content reviews: Daily Hadith, Daily Duas, 99 Names, Quran translation choice, Khutbah translation disclaimers
- [ ] App store metadata: descriptions, screenshots, content rating, data safety form
- [ ] Build signed AAB in Android Studio (keystore exists and is backed up)
- [ ] Upload AAB to Google Play Closed Testing
- [ ] Send opt-in URL to 12-15 testers (starts mandatory 14-day Google Play timer)
- [ ] Weekend iOS work on borrowed Mac: Xcode setup, TestFlight submission
- [ ] App Store review submission

### Blocked / waiting

- Google Play production launch is blocked by the mandatory 14-day Closed Testing window with 12+ opted-in testers. Window starts when AAB is uploaded to Closed Testing.

---

## Recent Session Log

Most recent at top.

- **May 1, 2026 (today):** Salah Guide complete rebuild — 108 content items reviewed and approved, 4 prayer flows populated with verified Arabic, FlowCard component built, page restructured to Wudu/How to Pray/Per-Prayer tabs. App icons regenerated for both platforms. iOS bundle ID fixed to match Android (com.khutbahcompanion.app). iOS permission descriptions improved (location and microphone). Server cleanup completed: 14 auth-protected route groups commented out, type check now clean (zero TypeScript errors). PROJECT_STATUS.md created and maintained. NSLocationAlwaysUsageDescription, UIBackgroundModes audio, and SKAdNetworkItems entries still pending audit.
- **Apr 30, 2026:** Premium UI cleanup, translation-limit modal removal, rate limiter on /api/transcribe, AdMob ATT integration fix, BannerAd component built and applied to 6 pages, AdMob console configured, Salah Guide content review begun, mosque finder data quality fixed (working correctly).
- **Apr 29, 2026:** App initial state assessment, monetization decision (free + ads, no auth), Closed Testing setup begun on Google Play Console.

---

## How To Use This File

**At session start:**
1. User: "Read PROJECT_STATUS.md before we start."
2. Claude reads it, summarizes the current state, and confirms what's done vs pending vs known issues.
3. Only then does work proceed.

**At session end (when meaningful changes have happened):**
1. Update the "Recent Session Log" with a one-line summary of what was done.
2. Move completed items from "Pending" to "Done" in the Launch Checklist.
3. Add any new known issues or decisions to the relevant sections.
4. Commit and push the updated file.

**Trust this file over memory.** If something in this file contradicts what Claude or the user remembers, this file wins until proven wrong.
