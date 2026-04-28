import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { BannerAd } from "@/components/banner-ad";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation, Clock, Loader2, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import { useToast } from "@/hooks/use-toast";

interface Mosque {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: string;
  address: string;
  denomination?: string;
  website?: string;
  phone?: string;
}

// Custom mosque marker icon
const mosqueIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// User location marker icon
const userIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MosqueFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user's geolocation on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "Unable to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access to find nearby mosques.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          setLocationError(errorMessage);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: errorMessage,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      const error = "Geolocation is not supported by your browser";
      setLocationError(error);
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: error,
      });
    }
  }, [toast]);

  // Fetch nearby mosques when user location is available
  const queryUrl = userLocation
    ? `/api/mosques/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`
    : null;

  const { data: mosques = [], isLoading, error } = useQuery<Mosque[]>({
    queryKey: ["/api/mosques/nearby", userLocation?.latitude, userLocation?.longitude],
    queryFn: async () => {
      if (!queryUrl) return [];
      const response = await fetch(queryUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch mosques: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!userLocation,
  });

  // Filter mosques based on search query
  const filteredMosques = mosques.filter((mosque) => {
    const query = searchQuery.toLowerCase();
    return (
      mosque.name.toLowerCase().includes(query) ||
      mosque.address.toLowerCase().includes(query)
    );
  });

  const handleGetDirections = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
    window.open(url, "_blank");
  };

  const mapCenter: LatLngExpression = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [40.7128, -74.0060]; // Default to NYC

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Mosque Finder
          </h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search mosques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </header>

      <main className="p-6 space-y-4 max-w-screen-lg mx-auto">
        {/* Map Container */}
        <div className="rounded-lg overflow-hidden border border-border h-64">
          {!userLocation && !locationError && (
            <div className="h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Getting your location...</p>
              </div>
            </div>
          )}

          {locationError && (
            <div className="h-full flex items-center justify-center bg-muted">
              <div className="text-center text-muted-foreground p-6">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-destructive" />
                <p className="text-sm font-medium mb-1">Location Access Required</p>
                <p className="text-xs">{locationError}</p>
              </div>
            </div>
          )}

          {userLocation && (
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                <Popup>Your Location</Popup>
              </Marker>
              
              {/* Mosque markers */}
              {filteredMosques.map((mosque) => (
                <Marker
                  key={mosque.id}
                  position={[mosque.latitude, mosque.longitude]}
                  icon={mosqueIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{mosque.name}</p>
                      <p className="text-xs text-muted-foreground">{mosque.distance} km away</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Finding nearby mosques...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Failed to load mosques. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mosque list */}
        {!isLoading && !error && userLocation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Nearby Mosques {filteredMosques.length > 0 && `(${filteredMosques.length})`}
              </h2>
            </div>

            {filteredMosques.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No mosques found matching your search"
                      : "No mosques found within 10km of your location"}
                  </p>
                </CardContent>
              </Card>
            )}

            {filteredMosques.map((mosque) => (
              <Card key={mosque.id} className="hover-elevate" data-testid={`card-mosque-${mosque.id}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{mosque.name}</h3>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{mosque.address}</span>
                        </div>
                        {mosque.phone && (
                          <p className="text-sm text-muted-foreground mt-2">
                            📞 {mosque.phone}
                          </p>
                        )}
                        {mosque.website && (
                          <a
                            href={mosque.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-1 block"
                          >
                            Visit Website
                          </a>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {mosque.distance} km
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleGetDirections(mosque)}
                      data-testid={`button-directions-${mosque.id}`}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BannerAd />
      <BottomNav />
    </div>
  );
}
