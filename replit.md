# Khutbah Translate - Islamic Companion App

## Overview

Khutbah Translate is a full-stack Islamic companion web application that provides real-time Arabic-to-English translation of khutbahs (sermons) alongside essential Islamic tools. The app features prayer times, Qibla compass, digital Quran reader, tasbih counter, duas collection, mosque finder, and Ramadan/Hijri calendar utilities. Built with a mobile-first design philosophy emphasizing spiritual serenity and effortless navigation through swipe-based interactions and Islamic aesthetic principles.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **GPT-4o** - Arabic-to-English translation with Islamic context preservation
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