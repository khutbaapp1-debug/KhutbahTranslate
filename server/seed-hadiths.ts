/**
 * Seed the `hadiths` table from the curated collection in
 * server/data/hadiths-collection.json.
 *
 * The collection was built from the verified fawazahmed0/hadith-api dataset
 * (Sahih al-Bukhari + Sahih Muslim), which sources from sunnah.com. No hadith
 * text, Arabic, translation, narrator, or reference is authored here — only
 * `category` was assigned by keyword-matching the verified English translation
 * (see server/scripts/build-hadiths-collection.mjs). Unknown fields are null.
 *
 * seedHadiths() is called from server/index.ts on startup (seeds when the table
 * is empty, refreshes when it has fewer than EXPECTED_HADITH_COUNT rows). It is
 * self-migrating: it runs the additive column/index DDL first, so it stays safe
 * even if add-hadiths-search-columns.sql hasn't been applied yet. Idempotent —
 * skips any (collection, hadith_number) already present.
 */
import { sql } from "drizzle-orm";
import { db } from "./db";
import { hadiths } from "@shared/schema";
// Imported (not read from disk) so esbuild inlines it into the production
// bundle — a runtime readFileSync would resolve to dist/ where the file
// doesn't exist, and the seed would silently never run.
import hadithCollection from "./data/hadiths-collection.json";

interface HadithRecord {
  collection: string;
  arabicText: string;
  transliteration: string | null;
  englishTranslation: string;
  narrator: string | null;
  category: string;
  subcategory: string | null;
  bookNumber: number | null;
  hadithNumber: number;
  source: string;
  grade: string;
  isDailyEligible: boolean;
}

const records = hadithCollection as unknown as HadithRecord[];

// Expected row count = size of the curated collection. server/index.ts compares
// the live table against this to decide whether to (re)seed.
export const EXPECTED_HADITH_COUNT = records.length;

// Additive, idempotent DDL — mirrors server/migrations/add-hadiths-search-columns.sql.
// Run before inserting so the seed never fails on a missing column (which, on the
// refresh path in index.ts, would leave the table truncated/empty).
async function ensureSchema(): Promise<void> {
  await db.execute(sql`ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS transliteration TEXT;`);
  await db.execute(sql`ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS subcategory TEXT;`);
  await db.execute(sql`ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS is_daily_eligible BOOLEAN DEFAULT true;`);
  await db.execute(sql`ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS source_verified BOOLEAN DEFAULT true;`);
  // Unique target for idempotent seeding. Tolerate failure from any pre-existing
  // duplicate (collection, hadith_number) rows so it never aborts the seed.
  await db
    .execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS uq_hadiths_collection_number ON hadiths (collection, hadith_number);`)
    .catch((e: any) => console.warn("uq_hadiths_collection_number not created:", e?.message || e));
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_hadiths_category ON hadiths (category);`);
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS idx_hadiths_translation ON hadiths USING gin (to_tsvector('english', english_translation));`,
  );
}

export async function seedHadiths(): Promise<void> {
  await ensureSchema();

  console.log(`Seeding ${records.length} hadiths from the verified collection...`);

  const rows = records.map((h) => ({
    arabicText: h.arabicText,
    englishTranslation: h.englishTranslation,
    collection: h.collection,
    bookNumber: h.bookNumber ?? null,
    hadithNumber: h.hadithNumber,
    narrator: h.narrator ?? null,
    category: h.category,
    subcategory: h.subcategory ?? null,
    transliteration: h.transliteration ?? null,
    reference: h.source, // API `source` maps to the existing `reference` column
    grade: h.grade ?? "sahih",
    isDailyEligible: h.isDailyEligible ?? true,
    sourceVerified: true, // every seeded row came from the verified dataset
  }));

  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    // Skip any (collection, hadith_number) already present.
    await db.insert(hadiths).values(rows.slice(i, i + CHUNK)).onConflictDoNothing();
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(hadiths);
  console.log(`Seed complete. hadiths table now has ${count} rows.`);
}

const isDirectRun = process.argv[1] && process.argv[1].includes("seed-hadiths");
if (isDirectRun) {
  seedHadiths()
    .then(() => {
      console.log("Hadith seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding hadiths:", error);
      process.exit(1);
    });
}
