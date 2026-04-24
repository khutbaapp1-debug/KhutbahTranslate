import { db } from "./db";
import { hadiths } from "@shared/schema";

interface CuratedHadith {
  collection: "bukhari" | "muslim" | "tirmidhi" | "abudawud" | "nasai" | "ibnmajah";
  number: number;
  category: string;
  narrator: string;
  grade: "sahih" | "hasan";
}

const COLLECTION_NAMES: Record<string, string> = {
  bukhari: "Sahih al-Bukhari",
  muslim: "Sahih Muslim",
  tirmidhi: "Jami at-Tirmidhi",
  abudawud: "Sunan Abu Dawud",
  nasai: "Sunan an-Nasai",
  ibnmajah: "Sunan Ibn Majah",
};

const CURATED_HADITHS: CuratedHadith[] = [
  { collection: "bukhari", number: 1, category: "intentions", narrator: "Umar ibn Al-Khattab", grade: "sahih" },
  { collection: "bukhari", number: 8, category: "faith", narrator: "Ibn Umar", grade: "sahih" },
  { collection: "bukhari", number: 12, category: "character", narrator: "Abdullah ibn Amr", grade: "sahih" },
  { collection: "bukhari", number: 13, category: "brotherhood", narrator: "Anas ibn Malik", grade: "sahih" },
  { collection: "bukhari", number: 25, category: "deeds", narrator: "Abu Huraira", grade: "sahih" },
  { collection: "bukhari", number: 41, category: "repentance", narrator: "Abu Sa'id Al-Khudri", grade: "sahih" },
  { collection: "bukhari", number: 1395, category: "charity", narrator: "Ibn Abbas", grade: "sahih" },
  { collection: "bukhari", number: 5970, category: "family", narrator: "Abdullah ibn Mas'ud", grade: "sahih" },
  { collection: "bukhari", number: 6011, category: "brotherhood", narrator: "An-Nu'man ibn Bashir", grade: "sahih" },
  { collection: "bukhari", number: 6018, category: "character", narrator: "Abu Huraira", grade: "sahih" },
  { collection: "bukhari", number: 6094, category: "character", narrator: "Abdullah ibn Mas'ud", grade: "sahih" },
  { collection: "bukhari", number: 6464, category: "deeds", narrator: "Aisha", grade: "sahih" },
  { collection: "bukhari", number: 6502, category: "spiritual", narrator: "Abu Huraira", grade: "sahih" },
  { collection: "bukhari", number: 7405, category: "remembrance", narrator: "Abu Huraira", grade: "sahih" },

  { collection: "muslim", number: 1, category: "faith", narrator: "Umar ibn Al-Khattab", grade: "sahih" },
  { collection: "muslim", number: 8, category: "faith", narrator: "Umar ibn Al-Khattab", grade: "sahih" },
  { collection: "muslim", number: 49, category: "character", narrator: "Abu Sa'id Al-Khudri", grade: "sahih" },
  { collection: "muslim", number: 223, category: "purification", narrator: "Abu Malik Al-Ash'ari", grade: "sahih" },
  { collection: "muslim", number: 2564, category: "spiritual", narrator: "Abu Huraira", grade: "sahih" },
  { collection: "muslim", number: 2999, category: "patience", narrator: "Suhaib", grade: "sahih" },

  { collection: "tirmidhi", number: 1924, category: "mercy", narrator: "Abdullah ibn Amr", grade: "sahih" },
  { collection: "tirmidhi", number: 1987, category: "character", narrator: "Abu Dharr", grade: "hasan" },
  { collection: "tirmidhi", number: 2317, category: "character", narrator: "Abu Huraira", grade: "hasan" },
  { collection: "tirmidhi", number: 2516, category: "spiritual", narrator: "Ibn Abbas", grade: "hasan" },
  { collection: "tirmidhi", number: 2687, category: "knowledge", narrator: "Abu Umamah", grade: "hasan" },

  { collection: "abudawud", number: 4084, category: "manners", narrator: "Abu Huraira", grade: "sahih" },
  { collection: "abudawud", number: 4811, category: "gratitude", narrator: "Abu Huraira", grade: "sahih" },

  { collection: "nasai", number: 1574, category: "prayer", narrator: "Aisha", grade: "sahih" },
  { collection: "nasai", number: 5009, category: "wealth", narrator: "Abu Huraira", grade: "sahih" },

  { collection: "ibnmajah", number: 224, category: "knowledge", narrator: "Anas ibn Malik", grade: "sahih" },
];

async function fetchHadith(collection: string, number: number) {
  const base = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
  const [engRes, araRes] = await Promise.all([
    fetch(`${base}/eng-${collection}/${number}.json`),
    fetch(`${base}/ara-${collection}/${number}.json`),
  ]);
  if (!engRes.ok || !araRes.ok) {
    throw new Error(`HTTP ${engRes.status}/${araRes.status} for ${collection}/${number}`);
  }
  const eng = await engRes.json();
  const ara = await araRes.json();
  return {
    arabic: (ara?.hadiths?.[0]?.text ?? "").trim(),
    english: (eng?.hadiths?.[0]?.text ?? "").trim(),
  };
}

export async function seedHadiths() {
  console.log("Fetching authentic hadiths from sunnah.com sources...");

  const inserts: Array<typeof hadiths.$inferInsert> = [];
  let failed = 0;

  for (const h of CURATED_HADITHS) {
    try {
      const { arabic, english } = await fetchHadith(h.collection, h.number);
      if (!arabic || !english) {
        failed++;
        continue;
      }
      inserts.push({
        arabicText: arabic,
        englishTranslation: english,
        collection: h.collection,
        hadithNumber: h.number,
        narrator: h.narrator,
        category: h.category,
        reference: `${COLLECTION_NAMES[h.collection]} ${h.number}`,
        grade: h.grade,
      });
    } catch (err: any) {
      console.error(`Failed to fetch ${h.collection} ${h.number}: ${err.message}`);
      failed++;
    }
  }

  if (inserts.length > 0) {
    await db.insert(hadiths).values(inserts);
  }
  console.log(`Seeded ${inserts.length} hadiths (${failed} failed) from authentic collections.`);
}

export const EXPECTED_HADITH_COUNT = CURATED_HADITHS.length;

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
