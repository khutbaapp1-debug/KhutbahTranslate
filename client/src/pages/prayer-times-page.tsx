import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { isNativeApp } from "@/lib/mobile-ads";
import { computePrayerTimes, getCachedCoords, setCachedCoords, PrayerTimesResult } from "@/lib/prayer-times-client";
import { scheduleAllNotifications } from "@/lib/notification-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Clock, Settings, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const CALCULATION_METHODS = {
  ISNA: 'Islamic Society of North America',
  MWL: 'Muslim World League',
  EGYPTIAN: 'Egyptian General Authority',
  KARACHI: 'University of Karachi',
  MAKKAH: 'Umm Al-Qura, Makkah',
  JAFARI: 'Shia Ithna-Ashari (Tehran)',
  TEHRAN: 'Institute of Geophysics, Tehran',
} as const;

type CalculationMethodKey = keyof typeof CALCULATION_METHODS;

interface PrayerTime {
  name: string;
  time: Date;
  isNext: boolean;
  isPassed: boolean;
}

export default function PrayerTimesPage() {
  const [, setLocation] = useLocation();
  const coordsRef = useRef<{latitude: number; longitude: number} | null>(null);
  const [locationName, setLocationName] = useState<string>("Getting location...");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationError, setLocationError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethodKey>(() => {
    const saved = localStorage.getItem('prayerCalculationMethod');
    return (saved as CalculationMethodKey) || 'ISNA';
  });
  const [asrMethod, setAsrMethod] = useState<'standard' | 'hanafi'>(() => {
    const saved = localStorage.getItem('asrCalculationMethod');
    return (saved as 'standard' | 'hanafi') || 'standard';
  });
  const { toast } = useToast();

  const [prayerData, setPrayerData] = useState<PrayerTimesResult | null>(() => {
    const cached = getCachedCoords();
    if (!cached) return null;
    try {
      return computePrayerTimes(
        cached.latitude, cached.longitude, new Date(),
        localStorage.getItem('prayerCalculationMethod') || 'ISNA',
        localStorage.getItem('asrCalculationMethod') || 'standard'
      );
    } catch { return null; }
  });

  const handleMethodChange = (method: CalculationMethodKey) => {
    setCalculationMethod(method);
    localStorage.setItem('prayerCalculationMethod', method);
    if (coordsRef.current) {
      setPrayerData(computePrayerTimes(coordsRef.current.latitude, coordsRef.current.longitude, new Date(), method, asrMethod));
    }
  };

  const handleAsrMethodChange = (method: 'standard' | 'hanafi') => {
    setAsrMethod(method);
    localStorage.setItem('asrCalculationMethod', method);
    if (coordsRef.current) {
      setPrayerData(computePrayerTimes(coordsRef.current.latitude, coordsRef.current.longitude, new Date(), calculationMethod, method));
    }
  };

  const requestLocation = () => {
    setLocationError(null);
    setLocationName("Getting location...");
    
    if (!navigator.geolocation) {
      setLocationName("Location not supported");
      setLocationError("Your browser doesn't support geolocation.");
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation. Please use a modern browser.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        coordsRef.current = { latitude, longitude };
        setCachedCoords(latitude, longitude);
        setPrayerData(computePrayerTimes(latitude, longitude, new Date(), calculationMethod, asrMethod));
        setLocationError(null);

        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
          .then((res) => res.json())
          .then((data) => {
            const city = data.address?.city || data.address?.town || data.address?.village || "Unknown";
            const state = data.address?.state || "";
            setLocationName(`${city}${state ? `, ${state}` : ""}`);
          })
          .catch(() => {
            setLocationName("Location found");
          });
      },
      (error) => {
        let errorMessage = "";
        
        // Provide specific error messages based on error code
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please click the location icon in your browser's address bar and allow access.";
            setLocationName("Permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your device's location settings.";
            setLocationName("Location unavailable");
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            setLocationName("Request timed out");
            break;
          default:
            errorMessage = "Unable to get your location. Please ensure location services are enabled.";
            setLocationName("Location error");
        }
        
        setLocationError(errorMessage);
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    requestLocation();

    return () => clearInterval(timer);
  }, [toast]);

  useEffect(() => {
    if (!isNativeApp()) return;
    if (coordsRef.current || getCachedCoords()) {
      scheduleAllNotifications().catch(console.error);
    }
  }, []);

  const isFriday = currentTime.getDay() === 5;

  const ordered = prayerData ? [
    { name: 'Fajr',    time: prayerData.fajr },
    { name: 'Dhuhr',   time: prayerData.dhuhr },
    { name: 'Asr',     time: prayerData.asr },
    { name: 'Maghrib', time: prayerData.maghrib },
    { name: 'Isha',    time: prayerData.isha },
  ] : [];
  const nextEntry   = ordered.find(p => p.time > currentTime);
  const isAfterIsha = !nextEntry && prayerData != null;

  const prayerTimes: PrayerTime[] = prayerData ? [
    {
      name: "Fajr",
      time: prayerData.fajr,
      isNext: nextEntry?.name === "Fajr",
      isPassed: isAfterIsha || (prayerData.fajr <= currentTime && nextEntry?.name !== "Fajr"),
    },
    {
      name: isFriday ? "Jummah" : "Dhuhr",
      time: prayerData.dhuhr,
      isNext: nextEntry?.name === "Dhuhr",
      isPassed: isAfterIsha || (prayerData.dhuhr <= currentTime && nextEntry?.name !== "Dhuhr"),
    },
    {
      name: "Asr",
      time: prayerData.asr,
      isNext: nextEntry?.name === "Asr",
      isPassed: isAfterIsha || (prayerData.asr <= currentTime && nextEntry?.name !== "Asr"),
    },
    {
      name: "Maghrib",
      time: prayerData.maghrib,
      isNext: nextEntry?.name === "Maghrib",
      isPassed: isAfterIsha || (prayerData.maghrib <= currentTime && nextEntry?.name !== "Maghrib"),
    },
    {
      name: "Isha",
      time: prayerData.isha,
      isNext: nextEntry?.name === "Isha",
      isPassed: false,
    },
  ] : [];

  const nextPrayer = prayerTimes.find(p => p.isNext);
  const startedPrayers = prayerTimes.filter(p => p.time <= currentTime);
  const currentPrayer = isAfterIsha
    ? prayerTimes.find(p => p.name === "Isha")
    : startedPrayers.length > 0
      ? startedPrayers[startedPrayers.length - 1]
      : undefined;

  const nextPrayerTime = nextEntry?.time ?? prayerData?.fajr;

  return (
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-home">
            <Home className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Prayer Times
          </h1>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-settings">
                <Settings className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Prayer Time Settings</DialogTitle>
                <DialogDescription>
                  Choose your preferred calculation methods
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fajr/Isha Calculation Method</label>
                  <Select value={calculationMethod} onValueChange={(v) => handleMethodChange(v as CalculationMethodKey)}>
                    <SelectTrigger className="w-full" data-testid="select-calculation-method">
                      <SelectValue placeholder="Select calculation method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CALCULATION_METHODS).map(([key, name]) => (
                        <SelectItem key={key} value={key} data-testid={`method-${key.toLowerCase()}`}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asr Calculation Method</label>
                  <Select value={asrMethod} onValueChange={(v) => handleAsrMethodChange(v as 'standard' | 'hanafi')}>
                    <SelectTrigger className="w-full" data-testid="select-asr-method">
                      <SelectValue placeholder="Select Asr method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard" data-testid="asr-standard">
                        Standard (Shafi, Maliki, Hanbali)
                      </SelectItem>
                      <SelectItem value="hanafi" data-testid="asr-hanafi">
                        Hanafi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-md mx-auto">
        {locationError && (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <MapPin className="w-12 h-12 text-destructive" />
                <div>
                  <h3 className="font-semibold mb-2">Location Access Required</h3>
                  <p className="text-sm text-muted-foreground mb-4">{locationError}</p>
                </div>
                <Button onClick={requestLocation} data-testid="button-retry-location">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {!locationError && !prayerData ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ) : !locationError && prayerData ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Prayer Times</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span data-testid="text-location">{locationName}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {prayerTimes.map((prayer) => {
                  const isCurrent = currentPrayer?.name === prayer.name && !prayer.isNext;
                  return (
                    <div
                      key={prayer.name}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isCurrent
                          ? "prayer-current-row border-green-500 bg-green-50 dark:bg-green-950/30"
                          : prayer.isNext
                          ? "border-primary bg-accent"
                          : prayer.isPassed
                          ? "border-border opacity-50"
                          : "border-border"
                      }`}
                      data-testid={`prayer-${prayer.name.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "prayer-current-icon bg-green-500 text-white"
                            : prayer.isNext 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium text-lg block">{prayer.name}</span>
                          {prayer.isNext && (
                            <span className="text-xs text-muted-foreground">
                              {nextPrayerTime && formatCountdown(nextPrayerTime, currentTime, isAfterIsha)} remaining
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold" data-testid={`time-${prayer.name.toLowerCase()}`}>
                          {prayer.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isCurrent && (
                          <Badge className="now-badge bg-green-500 hover:bg-green-600 text-white text-xs">
                            Now
                          </Badge>
                        )}
                        {prayer.isNext && (
                          <Badge variant="default" className="text-xs">
                            Next
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              {CALCULATION_METHODS[calculationMethod]} • Asr: {asrMethod === 'hanafi' ? 'Hanafi' : 'Standard'}
            </p>
          </>
        ) : null}
      </main>

    </div>
  );
}

function formatCountdown(prayerTime: Date, currentTime: Date, isTomorrow = false): string {
  const target = isTomorrow ? new Date(prayerTime.getTime() + 86400000) : prayerTime;
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - currentTime.getTime()) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
