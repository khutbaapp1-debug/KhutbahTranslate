import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bell, Clock, BookOpen, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface NotificationSettings {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  dailyHadithEnabled: boolean;
  dailyHadithTime: string;
  prayerRemindersEnabled: boolean;
  prayerReminderMinutes: number;
  jummahReminderEnabled: boolean;
  jummahReminderTime: string;
  pushToken?: string;
}

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);

  const { data: settings, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["/api/notifications/settings"],
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      const res = await apiRequest("PATCH", "/api/notifications/settings", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
    if (!localSettings) return;
    
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    updateMutation.mutate({ [field]: value });
  };

  const handleTimeChange = (field: "dailyHadithTime" | "jummahReminderTime", value: string) => {
    if (!localSettings) return;
    
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
  };

  const handleTimeBlur = (field: "dailyHadithTime" | "jummahReminderTime") => {
    if (!localSettings) return;
    updateMutation.mutate({ [field]: localSettings[field] });
  };

  const handleReminderMinutesChange = (value: string) => {
    if (!localSettings) return;
    
    const minutes = parseInt(value) || 0;
    const updated = { ...localSettings, prayerReminderMinutes: minutes };
    setLocalSettings(updated);
  };

  const handleReminderMinutesBlur = () => {
    if (!localSettings) return;
    updateMutation.mutate({ prayerReminderMinutes: localSettings.prayerReminderMinutes });
  };

  if (isLoading || !localSettings) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center space-y-2 pt-6">
          <div className="flex items-center justify-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Customize your reminder preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Master Switch
            </CardTitle>
            <CardDescription>
              Enable or disable all notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="flex-1">
                Enable Notifications
              </Label>
              <Switch
                id="notifications-enabled"
                checked={localSettings.notificationsEnabled}
                onCheckedChange={(checked) => handleToggle("notificationsEnabled", checked)}
                data-testid="switch-notifications-enabled"
              />
            </div>
          </CardContent>
        </Card>

        {localSettings.notificationsEnabled && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Daily Hadith
                </CardTitle>
                <CardDescription>
                  Receive a daily hadith notification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-hadith-enabled" className="flex-1">
                    Enable Daily Hadith
                  </Label>
                  <Switch
                    id="daily-hadith-enabled"
                    checked={localSettings.dailyHadithEnabled}
                    onCheckedChange={(checked) => handleToggle("dailyHadithEnabled", checked)}
                    data-testid="switch-daily-hadith-enabled"
                  />
                </div>

                {localSettings.dailyHadithEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="daily-hadith-time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Notification Time
                    </Label>
                    <Input
                      id="daily-hadith-time"
                      type="time"
                      value={localSettings.dailyHadithTime}
                      onChange={(e) => handleTimeChange("dailyHadithTime", e.target.value)}
                      onBlur={() => handleTimeBlur("dailyHadithTime")}
                      data-testid="input-daily-hadith-time"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Prayer Reminders
                </CardTitle>
                <CardDescription>
                  Get notified before prayer times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prayer-reminders-enabled" className="flex-1">
                    Enable Prayer Reminders
                  </Label>
                  <Switch
                    id="prayer-reminders-enabled"
                    checked={localSettings.prayerRemindersEnabled}
                    onCheckedChange={(checked) => handleToggle("prayerRemindersEnabled", checked)}
                    data-testid="switch-prayer-reminders-enabled"
                  />
                </div>

                {localSettings.prayerRemindersEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="prayer-reminder-minutes">
                      Remind me (minutes before prayer)
                    </Label>
                    <Input
                      id="prayer-reminder-minutes"
                      type="number"
                      min="0"
                      max="60"
                      value={localSettings.prayerReminderMinutes}
                      onChange={(e) => handleReminderMinutesChange(e.target.value)}
                      onBlur={handleReminderMinutesBlur}
                      data-testid="input-prayer-reminder-minutes"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Jummah Reminder
                </CardTitle>
                <CardDescription>
                  Get reminded about Friday prayer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jummah-reminder-enabled" className="flex-1">
                    Enable Jummah Reminder
                  </Label>
                  <Switch
                    id="jummah-reminder-enabled"
                    checked={localSettings.jummahReminderEnabled}
                    onCheckedChange={(checked) => handleToggle("jummahReminderEnabled", checked)}
                    data-testid="switch-jummah-reminder-enabled"
                  />
                </div>

                {localSettings.jummahReminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="jummah-reminder-time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Reminder Time (Fridays)
                    </Label>
                    <Input
                      id="jummah-reminder-time"
                      type="time"
                      value={localSettings.jummahReminderTime}
                      onChange={(e) => handleTimeChange("jummahReminderTime", e.target.value)}
                      onBlur={() => handleTimeBlur("jummahReminderTime")}
                      data-testid="input-jummah-reminder-time"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Note:</strong> Notifications require browser/app permissions. 
                  Make sure to allow notifications when prompted.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
