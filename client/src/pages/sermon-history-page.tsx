import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, MapPin, Calendar, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

const sermons = [
  {
    id: "1",
    title: "The Importance of Patience",
    mosqueName: "Central Mosque",
    date: "2025-11-15",
    duration: 2400,
    segmentCount: 45,
  },
  {
    id: "2",
    title: "Virtues of Ramadan",
    mosqueName: "Islamic Center",
    date: "2025-11-08",
    duration: 1800,
    segmentCount: 32,
  },
];

export default function SermonHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-4">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            My Sermons
          </h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sermons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-screen-lg mx-auto space-y-4">
        {sermons.map((sermon) => (
          <Card key={sermon.id} className="hover-elevate" data-testid={`card-sermon-${sermon.id}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {sermon.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{sermon.mosqueName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(sermon.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(sermon.duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {sermon.segmentCount} segments
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" data-testid={`button-view-${sermon.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-delete-${sermon.id}`}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
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
