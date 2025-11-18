import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sunrise, Sunset, Moon, Star } from "lucide-react";
import ramadanImage from "@assets/generated_images/Ramadan_crescent_moon_lanterns_7acbaea8.png";

export default function RamadanPage() {
  const [timeToIftar, setTimeToIftar] = useState({ hours: 5, minutes: 32, seconds: 15 });
  const [timeToSuhoor, setTimeToSuhoor] = useState({ hours: 18, minutes: 25, seconds: 0 });

  const currentDay = 15;
  const totalDays = 30;
  const progress = (currentDay / totalDays) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeToIftar((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${ramadanImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative h-full flex flex-col justify-center items-center text-white p-6">
          <Moon className="w-12 h-12 mb-3" />
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
            Ramadan 1447
          </h1>
          <p className="text-sm opacity-90">Blessed month of fasting and reflection</p>
        </div>
      </div>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto -mt-6">
        <Card className="border-primary/50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                Day {currentDay} of {totalDays}
              </Badge>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {totalDays - currentDay} days remaining
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sunset className="w-5 h-5 text-orange-600" />
                Iftar Countdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold font-mono" data-testid="text-iftar-countdown">
                  {String(timeToIftar.hours).padStart(2, "0")}:
                  {String(timeToIftar.minutes).padStart(2, "0")}:
                  {String(timeToIftar.seconds).padStart(2, "0")}
                </div>
                <p className="text-sm text-muted-foreground mt-2">until Maghrib</p>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Iftar Time</p>
                  <p className="font-semibold" data-testid="text-iftar-time">
                    6:15 PM
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Current Time</p>
                  <p className="font-semibold">12:43 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-blue-600" />
                Suhoor Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold font-mono" data-testid="text-suhoor-countdown">
                  {String(timeToSuhoor.hours).padStart(2, "0")}:
                  {String(timeToSuhoor.minutes).padStart(2, "0")}:
                  {String(timeToSuhoor.seconds).padStart(2, "0")}
                </div>
                <p className="text-sm text-muted-foreground mt-2">until Fajr</p>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Suhoor Ends</p>
                  <p className="font-semibold" data-testid="text-suhoor-time">
                    5:30 AM
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Tomorrow</p>
                  <p className="font-semibold">Day {currentDay + 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Ramadan Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { task: "Fasted today", completed: true },
              { task: "Read Qur'an", completed: true },
              { task: "Prayed Taraweeh", completed: false },
              { task: "Gave charity", completed: false },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer border border-border"
                data-testid={`checklist-${index}`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {item.completed && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={item.completed ? "text-muted-foreground line-through" : ""}
                >
                  {item.task}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
