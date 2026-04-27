import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Eye } from "lucide-react";
import { useState, useEffect } from "react";

const publicKhutbahs = [
  {
    id: "1",
    title: "The Importance of Knowledge in Islam",
    mosqueName: "Grand Mosque",
    date: "2025-11-15",
    duration: "35 min",
    topic: "Knowledge",
    views: 1234,
  },
  {
    id: "2",
    title: "Building Strong Family Bonds",
    mosqueName: "City Islamic Center",
    date: "2025-11-08",
    duration: "42 min",
    topic: "Family",
    views: 892,
  },
  {
    id: "3",
    title: "The Virtues of Patience",
    mosqueName: "Masjid Al-Rahman",
    date: "2025-11-01",
    duration: "38 min",
    topic: "Character",
    views: 2156,
  },
];

export default function KhutbahDatabasePage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Khutbah Database
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search khutbahs by topic, mosque, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </header>

      <main className="p-6 space-y-4 max-w-screen-lg mx-auto">
        {publicKhutbahs.map((khutbah) => (
          <Card key={khutbah.id} className="hover-elevate" data-testid={`card-khutbah-${khutbah.id}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-foreground flex-1">
                      {khutbah.title}
                    </h3>
                    <Badge variant="secondary">{khutbah.topic}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{khutbah.mosqueName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(khutbah.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{khutbah.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{khutbah.duration}</span>
                  <Button variant="default" size="sm" data-testid={`button-view-${khutbah.id}`}>
                    View Khutbah
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
