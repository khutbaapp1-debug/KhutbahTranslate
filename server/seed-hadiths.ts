// Seed authentic hadiths from major collections
import { db } from "./db";
import { hadiths } from "@shared/schema";

const AUTHENTIC_HADITHS = [
  {
    arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    englishTranslation: "Actions are judged by intentions, and everyone will be rewarded according to their intention.",
    collection: "bukhari",
    bookNumber: 1,
    hadithNumber: 1,
    narrator: "Umar ibn Al-Khattab",
    category: "faith",
    reference: "Sahih Bukhari 1:1:1",
    grade: "sahih"
  },
  {
    arabicText: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    englishTranslation: "A Muslim is the one from whose tongue and hand the Muslims are safe.",
    collection: "bukhari",
    bookNumber: 2,
    hadithNumber: 10,
    narrator: "Abdullah ibn Amr",
    category: "character",
    reference: "Sahih Bukhari 2:1:10",
    grade: "sahih"
  },
  {
    arabicText: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    englishTranslation: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    collection: "bukhari",
    bookNumber: 8,
    hadithNumber: 47,
    narrator: "Abu Huraira",
    category: "character",
    reference: "Sahih Bukhari 8:1:47",
    grade: "sahih"
  },
  {
    arabicText: "الدِّينُ النَّصِيحَةُ",
    englishTranslation: "Religion is sincerity and sincere advice.",
    collection: "muslim",
    bookNumber: 1,
    hadithNumber: 55,
    narrator: "Tamim Ad-Dari",
    category: "faith",
    reference: "Sahih Muslim 1:1:55",
    grade: "sahih"
  },
  {
    arabicText: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    englishTranslation: "None of you truly believes until he loves for his brother what he loves for himself.",
    collection: "bukhari",
    bookNumber: 1,
    hadithNumber: 13,
    narrator: "Anas ibn Malik",
    category: "faith",
    reference: "Sahih Bukhari 1:2:13",
    grade: "sahih"
  },
  {
    arabicText: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    englishTranslation: "Purity is half of faith.",
    collection: "muslim",
    bookNumber: 1,
    hadithNumber: 223,
    narrator: "Abu Malik Al-Ashari",
    category: "purification",
    reference: "Sahih Muslim 1:2:223",
    grade: "sahih"
  },
  {
    arabicText: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    englishTranslation: "The best among you are those who learn the Quran and teach it.",
    collection: "bukhari",
    bookNumber: 6,
    hadithNumber: 545,
    narrator: "Uthman ibn Affan",
    category: "knowledge",
    reference: "Sahih Bukhari 6:61:545",
    grade: "sahih"
  },
  {
    arabicText: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    englishTranslation: "Your smiling in the face of your brother is charity.",
    collection: "tirmidhi",
    bookNumber: 27,
    hadithNumber: 1956,
    narrator: "Abu Dharr",
    category: "charity",
    reference: "Jami' at-Tirmidhi 27:1956",
    grade: "hasan"
  },
  {
    arabicText: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
    englishTranslation: "The strong believer is better and more beloved to Allah than the weak believer.",
    collection: "muslim",
    bookNumber: 34,
    hadithNumber: 2664,
    narrator: "Abu Huraira",
    category: "faith",
    reference: "Sahih Muslim 34:2664",
    grade: "sahih"
  },
  {
    arabicText: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ",
    englishTranslation: "Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.",
    collection: "bukhari",
    bookNumber: 9,
    hadithNumber: 553,
    narrator: "Abu Musa",
    category: "prayer",
    reference: "Sahih Bukhari 9:10:553",
    grade: "sahih"
  },
  {
    arabicText: "الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَةٌ لِمَا بَيْنَهُنَّ",
    englishTranslation: "The five daily prayers and from one Friday to the next are expiation for whatever sins come between them.",
    collection: "muslim",
    bookNumber: 2,
    hadithNumber: 233,
    narrator: "Abu Huraira",
    category: "prayer",
    reference: "Sahih Muslim 2:233",
    grade: "sahih"
  },
  {
    arabicText: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا",
    englishTranslation: "Whoever cheats us is not one of us.",
    collection: "muslim",
    bookNumber: 1,
    hadithNumber: 102,
    narrator: "Abu Huraira",
    category: "character",
    reference: "Sahih Muslim 1:102",
    grade: "sahih"
  },
  {
    arabicText: "لَا ضَرَرَ وَلَا ضِرَارَ",
    englishTranslation: "There should be neither harming nor reciprocating harm.",
    collection: "ibn majah",
    bookNumber: 13,
    hadithNumber: 2340,
    narrator: "Abu Said Al-Khudri",
    category: "justice",
    reference: "Sunan Ibn Majah 13:2340",
    grade: "hasan"
  },
  {
    arabicText: "إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا",
    englishTranslation: "Allah is pure and accepts only that which is pure.",
    collection: "muslim",
    bookNumber: 12,
    hadithNumber: 1015,
    narrator: "Abu Huraira",
    category: "charity",
    reference: "Sahih Muslim 12:1015",
    grade: "sahih"
  },
  {
    arabicText: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    englishTranslation: "The most beloved deeds to Allah are those that are most consistent, even if they are small.",
    collection: "bukhari",
    bookNumber: 76,
    hadithNumber: 469,
    narrator: "Aisha",
    category: "faith",
    reference: "Sahih Bukhari 76:76:469",
    grade: "sahih"
  },
  {
    arabicText: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    englishTranslation: "A kind word is charity.",
    collection: "bukhari",
    bookNumber: 56,
    hadithNumber: 128,
    narrator: "Abu Huraira",
    category: "charity",
    reference: "Sahih Bukhari 56:128",
    grade: "sahih"
  },
  {
    arabicText: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ",
    englishTranslation: "Fear Allah wherever you are.",
    collection: "tirmidhi",
    bookNumber: 27,
    hadithNumber: 1987,
    narrator: "Abu Dharr",
    category: "taqwa",
    reference: "Jami' at-Tirmidhi 27:1987",
    grade: "hasan"
  },
  {
    arabicText: "مَنْ بَنَى مَسْجِدًا يَبْتَغِي بِهِ وَجْهَ اللَّهِ بَنَى اللَّهُ لَهُ مِثْلَهُ فِي الْجَنَّةِ",
    englishTranslation: "Whoever builds a mosque seeking Allah's pleasure, Allah will build for him a similar place in Paradise.",
    collection: "bukhari",
    bookNumber: 8,
    hadithNumber: 450,
    narrator: "Uthman ibn Affan",
    category: "charity",
    reference: "Sahih Bukhari 8:65:450",
    grade: "sahih"
  },
  {
    arabicText: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
    englishTranslation: "If Allah wants good for a person, He gives him understanding of the religion.",
    collection: "bukhari",
    bookNumber: 3,
    hadithNumber: 71,
    narrator: "Muawiya",
    category: "knowledge",
    reference: "Sahih Bukhari 3:71",
    grade: "sahih"
  },
  {
    arabicText: "الْحَيَاءُ مِنَ الْإِيمَانِ",
    englishTranslation: "Modesty is part of faith.",
    collection: "bukhari",
    bookNumber: 2,
    hadithNumber: 9,
    narrator: "Abu Huraira",
    category: "character",
    reference: "Sahih Bukhari 2:1:9",
    grade: "sahih"
  },
];

export async function seedHadiths() {
  console.log("Seeding hadiths...");
  
  // Check if hadiths already exist
  const existing = await db.select().from(hadiths).limit(1);
  if (existing.length > 0) {
    console.log("Hadiths already seeded, skipping...");
    return;
  }

  // Insert all hadiths
  await db.insert(hadiths).values(AUTHENTIC_HADITHS);
  console.log(`✓ Seeded ${AUTHENTIC_HADITHS.length} authentic hadiths`);
}

// Run immediately
seedHadiths()
  .then(() => {
    console.log("Hadith seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding hadiths:", error);
    process.exit(1);
  });
