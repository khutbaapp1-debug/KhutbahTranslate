import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Crown, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isPremiumUser } from "@/lib/premium";

const journalEntries = [
  {
    id: "1",
    sermonTitle: "The Importance of Patience",
    content: "Today's khutbah really resonated with me. I've been struggling with patience at work, and the reminder that every trial is a test from Allah gave me a new perspective. I'm going to try to pause and make dua before reacting to stressful situations.",
    prompt: "What lesson from today's khutbah will you apply this week?",
    mood: "Reflective",
    date: "2025-11-15",
  },
  {
    id: "2",
    sermonTitle: "Building Strong Family Bonds",
    content: "The stories about the Prophet's (PBUH) kindness to his family were beautiful. I realized I need to be more present with my family and less distracted by my phone.",
    prompt: "How can you strengthen your family relationships based on today's khutbah?",
    mood: "Inspired",
    date: "2025-11-08",
  },
];

export default function JournalPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const isPremium = isPremiumUser(user);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Crown className="w-6 h-6 text-primary" />
              Reflection Journal
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
                Reflect on khutbah teachings with guided journal prompts and track your spiritual growth over time
              </p>
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
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
                <BookOpen className="w-6 h-6" />
                Reflection Journal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your spiritual reflections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
              <Button size="icon" onClick={() => setIsCreating(true)} data-testid="button-new-entry">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
        {isCreating && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>New Reflection</CardTitle>
              <p className="text-sm text-muted-foreground">
                Reflect on today's khutbah: "The Importance of Gratitude"
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Guided Prompt:</p>
                <p className="text-sm">
                  What are three specific blessings you're grateful for today, and how can you show gratitude through your actions this week?
                </p>
              </div>

              <Textarea
                placeholder="Write your reflection here..."
                className="min-h-40"
                data-testid="textarea-reflection"
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button data-testid="button-save">
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {journalEntries.map((entry) => (
            <Card key={entry.id} className="hover-elevate" data-testid={`card-journal-${entry.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base">{entry.sermonTitle}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {entry.mood}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-accent/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
                  <p className="text-sm italic">{entry.prompt}</p>
                </div>
                <p className="text-sm leading-relaxed">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
