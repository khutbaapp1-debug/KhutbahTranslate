import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save, Clock, Pause, Play, X, AlertCircle, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface TranscriptSegment {
  id: number;
  arabic: string;
  english: string;
  timestamp: number;
}

export default function KhutbahPage() {
  const [processingError, setProcessingError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    translations,
    nextTranslationIn,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useAudioRecorder();

  // Fetch translation usage info for authenticated users
  const { data: usageInfo } = useQuery({
    queryKey: ['/api/translation/usage'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds while recording
  });

  useEffect(() => {
    // Auto-scroll to bottom when new translations arrive
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [translations]);

  const handleStartRecording = async () => {
    clearRecording();
    setProcessingError(null);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSaveRecording = () => {
    // Translations happen in real-time, no need for manual processing
    clearRecording();
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
                Live Translation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time Translation
              </p>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <Badge variant="destructive">Recording</Badge>
              </div>
            )}
          </div>
          
          {user && usageInfo && !usageInfo.isLimitReached && usageInfo.monthlyLimit !== Infinity && (
            <Alert className="bg-muted/50" data-testid="alert-usage-info">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <span className="font-medium">{Math.floor(usageInfo.minutesRemaining)} minutes</span> of free translation remaining this month
                {user.subscriptionTier === "free" && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 ml-2"
                    onClick={() => navigate("/premium")}
                    data-testid="link-upgrade"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade for unlimited
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {user && usageInfo?.isLimitReached && (
            <Alert variant="destructive" data-testid="alert-limit-reached">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Translation limit reached</p>
                <p className="text-sm mt-1">
                  You've used all {usageInfo.monthlyLimit} minutes this month. 
                  Resets on {new Date(usageInfo.resetDate).toLocaleDateString()}.
                </p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate("/premium")}
                  data-testid="button-upgrade-now"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </header>

      <main className="flex flex-col h-[calc(100vh-200px)]">
        {translations.length === 0 && !isRecording ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Start Recording Khutbah</h2>
                <p className="text-muted-foreground">
                  Press the record button to begin real-time translation. Automatically detects Arabic, Urdu, Hindi, French, and other languages.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {translations.map((segment, index) => (
                <div 
                  key={segment.id}
                  className="pb-3 border-b border-border/40 last:border-0"
                  data-testid={`segment-${segment.id}`}
                >
                  <p className="text-lg leading-relaxed">
                    {segment.english}
                  </p>
                </div>
              ))}
              {isRecording && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-4 bg-primary rounded-full animate-pulse" />
                    <span className="w-1.5 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-sm">Listening...</span>
                </div>
              )}
              {/* Invisible element at the bottom for auto-scroll */}
              <div ref={endOfMessagesRef} />
            </div>
          </ScrollArea>
        )}

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border p-6">
          <div className="max-w-3xl mx-auto">
            {(error || processingError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 h-4" />
                <AlertDescription>{error || processingError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col items-center gap-4">
              {/* Timer and Countdown */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-lg" data-testid="text-duration">
                    {formatDuration(recordingTime)}
                  </span>
                  {audioBlob && (
                    <Badge variant="secondary" className="ml-2">
                      {(audioBlob.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  )}
                </div>
                
                {/* Countdown Timer - shows when recording */}
                {isRecording && !isPaused && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-muted-foreground" data-testid="text-countdown">
                      Next translation in <span className="font-mono font-semibold text-primary">{nextTranslationIn}</span> seconds
                    </span>
                  </div>
                )}
              </div>

              {/* Main buttons - centered */}
              <div className="flex gap-2 items-center">
                {isRecording && (
                  <Button
                    variant="outline"
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    data-testid="button-pause-resume"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
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

              {/* Clear button - below when stopped */}
              {!isRecording && translations.length > 0 && (
                <Button variant="outline" onClick={clearRecording} data-testid="button-clear">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
