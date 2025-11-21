# Khutbah Translate - Islamic Companion App

## Overview

Khutbah Translate is a full-stack Islamic companion web application that provides real-time Arabic-to-English translation of khutbahs (sermons) alongside essential Islamic tools. The app features prayer times, Qibla compass, digital Quran reader, tasbih counter, duas collection, mosque finder, and Ramadan/Hijri calendar utilities. Built with a mobile-first design philosophy emphasizing spiritual serenity and effortless navigation through swipe-based interactions and Islamic aesthetic principles.

## Recent Updates (Nov 21, 2025)

**Auto-Detection of Source Language**
- Removed hardcoded Arabic-only transcription - now supports 99+ languages
- Whisper auto-detects source language (Arabic, Urdu, Hindi, French, English, etc.)
- UK use case: Khutbahs can be in Arabic, Urdu, Hindi, or French → Auto-detect → Translate to English
- India use case: Khutbahs can be in Arabic or English → Auto-detect → Translate to Hindi/Urdu
- France use case: Khutbahs typically in Arabic → Auto-detect → Translate to French
- Updated translation prompts to handle any detected source language
- GPT-4o handles all language pairs excellently
- Frontend now shows "Automatically detects Arabic, Urdu, Hindi, French, and other languages"

**Translation Usage Limits (2 Hours/Month for Free Users)**
- Added monthly translation usage tracking to users table (`monthlyTranslationMinutesUsed`, `translationUsageResetDate`)
- Free users limited to 120 minutes (2 hours) of translation per month
- Premium users get unlimited translation
- Anonymous users (no login) get unlimited translation for mosque use cases
- Created `server/translation-limits.ts` with usage tracking functions and middleware
- Frontend displays remaining time and upgrade CTA when approaching/hitting limit
- Usage resets automatically every month
- `/api/translation/usage` endpoint provides current usage info for authenticated users
- Each 5-second audio chunk tracked as ~0.083 minutes

**Multi-Language App Variants with Auto-Detection**
- **Auto-detects source language**: Whisper automatically detects Arabic, Urdu, Hindi, French, English, and 99+ other languages
- **Three regional app variants**: English, Hindi/Urdu, French (separate app store listings)
- **UK Use Case**: Khutbahs in Arabic/Urdu/Hindi/French → Auto-detect → Translate to English
- **India Use Case**: Khutbahs in Arabic/English → Auto-detect → Translate to Hindi/Urdu
- **France Use Case**: Khutbahs in Arabic → Auto-detect → Translate to French
- Created language configuration system in `shared/language-config.ts`
- Each variant has unique bundle ID: `.english`, `.hindi`, `.french`
- Same codebase builds all three variants - just change `DEFAULT_LANGUAGE` config
- Target markets: 🇬🇧 English (UK/USA/Canada), 🇮🇳 Hindi (India/Pakistan), 🇫🇷 French (France/North Africa)
- See `BUILD_VARIANTS.md` for complete build instructions
- Translation quality: GPT-4o excellent at all language pairs
- API costs remain same (~$4.68 per 30-min khutbah) regardless of source or target language

**Native Mobile Apps (iOS & Android)**
- Integrated Capacitor for native iOS and Android app deployment
- Configured permissions: microphone (recording), location (prayer times/mosque finder), background audio
- Generated app icons and splash screens (123 Android files, 10 iOS files)
- Created comprehensive deployment documentation for App Store and Google Play Store
- Three Capacitor config files: `capacitor.config.english.ts`, `.hindi.ts`, `.french.ts`
- Bundle identifiers: `com.khutbahtranslate.english/hindi/french`

**Previous Updates (Nov 20, 2025)**

**Monetization & Premium Features**
- Integrated 12 total features (9 free + 3 premium) in homepage app grid
- Premium features (Khutbah Database, Reflection Journal, Analytics) show gold crown lock icons for free users
- Created `/premium` page showcasing all premium benefits and upgrade CTA
- Google AdSense placements: Homepage banner below grid, inline ads on Prayer Times and Duas pages
- Premium feature gating implemented (requires completion for other layouts)

**Audio Recording System**
- Implemented Opus audio recording (WebM, 48kHz mono, 48kbps) for khutbah translation
- Custom `useAudioRecorder` hook with start, stop, pause, resume, clear controls
- Automatic fallback to other formats if Opus not supported
- Fixed media stream leak issue - proper cleanup on stop/clear

**Technical Improvements**
- Fixed HTML nesting error in BottomNav component
- Increased feature icon size from 40px to 48px
- Changed "99 Names of Allah" icon to display "99" text instead of star icon

## User Preferences

Preferred communication style: Simple, everyday language.

**Monetization Strategy**
- Free tier: 2 hours (120 minutes) of translation per month - encourages premium upgrades
- Premium subscriptions: $9.99/month via Stripe (to be fully implemented with Stripe integration)
- Anonymous users (no login): Unlimited translation access for mosque congregations
- Google Ads: Non-intrusive placements (homepage banner, inline on long pages)
- Never interrupt worship features (Tasbih, Qibla, live Khutbah translation) with ads

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing instead of React Router

**UI Component System**
- Shadcn/ui component library (New York style) with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants
- Custom CSS variables for theme support (light/dark modes)

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- React Hook Form with Zod resolver for form validation
- Local React state for UI-specific concerns

**Design System**
- Mobile-first responsive design with touch-optimized interactions
- Horizontal scroll cards with snap-scroll for feature discovery on homepage
- Fixed bottom navigation bar for primary app sections
- Arabic typography (Noto Naskh Arabic) with RTL support for religious content
- Inter font for English content
- Islamic aesthetic with geometric patterns and respectful color treatment

### Backend Architecture

**Server Framework**
- Express.js running on Node.js for RESTful API endpoints
- Session-based authentication using Passport.js with local strategy
- Custom middleware for request logging and authentication guards

**API Structure**
- RESTful endpoints organized by feature domain:
  - `/api/sermons` - Sermon CRUD operations and translations
  - `/api/transcripts` - Real-time transcript segment management
  - `/api/notes` - Premium feature for sermon annotations
  - `/api/journal` - Reflection journal entries
  - `/api/analytics` - User activity tracking
  - `/api/user` - Authentication and user management
- Multer middleware for handling audio file uploads (50MB limit)
- Role-based access control with `requireAuth` and `requirePremium` middleware

**Authentication & Authorization**
- Passport.js with local strategy for username/password authentication
- Password hashing using Node.js crypto.scrypt with salt
- Session management with express-session
- PostgreSQL-backed session store using connect-pg-simple
- Free vs Premium tier subscription model with Stripe integration

### Data Storage

**Database**
- PostgreSQL as primary database via Neon serverless
- Drizzle ORM for type-safe database queries and migrations
- WebSocket-based connection pooling (@neondatabase/serverless)

**Schema Design**
- `users` - User accounts with subscription tier tracking (free/premium), Stripe customer/subscription IDs
- `sermons` - Khutbah recordings with metadata (title, mosque, date, duration, topic, visibility)
- `transcript_segments` - Real-time translation segments with sequence numbers and timestamps
- `notes` - Premium feature for sermon annotations
- `journal_entries` - Reflection journal linked to sermons with AI-generated prompts
- `user_analytics` - Activity tracking (prayer counts, dhikr counts, Quran progress)
- `user_preferences` - User settings and customization

**Relationships**
- One-to-many: Users → Sermons, Sermons → Transcript Segments
- Cascade deletion for user-owned content
- UUID primary keys for all tables

### External Dependencies

**AI Services (OpenAI)**
- **Whisper API** - Arabic audio transcription with language detection
- **GPT-4o** - Arabic-to-multilingual translation with Islamic context preservation
  - Supports English, Hindi/Urdu (Hindustani), and French translations
  - Custom prompt engineering to preserve Islamic terminology (Allah, salah, jannah, etc.)
  - Automatic addition of "peace be upon him" for Prophet Muhammad mentions
  - Quranic verse detection and respectful formatting
  - Cultural sensitivity and scholarly tone maintenance
- **GPT-4o** - AI-generated features:
  - Action point extraction from sermons
  - Sermon summaries (main themes, key points)
  - Journal reflection prompts

**Payment Processing**
- Stripe for subscription management (premium tier)
- Stripe.js and React Stripe.js for frontend payment integration
- Webhook handling for subscription lifecycle events

**Third-Party UI Libraries**
- Radix UI primitives for 20+ accessible component patterns
- Lucide React for consistent iconography
- date-fns for date manipulation
- Embla Carousel for swipeable UI components

**Development Tools**
- TypeScript for static type checking
- ESBuild for server-side bundling
- Drizzle Kit for database migrations
- PostCSS with Autoprefixer for CSS processing

**Native Mobile Platform**
- Capacitor for wrapping web app as native iOS and Android apps
- iOS project in `/ios` directory (Xcode project)
- Android project in `/android` directory (Android Studio project)
- Asset generation via @capacitor/assets for icons and splash screens

**Planned Integrations** (Not Yet Implemented)
- Geolocation APIs for prayer time calculations and mosque finder
- Islamic calendar API for Hijri date conversion
- Qibla direction calculation using device compass/magnetometer

### Key Architectural Decisions

**Monorepo Structure**
- Shared schema definitions in `/shared` for type safety between client and server
- Client code in `/client` with Vite-specific configuration
- Server code in `/server` with Express routes and services
- Asset management in `/attached_assets` for generated images

**Real-Time Translation Flow**
1. Frontend captures audio via Web Audio API in chunks
2. Audio buffer sent to backend via multipart/form-data
3. OpenAI Whisper transcribes Arabic audio to text
4. GPT-4o translates with Islamic terminology preservation
5. Transcript segments stored in database with sequence numbers
6. Frontend polls or receives updates for real-time display

**Authentication Strategy**
- Session-based auth chosen over JWT for better security with server-side session invalidation
- PostgreSQL session store ensures session persistence across server restarts
- Trust proxy configuration for deployment behind reverse proxies

**Premium Feature Gating**
- Middleware-based role checks (`requirePremium`)
- Feature flags in UI components based on `user.subscriptionTier`
- Stripe subscription lifecycle tied to database subscription status

**Mobile-First Design Rationale**
- Bottom navigation for thumb-friendly interaction on mobile devices
- Horizontal scroll cards for feature discovery without overwhelming vertical scrolling
- Touch-optimized button sizes (minimum 44x44px tap targets)
- Gesture-driven interactions align with mobile app conventions

**Islamic Content Handling**
- Dedicated Arabic font family (Noto Naskh Arabic) for religious text
- RTL text direction support via `dir="rtl"` attribute
- Larger font sizes for Arabic content (text-2xl to text-4xl)
- Custom translation logic preserving Islamic terminology and adding honorifics automatically

**Multi-Language Variant System**
- Language configuration in `shared/language-config.ts` defines target language per app build
- Three app variants from single codebase: English, Hindi/Urdu, French
- `DEFAULT_LANGUAGE` constant determines which variant is built
- Separate Capacitor configs allow different bundle IDs and app store listings
- Regional pricing strategy: $9.99 (USA), ₹299 (India), €9.99 (France)
- See `BUILD_VARIANTS.md` for deployment instructions