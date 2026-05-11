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
- **Quran translation:** Saheeh International (en.sahih edition from api.alquran.cloud). Locked May 2, 2026. Already wired up in server/routes.ts. A user-selectable translation toggle (Pickthall / Yusuf Ali / etc.) is deferred to v1.1.

---

## Known Issues

Bugs we've identified but haven't fixed:

- **Old leaked Google API key:** Earlier in the project a Google API key was leaked. Revocation status not yet confirmed.

---

## Real-World Testing Feedback (May 4, 2026)

User tested the app in a real Friday khutbah environment and identified specific improvements per feature. Items below are categorized by launch impact.

### Possibly launch-blocking (verify before AAB build)

**Translation — "lines being missed"**
- User reports: translations were good but felt like some lines were missed during live use
- Type: Bug investigation
- Hypotheses to verify: (a) recording continues correctly during chunk processing — no audio dropped, (b) chunk boundary handling — sentences spanning the 12-second chunk break may lose context, (c) frontend display logic
- Action: investigate audio recorder pipeline and chunk handling before launch

**Qibla compass — calibration / accuracy**
- User reports: difficult to find the right direction based on actual knowledge
- Type: Investigation + possibly bug
- Hypotheses: (a) phone magnetometer needs user calibration (figure-8 motion), no UI prompt for it, (b) magnetic vs true North compensation — phone reports magnetic, Qibla calc uses true North; check if app accounts for declination
- Religious importance: praying toward wrong direction is a real concern
- Action: investigate before launch

### Should-do pre-launch

**Quran Reader — Arabic font**
- User reports: each word feels separated, doesn't flow as proper Arabic should
- Type: UX/styling improvement
- Cause: Western fonts handle Arabic with too much letter spacing; proper Arabic fonts use ligatures
- Candidate fonts: Amiri (Naskh-style classical), Scheherazade New (scholarly), Noto Naskh Arabic (Google), KFGQPC Uthmanic Hafs (official Mushaf font)
- User to provide reference screenshots
- Action: swap font in Quran reader page

**Salah Guide — reset on tab exit**
- User reports: scroll position persists across tabs, have to scroll up to access tab navigation
- Type: UX fix (small)
- Action: reset scroll to top when navigating between Wudu / How to Pray / Per-Prayer tabs

**Tasbih — multiple improvements**
- Move completed dhikr to bottom of list (sort by completion state)
- Auto-advance: completing one dhikr moves to the next in the session
- Decrement button (-1) for over-counting recovery
- Completion animation (simple dots/sparkles, not literal fireworks)
- Type: UX improvement + new state tracking
- Currently single-counter; needs guided session model

### V1.1 territory (defer unless time allows)

**Salah Guide — Wudu flash cards**
- User reports: cramped on mobile, would benefit from swipeable card-per-step layout
- Each card: image + clean text, swipe right for next step
- Type: UI redesign
- More room for imagery and clearer per-step focus

**Mosque Finder — Google Maps tiles instead of OSM**
- User reports: doesn't like the look of OpenStreetMap
- Options: Google Maps Embed API (free, iframe) or Google Maps JavaScript API (free tier $200/month credit, ~28k loads)
- Cost watch: as user base grows, monitor Maps API usage
- Type: Aesthetic improvement, integration swap

### Validated as good (UX-wise — content still needs religious review)

- Prayer Times: feature working correctly
- Daily Duas: feature working correctly (content NOT yet validated)
- Daily Hadith: feature working correctly (content NOT yet validated)
- Mosque Finder: feature working correctly (just OSM aesthetic complaint)

### Religious content validation (still required pre-launch)

- [ ] Daily Hadith — verify text, attribution, grading (sahih/hasan/daif), reference accuracy
- [ ] Daily Duas — verify Arabic text, transliteration accuracy, English translation, source attribution
- [ ] 99 Names of Allah — verify Arabic, English meaning, scholarly source for meanings
- [ ] Khutbah translation disclaimers — already in place via 3-card modal (May 4)
- [ ] Salah Guide — already validated May 1 (108 items reviewed)

---

## Persona Usability Audit (May 2026)

Seven user personas were tested against the app to surface friction points. Items below are prioritised by impact.

### The 7 Personas

1. **Aisha** — Convert (24), 6 months in, learning prayer. Uses: Salah Guide, Wudu, Duas
2. **Yusuf** — Busy professional (35), father of 2. Uses: Prayer Times, Qibla, Tasbih
3. **Hajja Khadija** — Elder (68), weak vision, basic phone skills. Uses: Quran, Duas, Tasbih
4. **Bilal** — Hafiz teen (16), fluent Arabic, tech-native. Uses: Quran, Khutbah translation
5. **Dr. Fatima** — Visually impaired (42), screen reader user. Uses: Prayer Times, Duas, Hadith
6. **Imran** — Traveller (29), mixed signal, different cities. Uses: Mosque Finder, Qibla, Prayer Times
7. **Layla** — Reverting senior (58), new Muslim at 55, no Arabic. Uses: Salah Guide, 99 Names, Duas

---

### P0 — Ship with v1 (high impact, broad reach)

- [ ] App-wide font size selector (Small / Default / Large / X-Large) in Settings — applied via CSS root variable to all body text and Arabic. Personas: Khadija, Layla, Fatima, Yusuf. Effort: Medium.
- [ ] Audio playback for recitations — wudu duas, prayer flow recitations, 99 Names, Tasbih dhikr. Small play button on each card. Use OpenAI TTS one-time generation for static MP3s (no recording needed, ~$1-3 one-time cost). Quran audio already partially available via api.alquran.cloud. Personas: Aisha, Layla, Bilal, Khadija. Effort: Medium (revised down from High given TTS approach).
- [ ] "Which prayer is which?" intro card on Salah Guide — tappable explainer mapping prayer names to rakat counts (Fajr=2, Dhuhr=4, Asr=4, Maghrib=3, Isha=4, Witr=3). Personas: Aisha, Layla. Effort: Low (~30 min).
- [ ] Persistent Tasbih state per dhikr type — count survives app restarts and tab switches. Use localStorage keyed by dhikr name. Personas: Yusuf, Khadija. Effort: Low (~1 hour).

### P1 — High value, ship next (v1 or early v1.1)

- [ ] Glossary tooltips for Islamic terms (Qiyam, Jalsah, Sujood, Tasleem, etc.) — tap underlined term for short definition overlay. Personas: Aisha, Layla. Effort: Medium.
- [ ] High-contrast theme option (third option beyond light/dark) for low-vision users. Personas: Khadija, Fatima. Effort: Low.
- [ ] "Next prayer in X minutes" widget at top of Home page — live countdown without entering Prayer Times. Personas: Yusuf, Imran. Effort: Low (~1 hour).
- [ ] Reduce motion preference — disables spinning compass animation, page transitions. Personas: Fatima, Khadija. Effort: Low.
- [ ] Reciter playback speed control (0.5x / 0.75x / 1x / 1.25x) in Quran reader. Personas: Bilal, Layla. Effort: Low.
- [ ] Offline caching of prayer times for next 7 days + last-known Qibla direction. Personas: Imran. Effort: Medium.
- [ ] Timezone-change banner on Prayer Times after detected location change. Personas: Imran. Effort: Low.

### P2 — Nice to have (v1.1)

- [ ] Beginner mode — hides advanced features (Action Points, Khutbah Guidelines) until enabled. Personas: Layla, Aisha. Effort: Low.
- [ ] Adjustable Arabic vs English text size ratio in Live Translation. Personas: Bilal. Effort: Low.
- [ ] Save mosque as favourite with quick-access list. Personas: Imran. Effort: Low.
- [ ] Mushaf style selector (Uthmani / Indo-Pak script). Personas: Bilal. Effort: Medium.
- [ ] Simple phonetic transliteration toggle (no diacritics, no apostrophes — e.g. "Az-zeem" instead of "'Adheem"). Personas: Layla, Khadija. Effort: Medium.
- [ ] Improved ARIA on transliteration text + skip-to-content link. Personas: Fatima. Effort: Low.
- [ ] Bookmark/long-press discoverability hint (one-time tooltip). Personas: Khadija. Effort: Low.

### P3 — Future (v2+)

- [ ] Voice-controlled Tasbih counter ("Subhan'Allah" detection)
- [ ] Companion smartwatch app for prayer notifications
- [ ] Hijri calendar widget on Home
- [ ] Haptic feedback + screen reader announcement for Tasbih counter

### Accessibility notes (legal relevance)

UK Equality Act and US ADA require reasonable digital accessibility accommodations. Quick wins (ARIA labels, color contrast, text alternatives for color-only indicators) are low effort and reduce legal exposure. Full WCAG compliance is v1.1+ territory.

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
- [x] Privacy policy hosted at https://khutbah-translate.replit.app/privacy (anonymous app state, AdMob disclosure, all third-party services disclosed including Google Places API and OpenStreetMap for Mosque Finder)
- [x] iOS permissions audit complete: removed unused NSLocationAlwaysUsageDescription, removed UIBackgroundModes audio, expanded SKAdNetworkItems to full 50-entry list per Google AdMob docs
- [x] Android permissions verified: removed unused MODIFY_AUDIO_SETTINGS, added ACCESS_NETWORK_STATE for connectivity checks
- [x] 3-card first-time disclaimer modal for Live Translation (forced walkthrough — Audio Quality / AI Imperfection / Verify with Imam — non-dismissible until acknowledged)
- [x] Real-time audio waveform visualization for Live Translation (parallel AnalyserNode tap, 20 bars, idle state on pause)
- [x] Translation "lines missed" bug fixed: translations now sorted by sequence number on insert, ellipsis placeholder shown for unclear audio chunks
- [x] Qibla compass fixed: webkitCompassHeading on iOS (True North), deviceorientationabsolute on Android, 5-second calibration delay before dismissing prompt
- [x] KFGQPC Uthmanic Hafs font applied to all Arabic text (self-hosted at client/public/fonts/KFGQPCHafs.otf), wordSpacing removed
- [x] Settings page built (/settings route, gear icon in home header): Display (font size, reduce motion), Prayer Times (calculation method, Asr method), Notifications link, About section
- [x] Font size selector: app-wide via CSS root variable --font-size-base, Small/Default/Large/X-Large, persists in localStorage
- [x] Notification settings page fixed: switched from API to localStorage (works for anonymous users), back button added
- [x] Notification service built: schedules real device notifications via @capacitor/local-notifications for prayer times, morning/evening duas, daily hadith
- [x] Prayer Guide reference card added to Salah Guide Per-Prayer tab (collapsible dropdown, collapsed by default)
- [x] Persistent Tasbih state: count and selected dhikr survive app restarts via localStorage
- [x] Tasbih improvements: completion animation when all 9 dhikrs complete, auto-advance to next dhikr after 1.5s, completed dhikrs greyed out (opacity-40) with checkmark, -1 decrement button
- [x] WheelPicker reusable component built (client/src/components/wheel-picker.tsx), deployed to Duas category selector and Salah Guide prayer type selector
- [x] Quran reader font size controls: A- / A+ buttons in header, 5 size steps (1.5rem to 3.5rem), persists in localStorage
- [x] Ruled lines removed from Quran reader (incompatible with dynamic font size)
- [x] Prayer countdown fixed: live ticking every second in 2h 34m 15s format
- [x] Home prayer widget: Next Prayer card between Live Translation and feature grid, live countdown, taps to Prayer Times, hidden if location denied
- [x] Per-Prayer buttons in 2x2 grid layout in Salah Guide
- [x] Salah Guide reset scroll to top on tab change
- [x] Meta description updated to lead with multilingual khutbah translation
- [x] Google Play metadata file created (GOOGLE_PLAY_METADATA.md): short description, full description, content rating answers, data safety form answers
- [x] Persona usability audit completed (7 personas, P0-P3 prioritised recommendations in PROJECT_STATUS.md)

### Pending
- [ ] Improved iOS permission usage descriptions (in progress — partial fix applied for location and microphone)
- [ ] Wudu flash cards — in progress (images sourced, layout to be built)
- [ ] Religious content reviews: Daily Hadith, Daily Duas, 99 Names (use Opus, verify against 3+ sources)
- [ ] Screenshots and feature graphic (1024x500 banner)
- [ ] Build signed AAB in Android Studio (keystore exists and is backed up)
- [ ] Upload AAB to Google Play Closed Testing (starts 14-day timer)
- [ ] Test all pages in landscape orientation on a physical device (Quran reader benefits from landscape; other pages may have unverified layouts — required before App Store submission)
- [ ] Send opt-in URL to 12-15 testers (starts mandatory 14-day Google Play timer)
- [ ] High contrast theme option
- [ ] Mosque finder: Google Maps tiles instead of OpenStreetMap
- [ ] Offline caching of prayer times (next 7 days) + last-known Qibla
- [ ] Glossary tooltips for Islamic terms (Qiyam, Jalsah, Sujood, etc.)
- [ ] Audio playback for recitations (OpenAI TTS one-time generation, ~$1-3 cost)
- [ ] Tasbih: Wudu flash cards with images
- [ ] iOS TestFlight (borrowed Mac session)
- [ ] App Store review submission

### Blocked / waiting

- Google Play production launch is blocked by the mandatory 14-day Closed Testing window with 12+ opted-in testers. Window starts when AAB is uploaded to Closed Testing.

---

## Recent Session Log

Most recent at top.

- **May 11, 2026:** Major feature sprint. Fixed: prayer countdown live ticking, Qibla compass (webkitCompassHeading iOS + deviceorientationabsolute Android + 5s calibration), translation out-of-order display bug (sequence sort + ellipsis placeholder). Built: Settings page with font size selector, notification service (Capacitor local notifications), WheelPicker reusable component deployed to Duas and Salah Guide, Tasbih completion animation + auto-advance + persistent state, Home prayer widget, Prayer Guide collapsible card, Quran A-/A+ font size controls. Font: KFGQPC Uthmanic Hafs self-hosted, replacing Amiri Quran. Google Play metadata complete (GOOGLE_PLAY_METADATA.md has all form answers). Persona usability audit added with P0-P3 recommendations. Currently mid-task on Wudu flash cards (images sourced and sliced, layout pending). Religious content reviews (Daily Hadith, Daily Duas, 99 Names) still outstanding — must use Opus model.

- **May 1, 2026 (today):** Salah Guide complete rebuild — 108 content items reviewed and approved, 4 prayer flows populated with verified Arabic, FlowCard component built, page restructured to Wudu/How to Pray/Per-Prayer tabs. App icons regenerated for both platforms. iOS bundle ID fixed to match Android (com.khutbahcompanion.app). iOS permission descriptions improved (location and microphone). Server cleanup completed: 14 auth-protected route groups commented out, type check now clean (zero TypeScript errors). PROJECT_STATUS.md created and maintained. NSLocationAlwaysUsageDescription, UIBackgroundModes audio, and SKAdNetworkItems entries still pending audit. Privacy policy updated to disclose Google Places API (location sent for Mosque Finder) and OpenStreetMap (map tiles, IP visible). Today (May 4): Permissions audit completed for both platforms — iOS Info.plist cleaned of unused location/background permissions and expanded SKAdNetworkItems to Google's full 50-entry list; Android manifest removed MODIFY_AUDIO_SETTINGS and added ACCESS_NETWORK_STATE. Also May 4: Built 3-card forced-walkthrough disclaimer modal for Live Translation (non-dismissible Dialog with Audio Quality / AI Imperfection / Verify with Imam cards, localStorage acknowledgment). Built real-time audio waveform visualization (parallel AnalyserNode tap, 20 vertical bars at 60fps, idle state during pause). Both deferred Saturday features now complete. Late May 4: Drafted Google Play app store metadata (short description, full description, content rating questionnaire answers all saved to GOOGLE_PLAY_METADATA.md). Captured real-world testing feedback covering 9 features for pre-launch and v1.1 prioritization. Feature focus: translation may be dropping lines (investigate), Qibla compass calibration (investigate), Quran Arabic font, Salah Guide UX, Tasbih improvements. Religious content validation outstanding for Daily Hadith, Daily Duas, 99 Names.
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
