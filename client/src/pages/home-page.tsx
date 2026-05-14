import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Clock, Circle, Compass, Book, Heart, Mic, MapPin, ScrollText, BookOpen, Settings } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon as MoonIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import mosqueImage from "@assets/generated_images/Mosque_at_dawn_prayer_time_1c06498c.png";
import kaabaImage from "@assets/generated_images/Kaaba_aerial_view_Makkah_b34ddcc4.png";
import quranImage from "@assets/generated_images/Open_Quran_with_calligraphy_c7ef6e94.png";
import tasbihImage from "@assets/generated_images/Prayer_beads_tasbih_closeup_5696650d.png";
import khutbahImage from "@assets/generated_images/mosque_microphone_audio_setup.png";
import duasImage from "@assets/generated_images/hands_in_dua_position.png";
import mosqueFinderImage from "@assets/generated_images/mosque_aerial_city_view.png";
import namesOfAllahImage from "@assets/generated_images/islamic_calligraphy_allah_names.png";

interface PrayerTimesWidgetData {
  fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string;
  nextPrayer: { nextPrayer: string };
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(() => {
    const cached = localStorage.getItem('cached-coords');
    return cached ? JSON.parse(cached) : null;
  });
  const [locationDenied, setLocationDenied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calculationMethod] = useState(() => localStorage.getItem("prayerCalculationMethod") || "ISNA");
  const [asrMethod] = useState(() => localStorage.getItem("asrCalculationMethod") || "standard");

  const { data: prayerData, isLoading: prayerLoading } = useQuery<PrayerTimesWidgetData>({
    queryKey: coords
      ? [`/api/prayer-times?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${calculationMethod}&asrMethod=${asrMethod}`]
      : ["/api/prayer-times"],
    enabled: coords !== null,
  });

  useEffect(() => {
    if (!navigator.geolocation) { setLocationDenied(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        localStorage.setItem('cached-coords', JSON.stringify(c));
        setCoords(c);
      },
      () => setLocationDenied(true),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayerName = prayerData?.nextPrayer?.nextPrayer ?? "";
  const nextPrayerTimeStr = prayerData && nextPrayerName
    ? (nextPrayerName === "Fajr" ? prayerData.fajr
      : nextPrayerName === "Dhuhr" ? prayerData.dhuhr
      : nextPrayerName === "Asr" ? prayerData.asr
      : nextPrayerName === "Maghrib" ? prayerData.maghrib
      : prayerData.isha)
    : "";
  const isAfterIsha = nextPrayerName === "Fajr" && widgetIsTimePassed(prayerData?.isha ?? "", currentTime);

  const features = [
    {
      title: "Live Translation",
      description: "Real-time translation of Friday sermons from Arabic to English",
      icon: Mic,
      backgroundImage: khutbahImage,
      path: "/khutbah",
      category: "khutbah",
    },
    {
      title: "Prayer Times",
      description: "Never miss a prayer with accurate timings based on your location",
      icon: Clock,
      backgroundImage: mosqueImage,
      path: "/prayer",
      category: "prayer",
    },
    {
      title: "Qur'an Reader",
      description: "Read the Holy Qur'an with translation and transliteration",
      icon: Book,
      backgroundImage: quranImage,
      path: "/quran",
      category: "knowledge",
    },
    {
      title: "Daily Duas",
      description: "Access a comprehensive collection of Islamic supplications",
      icon: Heart,
      backgroundImage: duasImage,
      path: "/duas",
      category: "knowledge",
    },
    {
      title: "Daily Hadith",
      description: "Receive daily authentic hadiths with translations",
      icon: ScrollText,
      backgroundImage: quranImage, // Reusing Quran image for now
      path: "/hadith",
      category: "knowledge",
    },
    {
      title: "Tasbih Counter",
      description: "Track your dhikr with a beautiful digital counter",
      icon: Circle,
      backgroundImage: tasbihImage,
      path: "/tasbih",
      category: "prayer",
    },
    {
      title: "Qibla Compass",
      description: "Find the direction to Kaaba from anywhere in the world",
      icon: Compass,
      backgroundImage: kaabaImage,
      path: "/qibla",
      category: "prayer",
    },
    {
      title: "99 Names of Allah",
      description: "Discover the beautiful names of Allah with meanings",
      icon: ((props: any) => (
        <span 
          {...props} 
          className={`${props.className} flex items-center justify-center text-5xl font-bold leading-none`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          99
        </span>
      )) as any,
      backgroundImage: namesOfAllahImage,
      path: "/names-of-allah",
      category: "knowledge",
    },
    {
      title: "Mosque Finder",
      description: "Locate nearby mosques for prayer and community",
      icon: MapPin,
      backgroundImage: mosqueFinderImage,
      path: "/mosques",
      category: "community",
    },
    {
      title: "Salah Guide",
      description: "Step-by-step guide on how to perform each prayer",
      icon: BookOpen,
      backgroundImage: mosqueImage,
      path: "/salah-guide",
      category: "knowledge",
    },
  ];

  const khutbahFeature = features[0]; // Live Translation is first
  const otherFeatures = features.slice(1); // All other features

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate" data-testid="text-app-title">
              Khutbah Companion
            </h1>
            <p className="text-xs text-muted-foreground">Your Islamic Companion</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
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
        </div>
      </header>

      <main className="pt-8 pb-12">
        <div className="px-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Assalamu Alaikum
          </h2>
          <p className="text-sm text-muted-foreground">
            Your complete Islamic companion in one place
          </p>
        </div>

        {/* Featured: Live Translation - Full Width Banner */}
        <div className="px-6">
          <button
            onClick={() => setLocation(khutbahFeature.path)}
            className="w-full hover-elevate active-elevate-2 transition-all"
            data-testid={`tile-${khutbahFeature.title.toLowerCase().replace(/\s+/g, '-')}`}
            aria-label={`Open ${khutbahFeature.title}`}
          >
            <div
              className="w-full aspect-[3/1] rounded-2xl bg-cover bg-center relative flex items-center justify-center overflow-hidden"
              style={{ backgroundImage: `url(${khutbahFeature.backgroundImage})` }}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/40 to-primary/60" aria-hidden="true" />
              <div className="relative z-10 flex items-center gap-3">
                <Mic className="w-14 h-14 text-white" />
                <div className="text-left">
                  <div className="text-xl font-semibold text-white">
                    {khutbahFeature.title}
                  </div>
                  <div className="text-sm text-white/90">
                    {khutbahFeature.description}
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Next Prayer Widget */}
        {!locationDenied && coords && (
          <div className="px-6 mt-5">
            {prayerLoading || !prayerData ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : (
              <Card
                className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() => setLocation("/prayer")}
                data-testid="widget-next-prayer"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground leading-none mb-0.5">Next Prayer</p>
                      <p className="font-semibold text-foreground leading-none">
                        {currentTime.getDay() === 5 && nextPrayerName === "Dhuhr" ? "Jummah" : nextPrayerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground leading-none mb-0.5">Time remaining</p>
                    <p className="font-mono font-semibold text-primary leading-none">
                      {nextPrayerTimeStr ? widgetFormatCountdown(nextPrayerTimeStr, currentTime, isAfterIsha) : "—"}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Other Features - 3 Column Grid */}
        <div className="px-6 mt-5">
          <div className="grid grid-cols-3 gap-5">
            {otherFeatures.map((feature: any) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.title}
                  onClick={() => setLocation(feature.path)}
                  className="flex flex-col items-center gap-2 hover-elevate active-elevate-2 transition-all"
                  data-testid={`tile-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-label={`Open ${feature.title}`}
                >
                  <div
                    className="w-full aspect-square rounded-2xl bg-cover bg-center relative flex items-center justify-center overflow-hidden"
                    style={{ backgroundImage: `url(${feature.backgroundImage})` }}
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/40 to-primary/60" aria-hidden="true" />
                    <Icon className="w-12 h-12 text-white relative z-10" />
                  </div>
                  <span className="text-xs font-medium text-center text-foreground leading-tight line-clamp-2 w-full">
                    {feature.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function widgetIsTimePassed(timeStr: string, currentTime: Date): boolean {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return currentTime.getHours() * 60 + currentTime.getMinutes() > hours * 60 + minutes;
}

function widgetFormatCountdown(timeStr: string, currentTime: Date, isTomorrow = false): string {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "";
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const target = new Date(currentTime);
  target.setHours(hours, minutes, 0, 0);
  if (isTomorrow) target.setDate(target.getDate() + 1);
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - currentTime.getTime()) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
