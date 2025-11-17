import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const namesOfAllah = [
  { arabic: "الرَّحْمَٰنُ", transliteration: "Ar-Rahman", meaning: "The Most Gracious" },
  { arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", meaning: "The Most Merciful" },
  { arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King" },
  { arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy" },
  { arabic: "السَّلَامُ", transliteration: "As-Salam", meaning: "The Source of Peace" },
  { arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Granter of Security" },
  { arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Guardian" },
  { arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", meaning: "The Almighty" },
  { arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", meaning: "The Compeller" },
  { arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Supreme" },
  { arabic: "الْخَالِقُ", transliteration: "Al-Khaliq", meaning: "The Creator" },
  { arabic: "الْبَارِئُ", transliteration: "Al-Bari", meaning: "The Evolver" },
];

export default function NamesOfAllahPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNames = namesOfAllah.filter(
    (name) =>
      name.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNames.map((name, index) => (
            <Card
              key={index}
              className="hover-elevate cursor-pointer transition-all overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.02) 100%)`,
              }}
              data-testid={`card-name-${index + 1}`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{index + 1}</span>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p
                    className="text-4xl font-arabic text-primary"
                    dir="rtl"
                    data-testid={`text-arabic-${index + 1}`}
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
      </main>

      <BottomNav />
    </div>
  );
}
