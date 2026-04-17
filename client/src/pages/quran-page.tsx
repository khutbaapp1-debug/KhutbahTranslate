import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, ChevronLeft, ChevronRight, BookMarked, Play, Pause, Loader2, Volume2, BookOpen, List, X, Bookmark, BookmarkCheck, HelpCircle, Hand, MousePointerClick } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Reciter {
  id: string;
  name: string;
  folder: string;
}

const RECITERS: Reciter[] = [
  { id: "alafasy", name: "Mishary Rashid Al-Afasy", folder: "Alafasy_128kbps" },
  { id: "shatri", name: "Abu Bakr Al Shatri", folder: "Abu_Bakr_Ash-Shaatree_128kbps" },
  { id: "abdulbasit", name: "Abdul Basit (Murattal)", folder: "AbdulBaset_Murattal_192kbps" },
  { id: "sudais", name: "Abdurrahmaan As-Sudais", folder: "Abdurrahmaan_As-Sudais_192kbps" },
  { id: "dosari", name: "Yasser Al Dosari", folder: "Yasser_Ad-Dussary_128kbps" },
  { id: "muaiqly", name: "Maher Al-Muaiqly", folder: "MaherAlMuaiqly128kbps" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
  { id: "faresabbad", name: "Faris Abad (Yemeni)", folder: "faresabbad" },
];

export default function QuranPage() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResumeMessage, setShowResumeMessage] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<string>("alafasy");
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [loadingVerse, setLoadingVerse] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"page" | "detailed">("page");
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  // Bookmarks: { [surahId]: verseId }
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
  const [showHowTo, setShowHowTo] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressFiredRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const { data: surahs, isLoading: loadingSurahs } = useQuery<Surah[]>({
    queryKey: ["/api/quran/surahs"],
  });

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quranBookmarks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setBookmarks(parsed);
        }
      }
    } catch {}

    if (!localStorage.getItem('quranHowToSeen')) {
      setShowHowTo(true);
    }

    const lastReadSurah = localStorage.getItem('lastReadSurah');
    if (lastReadSurah) {
      const surahId = parseInt(lastReadSurah, 10);
      if (surahId >= 1 && surahId <= 114) {
        setSelectedSurah(surahId);
        setShowResumeMessage(true);
        setTimeout(() => setShowResumeMessage(false), 5000);
      }
    }
  }, []);

  // Save current surah to localStorage whenever it changes
  useEffect(() => {
    if (selectedSurah) {
      localStorage.setItem('lastReadSurah', selectedSurah.toString());
    }
  }, [selectedSurah]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (verseId: number) => {
    if (!selectedSurah) return;
    setBookmarks(prev => {
      const next = { ...prev };
      if (next[selectedSurah] === verseId) {
        delete next[selectedSurah];
        toast({ title: "Bookmark removed", description: `Verse ${verseId} unbookmarked` });
      } else {
        next[selectedSurah] = verseId;
        toast({ title: "Bookmarked", description: `Verse ${verseId} saved as your reading position` });
      }
      return next;
    });
  };

  // Long-press handlers for bookmarking on the verse marker
  const handleMarkerPressStart = (verseId: number) => {
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      toggleBookmark(verseId);
    }, 600);
  };

  const handleMarkerPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

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

  // Scroll to bookmarked verse when surah loads
  useEffect(() => {
    if (!selectedSurah || !surahDetails) return;
    const bookmarkedVerse = bookmarks[selectedSurah];
    if (!bookmarkedVerse) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-verse-anchor="${bookmarkedVerse}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSurah, surahDetails, bookmarks]);

  // Generate audio URL for a specific verse
  const getAudioUrl = (surahNumber: number, verseNumber: number): string => {
    const reciter = RECITERS.find(r => r.id === selectedReciter);
    if (!reciter) return "";
    
    // Faris Abad uses AlQuran Cloud API
    if (selectedReciter === "faresabbad") {
      return `https://cdn.alquran.cloud/media/audio/ayah/ar.faresabbad/${surahNumber}:${verseNumber}`;
    }
    
    // Other reciters use everyayah.com
    const surahPadded = String(surahNumber).padStart(3, '0');
    const versePadded = String(verseNumber).padStart(3, '0');
    return `https://everyayah.com/data/${reciter.folder}/${surahPadded}${versePadded}.mp3`;
  };

  // Clean up audio completely
  const cleanupAudio = () => {
    // Cancel any pending auto-play
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ''; // Force release resources
      audioRef.current = null;
    }
    setPlayingVerse(null);
    setLoadingVerse(null);
  };

  // Play or pause a verse
  const toggleVerseAudio = async (verseNumber: number) => {
    if (!selectedSurah) return;

    // If same verse is playing, pause it
    if (playingVerse === verseNumber) {
      cleanupAudio();
      return;
    }

    // Stop current audio if any
    cleanupAudio();

    // Start new audio
    setLoadingVerse(verseNumber);
    const audioUrl = getAudioUrl(selectedSurah, verseNumber);
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Use event handlers that check if this audio is still current
    const handleLoadedData = () => {
      // Only proceed if this audio is still the current one
      if (audioRef.current === audio) {
        setLoadingVerse(null);
        setPlayingVerse(verseNumber);
        audio.play().catch((err) => {
          console.error('Playback failed:', err);
          toast({
            title: "Playback Error",
            description: "Unable to play recitation. Please try again.",
            variant: "destructive",
          });
          cleanupAudio();
        });
      }
    };

    const handleEnded = () => {
      // Only proceed if this audio is still current
      if (audioRef.current === audio) {
        setPlayingVerse(null);
        
        // Auto-play next verse if available
        if (surahDetails && verseNumber < surahDetails.total_verses) {
          // Clear any existing timeout before scheduling new one
          if (autoPlayTimeoutRef.current) {
            clearTimeout(autoPlayTimeoutRef.current);
          }
          
          // Small delay before playing next verse
          autoPlayTimeoutRef.current = setTimeout(() => {
            autoPlayTimeoutRef.current = null;
            toggleVerseAudio(verseNumber + 1);
          }, 500);
        } else {
          // Last verse of surah - clean up audio resources
          cleanupAudio();
        }
      }
    };

    const handleError = () => {
      // Only show error if this audio is still current
      if (audioRef.current === audio) {
        setLoadingVerse(null);
        setPlayingVerse(null);
        toast({
          title: "Audio Load Error",
          description: "Could not load recitation. Please check your internet connection.",
          variant: "destructive",
        });
      }
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
  };

  // Clean up audio when changing surahs or reciter
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [selectedSurah, selectedReciter]);

  const goToPreviousSurah = () => {
    if (selectedSurah && selectedSurah > 1) {
      setSelectedSurah(selectedSurah - 1);
      setShowResumeMessage(false);
      setActiveVerse(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextSurah = () => {
    if (selectedSurah && selectedSurah < 114) {
      setSelectedSurah(selectedSurah + 1);
      setShowResumeMessage(false);
      setActiveVerse(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Swipe gesture handlers — swipe left = next surah, swipe right = previous
  // Note: in RTL Arabic reading, "next page" naturally feels like swipe-right,
  // but we keep standard mobile UX (swipe-left advances) for predictability.
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Require horizontal swipe of at least 60px and mostly horizontal motion
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    if (deltaX < 0) {
      goToNextSurah();
    } else {
      goToPreviousSurah();
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
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSurah(null)}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-foreground truncate" data-testid="text-surah-name">
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
            <div className="px-4 pb-3">
              <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                <SelectTrigger className="w-full" data-testid="select-reciter">
                  <Volume2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select Reciter" />
                </SelectTrigger>
                <SelectContent>
                  {RECITERS.map((reciter) => (
                    <SelectItem key={reciter.id} value={reciter.id}>
                      {reciter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <main
            className="p-6 space-y-6 max-w-screen-lg mx-auto"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {showResumeMessage && (
              <Alert className="bg-primary/10 border-primary/20">
                <BookMarked className="h-4 w-4" />
                <AlertDescription>
                  Continuing from where you left off
                </AlertDescription>
              </Alert>
            )}
            
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

            <div className="flex items-center justify-center gap-1 p-1 rounded-md bg-muted w-fit mx-auto">
              <Button
                size="sm"
                variant={viewMode === "page" ? "default" : "ghost"}
                onClick={() => setViewMode("page")}
                data-testid="button-view-page"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Page
              </Button>
              <Button
                size="sm"
                variant={viewMode === "detailed" ? "default" : "ghost"}
                onClick={() => setViewMode("detailed")}
                data-testid="button-view-detailed"
              >
                <List className="w-4 h-4 mr-2" />
                Detailed
              </Button>
            </div>

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
            ) : viewMode === "page" ? (
              <>
                <Card className="bg-[hsl(40_30%_96%)] dark:bg-[hsl(40_15%_12%)] border-[hsl(40_30%_85%)] dark:border-[hsl(40_15%_22%)]">
                  <CardContent className="p-6 sm:p-10">
                    <p
                      className="font-arabic text-foreground text-justify"
                      dir="rtl"
                      style={{
                        fontSize: "1.875rem",
                        lineHeight: "3.25rem",
                        wordSpacing: "0.15em",
                      }}
                      data-testid="text-page-view"
                    >
                      {surahDetails.verses.map((verse) => {
                        const isBookmarked = bookmarks[selectedSurah!] === verse.id;
                        return (
                          <span key={verse.id} data-verse-anchor={verse.id}>
                            {verse.text}
                            <button
                              onClick={() => {
                                if (longPressFiredRef.current) {
                                  longPressFiredRef.current = false;
                                  return;
                                }
                                setActiveVerse(verse.id);
                                toggleVerseAudio(verse.id);
                              }}
                              onTouchStart={() => handleMarkerPressStart(verse.id)}
                              onTouchEnd={handleMarkerPressEnd}
                              onTouchCancel={handleMarkerPressEnd}
                              onMouseDown={() => handleMarkerPressStart(verse.id)}
                              onMouseUp={handleMarkerPressEnd}
                              onMouseLeave={handleMarkerPressEnd}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                toggleBookmark(verse.id);
                              }}
                              className={`inline-flex items-center justify-center mx-1 align-middle w-9 h-9 rounded-full text-sm hover-elevate active-elevate-2 transition-all ${
                                isBookmarked
                                  ? "bg-primary text-primary-foreground border border-primary"
                                  : "border border-primary/40 text-primary"
                              }`}
                              aria-label={`Verse ${verse.id}${isBookmarked ? " (bookmarked)" : ""}`}
                              data-testid={`verse-marker-${verse.id}`}
                            >
                              {loadingVerse === verse.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : playingVerse === verse.id ? (
                                <Pause className="w-3 h-3" />
                              ) : isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4" />
                              ) : (
                                <span className="font-sans">{verse.id}</span>
                              )}
                            </button>{" "}
                          </span>
                        );
                      })}
                    </p>
                  </CardContent>
                </Card>

                {activeVerse && (() => {
                  const verse = surahDetails.verses.find(v => v.id === activeVerse);
                  if (!verse) return null;
                  const isBookmarked = bookmarks[selectedSurah!] === verse.id;
                  return (
                    <Card className="border-primary/40" data-testid={`active-verse-${verse.id}`}>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="default">Verse {verse.id}</Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant={isBookmarked ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleBookmark(verse.id)}
                              data-testid={`button-bookmark-verse-${verse.id}`}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 mr-2" />
                              ) : (
                                <Bookmark className="w-4 h-4 mr-2" />
                              )}
                              {isBookmarked ? "Bookmarked" : "Bookmark"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setActiveVerse(null)}
                              data-testid="button-close-active-verse"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          {verse.transliteration}
                        </p>
                        <p className="text-base text-foreground">
                          {verse.translation}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })()}

                {!activeVerse && (
                  <p className="text-center text-sm text-muted-foreground">
                    Tap any verse number to play and translate. Long-press (or right-click) to bookmark your reading position.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {surahDetails.verses.map((verse) => {
                  const isBookmarked = bookmarks[selectedSurah!] === verse.id;
                  return (
                    <Card
                      key={verse.id}
                      data-testid={`verse-${verse.id}`}
                      data-verse-anchor={verse.id}
                      className={isBookmarked ? "border-primary" : ""}
                    >
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
                            <p className="text-base text-foreground mb-3" data-testid={`verse-translation-${verse.id}`}>
                              {verse.translation}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleVerseAudio(verse.id)}
                                disabled={loadingVerse === verse.id}
                                data-testid={`button-play-verse-${verse.id}`}
                              >
                                {loadingVerse === verse.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : playingVerse === verse.id ? (
                                  <Pause className="w-4 h-4 mr-2" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                {loadingVerse === verse.id
                                  ? "Loading..."
                                  : playingVerse === verse.id
                                  ? "Pause"
                                  : "Play Recitation"}
                              </Button>
                              <Button
                                variant={isBookmarked ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleBookmark(verse.id)}
                                data-testid={`button-bookmark-detailed-${verse.id}`}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-4 h-4 mr-2" />
                                ) : (
                                  <Bookmark className="w-4 h-4 mr-2" />
                                )}
                                {isBookmarked ? "Bookmarked" : "Bookmark"}
                              </Button>
                            </div>
                          </div>
                          <Badge variant={isBookmarked ? "default" : "outline"} className="shrink-0">
                            {verse.id}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              The Holy Qur'an
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHowTo(true)}
              aria-label="How to use"
              data-testid="button-show-how-to"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
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

      <Dialog open={showHowTo} onOpenChange={setShowHowTo}>
        <DialogContent className="max-w-md" data-testid="dialog-how-to">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quick Tour: Qur'an Reader
            </DialogTitle>
            <DialogDescription>
              A few quick tips to help you get the most out of your reading experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tap a verse number</p>
                <p className="text-sm text-muted-foreground">
                  Plays the recitation and shows the translation for that verse.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Hand className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Long-press to bookmark</p>
                <p className="text-sm text-muted-foreground">
                  Hold a verse number (or right-click on desktop) to save your reading position. You'll return to that exact verse next time.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Choose your reciter</p>
                <p className="text-sm text-muted-foreground">
                  Use the dropdown at the top of any surah to switch between reciters like Mishary Al-Afasy, Al-Sudais, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Swipe between surahs</p>
                <p className="text-sm text-muted-foreground">
                  Swipe left for the next surah, swipe right for the previous one — like turning pages.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <List className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Switch views</p>
                <p className="text-sm text-muted-foreground">
                  Use the Page / Detailed toggle to switch between flowing Mushaf-style reading and verse-by-verse with translation.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                localStorage.setItem('quranHowToSeen', '1');
                setShowHowTo(false);
              }}
              data-testid="button-how-to-got-it"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
