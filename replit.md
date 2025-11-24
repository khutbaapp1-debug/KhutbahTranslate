# Khutbah Companion

## Overview
Khutbah Companion is a full-stack Islamic companion web application designed to provide real-time Arabic-to-English translation of khutbahs (sermons). Beyond translation, it offers a suite of essential Islamic tools including prayer times, Qibla compass, a digital Quran reader, tasbih counter, duas collection, mosque finder, and a Ramadan/Hijri calendar. The project aims for spiritual serenity and effortless navigation through a mobile-first design, swipe-based interactions, and Islamic aesthetic principles. The business vision includes offering a valuable service to Muslim communities worldwide, with a flexible monetization strategy that balances free access with premium features and ad-supported usage to ensure sustainability and broad accessibility.

## Recent Updates (Nov 24, 2025)

**Enhanced Quran Reader UX**
- **Previous/Next Navigation**: Added header icons and bottom buttons to seamlessly browse between surahs without returning to list
- **Automatic Bookmarking**: localStorage-based auto-save remembers last read surah; automatically resumes where user left off on return
- **Smart UX**: Smooth scroll to top on surah change, disabled navigation at boundaries (Surah 1 & 114), and friendly "Continuing from where you left off" message

## Recent Updates (Nov 23, 2025)

**Simplified Rewarded Video Ad System with Local Optimistic Guard**
- **Massive Simplification**: Refactored from 200+ line complex tracking to 50-line ref-based guard (~150 lines removed)
- **Local Optimistic Guard** inside `useAudioRecorder` hook:
  - `pendingConsumptionRef` tracks unflushed usage (increments before send, rolls back on failure)
  - `lastKnownMinutesRef` provides fallback during refetch delays/failures
  - `hasQuotaSystem` auto-detects user type (anonymous/unlimited vs free tier)
  - Uses `effectiveMinutes = serverMinutes - pendingConsumption` for proactive gating
  - Gate condition: `effectiveMinutes - chunkCost <= 0.5` ensures > 0.5 min buffer preserved
- **Pre-Flight Check**: Fetches fresh usage before recording (shows modal if < 5 minutes)
- **Robust Edge Case Handling**:
  - ✅ Refetch stalls: Uses last known value + pending consumption
  - ✅ Refetch failures: Continues safely with fallback
  - ✅ Anonymous users: Bypasses quota system (unlimited)
  - ✅ Premium unlimited: Bypasses quota system (unlimited)
  - ✅ Free tier: Full enforcement with 0.5-minute safety buffer
- **Safety Guarantees**: No mid-khutbah interruptions, maintains buffer even with network issues
- **Code Quality**: No complex state synchronization, no double-subtraction bugs, single source of truth

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite for fast development and optimized builds. UI components are sourced from Shadcn/ui (New York style) leveraging Radix UI primitives for accessibility, styled with Tailwind CSS and CVA for type-safe variants. State management is handled by TanStack Query for server state and React Hook Form with Zod for validation. The design system is mobile-first, featuring touch-optimized interactions, horizontal scroll cards, fixed bottom navigation, and an Islamic aesthetic with Arabic typography (Noto Naskh Arabic) and respectful color treatment.

### Backend Architecture
The backend is an Express.js application running on Node.js, providing RESTful API endpoints organized by feature domain (e.g., `/api/sermons`, `/api/transcripts`). Authentication uses Passport.js with a local strategy and session management, backed by `express-session` and `connect-pg-simple`. Multer handles audio file uploads, and role-based access control (`requireAuth`, `requirePremium`) manages feature access based on user subscription tiers (Free/Premium).

### Data Storage
PostgreSQL serves as the primary database, utilizing Neon for serverless capabilities and Drizzle ORM for type-safe queries. The schema includes tables for `users`, `sermons`, `transcript_segments`, `notes`, `journal_entries`, and `user_analytics`, with UUID primary keys and appropriate relationships to ensure data integrity and user-owned content management.

### Key Architectural Decisions
The project adopts a monorepo structure with `/client`, `/server`, and `/shared` directories for clear separation and type safety. Real-time translation involves capturing audio chunks, sending them to the backend, transcribing with Whisper, translating with GPT-4o, and storing segments for real-time display. Session-based authentication was chosen for enhanced security. Premium feature gating is implemented via middleware and UI flags. A mobile-first design prioritizes thumb-friendly interactions and gesture-driven navigation. Islamic content handling includes dedicated Arabic fonts, RTL support, and custom translation logic to preserve terminology and add honorifics. A multi-language variant system allows building English, Hindi/Urdu, and French app versions from a single codebase using Capacitor for native mobile deployment.

## External Dependencies

### AI Services
- **OpenAI Whisper API**: For Arabic audio transcription and source language auto-detection (supports 99+ languages).
- **GPT-4o-mini**: For cost-effective and high-quality Arabic-to-English (and other language pairs) translation, maintaining Islamic context, terminology, and cultural sensitivity. Also used for AI-generated features like action point extraction, sermon summaries, and reflection prompts.

### Payment Processing
- **Stripe**: For managing premium subscriptions, handling payments, and processing webhooks for subscription lifecycle events.
- **Stripe.js and React Stripe.js**: For frontend payment integration.

### Third-Party UI Libraries
- **Radix UI**: Primitives for accessible UI components.
- **Lucide React**: For consistent iconography.
- **date-fns**: For date manipulation.
- **Embla Carousel**: For swipeable UI components.

### Native Mobile Platform
- **Capacitor**: For deploying the web application as native iOS and Android apps, configured with platform-specific permissions and assets.