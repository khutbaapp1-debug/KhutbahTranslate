import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, LogOut, Settings, Book, Activity, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to auth page if not logged in
  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      },
    });
  };

  const stats = [
    { label: "Sermons Saved", value: "12", icon: Book },
    { label: "Dhikr Count", value: "3,450", icon: Activity },
    { label: "Days Active", value: "45", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Profile
          </h1>
          <Button variant="ghost" size="icon" data-testid="button-settings">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-md mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground" data-testid="text-username">
                  {user.username}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge
                  variant={user.subscriptionTier === "premium" ? "default" : "secondary"}
                  className="mt-2"
                  data-testid="badge-subscription"
                >
                  {user.subscriptionTier === "premium" && <Crown className="w-3 h-3 mr-1" />}
                  {user.subscriptionTier === "premium" ? "Premium" : "Free"} Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.subscriptionTier !== "premium" && (
          <Card className="border-primary bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get access to the khutbah database, AI action points, analytics, and more
                  </p>
                  <Button data-testid="button-upgrade">
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setLocation("/notifications")}
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notification Preferences
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
