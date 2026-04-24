import { useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Book, Activity, Clock, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { isPremiumUser } from "@/lib/premium";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isPremium = isPremiumUser(user);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const stats = [
    { label: "Sermons Attended", value: 12, icon: Book, trend: "+3 this month" },
    { label: "Total Dhikr", value: "3.4K", icon: Activity, trend: "+450 this week" },
    { label: "Prayers On Time", value: "89%", icon: Clock, trend: "+5% this week" },
    { label: "Qur'an Pages Read", value: 42, icon: Book, trend: "+12 this week" },
  ];

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-nav">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Crown className="w-6 h-6 text-primary" />
              Analytics
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
                Track your spiritual progress with detailed analytics on prayers, dhikr, Qur'an reading, and sermon attendance
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
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
                <TrendingUp className="w-6 h-6" />
                Your Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Track your spiritual progress</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </Badge>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
        <div className="grid md:grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>30-Day Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Chart visualization would display here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "7-Day Streak", description: "Prayed all 5 prayers on time for 7 days", date: "Nov 15" },
              { title: "Quran Milestone", description: "Completed reading Surah Al-Baqarah", date: "Nov 12" },
              { title: "Consistent Dhikr", description: "Reached 1000 dhikr this week", date: "Nov 10" },
            ].map((achievement, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover-elevate"
                data-testid={`achievement-${index}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
