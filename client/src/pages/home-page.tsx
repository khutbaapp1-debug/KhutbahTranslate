import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Clock, Circle, Compass, Book, Heart, Mic, MapPin, Moon, Sparkles, Grid3x3, Users, BookOpen, Calendar } from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Sun, Moon as MoonIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import mosqueImage from "@assets/generated_images/Mosque_at_dawn_prayer_time_1c06498c.png";
import kaabaImage from "@assets/generated_images/Kaaba_aerial_view_Makkah_b34ddcc4.png";
import quranImage from "@assets/generated_images/Open_Quran_with_calligraphy_c7ef6e94.png";
import tasbihImage from "@assets/generated_images/Prayer_beads_tasbih_closeup_5696650d.png";
import ramadanImage from "@assets/generated_images/Ramadan_crescent_moon_lanterns_7acbaea8.png";
import khutbahImage from "@assets/generated_images/mosque_microphone_audio_setup.png";
import duasImage from "@assets/generated_images/hands_in_dua_position.png";
import mosqueFinderImage from "@assets/generated_images/mosque_aerial_city_view.png";
import namesOfAllahImage from "@assets/generated_images/islamic_calligraphy_allah_names.png";

type LayoutMode = "carousel" | "hybrid" | "categorized" | "quickaccess" | "appgrid";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("appgrid");
  const [showAllTools, setShowAllTools] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

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
      icon: Sparkles,
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
  ];

  const featuredFeatures = features.slice(0, 4);
  const secondaryFeatures = features.slice(4);

  const categories = {
    khutbah: {
      title: "Khutbah & Community",
      icon: Mic,
      features: features.filter(f => f.category === "khutbah" || f.category === "community"),
    },
    prayer: {
      title: "Prayer & Worship",
      icon: Circle,
      features: features.filter(f => f.category === "prayer"),
    },
    knowledge: {
      title: "Quran & Knowledge",
      icon: BookOpen,
      features: features.filter(f => f.category === "knowledge"),
    },
    calendar: {
      title: "Islamic Calendar",
      icon: Calendar,
      features: features.filter(f => f.category === "calendar"),
    },
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [layoutMode]);

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
  }, [layoutMode]);

  const getCarouselFeatures = () => {
    if (layoutMode === "carousel") return features;
    return featuredFeatures;
  };

  const carouselFeatures = getCarouselFeatures();

  const renderAppGridLayout = () => (
    <div className="px-6">
      <div className="grid grid-cols-3 gap-5">
        {features.map((feature) => {
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
  );

  const renderCarouselLayout = () => (
    <>
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
            data-testid={`dot-indicator-${index}`}
          />
        ))}
      </div>
    </>
  );

  const renderHybridLayout = () => (
    <>
      <div className="px-6 mb-6">
        <h3 className="text-base font-semibold text-foreground mb-3">Featured Tools</h3>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 scrollbar-hide mb-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredFeatures.map((feature) => (
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

      <div className="flex justify-center gap-2 mb-8">
        {featuredFeatures.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted"
            }`}
            data-testid={`dot-indicator-${index}`}
          />
        ))}
      </div>

      <div className="px-6">
        <h3 className="text-base font-semibold text-foreground mb-4">More Tools</h3>
        <div className="grid grid-cols-2 gap-3">
          {secondaryFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden"
                onClick={() => setLocation(feature.path)}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div
                  className="h-24 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${feature.backgroundImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-white" />
                      <h4 className="text-sm font-semibold text-white line-clamp-1">
                        {feature.title}
                      </h4>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );

  const renderCategorizedLayout = () => (
    <div className="px-6 space-y-8">
      {Object.entries(categories).map(([key, category]) => {
        const CategoryIcon = category.icon;
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-4">
              <CategoryIcon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {category.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden"
                    onClick={() => setLocation(feature.path)}
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-stretch h-24">
                      <div
                        className="w-28 bg-cover bg-center relative flex-shrink-0"
                        style={{ backgroundImage: `url(${feature.backgroundImage})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-center">
                        <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderQuickAccessLayout = () => (
    <>
      <div className="px-6 mb-4">
        <h3 className="text-base font-semibold text-foreground mb-3">Featured Tools</h3>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 scrollbar-hide mb-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredFeatures.map((feature) => (
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

      <div className="flex justify-center gap-2 mb-6">
        {featuredFeatures.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted"
            }`}
            data-testid={`dot-indicator-${index}`}
          />
        ))}
      </div>

      <div className="px-6">
        <Sheet open={showAllTools} onOpenChange={setShowAllTools}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              data-testid="button-view-all-tools"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              View All Tools
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>All Islamic Tools</SheetTitle>
              <SheetDescription>
                Choose from our comprehensive collection of Islamic resources
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden"
                    onClick={() => {
                      setLocation(feature.path);
                      setShowAllTools(false);
                    }}
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div
                      className="h-24 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${feature.backgroundImage})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-white" />
                          <h4 className="text-sm font-semibold text-white line-clamp-1">
                            {feature.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
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
          <div className="flex items-center gap-2">
            <Select value={layoutMode} onValueChange={(value: LayoutMode) => setLayoutMode(value)}>
              <SelectTrigger className="w-[140px]" data-testid="select-layout-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appgrid">App Grid</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="categorized">Categorized</SelectItem>
                <SelectItem value="quickaccess">Quick Access</SelectItem>
              </SelectContent>
            </Select>
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
            {layoutMode === "appgrid" && "All tools at a glance, phone-style"}
            {layoutMode === "carousel" && "Explore your Islamic tools and resources"}
            {layoutMode === "hybrid" && "Priority tools at top, all others below"}
            {layoutMode === "categorized" && "Tools organized by Islamic practice"}
            {layoutMode === "quickaccess" && "Featured tools + view all drawer"}
          </p>
        </div>

        {layoutMode === "appgrid" && renderAppGridLayout()}
        {layoutMode === "carousel" && renderCarouselLayout()}
        {layoutMode === "hybrid" && renderHybridLayout()}
        {layoutMode === "categorized" && renderCategorizedLayout()}
        {layoutMode === "quickaccess" && renderQuickAccessLayout()}
      </main>

      <BottomNav />
    </div>
  );
}
