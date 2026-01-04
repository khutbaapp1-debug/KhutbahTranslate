import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Lightbulb, 
  ChevronRight, 
  Calendar, 
  Users, 
  Briefcase, 
  Heart, 
  Sparkles,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { KhutbahGuideline } from "@shared/schema";

const categoryIcons: Record<string, typeof Users> = {
  "Family": Users,
  "Work": Briefcase,
  "Spiritual Practice": Heart,
  "Community": Users,
  "Personal Growth": Sparkles,
};

const categoryColors: Record<string, string> = {
  "Family": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Work": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Spiritual Practice": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Community": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Personal Growth": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

interface Suggestion {
  category: string;
  suggestion: string;
  completed: boolean;
}

export default function KhutbahGuidelinesPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: guidelines, isLoading } = useQuery<KhutbahGuideline[]>({
    queryKey: ['/api/khutbah-guidelines'],
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, suggestions }: { id: string; suggestions: Suggestion[] }) => {
      return apiRequest('PATCH', `/api/khutbah-guidelines/${id}`, { suggestions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/khutbah-guidelines'] });
    },
  });

  const toggleSuggestion = (guideline: KhutbahGuideline, suggestionIndex: number) => {
    const suggestions = (guideline.suggestions as Suggestion[]).map((s, i) => 
      i === suggestionIndex ? { ...s, completed: !s.completed } : s
    );
    updateMutation.mutate({ id: guideline.id, suggestions });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Lightbulb className="w-6 h-6 text-primary" />
              Khutbah Guidelines
            </h1>
          </div>
        </header>

        <main className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Sign In Required</h2>
              <p className="text-muted-foreground">
                Sign in to access your personalized weekly implementation plans from khutbahs.
              </p>
              <Button className="w-full" onClick={() => { window.location.href = "/api/login"; }} data-testid="button-signin">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    );
  }

  const sortedGuidelines = guidelines?.sort((a, b) => 
    new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
  ) || [];

  const currentGuideline = sortedGuidelines[0];
  const suggestions = currentGuideline?.suggestions as Suggestion[] | undefined;
  const completedCount = suggestions?.filter(s => s.completed).length || 0;
  const totalCount = suggestions?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  Weekly Guidelines
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Implement khutbah teachings
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : sortedGuidelines.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Lightbulb className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No Guidelines Yet</h2>
              <p className="text-muted-foreground">
                Record a khutbah to generate personalized weekly implementation suggestions.
              </p>
              <Button onClick={() => setLocation('/khutbah')} data-testid="button-record-khutbah">
                <RefreshCw className="w-4 h-4 mr-2" />
                Go to Khutbah
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentGuideline && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{currentGuideline.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        Week of {format(new Date(currentGuideline.weekStartDate), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary" data-testid="text-progress-count">
                        {completedCount}/{totalCount}
                      </span>
                      <p className="text-xs text-muted-foreground">completed</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {completedCount === totalCount 
                      ? "Excellent work! All guidelines completed." 
                      : `${totalCount - completedCount} more to go this week`}
                  </p>
                </CardContent>
              </Card>
            )}

            {currentGuideline && suggestions && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold px-1">This Week's Actions</h2>
                {suggestions.map((suggestion, index) => {
                  const Icon = categoryIcons[suggestion.category] || Sparkles;
                  const colorClass = categoryColors[suggestion.category] || "bg-gray-500/10 text-gray-600";
                  
                  return (
                    <Card 
                      key={index} 
                      className={`hover-elevate transition-opacity ${suggestion.completed ? 'opacity-60' : ''}`}
                      data-testid={`card-suggestion-${index}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={suggestion.completed}
                            onCheckedChange={() => toggleSuggestion(currentGuideline, index)}
                            className="mt-1"
                            disabled={updateMutation.isPending}
                            data-testid={`checkbox-suggestion-${index}`}
                          />
                          <div className="flex-1 space-y-2">
                            <Badge variant="secondary" className={`${colorClass} text-xs`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {suggestion.category}
                            </Badge>
                            <p className={`text-sm ${suggestion.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {suggestion.suggestion}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {sortedGuidelines.length > 1 && (
              <div className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold px-1 text-muted-foreground">Previous Weeks</h2>
                {sortedGuidelines.slice(1).map((guideline) => {
                  const prevSuggestions = guideline.suggestions as Suggestion[];
                  const prevCompleted = prevSuggestions?.filter(s => s.completed).length || 0;
                  const prevTotal = prevSuggestions?.length || 0;
                  
                  return (
                    <Card key={guideline.id} className="opacity-70" data-testid={`card-prev-guideline-${guideline.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{guideline.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Week of {format(new Date(guideline.weekStartDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {prevCompleted}/{prevTotal}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
