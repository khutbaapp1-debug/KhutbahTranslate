import { useLocation } from "wouter";
import { Clock, Circle, Compass, Book, Heart, Mic, MapPin, Moon, BookOpen, Calendar, Crown, BarChart3, BookMarked } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { HomepageBannerAd } from "@/components/google-ad";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon as MoonIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import mosqueImage from "@assets/generated_images/Mosque_at_dawn_prayer_time_1c06498c.png";
import kaabaImage from "@assets/generated_images/Kaaba_aerial_view_Makkah_b34ddcc4.png";
import quranImage from "@assets/generated_images/Open_Quran_with_calligraphy_c7ef6e94.png";
import tasbihImage from "@assets/generated_images/Prayer_beads_tasbih_closeup_5696650d.png";
import ramadanImage from "@assets/generated_images/Ramadan_crescent_moon_lanterns_7acbaea8.png";
import khutbahImage from "@assets/generated_images/mosque_microphone_audio_setup.png";
import duasImage from "@assets/generated_images/hands_in_dua_position.png";
import mosqueFinderImage from "@assets/generated_images/mosque_aerial_city_view.png";
import namesOfAllahImage from "@assets/generated_images/islamic_calligraphy_allah_names.png";
import khutbahDatabaseImage from "@assets/generated_images/khutbah_database_mosque_interior.png";
import journalImage from "@assets/generated_images/reflection_journal_writing_setup.png";
import analyticsImage from "@assets/generated_images/analytics_spiritual_dashboard.png";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const isPremium = user?.subscriptionTier === "premium";

  const features = [
    {
      title: "Khutbah Translate",
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
      title: "Ramadan",
      description: "Suhoor and Iftar times, fasting tracker for the holy month",
      icon: Moon,
      backgroundImage: ramadanImage,
      path: "/ramadan",
      category: "calendar",
    },
    {
      title: "Khutbah Database",
      description: "Access thousands of khutbahs with full translations",
      icon: BookMarked,
      backgroundImage: khutbahDatabaseImage,
      path: "/khutbah-database",
      category: "khutbah",
      premium: true,
    },
    {
      title: "Reflection Journal",
      description: "Reflect on teachings with guided journal prompts",
      icon: BookOpen,
      backgroundImage: journalImage,
      path: "/journal",
      category: "knowledge",
      premium: true,
    },
    {
      title: "Analytics",
      description: "Track your spiritual progress and growth over time",
      icon: BarChart3,
      backgroundImage: analyticsImage,
      path: "/analytics",
      category: "prayer",
      premium: true,
    },
  ];

  const renderAppGridLayout = () => (
    <div className="px-6">
      <div className="grid grid-cols-3 gap-5">
        {features.map((feature: any) => {
          const Icon = feature.icon;
          const isLocked = feature.premium && !isPremium;
          
          return (
            <button
              key={feature.title}
              onClick={() => {
                if (isLocked) {
                  setLocation("/premium");
                } else {
                  setLocation(feature.path);
                }
              }}
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
                {isLocked && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center z-20">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
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
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate" data-testid="text-app-title">
              Khutbah Translate
            </h1>
            <p className="text-xs text-muted-foreground">Your Islamic Companion</p>
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
          <p className="text-sm text-muted-foreground">
            Your complete Islamic companion in one place
          </p>
        </div>

        {renderAppGridLayout()}
        
        {/* Google Ad Placement */}
        <div className="mt-8 px-6">
          <HomepageBannerAd />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
