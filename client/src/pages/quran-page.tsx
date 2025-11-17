import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const surahs = [
  { number: 1, name: "Al-Fatihah", translation: "The Opening", verses: 7 },
  { number: 2, name: "Al-Baqarah", translation: "The Cow", verses: 286 },
  { number: 3, name: "Ali 'Imran", translation: "Family of Imran", verses: 200 },
  { number: 4, name: "An-Nisa", translation: "The Women", verses: 176 },
  { number: 5, name: "Al-Ma'idah", translation: "The Table Spread", verses: 120 },
];

const sampleVerses = [
  {
    number: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillāhi r-raḥmāni r-raḥīm",
  },
  {
    number: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "All praise is due to Allah, Lord of the worlds.",
    transliteration: "Al-ḥamdu lillāhi rabbi l-'ālamīn",
  },
  {
    number: 3,
    arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "The Entirely Merciful, the Especially Merciful,",
    transliteration: "Ar-raḥmāni r-raḥīm",
  },
];

export default function QuranPage() {
  const [selectedSurah, setSelectedSurah] = useState(surahs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSurahList, setShowSurahList] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Qur'an Reader
            </h1>
            <Button variant="ghost" size="icon" data-testid="button-bookmark">
              <Bookmark className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto">
        {showSurahList ? (
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-semibold mb-4">All Surahs</h2>
            {surahs.map((surah) => (
              <Card
                key={surah.number}
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => {
                  setSelectedSurah(surah);
                  setShowSurahList(false);
                }}
                data-testid={`card-surah-${surah.number}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">{surah.number}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{surah.name}</h3>
                        <p className="text-sm text-muted-foreground">{surah.translation}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{surah.verses} verses</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="sticky top-24 z-30 bg-background/95 backdrop-blur-lg border-b border-border p-4">
              <div className="max-w-screen-lg mx-auto flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSurahList(true)}
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  All Surahs
                </Button>
                <div className="text-center">
                  <h2 className="font-semibold" data-testid="text-surah-name">
                    {selectedSurah.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selectedSurah.translation}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-6 space-y-8 max-w-3xl mx-auto">
                {sampleVerses.map((verse) => (
                  <Card key={verse.number} className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0">
                        {verse.number}
                      </Badge>
                      <div className="flex-1 space-y-4">
                        <p
                          className="text-3xl font-arabic leading-loose text-right"
                          dir="rtl"
                          data-testid={`text-arabic-${verse.number}`}
                        >
                          {verse.arabic}
                        </p>
                        <p className="text-sm italic text-muted-foreground">
                          {verse.transliteration}
                        </p>
                        <p className="text-base leading-relaxed" data-testid={`text-translation-${verse.number}`}>
                          {verse.translation}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
