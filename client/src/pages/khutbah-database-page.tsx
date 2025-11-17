import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Eye, Crown } from "lucide-react";
import { useState } from "react";

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
  const isPremium = false;

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Crown className="w-6 h-6 text-primary" />
              Khutbah Database
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Premium Feature</p>
          </div>
        </header>

        <main className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-md w-full border-primary/50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Upgrade to Premium</h2>
              <p className="text-muted-foreground">
                Access thousands of khutbahs from mosques around the world with full translations and transcripts
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Search by topic, date, or mosque</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>AI-generated action points</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Save and organize favorites</span>
                </div>
              </div>
              <Button className="w-full" data-testid="button-upgrade">
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
              Khutbah Database
            </h1>
            <Badge variant="default" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </Badge>
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
