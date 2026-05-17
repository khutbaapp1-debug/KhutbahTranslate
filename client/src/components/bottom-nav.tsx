import { useState, useEffect } from "react";
import { Home, Book, Clock, Circle, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { isNativeApp } from "@/lib/mobile-ads";
import { onBannerHeight } from "@/lib/banner-height";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/quran", icon: Book, label: "Qur'an" },
  { path: "/prayer", icon: Clock, label: "Prayer" },
  { path: "/tasbih", icon: Circle, label: "Tasbih" },
  { path: "/duas", icon: Heart, label: "Duas" },
];

export function BottomNav() {
  const [location] = useLocation();
  const [adHeight, setAdHeight] = useState(0);

  useEffect(() => {
    if (!isNativeApp()) return;
    return onBannerHeight(setAdHeight);
  }, []);

  return (
    <nav className="fixed left-0 right-0 z-50 bg-background/95 border-t border-border pb-safe" style={{ bottom: `calc(${adHeight}px + env(safe-area-inset-bottom))`, '--bottom-nav-height': '64px' } as React.CSSProperties}>
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-md transition-colors hover-elevate ${
                isActive ? "text-primary" : "text-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
