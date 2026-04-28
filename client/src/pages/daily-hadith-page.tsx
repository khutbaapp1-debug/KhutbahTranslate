import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { BannerAd } from "@/components/banner-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Heart, Share2, BookOpen, User } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Hadith {
  id: string;
  arabicText: string;
  englishTranslation: string;
  collection: string;
  bookNumber?: number;
  hadithNumber?: number;
  narrator?: string;
  category?: string;
  reference: string;
  grade?: string;
  isFavorited: boolean;
}

export default function DailyHadithPage() {
  const { toast } = useToast();
  const [shareLoading, setShareLoading] = useState(false);

  const { data: hadith, isLoading } = useQuery<Hadith>({
    queryKey: ["/api/hadiths/daily"],
  });

  const favoriteMutation = useMutation({
    mutationFn: async (hadithId: string) => {
      const res = await apiRequest("POST", `/api/hadiths/${hadithId}/favorite`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hadiths/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hadiths/favorites"] });
    },
  });

  const handleShare = async () => {
    if (!hadith) return;
    
    setShareLoading(true);
    try {
      const shareText = `Daily Hadith\n\n${hadith.englishTranslation}\n\n— ${hadith.narrator || "Prophet Muhammad ﷺ"}\n${hadith.reference}`;
      
      if (navigator.share) {
        await navigator.share({
          title: "Daily Hadith",
          text: shareText,
        });
        toast({
          title: "Shared successfully",
          description: "Thank you for sharing Islamic wisdom",
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "Share this hadith with others",
        });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast({
          title: "Share failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleFavorite = () => {
    if (!hadith) return;
    favoriteMutation.mutate(hadith.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading today's hadith...</div>
        </div>
      </div>
    );
  }

  if (!hadith) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">No hadith available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <div className="text-center space-y-2 pt-6">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold">Daily Hadith</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <Card className="border-2">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-xl">
                  {hadith.collection.charAt(0).toUpperCase() + hadith.collection.slice(1)}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleFavorite}
                    disabled={favoriteMutation.isPending}
                    data-testid="button-favorite-hadith"
                    className="toggle-elevate"
                    aria-label={hadith.isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        hadith.isFavorited ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleShare}
                    disabled={shareLoading}
                    data-testid="button-share-hadith"
                    aria-label="Share hadith"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {hadith.category && (
                <Badge variant="secondary" className="w-fit" data-testid={`badge-category-${hadith.category}`}>
                  {hadith.category.charAt(0).toUpperCase() + hadith.category.slice(1)}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div
                  className="text-right text-2xl leading-loose font-arabic"
                  style={{ fontFamily: "Noto Naskh Arabic, serif" }}
                  lang="ar"
                  data-testid="text-hadith-arabic"
                >
                  {hadith.arabicText}
                </div>

                <div className="border-t pt-4">
                  <p className="text-lg leading-relaxed" data-testid="text-hadith-translation">
                    {hadith.englishTranslation}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                {hadith.narrator && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span data-testid="text-narrator">
                      Narrated by {hadith.narrator}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span data-testid="text-reference">{hadith.reference}</span>
                </div>

                {hadith.grade && (
                  <div className="inline-block">
                    <Badge
                      variant={hadith.grade === "sahih" ? "default" : "secondary"}
                      data-testid={`badge-grade-${hadith.grade}`}
                    >
                      {hadith.grade.charAt(0).toUpperCase() + hadith.grade.slice(1)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center italic">
                "Whoever follows a path in pursuit of knowledge, Allah will make easy for them a path to Paradise."
                <br />
                <span className="text-xs">— Sahih Muslim 2699</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <BannerAd />
      <BottomNav />
    </>
  );
}
