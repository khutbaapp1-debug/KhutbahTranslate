import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AdsLoader } from "@/components/ads-loader";
import { useEffect } from "react";
import { initNative } from "@/lib/native-init";

import HomePage from "@/pages/home-page";
import PrayerTimesPage from "@/pages/prayer-times-page";
import TasbihPage from "@/pages/tasbih-page";
import QiblaPage from "@/pages/qibla-page";
import QuranPage from "@/pages/quran-page";
import DuasPage from "@/pages/duas-page";
import DailyHadithPage from "@/pages/daily-hadith-page";
import NamesOfAllahPage from "@/pages/names-of-allah-page";
import KhutbahPage from "@/pages/khutbah-page";
import MosqueFinderPage from "@/pages/mosque-finder-page";
import SalahGuidePage from "@/pages/salah-guide-page";
import ProfilePage from "@/pages/profile-page";
import NotificationSettingsPage from "@/pages/notification-settings-page";
import SettingsPage from "@/pages/settings-page";
import LandingPage from "@/pages/landing-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
          <Toaster />
          <AdsLoader />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
