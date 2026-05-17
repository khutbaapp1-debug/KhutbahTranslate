import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
  const [, setLocation] = useLocation();
  const [selectedDhikr, setSelectedDhikr] = useState(() => {
    const savedId = localStorage.getItem("tasbih-selected-dhikr");
    return dhikrPresets.find((d) => d.id === savedId) ?? dhikrPresets[0];
  });

  const [count, setCount] = useState(() => {
    const savedId = localStorage.getItem("tasbih-selected-dhikr");
    const dhikr = dhikrPresets.find((d) => d.id === savedId) ?? dhikrPresets[0];
    const saved = localStorage.getItem(`tasbih-count-${dhikr.id}`);
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(`tasbih-count-${selectedDhikr.id}`, String(count));
  }, [count, selectedDhikr.id]);

  const [showCompletionBurst, setShowCompletionBurst] = useState(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, []);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    if (Capacitor.isNativePlatform()) {
      Haptics.impact({ style: newCount === selectedDhikr.target ? ImpactStyle.Heavy : ImpactStyle.Light }).catch(() => {});
    }
    if (newCount === selectedDhikr.target) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        const idx = dhikrPresets.findIndex((d) => d.id === selectedDhikr.id);
        const next = dhikrPresets[(idx + 1) % dhikrPresets.length];
        localStorage.setItem("tasbih-selected-dhikr", next.id);
        setSelectedDhikr(next);
        const saved = localStorage.getItem(`tasbih-count-${next.id}`);
        setCount(saved !== null ? parseInt(saved, 10) : 0);
      }, 1500);
      const allComplete = dhikrPresets.every((d) => {
        if (d.id === selectedDhikr.id) return newCount >= d.target;
        return parseInt(localStorage.getItem(`tasbih-count-${d.id}`) || "0", 10) >= d.target;
      });
      if (allComplete) {
        setShowCompletionBurst(true);
        setTimeout(() => setShowCompletionBurst(false), 700);
        setTimeout(() => {
          dhikrPresets.forEach((d) => localStorage.removeItem(`tasbih-count-${d.id}`));
          localStorage.setItem("tasbih-selected-dhikr", dhikrPresets[0].id);
          if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
          setSelectedDhikr(dhikrPresets[0]);
          setCount(0);
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    localStorage.removeItem(`tasbih-count-${selectedDhikr.id}`);
    setCount(0);
  };

  const handleDecrement = () => {
    setCount((prev) => Math.max(0, prev - 1));
  };

  const sortedDhikrPresets = [...dhikrPresets].sort((a, b) => {
    const ca = a.id === selectedDhikr.id ? count : parseInt(localStorage.getItem(`tasbih-count-${a.id}`) || "0", 10);
    const cb = b.id === selectedDhikr.id ? count : parseInt(localStorage.getItem(`tasbih-count-${b.id}`) || "0", 10);
    return (ca >= a.target ? 1 : 0) - (cb >= b.target ? 1 : 0);
  });

  const progress = (count / selectedDhikr.target) * 100;

  return (
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border pt-safe">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-home">
            <Home className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-2xl font-semibold text-foreground" data-testid="text-page-title">
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

        <style>{`
          @keyframes tasbih-burst {
            0%   { transform: translate(-50%, -50%) translate(0px, 0px) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
          }
        `}</style>
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
            {showCompletionBurst && [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <div
                  key={angle}
                  className="pointer-events-none absolute rounded-full bg-primary-foreground"
                  style={{
                    width: 10, height: 10, top: "50%", left: "50%",
                    "--dx": `${Math.round(Math.cos(rad) * 70)}px`,
                    "--dy": `${Math.round(Math.sin(rad) * 70)}px`,
                    animation: "tasbih-burst 600ms ease-out forwards",
                  } as React.CSSProperties}
                />
              );
            })}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Target: {selectedDhikr.target}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={count === 0}
            data-testid="button-decrement"
          >
            −1
          </Button>
          {count >= selectedDhikr.target && (
            <Badge variant="default" className="text-sm">
              ماشاء الله! Target reached
            </Badge>
          )}
        </div>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Select Dhikr</h3>
          <div className="grid grid-cols-2 gap-3">
            {sortedDhikrPresets.map((dhikr) => {
              const dhikrCount = dhikr.id === selectedDhikr.id ? count : parseInt(localStorage.getItem(`tasbih-count-${dhikr.id}`) || "0", 10);
              const isComplete = dhikrCount >= dhikr.target;
              return (
                <button
                  key={dhikr.id}
                  onClick={() => {
                    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
                    localStorage.setItem(`tasbih-count-${selectedDhikr.id}`, String(count));
                    localStorage.setItem("tasbih-selected-dhikr", dhikr.id);
                    setSelectedDhikr(dhikr);
                    const saved = localStorage.getItem(`tasbih-count-${dhikr.id}`);
                    setCount(saved !== null ? parseInt(saved, 10) : 0);
                  }}
                  className={`relative p-4 rounded-lg border text-left transition-all hover-elevate ${
                    selectedDhikr.id === dhikr.id
                      ? "border-primary bg-accent"
                      : isComplete
                      ? "border-border opacity-40"
                      : "border-border"
                  }`}
                  data-testid={`button-dhikr-${dhikr.id}`}
                >
                  {isComplete && (
                    <span className="absolute top-2 right-2 text-xs text-primary font-bold">✓</span>
                  )}
                  <p className="text-xl font-arabic mb-1" dir="rtl">{dhikr.text}</p>
                  <p className="text-xs text-muted-foreground">{dhikr.translation}</p>
                  <p className="text-xs text-muted-foreground mt-1">Target: {dhikr.target}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </main>

    </div>
  );
}
