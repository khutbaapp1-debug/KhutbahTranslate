import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Book, Activity, Clock, Home } from "lucide-react";

export default function AnalyticsPage() {
  const [, setLocation] = useLocation();
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

  return (
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-home">
              <Home className="w-5 h-5" />
            </Button>
            <h1 className="flex-1 flex items-center justify-center gap-2 text-2xl font-semibold text-foreground" data-testid="text-page-title">
              <TrendingUp className="w-6 h-6" />
              Your Analytics
            </h1>
            <div className="w-10" />
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

    </div>
  );
}
