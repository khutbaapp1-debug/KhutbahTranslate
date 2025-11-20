import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { namesOfAllah } from "@/data/names-of-allah";

// Normalize Arabic text by removing diacritics and normalizing letter variations
function normalizeArabic(text: string): string {
  return text
    // Normalize Unicode (NFC form)
    .normalize('NFC')
    // Remove Arabic diacritical marks (tashkeel) including superscript alef and all accent marks
    // Covers: \u064B-\u065F (all diacritical marks), \u0670 (superscript alef), \u06D6-\u06DC, \u06DF-\u06E4, \u06E7-\u06E8
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g, '')
    // Normalize different forms of Alef (including Alef Wasla \u0671)
    // Covers: Alef with Hamza below (إ), Alef with Hamza above (أ), Alef with Madda (آ), Alef Wasla (ٱ), bare Alef (ا)
    .replace(/[\u0625\u0623\u0622\u0671\u0627]/g, '\u0627')
    // Normalize different forms of Hamza
    .replace(/[\u0624\u0626]/g, '\u0621')
    // Normalize Taa Marbuta and Haa
    .replace(/\u0629/g, '\u0647')
    // Remove tatweel (elongation character)
    .replace(/\u0640/g, '')
    // Trim whitespace
    .trim();
}

export default function NamesOfAllahPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedArabicQuery = normalizeArabic(searchQuery);

  const filteredNames = namesOfAllah.filter((name) => {
    // Search in transliteration (case-insensitive)
    if (name.transliteration.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in meaning (case-insensitive)
    if (name.meaning.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in Arabic text (normalized to handle diacritics and variations)
    if (normalizedArabicQuery && normalizeArabic(name.arabic).includes(normalizedArabicQuery)) {
      return true;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              99 Names of Allah
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Asma ul Husna</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-screen-xl mx-auto">
        {filteredNames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No names found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNames.map((name) => (
              <Card
                key={name.number}
                className="hover-elevate cursor-pointer transition-all overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.02) 100%)`,
                }}
                data-testid={`card-name-${name.number}`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">{name.number}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <p
                      className="text-4xl font-arabic text-primary"
                      dir="rtl"
                      data-testid={`text-arabic-${name.number}`}
                    >
                      {name.arabic}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {name.transliteration}
                    </p>
                    <p className="text-sm text-muted-foreground">{name.meaning}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
