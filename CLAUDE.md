# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Khutbah Companion** is a full-stack Islamic companion web app offering real-time Arabic-to-English khutbah (sermon) translation plus tools: prayer times, Qibla compass, Quran reader, tasbih counter, duas, hadith reader, mosque finder, Hijri calendar, and Salah guide. Available as web app and native iOS/Android via Capacitor.

## Commands

```bash
npm run dev       # Start dev server (Express + Vite HMR on port 5000)
npm run build     # Production build: vite (client) + esbuild (server)
npm run start     # Run production build
npm run check     # TypeScript type check (tsc --noEmit)
npm run db:push   # Push schema changes to database (Drizzle Kit)
```

No test runner or linter is configured. TypeScript strict mode is enforced via `tsconfig.json`.

## Required Environment Variables

```
DATABASE_URL          # Neon PostgreSQL connection string
OPENAI_API_KEY        # GPT-4o-mini (translation) + Whisper fallback (transcription)
GROQ_API_KEY          # Groq Whisper (preferred transcription; falls back to OpenAI)
STRIPE_SECRET_KEY     # Stripe SDK
STRIPE_WEBHOOK_SECRET # Stripe webhook signature verification
```

## Architecture

### Directory Layout

```
client/src/
  pages/        # Route-level React components
  components/   # UI components (many from shadcn/ui via Radix)
  hooks/        # Custom React hooks
  lib/          # queryClient, auth-utils, qibla compass logic, theme provider
  data/         # Static data and constants

server/
  index.ts           # App entry: Express setup, Stripe webhook, Vite middleware
  routes.ts          # All /api/* endpoints
  db.ts              # Neon PostgreSQL connection + Drizzle ORM instance
  storage.ts         # Database CRUD operations
  openai-service.ts  # Whisper transcription + GPT-4o-mini translation
  translation-cache.ts  # Hybrid cache: Islamic phrase dict + segment cache
  translation-limits.ts # Usage tracking (free tier limits + ad credits)
  prayer-times.ts    # Prayer time calculations
  seed-duas.ts / seed-hadiths.ts  # DB seeding (run automatically on startup)

shared/
  schema.ts           # Drizzle ORM table definitions, Zod schemas, TypeScript types
  language-config.ts  # Multi-language support (English, Hindi/Urdu, French)
```

### Shared Types Pattern

The `@shared/*` path alias (resolves to `shared/`) is used by **both** client and server. All database table types, Zod validation schemas, and insert types are defined in `shared/schema.ts` and imported from both sides. Never duplicate type definitions — add them to `shared/schema.ts`.

### Khutbah Translation Flow

1. User uploads/records Arabic audio in the React client
2. `POST /api/sermons/:id/transcribe` — audio sent via multipart (50MB limit via Multer, in-memory)
3. `server/openai-service.ts` transcribes with Groq Whisper (if `GROQ_API_KEY` set) or OpenAI Whisper
4. `translation-cache.ts` checked first — 300+ pre-cached Islamic phrases reduce API calls ~50-70%
5. GPT-4o-mini translates remaining segments to the user's configured language
6. Segments stored in DB, streamed back to client for real-time display

### Authentication

Replit Auth (OIDC) handles all authentication — Google, Apple, GitHub, X, email/password. The OIDC subject is mapped to an internal UUID user record. Sessions stored in PostgreSQL via `connect-pg-simple`. Key middleware in `routes.ts`: `requireAuth`, `requirePremium`, `requireAdmin`.

**Important:** The Stripe webhook handler in `server/index.ts` must be registered **before** `express.json()` because it needs the raw `Buffer` body for signature verification.

### Database

Drizzle ORM with Neon serverless PostgreSQL. Schema lives in `shared/schema.ts`. Run `npm run db:push` to sync schema changes. The server runs `ensureSchemaAndSeed()` on startup — this applies any idempotent ALTER TABLE patches and seeds duas/hadiths if the tables are empty.

### Mobile Builds (Capacitor)

Language-specific Capacitor configs exist: `capacitor.config.ts` (English), plus Hindi/Urdu and French variants. When building a language variant:
1. Change `DEFAULT_LANGUAGE` in `shared/language-config.ts`
2. Run `npm run build`
3. Use `npx cap sync --config capacitor.config.[lang].ts` with the correct config

See `BUILD_VARIANTS.md` and `DEPLOYMENT.md` for full App Store deployment steps.

### Key Conventions

- **Path aliases:** `@/*` → `client/src/`, `@shared/*` → `shared/`, `@assets/*` → `client/src/assets/`
- **API validation:** Drizzle insert schemas + Zod for all request bodies in `routes.ts`
- **React Query** for all client-side data fetching; query client configured in `client/src/lib/queryClient.ts`
- **Shadcn/ui components** live in `client/src/components/ui/`; add new ones with `npx shadcn-ui@latest add <component>`
- The app is currently **free for all users** — premium features exist in the UI but limits in `translation-limits.ts` are not enforced
