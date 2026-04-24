import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

export default function HijriCalendarPage() {
  const [currentMonth] = useState("Dhul-Hijjah 1447");
  
  const islamicEvents = [
    { date: "1", event: "First of Dhul-Hijjah" },
    { date: "9", event: "Day of Arafah" },
    { date: "10", event: "Eid al-Adha" },
    { date: "11-13", event: "Days of Tashreeq" },
  ];

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background pb-nav">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Islamic Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Hijri Date Converter</p>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-screen-lg mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="flex items-center gap-2" data-testid="text-current-month">
                <Calendar className="w-5 h-5" />
                {currentMonth}
              </CardTitle>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {days.map((day) => {
                const hasEvent = islamicEvents.some((e) => 
                  e.date.includes(day.toString()) || e.date === day.toString()
                );
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                      day === 15
                        ? "bg-primary text-primary-foreground font-semibold"
                        : hasEvent
                        ? "bg-accent hover-elevate"
                        : "hover-elevate"
                    }`}
                    data-testid={`day-${day}`}
                  >
                    <div className="text-center">
                      <div>{day}</div>
                      {hasEvent && <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Islamic Events This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {islamicEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
                data-testid={`event-${index}`}
              >
                <div>
                  <p className="font-medium">{event.event}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.date} {currentMonth.split(" ")[0]}
                  </p>
                </div>
                <Badge variant="secondary">{event.date}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Gregorian Date</p>
                <p className="text-2xl font-semibold" data-testid="text-gregorian-date">
                  November 17, 2025
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Hijri Date</p>
                <p className="text-2xl font-semibold" data-testid="text-hijri-date">
                  15 Dhul-Hijjah 1447
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
