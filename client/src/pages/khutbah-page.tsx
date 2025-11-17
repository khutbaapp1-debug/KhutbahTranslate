import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptSegment {
  id: number;
  arabic: string;
  english: string;
  timestamp: number;
}

export default function KhutbahPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRecording) {
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      setTimeout(() => {
        setSegments((prev) => [
          ...prev,
          {
            id: Date.now(),
            arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
            english: "All praise is due to Allah, Lord of the worlds.",
            timestamp: duration,
          },
        ]);
      }, 3000);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
                Live Translation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time Arabic to English
              </p>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <Badge variant="destructive">Recording</Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col h-[calc(100vh-200px)]">
        {segments.length === 0 && !isRecording ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Start Recording Khutbah</h2>
                <p className="text-muted-foreground">
                  Press the record button to begin real-time translation of the sermon from Arabic to English
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {segments.map((segment) => (
                <Card key={segment.id} className="overflow-hidden" data-testid={`segment-${segment.id}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(segment.timestamp)}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-accent/30 rounded-lg p-4">
                        <p
                          className="text-2xl font-arabic leading-loose text-right"
                          dir="rtl"
                          data-testid="text-arabic"
                        >
                          {segment.arabic}
                        </p>
                      </div>

                      <p className="text-lg leading-relaxed" data-testid="text-english">
                        {segment.english}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {isRecording && (
                <Card className="border-primary/50">
                  <CardContent className="p-6 flex items-center justify-center gap-2">
                    <div className="animate-pulse flex gap-1">
                      <div className="w-2 h-8 bg-primary rounded-full" />
                      <div className="w-2 h-10 bg-primary rounded-full" />
                      <div className="w-2 h-6 bg-primary rounded-full" />
                    </div>
                    <span className="text-muted-foreground">Listening...</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border p-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono" data-testid="text-duration">
                  {formatDuration(duration)}
                </span>
              </div>
              {segments.length > 0 && (
                <Badge variant="secondary">
                  {segments.length} segments
                </Badge>
              )}
            </div>

            <div className="flex gap-3">
              {segments.length > 0 && !isRecording && (
                <Button variant="outline" data-testid="button-save">
                  <Save className="w-4 h-4 mr-2" />
                  Save Sermon
                </Button>
              )}
              <Button
                onClick={handleToggleRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="min-w-[140px]"
                data-testid="button-record"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
