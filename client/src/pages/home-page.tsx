import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Clock, Circle, Compass, Book, Heart, Mic, MapPin, Moon, Sparkles } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon as MoonIcon } from "lucide-react";

import mosqueImage from "@assets/generated_images/Mosque_at_dawn_prayer_time_1c06498c.png";
import kaabaImage from "@assets/generated_images/Kaaba_aerial_view_Makkah_b34ddcc4.png";
import quranImage from "@assets/generated_images/Open_Quran_with_calligraphy_c7ef6e94.png";
import tasbihImage from "@assets/generated_images/Prayer_beads_tasbih_closeup_5696650d.png";
import ramadanImage from "@assets/generated_images/Ramadan_crescent_moon_lanterns_7acbaea8.png";
import khutbahImage from "@assets/generated_images/friday_khutbah_sermon_scene.png";
import duasImage from "@assets/generated_images/islamic_duas_prayer_book.png";
import mosqueFinderImage from "@assets/generated_images/mosque_aerial_city_view.png";
import namesOfAllahImage from "@assets/generated_images/islamic_calligraphy_allah_names.png";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      title: "Khutbah Translate",
      description: "Real-time translation of Friday sermons from Arabic to English",
      icon: Mic,
      backgroundImage: khutbahImage,
      path: "/khutbah",
    },
    {
      title: "Prayer Times",
      description: "Never miss a prayer with accurate timings based on your location",
      icon: Clock,
      backgroundImage: mosqueImage,
      path: "/prayer",
    },
    {
      title: "Qur'an Reader",
      description: "Read the Holy Qur'an with translation and transliteration",
      icon: Book,
      backgroundImage: quranImage,
      path: "/quran",
    },
    {
      title: "Daily Duas",
      description: "Access a comprehensive collection of Islamic supplications",
      icon: Heart,
      backgroundImage: duasImage,
      path: "/duas",
    },
    {
      title: "Tasbih Counter",
      description: "Track your dhikr with a beautiful digital counter",
      icon: Circle,
      backgroundImage: tasbihImage,
      path: "/tasbih",
    },
    {
      title: "Qibla Compass",
      description: "Find the direction to Kaaba from anywhere in the world",
      icon: Compass,
      backgroundImage: kaabaImage,
      path: "/qibla",
    },
    {
      title: "99 Names of Allah",
      description: "Discover the beautiful names of Allah with meanings",
      icon: Sparkles,
      backgroundImage: namesOfAllahImage,
      path: "/names-of-allah",
    },
    {
      title: "Mosque Finder",
      description: "Locate nearby mosques for prayer and community",
      icon: MapPin,
      backgroundImage: mosqueFinderImage,
      path: "/mosques",
    },
    {
      title: "Ramadan",
      description: "Suhoor and Iftar times, fasting tracker for the holy month",
      icon: Moon,
      backgroundImage: ramadanImage,
      path: "/ramadan",
    },
  ];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-app-title">
              Khutbah Translate
            </h1>
            <p className="text-sm text-muted-foreground">Your Islamic Companion</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="pt-8 pb-12">
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Assalamu Alaikum
          </h2>
          <p className="text-muted-foreground">
            Explore your Islamic tools and resources
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              backgroundImage={feature.backgroundImage}
              onExplore={() => setLocation(feature.path)}
            />
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
