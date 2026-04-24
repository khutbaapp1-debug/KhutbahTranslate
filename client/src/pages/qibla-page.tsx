import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, RotateCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateQiblaDirection, getCardinalDirection } from "@/lib/qibla";
import { useToast } from "@/hooks/use-toast";

export default function QiblaPage() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [calibrated, setCalibrated] = useState(false);
  const [compassSupported, setCompassSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      setCompassSupported(true);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          const result = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(result.direction);
          setDistance(result.distance);
          setIsLoading(false);
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Please enable location access to use the Qibla compass.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!compassSupported) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(360 - event.alpha);
        setCalibrated(true);
      }
    };

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [compassSupported]);

  const refreshLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          const result = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(result.direction);
          setDistance(result.distance);
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check permissions.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const needleRotation = compassSupported ? qiblaDirection - heading : qiblaDirection;

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Qibla Compass
          </h1>
          {location && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={refreshLocation}
              data-testid="button-refresh-location"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-screen-md mx-auto">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-64 rounded-full mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </div>
        ) : location ? (
          <>
            <div className="flex flex-col items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span data-testid="text-location" className="font-mono text-xs">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </Badge>
              
              {compassSupported && !calibrated && (
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Move your device in a figure-8 pattern to calibrate the compass
                </p>
              )}

              {!compassSupported && (
                <Badge variant="outline" className="text-xs">
                  Static Mode - Compass sensor not available
                </Badge>
              )}
            </div>

            <div className="relative w-80 h-80 mx-auto perspective-1000" data-testid="compass-container">
              <div 
                className="absolute inset-0 rounded-full border-4 border-border bg-gradient-to-br from-card via-card to-card/80 shadow-2xl"
                style={{
                  transform: 'rotateX(5deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="absolute inset-4 rounded-full border-2 border-muted/50" 
                     style={{ transform: 'translateZ(2px)' }} 
                />
                <div className="absolute inset-8 rounded-full border border-muted/30"
                     style={{ transform: 'translateZ(4px)' }} 
                />
                
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    transform: compassSupported ? `rotate(${-heading}deg)` : 'none',
                    transition: 'transform 0.5s ease-out'
                  }}
                >
                  <div className="absolute top-4 text-xs font-bold text-primary"
                       style={{ 
                         transform: compassSupported ? `rotate(${heading}deg)` : 'none',
                         transition: 'transform 0.5s ease-out'
                       }}
                  >
                    N
                  </div>
                  <div className="absolute right-4 text-xs font-semibold text-muted-foreground"
                       style={{ 
                         transform: compassSupported ? `rotate(${heading}deg)` : 'none',
                         transition: 'transform 0.5s ease-out'
                       }}
                  >
                    E
                  </div>
                  <div className="absolute bottom-4 text-xs font-semibold text-muted-foreground"
                       style={{ 
                         transform: compassSupported ? `rotate(${heading}deg)` : 'none',
                         transition: 'transform 0.5s ease-out'
                       }}
                  >
                    S
                  </div>
                  <div className="absolute left-4 text-xs font-semibold text-muted-foreground"
                       style={{ 
                         transform: compassSupported ? `rotate(${heading}deg)` : 'none',
                         transition: 'transform 0.5s ease-out'
                       }}
                  >
                    W
                  </div>
                </div>

                <div
                  className="absolute inset-0 transition-transform duration-500 ease-out"
                  style={{ 
                    transform: `rotate(${needleRotation}deg) translateZ(8px)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Navigation
                      className="w-24 h-24 text-primary drop-shadow-2xl"
                      fill="currentColor"
                      data-testid="compass-needle"
                      style={{
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                      }}
                    />
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                     style={{ transform: 'translateZ(10px)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-primary shadow-xl ring-4 ring-primary/20" />
                </div>
              </div>

              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
                <div className="text-4xl font-bold text-primary mb-1" data-testid="text-qibla-degrees">
                  {Math.round(qiblaDirection)}°
                </div>
                <div className="text-lg font-semibold text-muted-foreground">
                  {getCardinalDirection(qiblaDirection)}
                </div>
              </div>
            </div>

            <Card className="mt-20">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Direction to Kaaba</span>
                  <span className="text-lg font-semibold" data-testid="text-qibla-direction">
                    {Math.round(qiblaDirection)}° {getCardinalDirection(qiblaDirection)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Distance to Makkah</span>
                  <span className="text-lg font-semibold" data-testid="text-distance">
                    {distance.toFixed(0)} km
                  </span>
                </div>
                {compassSupported && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Heading</span>
                    <span className="text-lg font-semibold">
                      {Math.round(heading)}°
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Compass Mode</span>
                  <Badge variant={compassSupported ? "default" : "secondary"} className="text-xs">
                    {compassSupported ? "Dynamic" : "Static"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground max-w-sm mx-auto">
              {compassSupported 
                ? "Hold your device flat and rotate until the needle points upward to face the Qibla" 
                : "The needle shows the absolute direction to Mecca from your current location"}
            </p>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Location Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We need your location to calculate the Qibla direction accurately.
                </p>
                <Button onClick={refreshLocation} data-testid="button-get-location">
                  <MapPin className="w-4 h-4 mr-2" />
                  Enable Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
