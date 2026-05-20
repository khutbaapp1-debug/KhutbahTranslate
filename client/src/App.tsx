import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AdsLoader } from "@/components/ads-loader";
import { BannerAd } from "@/components/banner-ad";
import { lazy, Suspense, useEffect } from "react";
import { initNative } from "@/lib/native-init";
import { PageSkeleton } from "@/components/page-skeleton";

const HomePage = lazy(() => import("@/pages/home-page"));
const PrayerTimesPage = lazy(() => import("@/pages/prayer-times-page"));
const TasbihPage = lazy(() => import("@/pages/tasbih-page"));
const QiblaPage = lazy(() => import("@/pages/qibla-page"));
const QuranPage = lazy(() => import("@/pages/quran-page"));
const DuasPage = lazy(() => import("@/pages/duas-page"));
const DailyHadithPage = lazy(() => import("@/pages/daily-hadith-page"));
const NamesOfAllahPage = lazy(() => import("@/pages/names-of-allah-page"));
const KhutbahPage = lazy(() => import("@/pages/khutbah-page"));
const MosqueFinderPage = lazy(() => import("@/pages/mosque-finder-page"));
const SalahGuidePage = lazy(() => import("@/pages/salah-guide-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const NotificationSettingsPage = lazy(() => import("@/pages/notification-settings-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const LandingPage = lazy(() => import("@/pages/landing-page"));
const PrivacyPage = lazy(() => import("@/pages/privacy-page"));
const TermsPage = lazy(() => import("@/pages/terms-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/landing" component={LandingPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />

        <Route path="/prayer" component={PrayerTimesPage} />
        <Route path="/tasbih" component={TasbihPage} />
        <Route path="/qibla" component={QiblaPage} />

        <Route path="/quran" component={QuranPage} />
        <Route path="/duas" component={DuasPage} />
        <Route path="/hadith" component={DailyHadithPage} />
        <Route path="/names-of-allah" component={NamesOfAllahPage} />

        <Route path="/khutbah" component={KhutbahPage} />

        <Route path="/mosques" component={MosqueFinderPage} />

        <Route path="/salah-guide" component={SalahGuidePage} />

        <Route path="/profile" component={ProfilePage} />
        <Route path="/notifications" component={NotificationSettingsPage} />
        <Route path="/settings" component={SettingsPage} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    initNative();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div style={{ paddingBottom: 'var(--banner-height, 108px)' }}>
            <Toaster />
            <AdsLoader />
            <Router />
            <BannerAd />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
