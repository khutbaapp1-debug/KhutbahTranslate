import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WheelPicker } from "@/components/wheel-picker";
import { Badge } from "@/components/ui/badge";
import { Heart, Loader2, Home } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Dua } from "@shared/schema";

const duaCategories = [
  { id: "all", label: "All" },
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
  { id: "daily", label: "Daily" },
  { id: "sleep", label: "Sleep" },
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food" },
  { id: "prayer", label: "Prayer" },
  { id: "distress", label: "Distress" },
  { id: "gratitude", label: "Gratitude" },
  { id: "forgiveness", label: "Forgiveness" },
  { id: "knowledge", label: "Knowledge" },
  { id: "protection", label: "Protection" },
];

interface FavoriteDua {
  id: string;
  favoriteId: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  category: string;
  occasion: string | null;
  reference: string | null;
}

export default function DuasPage() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const { user } = useAuth();

  const { data: allDuas, isLoading: loadingDuas } = useQuery<Dua[]>({
    queryKey: ["/api/duas"],
  });

  const { data: favoriteDuas } = useQuery<FavoriteDua[]>({
    queryKey: ["/api/duas/favorites"],
    enabled: !!user,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ duaId, isFavorite }: { duaId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/duas/${duaId}/favorite`);
      } else {
        await apiRequest("POST", `/api/duas/${duaId}/favorite`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duas/favorites"] });
    },
  });

  const filteredDuas = allDuas?.filter((dua) => {
    if (activeCategory === "all") return true;
    return dua.category === activeCategory;
  });

  const isFavorited = (duaId: string) => {
    return favoriteDuas?.some((fav) => fav.id === duaId) || false;
  };

  const toggleFavorite = (duaId: string) => {
    if (!user) return;
    const isFavorite = isFavorited(duaId);
    favoriteMutation.mutate({ duaId, isFavorite });
  };

  return (
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border pt-safe">
        <div className="py-2 px-4 max-w-screen-xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-home">
              <Home className="w-5 h-5" />
            </Button>
            <h1 className="flex-1 text-center text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Daily Duas
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-screen-lg mx-auto">
        <WheelPicker
          items={duaCategories.map((c) => ({ label: c.label, value: c.id }))}
          selectedValue={activeCategory}
          onChange={setActiveCategory}
          className="mb-6 -mx-6"
        />

        {loadingDuas ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDuas && filteredDuas.length > 0 ? (
              filteredDuas.map((dua) => (
                <Card key={dua.id} className="overflow-hidden" data-testid={`card-dua-${dua.id}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="shrink-0">
                          {dua.occasion || dua.category}
                        </Badge>
                        {dua.reference && (
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {dua.reference}
                          </Badge>
                        )}
                      </div>
                      {user && (
                        <button
                          onClick={() => toggleFavorite(dua.id)}
                          className="shrink-0 p-2 rounded-full hover-elevate"
                          data-testid={`button-favorite-${dua.id}`}
                          disabled={favoriteMutation.isPending}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isFavorited(dua.id)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p
                        className="text-3xl font-arabic leading-loose text-right"
                        dir="rtl"
                        data-testid={`text-arabic-${dua.id}`}
                      >
                        {dua.arabicText}
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
              ))
            ) : (
              <p className="text-center py-12 text-muted-foreground">
                No duas found in this category
              </p>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
