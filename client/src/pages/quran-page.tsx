import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Surah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
}

interface Verse {
  id: number;
  text: string;
  translation: string;
  transliteration: string;
}

interface SurahDetails extends Surah {
  verses: Verse[];
}

export default function QuranPage() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: surahs, isLoading: loadingSurahs } = useQuery<Surah[]>({
    queryKey: ["/api/quran/surahs"],
  });

  const surahDetailsQuery = useQuery<SurahDetails>({
    queryKey: [`/api/quran/surah/${selectedSurah}`],
    queryFn: async () => {
      const response = await fetch(`/api/quran/surah/${selectedSurah}`);
      if (!response.ok) {
        throw new Error("Failed to fetch surah");
      }
      return response.json();
    },
    enabled: !!selectedSurah,
  });

  const surahDetails = surahDetailsQuery.data;
  const loadingDetails = surahDetailsQuery.isLoading;

  const goToPreviousSurah = () => {
    if (selectedSurah && selectedSurah > 1) {
      setSelectedSurah(selectedSurah - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextSurah = () => {
    if (selectedSurah && selectedSurah < 114) {
      setSelectedSurah(selectedSurah + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredSurahs = surahs?.filter(
    (surah) =>
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedSurah && surahDetails) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-4 p-4 max-w-screen-xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedSurah(null)}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-surah-name">
                {surahDetails.transliteration}
              </h1>
              <p className="text-sm text-muted-foreground">
                {surahDetails.translation} • {surahDetails.total_verses} verses
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousSurah}
                disabled={selectedSurah === 1}
                data-testid="button-previous-surah"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextSurah}
                disabled={selectedSurah === 114}
                data-testid="button-next-surah"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <h2 className="text-4xl mb-2 font-arabic" dir="rtl" data-testid="text-surah-arabic">
                  {surahDetails.name}
                </h2>
                <p className="text-sm opacity-90">
                  {surahDetails.type === "meccan" ? "Meccan" : "Medinan"} • Surah {surahDetails.id}
                </p>
              </CardContent>
            </Card>

            {loadingDetails ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {surahDetails.verses.map((verse) => (
                  <Card key={verse.id} data-testid={`verse-${verse.id}`}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p
                            className="text-3xl leading-loose text-foreground font-arabic mb-4"
                            dir="rtl"
                            data-testid={`verse-arabic-${verse.id}`}
                          >
                            {verse.text}
                          </p>
                          <p className="text-sm text-muted-foreground italic mb-2" data-testid={`verse-transliteration-${verse.id}`}>
                            {verse.transliteration}
                          </p>
                          <p className="text-base text-foreground" data-testid={`verse-translation-${verse.id}`}>
                            {verse.translation}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {verse.id}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8 pb-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={goToPreviousSurah}
                disabled={selectedSurah === 1}
                data-testid="button-previous-surah-bottom"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Surah
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={goToNextSurah}
                disabled={selectedSurah === 114}
                data-testid="button-next-surah-bottom"
              >
                Next Surah
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </main>
        </ScrollArea>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            The Holy Qur'an
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

      <main className="p-6 max-w-screen-lg mx-auto">
        {loadingSurahs ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredSurahs?.map((surah) => (
              <Card
                key={surah.id}
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => setSelectedSurah(surah.id)}
                data-testid={`surah-card-${surah.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {surah.id}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground" data-testid={`surah-name-${surah.id}`}>
                          {surah.transliteration}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {surah.translation} • {surah.total_verses} verses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-arabic" dir="rtl">
                        {surah.name}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {surah.type === "meccan" ? "Meccan" : "Medinan"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSurahs && filteredSurahs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No surahs found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
