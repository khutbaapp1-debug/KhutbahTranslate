import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WuduStep } from "@/data/wudu-steps";
import type { PrayerFlowCard } from "@/data/prayer-flows";

type AnyRecitation = {
  arabic: string;
  transliteration: string;
  meaning: string;
  name: string;
  label?: string;
};

interface FlowCardProps {
  card: WuduStep | PrayerFlowCard;
}

export function FlowCard({ card }: FlowCardProps) {
  const [activeMeaning, setActiveMeaning] = useState<{ name: string; meaning: string } | null>(null);
  const recitations = card.recitations as AnyRecitation[] | undefined;

  return (
    <>
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground">{card.title}</h3>

          {card.description.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-muted-foreground">{para}</p>
          ))}

          {recitations && recitations.length > 0 && (
            <div className="space-y-5">
              {recitations.map((rec, i) => (
                <div key={i} className="space-y-1">
                  {rec.label && (
                    <p className="text-xs text-muted-foreground">{rec.label}</p>
                  )}
                  <p className="text-2xl font-arabic text-foreground leading-loose text-right" dir="rtl">
                    {rec.arabic}
                  </p>
                  <p className="text-sm italic text-muted-foreground">{rec.transliteration}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setActiveMeaning({ name: rec.name, meaning: rec.meaning })}
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    View Meaning
                  </Button>
                </div>
              ))}
            </div>
          )}

          {card.note && (
            <p className="text-xs italic text-muted-foreground">{card.note}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={activeMeaning !== null} onOpenChange={() => setActiveMeaning(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{activeMeaning?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{activeMeaning?.meaning}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
