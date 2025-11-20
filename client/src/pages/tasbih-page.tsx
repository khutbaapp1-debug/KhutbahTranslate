import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

const dhikrPresets = [
  { id: "subhanallah", text: "سُبْحَانَ ٱللَّٰهِ", translation: "SubhanAllah", target: 33 },
  { id: "alhamdulillah", text: "ٱلْحَمْدُ لِلَّٰهِ", translation: "Alhamdulillah", target: 33 },
  { id: "allahu-akbar", text: "ٱللَّٰهُ أَكْبَرُ", translation: "Allahu Akbar", target: 34 },
  { id: "la-ilaha", text: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", translation: "La ilaha illallah", target: 100 },
  { id: "astaghfirullah", text: "أَسْتَغْفِرُ ٱللَّٰهَ", translation: "Astaghfirullah", target: 100 },
  { id: "salawat", text: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", translation: "Allahumma salli ala Muhammad", target: 100 },
  { id: "la-hawla", text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ", translation: "La hawla wa la quwwata illa billah", target: 100 },
  { id: "subhanallahi-wabihamdihi", text: "سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ", translation: "Subhanallahi wa bihamdihi", target: 100 },
  { id: "tawhid-full", text: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ", translation: "La ilaha illallah wahdahu la sharika lah", target: 100 },
];

export default function TasbihPage() {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrPresets[0]);

  const handleIncrement = () => {
    setCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const progress = (count / selectedDhikr.target) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Digital Tasbih
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            data-testid="button-reset"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-screen-md mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-arabic font-semibold text-foreground" dir="rtl">
            {selectedDhikr.text}
          </h2>
          <p className="text-lg text-muted-foreground">{selectedDhikr.translation}</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleIncrement}
            className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-xl active-elevate-2 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all"
            data-testid="button-counter"
          >
            <div className="absolute inset-4 rounded-full border-4 border-primary-foreground/20" />
            <div className="absolute inset-8 rounded-full border-2 border-primary-foreground/10" />
            
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.1"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 115} ${2 * Math.PI * 115}`}
                strokeDashoffset={2 * Math.PI * 115 * (1 - progress / 100)}
                className="transition-all duration-300"
                opacity="0.9"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold" data-testid="text-count">{count}</span>
              <span className="text-sm opacity-90 mt-2">Tap to count</span>
            </div>
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Target: {selectedDhikr.target}
          </p>
          {count >= selectedDhikr.target && (
            <Badge variant="default" className="text-sm">
              ماشاء الله! Target reached
            </Badge>
          )}
        </div>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Select Dhikr</h3>
          <div className="grid grid-cols-2 gap-3">
            {dhikrPresets.map((dhikr) => (
              <button
                key={dhikr.id}
                onClick={() => {
                  setSelectedDhikr(dhikr);
                  setCount(0);
                }}
                className={`p-4 rounded-lg border text-left transition-all hover-elevate ${
                  selectedDhikr.id === dhikr.id
                    ? "border-primary bg-accent"
                    : "border-border"
                }`}
                data-testid={`button-dhikr-${dhikr.id}`}
              >
                <p className="text-xl font-arabic mb-1" dir="rtl">{dhikr.text}</p>
                <p className="text-xs text-muted-foreground">{dhikr.translation}</p>
                <p className="text-xs text-muted-foreground mt-1">Target: {dhikr.target}</p>
              </button>
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
