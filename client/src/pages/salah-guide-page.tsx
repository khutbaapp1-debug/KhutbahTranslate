import { useState, useEffect } from "react";
import { Info, BookOpen, ChevronDown, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlowCard } from "@/components/flow-card";
import { WheelPicker } from "@/components/wheel-picker";
import { WuduFlashCard } from "@/components/wudu-flash-card";
import { prayerFlows, type PrayerType } from "@/data/prayer-flows";

type Prayer = {
  id: string;
  name: string;
  arabicName: string;
  sunnahBefore: number;
  fard: number;
  sunnahAfter: number;
  witr?: number;
  description: string;
};

const prayers: Prayer[] = [
  {
    id: "fajr",
    name: "Fajr",
    arabicName: "الفجر",
    sunnahBefore: 2,
    fard: 2,
    sunnahAfter: 0,
    description: "The dawn prayer, performed before sunrise. Recited aloud.",
  },
  {
    id: "dhuhr",
    name: "Dhuhr",
    arabicName: "الظهر",
    sunnahBefore: 4,
    fard: 4,
    sunnahAfter: 2,
    description: "The midday prayer, performed after the sun passes its zenith. Recited silently.",
  },
  {
    id: "asr",
    name: "Asr",
    arabicName: "العصر",
    sunnahBefore: 0,
    fard: 4,
    sunnahAfter: 0,
    description: "The afternoon prayer, performed in the late afternoon before sunset. Recited silently.",
  },
  {
    id: "maghrib",
    name: "Maghrib",
    arabicName: "المغرب",
    sunnahBefore: 0,
    fard: 3,
    sunnahAfter: 2,
    description: "The sunset prayer, performed just after sunset. First two rakat aloud, third silent.",
  },
  {
    id: "isha",
    name: "Isha",
    arabicName: "العشاء",
    sunnahBefore: 0,
    fard: 4,
    sunnahAfter: 2,
    witr: 3,
    description: "The night prayer, performed after twilight. First two rakat aloud, the rest silent.",
  },
];

const DISCLAIMER_KEY = "salah-guide-disclaimer-acknowledged";

export default function SalahGuidePage() {
  const [, setLocation] = useLocation();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [activeTab, setActiveTab] = useState("wudu");
  const [selectedPrayerType, setSelectedPrayerType] = useState<PrayerType>("2rakat");
  const [prayerGuideOpen, setPrayerGuideOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISCLAIMER_KEY)) {
      setShowDisclaimer(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  const handleDismiss = () => {
    localStorage.setItem(DISCLAIMER_KEY, "true");
    setShowDisclaimer(false);
  };

  return (
    <div className="min-h-screen bg-background ">
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-screen-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-home">
            <Home className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              Salah Guide
              <button
                onClick={() => setShowDisclaimer(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="About this guide"
              >
                <Info className="w-4 h-4" />
              </button>
            </h1>
            <p className="text-xs text-muted-foreground">Step-by-step prayer instructions</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-screen-md mx-auto space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="wudu" data-testid="tab-wudu">Wudu</TabsTrigger>
            <TabsTrigger value="how-to-pray" data-testid="tab-how-to-pray">How to Pray</TabsTrigger>
            <TabsTrigger value="prayers" data-testid="tab-prayers">Prayers</TabsTrigger>
          </TabsList>

          <TabsContent value="wudu" className="mt-4">
            <WuduFlashCard />
          </TabsContent>

          <TabsContent value="how-to-pray" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground px-1">
              Choose the type of prayer below to see a step-by-step guide.
            </p>

            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-4">
                <button
                  className="flex items-center justify-between w-full cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => setPrayerGuideOpen((o) => !o)}
                  aria-expanded={prayerGuideOpen}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Prayer Guide</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200${prayerGuideOpen ? " rotate-180" : ""}`}
                  />
                </button>
                {prayerGuideOpen && (
                  <table className="w-full text-sm mt-3">
                    <tbody>
                      {[
                        { name: "Fajr",    rakat: 2, time: "Dawn" },
                        { name: "Dhuhr",   rakat: 4, time: "Midday" },
                        { name: "Asr",     rakat: 4, time: "Afternoon" },
                        { name: "Maghrib", rakat: 3, time: "Sunset" },
                        { name: "Isha",    rakat: 4, time: "Night" },
                        { name: "Witr",    rakat: 3, time: "After Isha" },
                        { name: "Jummah",  rakat: 2, time: "Friday (replaces Dhuhr)" },
                        { name: "Sunnah",  rakat: 2, time: "Optional" },
                      ].map(({ name, rakat, time }) => (
                        <tr key={name} className="border-b border-border/40 last:border-0">
                          <td className="py-1.5 font-semibold text-foreground w-1/3">{name}</td>
                          <td className="py-1.5 font-medium text-primary w-1/4">{rakat} Rakat</td>
                          <td className="py-1.5 text-muted-foreground">{time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            <WheelPicker
              items={[
                { value: "2rakat",  label: "2 Rakat" },
                { value: "4rakat",  label: "4 Rakat" },
                { value: "maghrib", label: "Maghrib (3 Rakat)" },
                { value: "witr",    label: "Witr (3 Rakat)" },
              ]}
              selectedValue={selectedPrayerType}
              onChange={(v) => setSelectedPrayerType(v as PrayerType)}
            />
            {prayerFlows[selectedPrayerType].map((card) => (
              <FlowCard key={card.number} card={card} />
            ))}
          </TabsContent>

          <TabsContent value="prayers" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground px-1">
              Below is what each daily prayer consists of, including sunnah and fard rakat for each.
            </p>
            {prayers.map((prayer) => (
              <Card key={prayer.id} data-testid={`prayer-${prayer.id}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground" data-testid={`text-prayer-${prayer.id}`}>
                        {prayer.name}
                      </h2>
                      <p className="text-2xl font-arabic text-primary mt-1" dir="rtl">
                        {prayer.arabicName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prayer.sunnahBefore > 0 && (
                        <Badge variant="secondary">
                          {prayer.sunnahBefore} Sunnah before
                        </Badge>
                      )}
                      <Badge>
                        {prayer.fard} Fard
                      </Badge>
                      {prayer.sunnahAfter > 0 && (
                        <Badge variant="secondary">
                          {prayer.sunnahAfter} Sunnah after
                        </Badge>
                      )}
                      {prayer.witr && (
                        <Badge variant="secondary">
                          {prayer.witr} Witr
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{prayer.description}</p>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-foreground">Important reminders</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                  <li>Perform wudu (ablution) before every prayer.</li>
                  <li>Face the Qibla (direction of the Kaaba in Makkah).</li>
                  <li>Wear clean clothes that cover the body appropriately.</li>
                  <li>Pray on a clean surface or prayer mat.</li>
                  <li>For 3-rakah prayers (Maghrib): perform Tashahhud after the 2nd rakah, stand up for the 3rd, then end with full Tashahhud and Tasleem.</li>
                  <li>For 4-rakah prayers (Dhuhr, Asr, Isha): perform Tashahhud after the 2nd rakah, then continue to the 3rd and 4th rakahs (recite only Al-Fatiha in those), then end with full Tashahhud and Tasleem.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>


      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>A Note on This Guide</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This Salah Guide is intended for general use. The basic structure of prayer is universally agreed upon, but may vary between the four schools of thought.
          </p>
          <p className="text-sm text-muted-foreground">
            For matters specific to your tradition or fiqh rulings, please consult your local imam or a qualified scholar.
          </p>
          <Button onClick={handleDismiss} className="w-full mt-2">
            I understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
