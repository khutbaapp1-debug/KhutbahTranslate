import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { InlineAd } from "@/components/google-ad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
  isPassed: boolean;
}

interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: {
    nextPrayer: string;
    timeRemaining: string;
    hours: number;
    minutes: number;
    seconds: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function PrayerTimesPage() {
  const [coords, setCoords] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationName, setLocationName] = useState<string>("Getting location...");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: prayerData, isLoading, error } = useQuery<PrayerTimesData>({
    queryKey: coords 
      ? [`/api/prayer-times?latitude=${coords.latitude}&longitude=${coords.longitude}`]
      : ["/api/prayer-times"],
    enabled: coords !== null,
  });

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
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
        
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
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

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Prayer Times
            </h1>
          </div>
        </header>
        <main className="p-6 max-w-screen-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Error loading prayer times. Please try again.</p>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const prayerTimes: PrayerTime[] = prayerData ? [
    { 
      name: "Fajr", 
      time: prayerData.fajr, 
      isNext: prayerData.nextPrayer?.nextPrayer === "Fajr", 
      isPassed: isTimePassed(prayerData.fajr, currentTime)
    },
    { 
      name: "Dhuhr", 
      time: prayerData.dhuhr, 
      isNext: prayerData.nextPrayer?.nextPrayer === "Dhuhr", 
      isPassed: isTimePassed(prayerData.dhuhr, currentTime)
    },
    { 
      name: "Asr", 
      time: prayerData.asr, 
      isNext: prayerData.nextPrayer?.nextPrayer === "Asr", 
      isPassed: isTimePassed(prayerData.asr, currentTime)
    },
    { 
      name: "Maghrib", 
      time: prayerData.maghrib, 
      isNext: prayerData.nextPrayer?.nextPrayer === "Maghrib", 
      isPassed: isTimePassed(prayerData.maghrib, currentTime)
    },
    { 
      name: "Isha", 
      time: prayerData.isha, 
      isNext: prayerData.nextPrayer?.nextPrayer === "Isha", 
      isPassed: isTimePassed(prayerData.isha, currentTime)
    },
  ] : [];

  const nextPrayer = prayerTimes.find((p) => p.isNext);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Prayer Times
          </h1>
          <Button variant="ghost" size="icon" data-testid="button-location-edit">
            <MapPin className="w-5 h-5" />
          </Button>
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
        
        {!locationError && (isLoading || !prayerData) ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ) : !locationError && prayerData ? (
          <>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm" data-testid="text-location">{locationName}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm opacity-90">Next Prayer</p>
                  <h2 className="text-4xl font-bold" data-testid="text-next-prayer">
                    {nextPrayer?.name || prayerData.nextPrayer?.nextPrayer}
                  </h2>
                  <p className="text-2xl" data-testid="text-next-prayer-time">
                    {nextPrayer?.time}
                  </p>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Clock className="w-4 h-4" />
                    <span data-testid="text-countdown">
                      {prayerData.nextPrayer?.timeRemaining} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Prayer Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prayerTimes.map((prayer) => (
                  <div
                    key={prayer.name}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      prayer.isNext
                        ? "border-primary bg-accent"
                        : "border-border"
                    } ${prayer.isPassed ? "opacity-50" : ""}`}
                    data-testid={`prayer-${prayer.name.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        prayer.isNext ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-lg">{prayer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold" data-testid={`time-${prayer.name.toLowerCase()}`}>
                        {prayer.time}
                      </span>
                      {prayer.isPassed && (
                        <Badge variant="secondary" className="text-xs">
                          Passed
                        </Badge>
                      )}
                      {prayer.isNext && (
                        <Badge variant="default" className="text-xs">
                          Next
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              Times calculated using ISNA method based on your location
            </p>
            
            {/* Google Ad Placement */}
            <InlineAd />
          </>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}

function isTimePassed(timeStr: string, currentTime: Date): boolean {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return false;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3];
  
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  const prayerMinutes = hours * 60 + minutes;
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  return currentMinutes > prayerMinutes;
}
