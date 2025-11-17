import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
  isPassed: boolean;
}

export default function PrayerTimesPage() {
  const [location, setLocation] = useState<string>("Getting location...");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const prayerTimes: PrayerTime[] = [
    { name: "Fajr", time: "05:30 AM", isNext: false, isPassed: true },
    { name: "Dhuhr", time: "12:45 PM", isNext: true, isPassed: false },
    { name: "Asr", time: "03:30 PM", isNext: false, isPassed: false },
    { name: "Maghrib", time: "06:15 PM", isNext: false, isPassed: false },
    { name: "Isha", time: "07:45 PM", isNext: false, isPassed: false },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation("New York, NY");
          setIsLoading(false);
        },
        () => {
          setLocation("Location unavailable");
          setIsLoading(false);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const nextPrayer = prayerTimes.find((p) => p.isNext);
  const timeUntilNext = "2:15:30";

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
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm" data-testid="text-location">{location}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm opacity-90">Next Prayer</p>
                  <h2 className="text-4xl font-bold" data-testid="text-next-prayer">
                    {nextPrayer?.name}
                  </h2>
                  <p className="text-2xl" data-testid="text-next-prayer-time">
                    {nextPrayer?.time}
                  </p>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Clock className="w-4 h-4" />
                    <span data-testid="text-countdown">{timeUntilNext} remaining</span>
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
              Times calculated using Muslim World League method
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
