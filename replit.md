# Khutbah Companion

## Overview
Khutbah Companion is a full-stack Islamic companion web application providing real-time Arabic-to-English khutbah (sermon) translation, alongside essential Islamic tools such as prayer times, Qibla compass, digital Quran reader, tasbih counter, duas collection, mosque finder, and a Ramadan/Hijri calendar. The project aims to offer spiritual serenity and effortless navigation through a mobile-first design, swipe-based interactions, and Islamic aesthetic principles. The business vision focuses on serving Muslim communities globally with a flexible monetization strategy balancing free access, premium features, and ad-supported usage for sustainability and broad accessibility.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18, TypeScript, and Vite. UI components utilize Shadcn/ui (New York style) with Radix UI primitives for accessibility, styled using Tailwind CSS and CVA. State management is handled by TanStack Query for server state and React Hook Form with Zod for validation. The design is mobile-first, featuring touch-optimized interactions, horizontal scroll cards, fixed bottom navigation, and an Islamic aesthetic with Arabic typography and respectful color treatment.

### Backend Architecture
The backend is an Express.js application on Node.js, providing RESTful API endpoints. Authentication uses Passport.js with a local strategy and session management (express-session, connect-pg-simple). Multer handles audio file uploads, and role-based access control (`requireAuth`, `requirePremium`) manages feature access.

### Data Storage
PostgreSQL serves as the primary database, utilizing Neon for serverless capabilities and Drizzle ORM for type-safe queries. The schema includes tables for users, sermons, transcript_segments, notes, khutbah_guidelines, missed_prayers, user_analytics, hadiths, favoriteHadiths, duas, favoriteDuas, and userPreferences, including comprehensive notification settings.

### Key Architectural Decisions
The project adopts a monorepo structure with `/client`, `/server`, and `/shared` directories. Real-time translation involves audio chunk capture, backend processing with Whisper for transcription, and GPT-4o-mini for translation, with segments stored for real-time display. Session-based authentication is used for security. Premium feature gating is implemented via middleware and UI flags. A mobile-first design prioritizes thumb-friendly interactions. Islamic content handling includes dedicated Arabic fonts, RTL support, and custom translation logic. Multi-language support is built-in, with Capacitor enabling native mobile deployment.

### New Features (November 2025)
- **Khutbah Guidelines**: AI-powered weekly implementation plans generated from sermon content. Each sermon can generate 5-7 practical suggestions across categories (Family, Work, Spiritual Practice, Community, Personal Growth) that users can track and complete.
- **Prayer Tracker (Qada)**: Missed prayer tracking system allowing users to log prayers they need to make up, mark them as completed, and view progress statistics with estimated completion timeline.

## External Dependencies

### AI Services
- **OpenAI Whisper API**: For Arabic audio transcription and source language auto-detection.
- **GPT-4o-mini**: For cost-effective and high-quality Arabic-to-English translation, maintaining Islamic context, and for AI-generated features like action point extraction, sermon summaries, and khutbah implementation guidelines.

### Payment Processing
- **Stripe**: For managing premium subscriptions, handling payments, and processing webhooks.
- **Stripe.js and React Stripe.js**: For frontend payment integration.

### Third-Party UI Libraries
- **Radix UI**: Primitives for accessible UI components.
- **Lucide React**: For iconography.
- **date-fns**: For date manipulation.
- **Embla Carousel**: For swipeable UI components.

### Native Mobile Platform
- **Capacitor**: For deploying the web application as native iOS and Android apps.