import { db } from "./db";
import { duas } from "@shared/schema";

const duasData = [
  // Morning Duas
  {
    arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Asbahnaa wa-asbahal-mulku lillah, walhamdu lillah",
    translation: "We have entered morning and the whole kingdom belongs to Allah, and all praise is for Allah",
    category: "morning",
    occasion: "Upon waking up",
    reference: "Muslim 2723",
  },
  {
    arabicText: "بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i, wa Huwas-Sami'ul-'Alim",
    translation: "In the Name of Allah, with Whose Name nothing can harm on earth or in heaven, and He is the All-Hearing, All-Knowing",
    category: "morning",
    occasion: "Morning protection",
    reference: "Abu Dawud 5088",
  },
  {
    arabicText: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilayka an-nushur",
    translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection",
    category: "morning",
    occasion: "Morning remembrance",
    reference: "Tirmidhi 3391",
  },

  // Evening Duas
  {
    arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Amsayna wa-amsal-mulku lillah, walhamdu lillah",
    translation: "We have entered evening and the whole kingdom belongs to Allah, and all praise is for Allah",
    category: "evening",
    occasion: "Upon entering evening",
    reference: "Muslim 2723",
  },
  {
    arabicText: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilayka al-masir",
    translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return",
    category: "evening",
    occasion: "Evening remembrance",
    reference: "Tirmidhi 3391",
  },

  // Before Sleep
  {
    arabicText: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your Name, O Allah, I die and I live",
    category: "sleep",
    occasion: "Before going to sleep",
    reference: "Bukhari 6324",
  },
  {
    arabicText: "اللَّهُمَّ إِنِّي أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ",
    transliteration: "Allahumma inni aslamtu nafsi ilayka, wa fawwadtu amri ilayka",
    translation: "O Allah, I have submitted myself to You, and I have delegated my affairs to You",
    category: "sleep",
    occasion: "Before sleeping",
    reference: "Bukhari 247",
  },

  // Upon Waking
  {
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation: "All praise is for Allah who gave us life after having taken it from us, and to Him is the resurrection",
    category: "morning",
    occasion: "Upon waking from sleep",
    reference: "Bukhari 6312",
  },

  // Food and Drink
  {
    arabicText: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation: "In the Name of Allah",
    category: "food",
    occasion: "Before eating",
    reference: "Bukhari 5376",
  },
  {
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    translation: "All praise is for Allah who has given us food and drink and made us Muslims",
    category: "food",
    occasion: "After eating",
    reference: "Abu Dawud 3850",
  },

  // Travel
  {
    arabicText: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina la-munqalibun",
    translation: "Glory to Him who has subjected this to us, and we could never have it by our efforts, and to our Lord we shall return",
    category: "travel",
    occasion: "Upon mounting a vehicle",
    reference: "Abu Dawud 2602",
  },
  {
    arabicText: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda",
    translation: "O Allah, we ask You in this journey of ours for righteousness and piety, and for deeds that are pleasing to You",
    category: "travel",
    occasion: "When starting a journey",
    reference: "Tirmidhi 3446",
  },

  // Entering/Leaving Home
  {
    arabicText: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
    transliteration: "Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah",
    translation: "In the Name of Allah, I place my trust in Allah, there is no might and no power except with Allah",
    category: "daily",
    occasion: "Leaving the home",
    reference: "Abu Dawud 5095",
  },
  {
    arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ",
    transliteration: "Allahumma inni as'aluka khayral-mawliji wa khayral-makhraji",
    translation: "O Allah, I ask You for the best of entering and the best of leaving",
    category: "daily",
    occasion: "Entering the home",
    reference: "Abu Dawud 5096",
  },

  // Distress and Anxiety
  {
    arabicText: "لاَ إِلَهَ إِلاَّ اللَّهُ الْعَظِيمُ الْحَلِيمُ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ السَّمَوَاتِ وَالأَرْضِ",
    transliteration: "La ilaha illallahul-'Adhimul-Halim, la ilaha illallahu Rabbus-samawati wal-ard",
    translation: "There is no deity except Allah, the Most Great, the Forbearing. There is no deity except Allah, the Lord of the heavens and the earth",
    category: "distress",
    occasion: "When in distress",
    reference: "Bukhari 6346",
  },
  {
    arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal",
    translation: "O Allah, I seek refuge in You from worry and grief, and I seek refuge in You from incapacity and laziness",
    category: "distress",
    occasion: "Against anxiety",
    reference: "Bukhari 6363",
  },
  {
    arabicText: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim",
    translation: "Allah is sufficient for me. There is no deity except Him. In Him I have placed my trust, and He is the Lord of the Mighty Throne",
    category: "distress",
    occasion: "When feeling worried",
    reference: "Abu Dawud 5081",
  },

  // Gratitude
  {
    arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    transliteration: "Alhamdu lillahi Rabbil-'alamin",
    translation: "All praise is for Allah, the Lord of all the worlds",
    category: "gratitude",
    occasion: "Expression of gratitude",
    reference: "Quran 1:2",
  },
  {
    arabicText: "اللَّهُمَّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلاَلِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ",
    transliteration: "Allahumma lakal-hamdu kama yanbaghli li jalali wajhika wa 'adhimi sultanik",
    translation: "O Allah, to You belongs all praise, as is befitting to the majesty of Your Face and the greatness of Your authority",
    category: "gratitude",
    occasion: "Praising Allah",
    reference: "Ibn Majah 3801",
  },

  // Forgiveness
  {
    arabicText: "أَسْتَغْفِرُ اللَّهَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullahalladi la ilaha illa Huwal-Hayyul-Qayyum wa atubu ilayh",
    translation: "I seek forgiveness from Allah, there is no deity except Him, the Ever-Living, the Sustainer, and I repent to Him",
    category: "forgiveness",
    occasion: "Seeking forgiveness",
    reference: "Abu Dawud 1517",
  },
  {
    arabicText: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
    transliteration: "Rabbighfir li wa tub 'alayya, innaka Antat-Tawwabur-Rahim",
    translation: "My Lord, forgive me and accept my repentance, indeed You are the Oft-Returning, the Most Merciful",
    category: "forgiveness",
    occasion: "Between prostrations",
    reference: "Abu Dawud 874",
  },

  // Rain
  {
    arabicText: "اللَّهُمَّ صَيِّباً نَافِعاً",
    transliteration: "Allahumma sayyiban nafi'a",
    translation: "O Allah, let it be an abundant and beneficial rain",
    category: "weather",
    occasion: "Upon seeing rain",
    reference: "Bukhari 1032",
  },

  // After Prayer
  {
    arabicText: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    translation: "O Allah, help me to remember You, to thank You, and to worship You in the best manner",
    category: "prayer",
    occasion: "After prayer",
    reference: "Abu Dawud 1522",
  },
  {
    arabicText: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ",
    transliteration: "SubhanAllah, walhamdulillah, wallahu akbar",
    translation: "Glory be to Allah, all praise is for Allah, and Allah is the Greatest",
    category: "prayer",
    occasion: "After obligatory prayer (33 times each)",
    reference: "Muslim 597",
  },

  // Seeking Knowledge
  {
    arabicText: "رَبِّ زِدْنِي عِلْماً",
    transliteration: "Rabbi zidni 'ilma",
    translation: "My Lord, increase me in knowledge",
    category: "knowledge",
    occasion: "When seeking knowledge",
    reference: "Quran 20:114",
  },
  {
    arabicText: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي",
    transliteration: "Allahumma infa'ni bima 'allamtani, wa 'allimni ma yanfa'uni",
    translation: "O Allah, benefit me with what You have taught me, and teach me what will benefit me",
    category: "knowledge",
    occasion: "Seeking beneficial knowledge",
    reference: "Tirmidhi 3599",
  },

  // When Angry
  {
    arabicText: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim",
    translation: "I seek refuge in Allah from the accursed Satan",
    category: "emotions",
    occasion: "When feeling angry",
    reference: "Bukhari 3282",
  },

  // Illness
  {
    arabicText: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ أَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ",
    transliteration: "Adh-hibal-ba's Rabban-nas, ishfi Antash-Shafi, la shifa'a illa shifa'uk",
    translation: "Remove the hardship, Lord of mankind, and heal, You are the Healer, there is no healing except Your healing",
    category: "illness",
    occasion: "When sick or visiting the sick",
    reference: "Bukhari 5743",
  },

  // General Protection
  {
    arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi-kalimatillahit-tammati min sharri ma khalaq",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
    category: "protection",
    occasion: "General protection",
    reference: "Muslim 2708",
  },
  {
    arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    transliteration: "Allahumma inni a'udhu bika min 'adhabil-qabr, wa a'udhu bika min fitnatil-masihid-dajjal",
    translation: "O Allah, I seek refuge in You from the punishment of the grave, and I seek refuge in You from the trial of the False Messiah",
    category: "protection",
    occasion: "Protection from trials",
    reference: "Bukhari 1377",
  },

  // Daily Remembrance
  {
    arabicText: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa Huwa 'ala kulli shay'in qadir",
    translation: "There is no deity except Allah, alone, without partner. To Him belongs dominion and to Him belongs praise, and He has power over all things",
    category: "daily",
    occasion: "Daily remembrance (100 times)",
    reference: "Bukhari 6404",
  },
];

export async function seedDuas() {
  try {
    console.log("Starting to seed duas...");
    
    for (const dua of duasData) {
      await db.insert(duas).values(dua);
    }
    
    console.log(`Successfully seeded ${duasData.length} duas`);
  } catch (error) {
    console.error("Error seeding duas:", error);
    throw error;
  }
}
