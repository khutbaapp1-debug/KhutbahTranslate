import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Bell, Home } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

const FONT_SIZE_OPTIONS = [
  { label: "Small",   value: "14px" },
  { label: "Default", value: "16px" },
  { label: "Large",   value: "18px" },
  { label: "X-Large", value: "20px" },
];

const PRAYER_METHODS = [
  { value: "MWL",         label: "Muslim World League" },
  { value: "ISNA",        label: "ISNA" },
  { value: "EGYPTIAN",    label: "Egyptian" },
  { value: "KARACHI",     label: "Karachi" },
  { value: "UMM_AL_QURA", label: "Umm Al-Qura" },
  { value: "GULF",        label: "Gulf" },
  { value: "KUWAIT",      label: "Kuwait" },
  { value: "QATAR",       label: "Qatar" },
  { value: "SINGAPORE",   label: "Singapore" },
  { value: "TEHRAN",      label: "Tehran" },
  { value: "JAFARI",      label: "Shia Ithna Ashari" },
];

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState("16px");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [prayerMethod, setPrayerMethod] = useState("ISNA");
  const [asrMethod, setAsrMethod] = useState("standard");

  useEffect(() => {
    const savedFontSize = localStorage.getItem("app-font-size") || "16px";
    setFontSize(savedFontSize);
    document.documentElement.style.setProperty("--font-size-base", savedFontSize);

    const savedReduceMotion = localStorage.getItem("app-reduce-motion") === "true";
    setReduceMotion(savedReduceMotion);
    if (savedReduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    }

    setPrayerMethod(localStorage.getItem("prayerCalculationMethod") || "ISNA");
    setAsrMethod(localStorage.getItem("asrCalculationMethod") || "standard");
  }, []);

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem("app-font-size", value);
    document.documentElement.style.setProperty("--font-size-base", value);
  };

  const handleReduceMotionChange = (checked: boolean) => {
    setReduceMotion(checked);
    localStorage.setItem("app-reduce-motion", String(checked));
    if (checked) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  };

  const handlePrayerMethodChange = (value: string) => {
    setPrayerMethod(value);
    localStorage.setItem("prayerCalculationMethod", value);
  };

  const handleAsrMethodChange = (value: string) => {
    setAsrMethod(value);
    localStorage.setItem("asrCalculationMethod", value);
  };

  return (
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border pt-safe">
        <div className="flex items-center p-4 max-w-screen-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <Home className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-xl font-semibold text-foreground" data-testid="text-page-title">
            Settings
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-md mx-auto">
        {/* Section 1 — Display */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Select value={fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger id="font-size" data-testid="select-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                {(["light", "dark", "high-contrast"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      theme === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {t === "light" ? "Light" : t === "dark" ? "Dark" : "High Contrast"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <p className="text-sm text-muted-foreground">Minimise animations and transitions</p>
              </div>
              <Switch
                id="reduce-motion"
                checked={reduceMotion}
                onCheckedChange={handleReduceMotionChange}
                data-testid="switch-reduce-motion"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2 — Prayer Times */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prayer Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prayer-method">Calculation Method</Label>
              <Select value={prayerMethod} onValueChange={handlePrayerMethodChange}>
                <SelectTrigger id="prayer-method" data-testid="select-prayer-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRAYER_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asr-method">Asr Calculation</Label>
              <Select value={asrMethod} onValueChange={handleAsrMethodChange}>
                <SelectTrigger id="asr-method" data-testid="select-asr-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Shafi/Maliki/Hanbali)</SelectItem>
                  <SelectItem value="hanafi">Hanafi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 — Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">
                  Manage prayer time reminders, daily hadith, and dua notifications
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/notifications")}
                  data-testid="button-manage-notifications"
                >
                  Manage Notifications →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 — About */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <a
                href="https://khutbah-translate.replit.app/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
                data-testid="link-privacy-policy"
              >
                View →
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contact / Data Deletion</span>
              <a
                href="mailto:khutba.app1@gmail.com"
                className="text-sm text-primary hover:underline"
                data-testid="link-contact"
              >
                khutba.app1@gmail.com
              </a>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Made with care for the global Muslim community
            </p>
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
