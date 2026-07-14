-- Adapts the existing `hadiths` table for the curated, searchable collection.
--
-- The `hadiths` table already exists (id uuid, arabic_text, english_translation,
-- collection, book_number, hadith_number, narrator, category, reference, grade)
-- and backs the live /api/hadiths/daily endpoint, so this migration is purely
-- ADDITIVE and idempotent — safe to run against production. It does NOT create
-- or drop the table and does not touch existing rows or the daily endpoint.
--
-- (Named add-hadiths-search-columns.sql rather than add-hadiths-table.sql because
--  the table already exists; a CREATE TABLE IF NOT EXISTS would have been a no-op.)

-- New optional columns. `english_translation`/`reference` already exist and are
-- reused as the API's `translation`/`source`.
ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS transliteration TEXT;
ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS is_daily_eligible BOOLEAN DEFAULT true;

-- Flags that a row's text/reference/narrator came from the verified fawazahmed0
-- dataset. Manually added hadiths should set this false until scholarly review.
ALTER TABLE hadiths ADD COLUMN IF NOT EXISTS source_verified BOOLEAN DEFAULT true;

-- Idempotent seeding target: ON CONFLICT (collection, hadith_number) DO NOTHING.
-- Postgres treats NULLs as distinct, so any legacy row without a hadith_number
-- will not collide. If this fails due to pre-existing duplicate
-- (collection, hadith_number) pairs, dedupe those rows first.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hadiths_collection_number
  ON hadiths (collection, hadith_number);

-- Category filter + full-text search on the (existing) english_translation column.
CREATE INDEX IF NOT EXISTS idx_hadiths_category ON hadiths (category);
CREATE INDEX IF NOT EXISTS idx_hadiths_translation
  ON hadiths USING gin (to_tsvector('english', english_translation));
