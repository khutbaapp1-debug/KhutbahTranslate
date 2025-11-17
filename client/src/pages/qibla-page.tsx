import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QiblaPage() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState<string>("Getting location...");
  const [distance, setDistance] = useState<string>("Calculating...");
  const [isLoading, setIsLoading] = useState(true);
  const [calibrated, setCalibrated] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          const kaabaLat = 21.4225;
          const kaabaLng = 39.8262;
          
          const direction = calculateQiblaDirection(latitude, longitude, kaabaLat, kaabaLng);
          setQiblaDirection(direction);
          setLocation("New York, NY");
          setDistance("6,839 km");
          setIsLoading(false);
        },
        () => {
          setLocation("Location unavailable");
          setIsLoading(false);
        }
      );
    }

    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setHeading(360 - event.alpha);
          setCalibrated(true);
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  function calculateQiblaDirection(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const dLng = toRad(lng2 - lng1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let bearing = toDeg(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }

  const needleRotation = qiblaDirection - heading;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Qibla Compass
          </h1>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-screen-md mx-auto">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-64 rounded-full mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span data-testid="text-location">{location}</span>
              </Badge>
              
              {!calibrated && (
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Move your device in a figure-8 pattern to calibrate the compass
                </p>
              )}
            </div>

            <div className="relative w-80 h-80 mx-auto" data-testid="compass-container">
              <div className="absolute inset-0 rounded-full border-4 border-border bg-card">
                <div className="absolute inset-4 rounded-full border-2 border-muted" />
                <div className="absolute inset-8 rounded-full border border-muted" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-4 text-xs font-semibold">N</div>
                  <div className="absolute right-4 text-xs font-semibold">E</div>
                  <div className="absolute bottom-4 text-xs font-semibold">S</div>
                  <div className="absolute left-4 text-xs font-semibold">W</div>
                </div>

                <div
                  className="absolute inset-0 transition-transform duration-500 ease-out"
                  style={{ transform: `rotate(${needleRotation}deg)` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Navigation
                      className="w-24 h-24 text-primary drop-shadow-lg"
                      fill="currentColor"
                      data-testid="compass-needle"
                    />
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Direction to Kaaba</span>
                  <span className="text-lg font-semibold" data-testid="text-qibla-direction">
                    {Math.round(qiblaDirection)}°
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Distance to Makkah</span>
                  <span className="text-lg font-semibold" data-testid="text-distance">
                    {distance}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Heading</span>
                  <span className="text-lg font-semibold">
                    {Math.round(heading)}°
                  </span>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground max-w-sm mx-auto">
              Hold your device flat and rotate until the needle points upward to face the Qibla
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
