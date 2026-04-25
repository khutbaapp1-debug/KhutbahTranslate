import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import takbirImg from "@assets/salah/takbir.png";
import qiyamImg from "@assets/salah/qiyam.png";
import rukuImg from "@assets/salah/ruku.png";
import sujoodImg from "@assets/salah/sujood.png";
import jalsahImg from "@assets/salah/jalsah.png";
import tasleemImg from "@assets/salah/tasleem.png";

type Prayer = {
  id: string;
  name: string;
  arabicName: string;
  sunnahBefore: number;
  fard: number;
  sunnahAfter: number;
  witr?: number;
  description: string;
};

const prayers: Prayer[] = [
  {
    id: "fajr",
    name: "Fajr",
    arabicName: "الفجر",
    sunnahBefore: 2,
    fard: 2,
    sunnahAfter: 0,
    description: "The dawn prayer, performed before sunrise. Recited aloud.",
  },
  {
    id: "dhuhr",
    name: "Dhuhr",
    arabicName: "الظهر",
    sunnahBefore: 4,
    fard: 4,
    sunnahAfter: 2,
    description: "The midday prayer, after the sun passes its zenith. Recited silently.",
  },
  {
    id: "asr",
    name: "Asr",
    arabicName: "العصر",
    sunnahBefore: 0,
    fard: 4,
    sunnahAfter: 0,
    description: "The afternoon prayer, before sunset. Recited silently.",
  },
  {
    id: "maghrib",
    name: "Maghrib",
    arabicName: "المغرب",
    sunnahBefore: 0,
    fard: 3,
    sunnahAfter: 2,
    description: "The sunset prayer, just after the sun has set. First two rakahs aloud, last silent.",
  },
  {
    id: "isha",
    name: "Isha",
    arabicName: "العشاء",
    sunnahBefore: 0,
    fard: 4,
    sunnahAfter: 2,
    witr: 3,
    description: "The night prayer, after twilight has disappeared. First two rakahs aloud, rest silent. Witr is highly recommended.",
  },
];

type Step = {
  position: string;
  arabic: string;
  transliteration: string;
  translation: string;
  notes?: string;
  image?: string;
  imageAlt?: string;
};

const steps: Step[] = [
  {
    position: "1. Niyyah (Intention)",
    arabic: "",
    transliteration: "",
    translation: "Make the intention in your heart for the specific prayer you are about to perform. The intention does not need to be spoken aloud.",
  },
  {
    position: "2. Takbir al-Ihram (Opening Takbir)",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allaahu Akbar",
    translation: "Allah is the Greatest",
    notes: "Raise both hands to the level of your ears (men) or shoulders (women), then place the right hand over the left on your chest.",
    image: takbirImg,
    imageAlt: "Takbir al-Ihram: standing with both hands raised to ear level",
  },
  {
    position: "3. Opening Supplication (Du'a al-Istiftah)",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
    transliteration: "Subhaanaka Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta'aala jadduka, wa laa ilaaha ghayruk",
    translation: "Glory be to You, O Allah, and praise. Blessed is Your Name, and exalted is Your Majesty. There is no god but You.",
  },
  {
    position: "4. Seeking Refuge & Bismillah",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ۝ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    transliteration: "A'oodhu billaahi minash-Shaytaanir-rajeem. Bismillaahir-Rahmaanir-Raheem",
    translation: "I seek refuge in Allah from Satan, the accursed. In the name of Allah, the Most Gracious, the Most Merciful.",
  },
  {
    position: "5. Recite Surah Al-Fatiha",
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    transliteration: "Alhamdu lillaahi Rabbil-'aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na'budu wa iyyaaka nasta'een. Ihdinas-Siraatal-Mustaqeem. Siraatal-ladheena an'amta 'alayhim, ghayril-maghdoobi 'alayhim wa lad-daalleen",
    translation: "All praise is for Allah, Lord of all worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship and You alone we ask for help. Guide us to the straight path. The path of those You have blessed, not of those who incurred Your wrath, nor of those who went astray.",
    notes: "Say 'Aameen' silently (Hanafi) or aloud (other schools) at the end.",
  },
  {
    position: "6. Recite a Surah or Verses",
    arabic: "",
    transliteration: "",
    translation: "Recite a short surah or a few verses from the Qur'an after Al-Fatiha. This is required in the first two rakahs of every prayer. Common short surahs include Al-Ikhlas, Al-Falaq, An-Nas, or Al-Kawthar.",
  },
  {
    position: "7. Ruku' (Bowing)",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    transliteration: "Subhaana Rabbiyal-'Adheem",
    translation: "Glory is to my Lord, the Most Great",
    notes: "Say 'Allaahu Akbar', then bow forward, placing your hands on your knees with your back straight. Recite the above 3 times.",
  },
  {
    position: "8. Standing from Ruku' (I'tidal)",
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ",
    transliteration: "Sami'a Allaahu liman hamidah. Rabbanaa wa lakal-hamd",
    translation: "Allah hears the one who praises Him. Our Lord, all praise is for You.",
    notes: "Rise back to standing position fully.",
  },
  {
    position: "9. First Sujood (Prostration)",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَىٰ",
    transliteration: "Subhaana Rabbiyal-A'laa",
    translation: "Glory is to my Lord, the Most High",
    notes: "Say 'Allaahu Akbar', then prostrate, placing forehead, nose, both palms, both knees, and toes on the ground. Recite the above 3 times.",
  },
  {
    position: "10. Sitting Between Sujoods (Jalsah)",
    arabic: "رَبِّ اغْفِرْ لِي",
    transliteration: "Rabbighfir lee",
    translation: "My Lord, forgive me",
    notes: "Say 'Allaahu Akbar', then sit up briefly. Recite the above 1-3 times.",
  },
  {
    position: "11. Second Sujood",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَىٰ",
    transliteration: "Subhaana Rabbiyal-A'laa",
    translation: "Glory is to my Lord, the Most High",
    notes: "Say 'Allaahu Akbar' and prostrate again, repeating as before. This completes one rakah.",
  },
  {
    position: "12. Tashahhud (After Every 2 Rakahs)",
    arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaat. As-salaamu 'alayka ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuh. As-salaamu 'alaynaa wa 'alaa 'ibaadillaahis-saaliheen. Ash-hadu an laa ilaaha illallaah, wa ash-hadu anna Muhammadan 'abduhu wa rasooluh",
    translation: "All compliments, prayers, and pure words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.",
    notes: "Sit with right foot upright and left foot under you. Raise the right index finger when saying 'illallaah'.",
  },
  {
    position: "13. Salawat (Final Tashahhud Only)",
    arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ ۝ اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allaahumma salli 'alaa Muhammad, wa 'alaa aali Muhammad, kamaa sallayta 'alaa Ibraaheema wa 'alaa aali Ibraaheem, innaka Hameedun Majeed. Allaahumma baarik 'alaa Muhammad, wa 'alaa aali Muhammad, kamaa baarakta 'alaa Ibraaheema wa 'alaa aali Ibraaheem, innaka Hameedun Majeed",
    translation: "O Allah, send Your prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. Indeed You are Praiseworthy, Glorious. O Allah, send Your blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. Indeed You are Praiseworthy, Glorious.",
  },
  {
    position: "14. Tasleem (Closing Salam)",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    transliteration: "As-salaamu 'alaykum wa rahmatullaah",
    translation: "Peace and the mercy of Allah be upon you",
    notes: "Turn your head to the right and say it, then turn to the left and repeat. This ends the prayer.",
  },
];

export default function SalahGuidePage() {
  const [activePrayer, setActivePrayer] = useState("fajr");

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Salah Guide
            </h1>
            <p className="text-xs text-muted-foreground">Step-by-step prayer instructions</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-screen-md mx-auto space-y-6">
        <Tabs value={activePrayer} onValueChange={setActivePrayer}>
          <TabsList className="w-full grid grid-cols-5">
            {prayers.map((p) => (
              <TabsTrigger key={p.id} value={p.id} data-testid={`tab-${p.id}`}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {prayers.map((prayer) => (
            <TabsContent key={prayer.id} value={prayer.id} className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground" data-testid={`text-prayer-${prayer.id}`}>
                        {prayer.name}
                      </h2>
                      <p className="text-3xl font-arabic text-primary mt-1" dir="rtl">
                        {prayer.arabicName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prayer.sunnahBefore > 0 && (
                        <Badge variant="secondary">
                          {prayer.sunnahBefore} Sunnah before
                        </Badge>
                      )}
                      <Badge>
                        {prayer.fard} Fard
                      </Badge>
                      {prayer.sunnahAfter > 0 && (
                        <Badge variant="secondary">
                          {prayer.sunnahAfter} Sunnah after
                        </Badge>
                      )}
                      {prayer.witr && (
                        <Badge variant="secondary">
                          {prayer.witr} Witr
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{prayer.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground px-1">
            How to perform one rakah
          </h3>
          <p className="text-sm text-muted-foreground px-1">
            Follow these steps for each rakah. Repeat steps 4–11 in every rakah, then perform Tashahhud after every 2 rakahs and again at the end.
          </p>

          {steps.map((step, idx) => (
            <Card key={idx} data-testid={`step-${idx + 1}`}>
              <CardContent className="p-5 space-y-3">
                <h4 className="font-semibold text-foreground">{step.position}</h4>

                {step.arabic && (
                  <p className="text-2xl font-arabic text-foreground leading-loose text-right" dir="rtl">
                    {step.arabic}
                  </p>
                )}

                {step.transliteration && (
                  <p className="text-sm italic text-muted-foreground">{step.transliteration}</p>
                )}

                {step.translation && (
                  <p className="text-sm text-foreground">{step.translation}</p>
                )}

                {step.notes && (
                  <div className="text-xs text-muted-foreground bg-muted rounded-md p-3 mt-2">
                    {step.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-5 space-y-2">
            <h3 className="font-semibold text-foreground">Important reminders</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>Perform wudu (ablution) before every prayer.</li>
              <li>Face the Qibla (direction of the Kaaba in Makkah).</li>
              <li>Wear clean clothes that cover the body appropriately.</li>
              <li>Pray on a clean surface or prayer mat.</li>
              <li>For 3-rakah prayers (Maghrib): perform Tashahhud after the 2nd rakah, stand up for the 3rd, then end with full Tashahhud and Tasleem.</li>
              <li>For 4-rakah prayers (Dhuhr, Asr, Isha): perform Tashahhud after the 2nd rakah, then continue to the 3rd and 4th rakahs (recite only Al-Fatiha in those), then end with full Tashahhud and Tasleem.</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
