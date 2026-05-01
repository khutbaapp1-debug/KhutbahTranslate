export type PrayerFlowRecitation = {
  arabic: string;
  transliteration: string;
  meaning: string;
  name: string;
  label?: string;
};

export type PrayerFlowCard = {
  number: number;
  title: string;
  description: string;
  recitations?: PrayerFlowRecitation[];
  note?: string;
};

export type PrayerType = "2rakat" | "4rakat" | "maghrib" | "witr";

const BISMILLAH: PrayerFlowRecitation = {
  name: "Bismillah",
  arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  transliteration: "Bismillahir-Rahmanir-Raheem.",
  meaning: "In the name of Allah, the Most Gracious, the Most Merciful.",
};

const SURAH_FATIHAH: PrayerFlowRecitation = {
  name: "Surah al-Fatihah",
  arabic:
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
  transliteration:
    "Bismillahir-Rahmanir-Raheem. Alhamdu lillahi Rabbil-'alameen. Ar-Rahmanir-Raheem. Maliki yawmid-deen. Iyyaka na'budu wa iyyaka nasta'een. Ihdinas-sirata-l-mustaqeem. Sirata-l-ladheena an'amta 'alayhim. Ghayril-maghdoobi 'alayhim wa lad-dalleen. Ameen.",
  meaning:
    "In the name of Allah, the Most Gracious, the Most Merciful. Praise be to Allah, Lord of all the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgement. You alone we worship, and You alone we ask for help. Guide us to the straight path — the path of those upon whom You have bestowed favor, not of those who have evoked anger, nor of those who are astray. Ameen.",
};

const SURAH_IKHLAS: PrayerFlowRecitation = {
  name: "Surah al-Ikhlas",
  arabic:
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
  transliteration:
    "Bismillahir-Rahmanir-Raheem. Qul huwa Allahu ahad. Allahu-s-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
  meaning:
    "In the name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.",
};

const TASBIH_RUKU: PrayerFlowRecitation = {
  name: "Tasbih of Ruku'",
  arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
  transliteration: "Subhana Rabbiyal-'Adheem.",
  meaning: "Glory is to my Lord, the Most Great.",
};

const TASBIH_SUJOOD: PrayerFlowRecitation = {
  name: "Tasbih of Sujood",
  arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَىٰ",
  transliteration: "Subhana Rabbiyal-A'la.",
  meaning: "Glory is to my Lord, the Most High.",
};

const JALSAH_DUA: PrayerFlowRecitation = {
  name: "Brief Dua of Jalsah",
  arabic: "رَبِّ اغْفِرْ لِي",
  transliteration: "Rabbighfir lee.",
  meaning: "O my Lord, forgive me.",
};

const QIYAM_RECITE_NOTE =
  "Recite silently. If you are leading the prayer in congregation, recite Surah al-Fatihah and the surah aloud during Fajr, Maghrib, and the first two rakat of Isha.";

const itidalRecitations: PrayerFlowRecitation[] = [
  {
    name: "Sami'-Allahu liman hamidah",
    label: "As you rise",
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ",
    transliteration: "Sami'-Allahu liman hamidah.",
    meaning: "Allah hears the one who praises Him.",
  },
  {
    name: "Rabbana lakal hamd",
    label: "Once standing upright",
    arabic: "رَبَّنَا لَكَ الْحَمْدُ",
    transliteration: "Rabbana lakal hamd.",
    meaning: "Our Lord, all praise is due to You.",
  },
];

const twoRakat: PrayerFlowCard[] = [
  {
    number: 1,
    title: "1. Make Wudu",
    description:
      "Before you can pray, you must perform wudu (ablution). If you have not yet done so, please go to the Wudu tab first.",
  },
  {
    number: 2,
    title: "2. Find a Clean Place and Face the Qibla",
    description:
      "Choose a clean, quiet place to pray. Make sure your body, clothes, and the prayer area are free from impurity. Cover your awrah modestly — for men, at minimum from the navel to the knees; for women, the whole body except the face and hands. Then stand facing the qibla (the direction of the Kaaba in Makkah).",
  },
  {
    number: 3,
    title: "3. Make the Intention (Niyyah)",
    description:
      "In your heart, intend the specific prayer you are about to perform. You can frame your intention naturally — for example: \"I am facing the Kaaba, praying two rakat fard for Fajr. O Allah, forgive any mistakes I may make.\" If you are praying behind an imam in congregation, also include that you are praying behind the imam.\n\nThe intention does not need to be spoken aloud; it is an act of the heart.",
  },
  {
    number: 4,
    title: "4. Takbir al-Ihram (Opening Takbir)",
    description:
      "Stand upright, facing the qibla. Raise both hands and say \"Allahu Akbar\" (Allah is the Greatest). Your prayer has now officially begun. From this point onward, focus only on the prayer — do not speak, eat, or move unnecessarily until you complete the prayer.",
    recitations: [
      {
        name: "Takbir",
        arabic: "اللَّهُ أَكْبَرُ",
        transliteration: "Allahu Akbar",
        meaning: "Allah is the Greatest.",
      },
    ],
  },
  {
    number: 5,
    title: "5. Qiyam (Standing) — Rakah 1",
    description:
      "Place your right hand over your left, between the chest and navel. Keep your gaze focused on the spot where your forehead will rest in prostration. Recite the following, in order:",
    recitations: [
      {
        name: "Subhanaka (Opening Dua)",
        label: "Opening dua",
        arabic:
          "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَىٰ جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ",
        transliteration:
          "Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruka.",
        meaning:
          "O Allah, glory and praise are for You; blessed is Your Name; exalted is Your Majesty; there is no god but You.",
      },
      {
        name: "Ta'awwudh",
        label: "Seeking refuge",
        arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        transliteration: "A'udhu billahi minash-shaytanir-rajeem.",
        meaning: "I seek refuge in Allah from the accursed Shaytan.",
      },
      BISMILLAH,
      SURAH_FATIHAH,
      SURAH_IKHLAS,
    ],
    note: QIYAM_RECITE_NOTE,
  },
  {
    number: 6,
    title: "6. Ruku' (Bowing)",
    description:
      "Saying \"Allahu Akbar,\" bow forward at the waist. Place your hands firmly on your knees with fingers spread, and keep your back flat — parallel to the ground. Your gaze stays on the spot where your forehead will rest in prostration. Recite the following at least three times:",
    recitations: [TASBIH_RUKU],
  },
  {
    number: 7,
    title: "7. I'tidal (Standing After Ruku')",
    description:
      "As you rise from Ruku', say the first phrase below. Stand fully upright with your hands at your sides, then say the second phrase. This is a brief moment — do not linger.",
    recitations: itidalRecitations,
  },
  {
    number: 8,
    title: "8. Sujood (First Prostration)",
    description:
      "Saying \"Allahu Akbar,\" lower yourself to the ground in prostration. Seven body parts must touch the floor: forehead, nose, both palms, both knees, and the toes of both feet (curled forward toward the qibla). Place your palms on the ground beside your head, with elbows lifted away from your sides. Recite the following at least three times:",
    recitations: [TASBIH_SUJOOD],
  },
  {
    number: 9,
    title: "9. Jalsah (Sitting Briefly)",
    description:
      "Saying \"Allahu Akbar,\" rise from prostration into a sitting position. Sit on the flat of your left foot, with your right foot upright — toes curled forward toward the qibla. Place your palms flat on your thighs, just above the knees. Briefly recite the following before returning to prostration:",
    recitations: [JALSAH_DUA],
  },
  {
    number: 10,
    title: "10. Sujood (Second Prostration)",
    description:
      "Saying \"Allahu Akbar,\" return to prostration. The same seven body parts touch the ground: forehead, nose, both palms, both knees, and the curled toes of both feet. Place your palms beside your head as before. Recite the same tasbih at least three times:\n\nThis completes the first rakah. Saying \"Allahu Akbar,\" stand back up to begin Rakah 2.",
    recitations: [TASBIH_SUJOOD],
  },
  {
    number: 11,
    title: "11. Qiyam (Standing) — Rakah 2",
    description:
      "Place your right hand over your left, between the chest and navel. Keep your gaze focused on the spot where your forehead will rest in prostration. Recite the following, in order:",
    recitations: [BISMILLAH, SURAH_FATIHAH, SURAH_IKHLAS],
    note: QIYAM_RECITE_NOTE,
  },
  {
    number: 12,
    title: "12. Ruku' (Bowing)",
    description:
      "Saying \"Allahu Akbar,\" bow forward at the waist. Place your hands firmly on your knees with fingers spread, and keep your back flat — parallel to the ground. Your gaze stays on the spot where your forehead will rest in prostration. Recite the following at least three times:",
    recitations: [TASBIH_RUKU],
  },
  {
    number: 13,
    title: "13. I'tidal (Standing After Ruku')",
    description:
      "As you rise from Ruku', say the first phrase below. Stand fully upright with your hands at your sides, then say the second phrase. This is a brief moment — do not linger.",
    recitations: itidalRecitations,
  },
  {
    number: 14,
    title: "14. Sujood (First Prostration)",
    description:
      "Saying \"Allahu Akbar,\" lower yourself to the ground in prostration. Seven body parts must touch the floor: forehead, nose, both palms, both knees, and the toes of both feet (curled forward toward the qibla). Place your palms on the ground beside your head, with elbows lifted away from your sides. Recite the following at least three times:",
    recitations: [TASBIH_SUJOOD],
  },
  {
    number: 15,
    title: "15. Jalsah (Sitting Briefly)",
    description:
      "Saying \"Allahu Akbar,\" rise from prostration into a sitting position. Sit on the flat of your left foot, with your right foot upright — toes curled forward toward the qibla. Place your palms flat on your thighs, just above the knees. Briefly recite the following before returning to prostration:",
    recitations: [JALSAH_DUA],
  },
  {
    number: 16,
    title: "16. Sujood (Second Prostration)",
    description:
      "Saying \"Allahu Akbar,\" return to prostration. The same seven body parts touch the ground: forehead, nose, both palms, both knees, and the curled toes of both feet. Place your palms beside your head as before. Recite the same tasbih at least three times:\n\nThis completes Rakah 2. Saying \"Allahu Akbar,\" sit up for the Tashahhud.",
    recitations: [TASBIH_SUJOOD],
  },
  {
    number: 17,
    title: "17. Final Tashahhud (Sitting)",
    description:
      "Sit in the same position as Jalsah — left foot folded under the body, right foot upright with toes curled forward. Place your hands flat on your thighs, just above the knees. Now recite the following, in order:",
    recitations: [
      {
        name: "Tashahhud (At-tahiyyat)",
        arabic:
          "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration:
          "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-saliheen. Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan abduhu wa rasuluh.",
        meaning:
          "All compliments, prayers, and pure words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.",
      },
      {
        name: "Durood (Salawat upon the Prophet ﷺ)",
        label: "Then recite the Durood",
        arabic:
          "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ ۝ اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
        transliteration:
          "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibraheem, innaka Hameedun Majeed. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibraheem, innaka Hameedun Majeed.",
        meaning:
          "O Allah, send Your prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. Indeed You are Praiseworthy, Glorious. O Allah, send Your blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. Indeed You are Praiseworthy, Glorious.",
      },
      {
        name: "Personal Dua",
        label: "End with a brief personal dua, for example:",
        arabic:
          "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration:
          "Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'adhaban-naar.",
        meaning:
          "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
      },
    ],
    note: "When you reach \"La ilaha illa Allah\" in the Tashahhud, raise the index finger of your right hand (other fingers gently closed into a fist), then lower it.",
  },
  {
    number: 18,
    title: "18. Tasleem (Closing the Prayer)",
    description:
      "Remaining in the sitting position, end the prayer by turning your head to the right and saying the salam. Then turn your head to the left and repeat the same words. Your prayer is now complete.\n\nYour 2-rakat prayer is complete. May Allah accept it from you.",
    recitations: [
      {
        name: "Salam (Tasleem)",
        label: "Said twice — once to the right, once to the left",
        arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
        transliteration: "As-salamu 'alaykum wa rahmat-Ullah.",
        meaning: "Peace and the mercy of Allah be upon you.",
      },
    ],
  },
];

export const prayerFlows: Record<PrayerType, PrayerFlowCard[]> = {
  "2rakat": twoRakat,
  "4rakat": [],
  "maghrib": [],
  "witr": [],
};
