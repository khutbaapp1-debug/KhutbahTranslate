---

## Content Rating Questionnaire (IARC) — Pre-filled Answers

These are the answers to use when filling out the IARC content rating questionnaire in Google Play Console. The questionnaire is located in Play Console under: App content → Content rating.

Answer honestly when prompted in Play Console. Misrepresenting answers can result in app removal.

### Section 1: App Category

**Is this app a game?** NO — Khutbah Companion is a religious/lifestyle app.

### Section 2: Violence

All questions: **NO**
- Realistic violence: NO
- Cartoon/fantasy violence: NO
- Animated/realistic blood: NO
- Sexual violence: NO
- Self-harm content: NO

App contains no violent content of any kind.

### Section 3: Sexual Content

All questions: **NO**
- Sexual content: NO
- Nudity: NO
- Suggestive content: NO

### Section 4: Language / Profanity

All questions: **NO**
- Profanity: NO
- Crude humor: NO
- Hate speech: NO

App content is religious sermons and Islamic educational material. The intended content has no profanity.

### Section 5: Drugs, Alcohol, and Tobacco

All questions: **NO**
- Alcohol references: NO
- Drug references: NO
- Tobacco references: NO

### Section 6: Gambling and Contests

All questions: **NO**
- Real money gambling: NO
- Simulated gambling: NO
- Contests/sweepstakes: NO

### Section 7: User Interaction

All questions: **NO**
- User-to-user interaction or content exchange: NO (anonymous app, no accounts, no messaging)
- Location sharing between users: NO
- Digital purchases: NO (free with ads only)
- User-generated content: NO (all content is curated by app developer)

### Section 8: Ads and In-App Purchases

- **Contains ads:** YES (AdMob banner ads, non-personalized only)
- **In-app purchases:** NO (free app)

### Expected Resulting Ratings

Based on the above answers:
- **ESRB (USA/Canada/Mexico):** Everyone (E)
- **PEGI (Europe):** 3+
- **USK (Germany):** 0
- **ClassInd (Brazil):** Livre / All ages
- **ACB (Australia):** General
- **GRAC (South Korea):** All ages

This is the lowest rating tier and matches the actual content (religious educational app suitable for all ages).

---

## Data Safety Form — Pre-filled Answers

These are the answers to use when filling out the Data Safety form in Google Play Console. Located in Play Console under: App content → Data safety.

The Data Safety form is separate from the privacy policy — it's a structured disclosure that appears on the Play Store listing before users download.

---

### Section 1: Does your app collect or share any user data?

**YES** — the app collects location, audio, and device identifiers.

---

### Section 2: Data Types Collected and Shared

#### Location Data

**Approximate location**
- Collected: YES
- Shared with third parties: YES (Google Places API for mosque finder)
- Required or optional: Optional (user can decline location permission; prayer times and Qibla still work with manual entry)
- Purpose: App functionality (prayer times, Qibla direction, mosque finder)
- Processed ephemerally: YES (not stored on our servers)

**Precise location**
- Collected: YES
- Shared with third parties: YES (Google Places API for mosque finder)
- Required or optional: Optional
- Purpose: App functionality
- Processed ephemerally: YES

---

#### Audio Data — Voice or Sound Recordings

- Collected: YES (only when user taps Record in Live Translation)
- Shared with third parties: YES (sent to OpenAI for transcription and translation)
- Required or optional: Required for Live Translation feature; user must explicitly tap Record
- Purpose: App functionality (live khutbah translation)
- Processed ephemerally: YES — audio is transmitted to OpenAI for processing only, not stored on our servers or OpenAI's servers beyond the API call
- Note: Audio is NEVER recorded in the background. Only active when user explicitly taps Record.

---

#### Device or Other Identifiers

- Collected: YES (advertising ID, collected automatically by Google AdMob SDK)
- Shared with third parties: YES (with Google AdMob for ad serving)
- Required or optional: Required for ad-supported free app
- Purpose: Advertising (non-personalized ads only — advertising ID used for frequency capping and fraud prevention, not for behavioral targeting)

---

#### App Activity

- Collected: YES (ad impression and click data, collected automatically by AdMob)
- Shared with third parties: YES (with Google AdMob)
- Purpose: Advertising

---

### Section 3: Data NOT Collected

These should all be answered NO in the form:
- Personal info (name, email, address, phone number): NO
- Financial info (payment card, bank account): NO
- Health and fitness: NO
- Messages (SMS, email, in-app messages): NO
- Photos and videos: NO
- Files and documents: NO
- Calendar: NO
- Contacts: NO
- Web browsing history: NO
- App info and performance (crash logs): NO (not currently implemented)

---

### Section 4: Security Practices

**Is data encrypted in transit?**
YES — all API calls use HTTPS. Audio sent to OpenAI, location sent to Google Places, and ad requests to AdMob all use encrypted connections.

**Can users request data deletion?**
YES — users can email khutba.app1@gmail.com to request deletion of any cached data associated with their use of the app. Note: the app does not require account creation and does not store personally identifiable information. The translation cache stores Arabic text and translations without any user identifiers.

**Is data collected for children?**
NO — the app is not directed at children and does not knowingly collect data from users under 13.

---

### Section 5: In-App Purchases

**Does the app have in-app purchases?**
NO — the app is free with non-personalized banner ads only.

---

### Notes for filling out the form

- When Google asks about "data shared with third parties" — this covers OpenAI (audio), Google Places API (location), and Google AdMob (device ID + app activity)
- When Google asks if data is "used for tracking" — answer NO (non-personalized ads, no cross-app tracking)
- When Google asks about "data collected for developer's own app" vs "shared with third parties" — most of your data is shared (not retained by you)
- The translation cache on your server stores Arabic text + English translations with NO user identifiers — this is app functionality data, not user data, and does not need to be disclosed
- OpenStreetMap tile loading is NOT a data collection event — your IP is visible to OSM's CDN but no data is "collected" in the Play Store sense

---
