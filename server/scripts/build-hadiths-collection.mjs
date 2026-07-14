/**
 * Regenerate server/data/hadiths-collection.json from the verified
 * fawazahmed0/hadith-api dataset (Sahih al-Bukhari + Sahih Muslim).
 *
 * Provenance: every hadith's Arabic, English translation, and reference number
 * comes verbatim from the dataset. `narrator` is parsed from the verified
 * English text (null when not confidently parseable). `category` is the only
 * derived field — assigned by keyword-matching the English translation, with a
 * >=2 hit threshold to avoid incidental single-word false positives. Nothing is
 * authored from memory.
 *
 * Run:  node server/scripts/build-hadiths-collection.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "hadiths-collection.json");
const BASE = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions";

async function fetchEdition(name) {
  const res = await fetch(`${BASE}/${name}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${name}`);
  return (await res.json()).hadiths;
}

const CATEGORIES = [
  "Faith", "Prayer", "Fasting", "Charity", "Character", "Family", "Knowledge",
  "Dua", "Remembrance", "Quran", "Death", "Jannah", "Business", "Health", "Repentance",
];

// [category, keyword regexes]. Ordered; ties break by earlier position.
const CATEGORY_RULES = [
  ["Prayer", [/\bpray(?:er|ing|ed|ers)?\b/i, /\bsal(?:ah|at)\b/i, /\bablution\b/i, /\bwudu\b/i, /\bprostrat/i, /\brak['`]?ah?\b/i, /\bmosque\b/i, /\badhan\b/i, /call to prayer/i, /\bqibla\b/i, /\bcongregation\b/i]],
  ["Fasting", [/\bfast(?:ing|ed|s)?\b/i, /ramadan/i, /\bsuhoor\b/i, /\biftar\b/i, /break(?:ing)? the fast/i]],
  ["Quran", [/\bqur['`]?an\b/i, /\brecit(?:e|ing|ation|ed|es)\b/i, /\bsurah?\b/i, /\bthe book of allah\b/i, /\brevelation\b/i, /\bal-fatiha\b/i]],
  ["Charity", [/\bcharity\b/i, /\bsadaqah\b/i, /\bzakat\b/i, /\balms\b/i, /\bthe needy\b/i, /\bthe poor\b/i, /feed(?:ing|s)? the/i, /\bspend(?:ing)? (?:in|for|of)\b/i]],
  ["Repentance", [/\brepent(?:ance|ed|s)?\b/i, /\bforgive(?:ness|n|s)?\b/i, /seek(?:ing)? forgiveness/i, /\bistighfar\b/i, /\bpardon\b/i, /\bsins?\b/i]],
  ["Dua", [/\bsupplicat/i, /\binvoke\b/i, /\binvocation\b/i, /\bdu['`]?a['`]?\b/i, /call(?:ing|ed)? upon allah/i, /ask(?:ing|ed)? allah/i, /o allah[,!]/i]],
  ["Remembrance", [/\bremembrance\b/i, /\bdhikr\b/i, /\bglorif/i, /\bsubhan/i, /praise (?:be to )?allah/i, /\btasbih\b/i, /mention(?:ing|ed)? (?:of )?allah/i, /la ilaha/i]],
  ["Family", [/\bparents?\b/i, /\bmother\b/i, /\bfather\b/i, /\bwife\b/i, /\bhusband\b/i, /\bmarriage\b/i, /\bmarry\b/i, /\bchildren\b/i, /\bkinship\b/i, /\brelatives\b/i, /\bkin\b/i, /\borphan\b/i]],
  ["Knowledge", [/\bknowledge\b/i, /\blearn(?:ing|ed|s)?\b/i, /\bteach(?:ing|es|er)?\b/i, /\bscholars?\b/i, /\bwisdom\b/i, /seek(?:ing)? knowledge/i]],
  ["Business", [/\btrade\b/i, /\bbusiness\b/i, /\bbuy(?:ing|s)?\b/i, /\bsell(?:ing|s)?\b/i, /\btransaction\b/i, /\briba\b/i, /\busury\b/i, /\bdebt\b/i, /\bwages?\b/i, /\bmarket\b/i, /\bwealth\b/i]],
  ["Health", [/\billness\b/i, /\bsick(?:ness)?\b/i, /\bcure\b/i, /\bmedicine\b/i, /\bdisease\b/i, /\bheal(?:ing|s|ed)?\b/i, /\bplague\b/i, /\bremedy\b/i, /\bfever\b/i]],
  ["Death", [/\bdeath\b/i, /\bdies?\b/i, /\bdying\b/i, /\bgrave\b/i, /\bfuneral\b/i, /\bdeceased\b/i, /\bburial\b/i, /\bthe soul\b/i]],
  ["Jannah", [/\bparadise\b/i, /\bjannah\b/i, /\bhell(?:fire)?\b/i, /\bthe fire\b/i, /\bthe hereafter\b/i, /\bgardens? of\b/i, /\bgates of\b/i]],
  ["Character", [/\bhonest(?:y)?\b/i, /\btruthful(?:ness)?\b/i, /\blie(?:s|d)?\b/i, /\bpatien(?:ce|t)\b/i, /\bhumilit(?:y)?\b/i, /\banger\b/i, /\bmodest(?:y)?\b/i, /\bmanners?\b/i, /\bkind(?:ness)?\b/i, /\bgentle(?:ness)?\b/i, /good character/i, /best of you/i, /\bharm(?:s|ing|ed)?\b/i, /\bneighbou?r\b/i]],
  ["Faith", [/\bfaith\b/i, /\bbeliev(?:e|er|ers|ing)\b/i, /\bbelief\b/i, /\biman\b/i, /testif(?:y|ies)/i, /\bshahada\b/i, /oneness/i, /\btawhid\b/i, /pillars of islam/i, /\bangels?\b/i, /divine decree/i, /\bdestiny\b/i]],
];

const MIN_HITS = 2;
function categorize(text) {
  let best = null, bestScore = 0;
  for (const [cat, kws] of CATEGORY_RULES) {
    let score = 0;
    for (const re of kws) if (re.test(text)) score++;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return bestScore >= MIN_HITS ? best : null;
}

function narratorFrom(text, collection) {
  if (collection === "bukhari") {
    const m = text.match(/^Narrated ([^:]{2,60}):/);
    if (m) return m[1].replace(/\s+/g, " ").trim();
  } else {
    const m = text.match(/on the authority of ([A-Z][A-Za-z'`. -]{2,40}?)(?: that| who| as | reported|,|:|\.)/);
    if (m) return m[1].replace(/\s+/g, " ").trim();
    const m2 = text.match(/^([A-Z][A-Za-z'`. -]{2,40}?)(?: (?:is|was|has|had|have|it)\b)? reported/);
    if (m2) return m2[1].replace(/\s+/g, " ").trim();
  }
  return null;
}

function quality(h) {
  let s = h.narrator ? 2 : 0;
  const L = h.englishTranslation.length;
  if (L >= 120 && L <= 500) s += 2; else if (L <= 650) s += 1;
  return s;
}

function collect(eng, araMap, collection, sourceName) {
  const buckets = new Map(CATEGORIES.map((c) => [c, []]));
  for (const h of eng) {
    const en = (h.text || "").trim();
    const ar = (araMap.get(h.hadithnumber) || "").trim();
    if (!en || !ar) continue;
    if (en.length < 80 || en.length > 900) continue;
    const cat = categorize(en);
    if (!cat) continue;
    buckets.get(cat).push({
      collection,
      arabicText: ar,
      transliteration: null,
      englishTranslation: en,
      narrator: narratorFrom(en, collection),
      category: cat,
      subcategory: null,
      bookNumber: h.reference ? h.reference.book : null,
      hadithNumber: h.hadithnumber,
      source: `${sourceName} ${h.hadithnumber}`,
      grade: "sahih",
      isDailyEligible: true,
    });
  }
  return buckets;
}

function pick(buckets, cap) {
  const out = [];
  for (const cat of CATEGORIES) {
    const arr = buckets.get(cat).slice().sort((a, b) => quality(b) - quality(a) || a.hadithNumber - b.hadithNumber);
    out.push(...arr.slice(0, cap));
  }
  return out;
}

const [engB, araB, engM, araM] = await Promise.all([
  fetchEdition("eng-bukhari"), fetchEdition("ara-bukhari"),
  fetchEdition("eng-muslim"), fetchEdition("ara-muslim"),
]);
const araMap = (arr) => new Map(arr.map((h) => [h.hadithnumber, (h.text || "").trim()]));

const CAP = 14;
const collection = [
  ...pick(collect(engB, araMap(araB), "bukhari", "Sahih al-Bukhari"), CAP),
  ...pick(collect(engM, araMap(araM), "muslim", "Sahih Muslim"), CAP),
];

writeFileSync(OUT, JSON.stringify(collection, null, 2));
const dist = {};
for (const h of collection) dist[h.category] = (dist[h.category] || 0) + 1;
console.log(`Wrote ${collection.length} hadiths to ${OUT}`);
console.log("by category:", JSON.stringify(dist));
