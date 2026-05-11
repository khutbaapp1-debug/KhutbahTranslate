import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WuduCardData {
  id: number;
  title: string;
  body: string;
  image?: string;
  note?: string;
  isClosingDua?: boolean;
}

const CARDS: WuduCardData[] = [
  {
    id: 1,
    title: "Niyyah & Bismillah",
    body: "Make the intention in your heart to perform wudu for prayer. The intention does not need to be spoken aloud — it is an act of the heart. Then say: Bismillah (In the name of Allah) before water touches your body.",
  },
  {
    id: 2,
    title: "Wash the Hands",
    body: "Wash your right hand up to the wrist, then your left. Repeat 3 times. Ensure water reaches between the fingers.",
    image: "/images/wudu/wudu-hands.jpg",
  },
  {
    id: 3,
    title: "Rinse the Mouth (Madmadah)",
    body: "Using your right hand, bring water to your mouth, swirl it around, then spit it out. Repeat 3 times.",
    image: "/images/wudu/wudu-mouth.jpg",
    note: "If fasting, rinse gently without gargling.",
  },
  {
    id: 4,
    title: "Cleanse the Nose (Istinshaq)",
    body: "Draw water into your nostrils with your right hand, then blow out with your left. Repeat 3 times.",
    image: "/images/wudu/wudu-nose.jpg",
    note: "If fasting, draw water in gently.",
  },
  {
    id: 5,
    title: "Wash the Face",
    body: "Wash your face from forehead to chin, and from earlobe to earlobe. Repeat 3 times.",
    image: "/images/wudu/wudu-face.jpg",
    note: "If you have a beard, run wet fingers through it.",
  },
  {
    id: 6,
    title: "Wash the Arms",
    body: "Wash from fingertips up to and including the elbow — right arm first, then left. Repeat 3 times.",
    image: "/images/wudu/wudu-arms.jpg",
  },
  {
    id: 7,
    title: "Wipe the Head & Neck (Masah)",
    body: "Wet both hands. Place palms on front of head, move back to nape of neck, then return with backs of hands. Wipe the neck once with the backs of your middle fingers. Done once only.",
    image: "/images/wudu/wudu-head.jpg",
  },
  {
    id: 8,
    title: "Wipe the Ears",
    body: "Without re-wetting, use index fingers to wipe inside the ears, and thumbs to wipe behind the ears. Done once.",
    image: "/images/wudu/wudu-ears.jpg",
  },
  {
    id: 9,
    title: "Wash the Feet",
    body: "Wash right foot from toes up to and including the ankle, then the left. Repeat 3 times. Run the little finger of your left hand between each toe.",
    image: "/images/wudu/wudu-feet.jpg",
  },
  {
    id: 10,
    title: "Closing Dua",
    body: "Your wudu is complete. Recite the closing dua:",
    isClosingDua: true,
  },
];

export function WuduFlashCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  function goTo(index: number, dir: "next" | "prev") {
    setDirection(dir);
    setCurrentIndex(index);
    setAnimKey((k) => k + 1);
  }

  function goNext() {
    if (currentIndex < CARDS.length - 1) goTo(currentIndex + 1, "next");
  }

  function goPrev() {
    if (currentIndex > 0) goTo(currentIndex - 1, "prev");
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  const card = CARDS[currentIndex];
  const animClass = direction === "next" ? "wfc-slide-in-right" : "wfc-slide-in-left";

  return (
    <div className="select-none">
      <style>{`
        @keyframes wfcSlideInRight {
          from { transform: translateX(56px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes wfcSlideInLeft {
          from { transform: translateX(-56px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes wfcHintPulse {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(-5px); }
        }
        .wfc-slide-in-right { animation: wfcSlideInRight 220ms ease-out both; }
        .wfc-slide-in-left  { animation: wfcSlideInLeft  220ms ease-out both; }
        .wfc-hint-pulse     { animation: wfcHintPulse 900ms ease-in-out infinite; }
      `}</style>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-3" role="tablist" aria-label="Wudu steps">
        {CARDS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Step ${i + 1}`}
            onClick={() => goTo(i, i > currentIndex ? "next" : "prev")}
            className={`rounded-full transition-all duration-200 ${
              i === currentIndex
                ? "w-4 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" style={{ height: "72vh", maxHeight: 580 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={animKey} className={`${animClass} flex flex-col h-full`}>
          {card.image && (
            <img
              src={card.image}
              alt={card.title}
              className="w-full object-cover rounded-t-2xl"
              style={{ height: "70%", flexShrink: 0 }}
              draggable={false}
            />
          )}

          <div className={`p-5 space-y-3 flex-1 overflow-y-auto ${!card.image ? "pt-7" : ""}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Step {card.id} of {CARDS.length}
            </p>

            <h2 className="text-lg font-bold text-card-foreground leading-snug">
              {card.title}
            </h2>

            <p className="text-sm text-card-foreground leading-relaxed">
              {card.body}
            </p>

            {card.note && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2">
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <span className="font-semibold">Note: </span>
                  {card.note}
                </p>
              </div>
            )}

            {card.isClosingDua && (
              <div className="space-y-2 pt-1">
                <p className="text-sm italic text-card-foreground leading-relaxed">
                  "Allahumma j'alni minat-tawwabeen, waj'alni minal-mutatahhireen."
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O Allah, make me among those who repent, and make me among those who purify themselves.
                </p>
                <div className="mt-3 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5">
                  <p className="text-sm font-medium text-primary text-center">
                    Your wudu is complete. You are ready to pray. ✓
                  </p>
                </div>
              </div>
            )}

            {card.id === 1 && (
              <div
                className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 transition-opacity duration-700"
                style={{ opacity: showHint ? 1 : 0, pointerEvents: "none" }}
                aria-hidden="true"
              >
                <span className="wfc-hint-pulse inline-block">&#8592;</span>
                <span>Swipe to begin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-3 px-1">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors active:scale-95"
          aria-label="Previous step"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs text-muted-foreground tabular-nums">
          {currentIndex + 1} / {CARDS.length}
        </span>

        <button
          onClick={goNext}
          disabled={currentIndex === CARDS.length - 1}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors active:scale-95"
          aria-label="Next step"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
