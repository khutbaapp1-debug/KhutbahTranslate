import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Clock, Circle, Compass, Book, Heart, Mic, MapPin, ScrollText, BookOpen, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon as MoonIcon } from "lucide-react";
import { computePrayerTimes, getCachedCoords, setCachedCoords, PrayerTimesResult } from "@/lib/prayer-times-client";

import mosqueImage from "@assets/generated_images/Mosque_at_dawn_prayer_time_1c06498c.png";
import kaabaImage from "@assets/generated_images/Kaaba_aerial_view_Makkah_b34ddcc4.png";
import quranImage from "@assets/generated_images/Open_Quran_with_calligraphy_c7ef6e94.png";
import tasbihImage from "@assets/generated_images/Prayer_beads_tasbih_closeup_5696650d.png";
import khutbahImage from "@assets/generated_images/mosque_microphone_audio_setup.png";
import duasImage from "@assets/generated_images/hands_in_dua_position.png";
import mosqueFinderImage from "@assets/generated_images/mosque_aerial_city_view.png";
import namesOfAllahImage from "@assets/generated_images/islamic_calligraphy_allah_names.png";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [calculationMethod] = useState(() => localStorage.getItem("prayerCalculationMethod") || "ISNA");
  const [asrMethod] = useState(() => localStorage.getItem("asrCalculationMethod") || "standard");
  const [locationDenied, setLocationDenied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(() => {
    const cached = getCachedCoords();
    if (!cached) return null;
    try {
      return computePrayerTimes(
        cached.latitude, cached.longitude, new Date(),
        localStorage.getItem("prayerCalculationMethod") || "ISNA",
        localStorage.getItem("asrCalculationMethod") || "standard"
      );
    } catch { return null; }
  });

  useEffect(() => {
    if (!navigator.geolocation) { setLocationDenied(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCachedCoords(pos.coords.latitude, pos.coords.longitude);
        setPrayerData(computePrayerTimes(pos.coords.latitude, pos.coords.longitude, new Date(), calculationMethod, asrMethod));
      },
      () => { if (!getCachedCoords()) setLocationDenied(true); },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayers = prayerData ? [
    { name: 'Fajr',    time: prayerData.fajr },
    { name: 'Dhuhr',   time: prayerData.dhuhr },
    { name: 'Asr',     time: prayerData.asr },
    { name: 'Maghrib', time: prayerData.maghrib },
    { name: 'Isha',    time: prayerData.isha },
  ] : [];
  const nextPrayerEntry = prayers.find(p => p.time > currentTime);
  const nextPrayerName  = nextPrayerEntry?.name ?? (prayerData ? 'Fajr' : '');
  const nextPrayerTime  = nextPrayerEntry?.time ?? prayerData?.fajr;
  const isAfterIsha     = !nextPrayerEntry && prayerData != null;

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
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border pt-safe">
        <div className="flex items-center justify-between py-2 px-4 max-w-screen-xl mx-auto gap-4">
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

      <main className="pt-16 pb-12">
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
        {!locationDenied && prayerData && (
          <div className="px-6 mt-5">
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
                    {nextPrayerTime ? widgetFormatCountdown(nextPrayerTime, currentTime, isAfterIsha) : "—"}
                  </p>
                </div>
              </div>
            </Card>
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

    </div>
  );
}

function widgetFormatCountdown(prayerTime: Date, currentTime: Date, isTomorrow = false): string {
  const target = isTomorrow
    ? new Date(prayerTime.getTime() + 24 * 60 * 60 * 1000)
    : prayerTime;
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - currentTime.getTime()) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
