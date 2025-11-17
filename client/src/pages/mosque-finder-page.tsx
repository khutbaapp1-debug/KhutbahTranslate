import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation, Clock } from "lucide-react";

const mosques = [
  {
    id: "1",
    name: "Central Mosque",
    address: "123 Main Street, New York, NY",
    distance: "0.5 km",
    prayerTimes: { fajr: "05:30", dhuhr: "12:45", asr: "15:30", maghrib: "18:15", isha: "19:45" },
  },
  {
    id: "2",
    name: "Islamic Center",
    address: "456 Oak Avenue, New York, NY",
    distance: "1.2 km",
    prayerTimes: { fajr: "05:30", dhuhr: "12:45", asr: "15:30", maghrib: "18:15", isha: "19:45" },
  },
  {
    id: "3",
    name: "Masjid Al-Noor",
    address: "789 Elm Street, New York, NY",
    distance: "2.1 km",
    prayerTimes: { fajr: "05:30", dhuhr: "12:45", asr: "15:30", maghrib: "18:15", isha: "19:45" },
  },
];

export default function MosqueFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
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
        <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Map would display here</p>
            <p className="text-xs">Showing mosques near your location</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Nearby Mosques</h2>
          {mosques.map((mosque) => (
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
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {mosque.distance}
                    </Badge>
                  </div>

                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <div className="flex gap-3">
                      <span>Fajr: {mosque.prayerTimes.fajr}</span>
                      <span>Dhuhr: {mosque.prayerTimes.dhuhr}</span>
                      <span>Maghrib: {mosque.prayerTimes.maghrib}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" data-testid={`button-directions-${mosque.id}`}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
