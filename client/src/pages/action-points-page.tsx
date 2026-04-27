import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

const actionPoints = [
  {
    id: "1",
    sermonTitle: "The Importance of Patience",
    content: "Practice patience by pausing before reacting to frustrating situations this week",
    completed: true,
    week: 46,
  },
  {
    id: "2",
    sermonTitle: "The Importance of Patience",
    content: "Make dua during times of difficulty, remembering Allah's wisdom",
    completed: true,
    week: 46,
  },
  {
    id: "3",
    sermonTitle: "The Importance of Patience",
    content: "Reflect on a past trial and identify the lessons learned from it",
    completed: false,
    week: 46,
  },
  {
    id: "4",
    sermonTitle: "Building Strong Family Bonds",
    content: "Spend 30 minutes of quality time with family without distractions",
    completed: false,
    week: 47,
  },
  {
    id: "5",
    sermonTitle: "Building Strong Family Bonds",
    content: "Express gratitude to a family member for something specific they do",
    completed: false,
    week: 47,
  },
];

export default function ActionPointsPage() {
  const [completed, setCompleted] = useState<string[]>(
    actionPoints.filter((ap) => ap.completed).map((ap) => ap.id)
  );

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleComplete = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const completedCount = completed.length;
  const totalCount = actionPoints.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
                <Target className="w-6 h-6" />
                Weekly Action Points
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Implement khutbah teachings
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">This Week's Progress</h2>
                <span className="text-2xl font-bold text-primary" data-testid="text-progress">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                You've completed {completedCount} out of {totalCount} action points this week
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {actionPoints.map((point) => (
            <Card key={point.id} className="hover-elevate" data-testid={`card-action-${point.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {point.sermonTitle}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    Week {point.week}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={completed.includes(point.id)}
                    onCheckedChange={() => toggleComplete(point.id)}
                    className="mt-1"
                    data-testid={`checkbox-${point.id}`}
                  />
                  <p
                    className={`flex-1 ${
                      completed.includes(point.id)
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {point.content}
                  </p>
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
