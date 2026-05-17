import { useEffect, useRef, useState } from "react";
import { BookOpen, Loader2, Pause, Play } from "lucide-react";
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
  audioUrl?: string;
};

interface FlowCardProps {
  card: WuduStep | PrayerFlowCard;
}

let sharedAudio: HTMLAudioElement | null = null;
let sharedAudioController: AbortController | null = null;
let currentUrl: string | null = null;
type AudioListener = (playingUrl: string | null) => void;
const audioListeners = new Set<AudioListener>();

function notifyAudio(url: string | null) {
  currentUrl = url;
  audioListeners.forEach((l) => l(url));
}

function tearDownSharedAudio() {
  // Detach all event listeners *before* pausing so the old `pause`/`error`
  // events can't race with a new playback and flip state to null.
  if (sharedAudioController) {
    sharedAudioController.abort();
    sharedAudioController = null;
  }
  if (sharedAudio) {
    sharedAudio.pause();
    sharedAudio.src = "";
    sharedAudio = null;
  }
}

function playRecitation(url: string) {
  if (typeof window === "undefined") return;
  tearDownSharedAudio();

  const controller = new AbortController();
  const { signal } = controller;
  const audio = new Audio(url);
  audio.preload = "auto";

  sharedAudio = audio;
  sharedAudioController = controller;
  notifyAudio(url);

  const handleEnd = () => {
    if (sharedAudio === audio) {
      tearDownSharedAudio();
      notifyAudio(null);
    }
  };
  audio.addEventListener("ended", handleEnd, { signal });
  audio.addEventListener("error", handleEnd, { signal });

  void audio.play().catch(() => {
    if (sharedAudio === audio) {
      tearDownSharedAudio();
      notifyAudio(null);
    }
  });
}

function stopRecitation() {
  tearDownSharedAudio();
  notifyAudio(null);
}

function getCurrentUrl(): string | null {
  return currentUrl;
}

function RecitationAudioButton({ url }: { url: string }) {
  // Initialise from module-level state so navigating back into a card whose
  // recitation is already playing shows the correct "Stop" state.
  const [playingUrl, setPlayingUrl] = useState<string | null>(() => getCurrentUrl());
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    const listener: AudioListener = (current) => {
      setPlayingUrl(current);
      if (current !== url) {
        loadingRef.current = false;
        setLoading(false);
      } else if (loadingRef.current) {
        // Audio started for our URL — clear the loading spinner.
        loadingRef.current = false;
        setLoading(false);
      }
    };
    audioListeners.add(listener);
    return () => {
      audioListeners.delete(listener);
      // If this button's audio is currently playing and the component
      // unmounts (e.g. user changes tabs or leaves the page), stop it so
      // there's no orphaned background recitation.
      if (getCurrentUrl() === url) {
        stopRecitation();
      }
    };
  }, [url]);

  const isPlaying = playingUrl === url;

  const handleClick = () => {
    if (isPlaying) {
      stopRecitation();
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    playRecitation(url);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={handleClick}
      data-testid={isPlaying ? "button-stop-recitation" : "button-play-recitation"}
      aria-label={isPlaying ? "Stop recitation" : "Play recitation"}
    >
      {loading && !isPlaying ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-3 h-3 mr-1" />
      ) : (
        <Play className="w-3 h-3 mr-1" />
      )}
      {isPlaying ? "Stop" : "Listen"}
    </Button>
  );
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
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setActiveMeaning({ name: rec.name, meaning: rec.meaning })}
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      View Meaning
                    </Button>
                    {rec.audioUrl && <RecitationAudioButton url={rec.audioUrl} />}
                  </div>
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
