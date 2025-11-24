import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";

import HomePage from "@/pages/home-page";
import PrayerTimesPage from "@/pages/prayer-times-page";
import TasbihPage from "@/pages/tasbih-page";
import QiblaPage from "@/pages/qibla-page";
import QuranPage from "@/pages/quran-page";
import DuasPage from "@/pages/duas-page";
import DailyHadithPage from "@/pages/daily-hadith-page";
import NamesOfAllahPage from "@/pages/names-of-allah-page";
import KhutbahPage from "@/pages/khutbah-page";
import SermonHistoryPage from "@/pages/sermon-history-page";
import MosqueFinderPage from "@/pages/mosque-finder-page";
import RamadanPage from "@/pages/ramadan-page";
import HijriCalendarPage from "@/pages/hijri-calendar-page";
import KhutbahDatabasePage from "@/pages/khutbah-database-page";
import ActionPointsPage from "@/pages/action-points-page";
import AnalyticsPage from "@/pages/analytics-page";
import JournalPage from "@/pages/journal-page";
import ProfilePage from "@/pages/profile-page";
import PremiumPage from "@/pages/premium-page";
import NotificationSettingsPage from "@/pages/notification-settings-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/prayer" component={PrayerTimesPage} />
      <Route path="/tasbih" component={TasbihPage} />
      <Route path="/qibla" component={QiblaPage} />
      
      <Route path="/quran" component={QuranPage} />
      <Route path="/duas" component={DuasPage} />
      <Route path="/hadith" component={DailyHadithPage} />
      <Route path="/names-of-allah" component={NamesOfAllahPage} />
      
      <Route path="/khutbah" component={KhutbahPage} />
      <Route path="/sermons" component={SermonHistoryPage} />
      <Route path="/khutbah-database" component={KhutbahDatabasePage} />
      
      <Route path="/mosques" component={MosqueFinderPage} />
      <Route path="/ramadan" component={RamadanPage} />
      <Route path="/calendar" component={HijriCalendarPage} />
      
      <Route path="/action-points" component={ActionPointsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/journal" component={JournalPage} />
      
      <Route path="/profile" component={ProfilePage} />
      <Route path="/premium" component={PremiumPage} />
      <Route path="/notifications" component={NotificationSettingsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
