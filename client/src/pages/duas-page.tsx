import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

const duaCategories = [
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
  { id: "daily", label: "Daily" },
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food" },
];

const duas = {
  morning: [
    {
      id: 1,
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
      translation: "We have entered a new day and with it all dominion is Allah's.",
      transliteration: "Aṣbaḥnā wa aṣbaḥa-l-mulku lillāh",
      occasion: "Upon waking",
    },
    {
      id: 2,
      arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
      translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
      transliteration: "Allāhumma bika aṣbaḥnā wa bika amsaynā wa bika naḥyā wa bika namūtu wa ilayka-n-nushūr",
      occasion: "Morning remembrance",
    },
  ],
  evening: [
    {
      id: 3,
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
      translation: "We have entered the evening and with it all dominion is Allah's.",
      transliteration: "Amsaynā wa amsā-l-mulku lillāh",
      occasion: "Evening time",
    },
  ],
  daily: [
    {
      id: 4,
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Most Gracious, the Most Merciful",
      transliteration: "Bismillāhi r-raḥmāni r-raḥīm",
      occasion: "Before any action",
    },
  ],
  travel: [
    {
      id: 5,
      arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
      translation: "Glory be to Him who has placed this at our service, and we ourselves would not have been capable of it.",
      transliteration: "Subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn",
      occasion: "When starting a journey",
    },
  ],
  food: [
    {
      id: 6,
      arabic: "بِسْمِ اللَّهِ",
      translation: "In the name of Allah",
      transliteration: "Bismillāh",
      occasion: "Before eating",
    },
    {
      id: 7,
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
      translation: "Praise be to Allah Who has fed us and given us drink and made us Muslims.",
      transliteration: "Alḥamdu lillāhi-lladhī aṭ'amanā wa saqānā wa ja'alanā muslimīn",
      occasion: "After eating",
    },
  ],
};

export default function DuasPage() {
  const [activeCategory, setActiveCategory] = useState("morning");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Daily Duas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supplications for every occasion
          </p>
        </div>
      </header>

      <main className="p-6 max-w-screen-lg mx-auto">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6">
            {duaCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="whitespace-nowrap"
                data-testid={`tab-${category.id}`}
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {duaCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {duas[category.id as keyof typeof duas].map((dua) => (
                <Card key={dua.id} className="overflow-hidden" data-testid={`card-dua-${dua.id}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <Badge variant="secondary" className="shrink-0">
                        {dua.occasion}
                      </Badge>
                      <button
                        onClick={() => toggleFavorite(dua.id)}
                        className="shrink-0 p-2 rounded-full hover-elevate"
                        data-testid={`button-favorite-${dua.id}`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(dua.id)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <p
                        className="text-3xl font-arabic leading-loose text-right"
                        dir="rtl"
                        data-testid={`text-arabic-${dua.id}`}
                      >
                        {dua.arabic}
                      </p>

                      <p className="text-sm italic text-muted-foreground">
                        {dua.transliteration}
                      </p>

                      <p className="text-base leading-relaxed" data-testid={`text-translation-${dua.id}`}>
                        {dua.translation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
