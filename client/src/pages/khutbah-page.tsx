import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save, Clock, Pause, Play, X, AlertCircle, Crown, Play as PlayCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TranscriptSegment {
  id: number;
  arabic: string;
  english: string;
  timestamp: number;
}

interface UsageInfo {
  minutesUsed: number;
  minutesRemaining: number;
  monthlyLimit: number;
  adCreditsAvailable: number;
  totalAvailable: number;
  resetDate: string | Date;
  isLimitReached: boolean;
  canEarnAdCredits: boolean;
}

export default function KhutbahPage() {
  const [processingError, setProcessingError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch translation usage info for authenticated users
  const { data: usageInfo, refetch: refetchUsage } = useQuery<UsageInfo>({
    queryKey: ['/api/translation/usage'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation to redeem ad credit
  const redeemAdMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/translation/redeem-ad');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/translation/usage'] });
      setWatchingAd(false);
      setShowLimitModal(false);
      clearErrors(); // Clear error states without losing translations
      toast({
        title: "Success!",
        description: "+30 minutes added to your account",
      });
    },
    onError: (error: any) => {
      setWatchingAd(false);
      toast({
        title: "Error",
        description: error.message || "Failed to redeem ad credit. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Audio recorder hook with local optimistic usage guard (handles refetch delays)
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    transcriptionError,
    translations,
    nextTranslationIn,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    clearErrors,
  } = useAudioRecorder({
    minutesRemaining: usageInfo?.minutesRemaining, // Hook handles pending consumption internally
    onLimitReached: () => {
      setShowLimitModal(true);
    },
    onChunkSent: () => {
      // Refresh usage after each chunk (hook reconciles pending consumption on update)
      queryClient.invalidateQueries({ queryKey: ['/api/translation/usage'] });
    }
  });

  useEffect(() => {
    // Auto-scroll to bottom when new translations arrive
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [translations]);

  // Watch for 429 errors from backend
  useEffect(() => {
    if (transcriptionError === "limit_reached" && !showLimitModal) {
      // 429 error hit - pause recording and show modal
      if (isRecording) {
        pauseRecording();
      }
      setShowLimitModal(true);
      queryClient.invalidateQueries({ queryKey: ['/api/translation/usage'] });
    }
  }, [transcriptionError, showLimitModal, isRecording, pauseRecording]);

  const handleStartRecording = async () => {
    // Pre-flight check: Fetch fresh usage data before starting
    if (user) {
      const { data: freshUsage } = await refetchUsage();
      
      // Check if limit reached
      if (freshUsage?.isLimitReached) {
        setShowLimitModal(true);
        return;
      }
      
      // Warn if low on minutes (< 5 minutes)
      if (freshUsage && freshUsage.minutesRemaining < 5) {
        setShowLimitModal(true);
        return;
      }
    }
    
    clearRecording();
    setProcessingError(null);
    await startRecording();
  };

  const handleWatchAd = () => {
    setProcessingError(null); // Clear any previous errors
    setWatchingAd(true);
    // Simulate watching a 30-second ad
    // In production, this would integrate with Google AdSense/AdMob
    setTimeout(() => {
      redeemAdMutation.mutate();
    }, 3000); // Shortened to 3 seconds for testing (would be 30 seconds in production)
  };

  const handleModalClose = (open: boolean) => {
    // Only close when open is false (per Shadcn dialog pattern)
    if (!open) {
      setShowLimitModal(false);
      setWatchingAd(false);
      setProcessingError(null);
      // Clear error states only - preserve translations and audio
      clearErrors();
    }
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
            <Alert 
              className={usageInfo.minutesRemaining < 10 ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900" : "bg-muted/50"} 
              data-testid="alert-usage-info"
            >
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <span className="font-medium">{Math.floor(usageInfo.minutesRemaining)} minutes</span> of free translation remaining this month
                {usageInfo.minutesRemaining < 10 && usageInfo.canEarnAdCredits && (
                  <span className="text-yellow-700 dark:text-yellow-400 ml-2">
                    — Running low! Watch an ad for +30 minutes
                  </span>
                )}
                {user.subscriptionTier === "free" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 ml-2 underline"
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
                  You've used all {usageInfo.totalAvailable} minutes this month. 
                  Resets on {new Date(usageInfo.resetDate).toLocaleDateString()}.
                </p>
                <div className="flex gap-2 mt-2">
                  {usageInfo.canEarnAdCredits && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowLimitModal(true)}
                      data-testid="button-watch-ad-header"
                    >
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Watch Ad
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => navigate("/premium")}
                    data-testid="button-upgrade-now"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {processingError && (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{processingError}</AlertDescription>
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
      
      {/* Limit Reached Modal - Watch Ad or Upgrade */}
      <Dialog open={showLimitModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-limit-reached">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Translation Limit Reached
            </DialogTitle>
            <DialogDescription>
              You've used all {usageInfo?.totalAvailable || 60} minutes of free translation this month.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {usageInfo?.canEarnAdCredits && !watchingAd && (
              <Card className="border-primary/20 hover-elevate" data-testid="card-watch-ad">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <PlayCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Watch a 30-second ad</h3>
                      <p className="text-sm text-muted-foreground">
                        Get +30 minutes instantly
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ({usageInfo.adCreditsAvailable}/120 minutes earned from ads)
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleWatchAd} 
                    className="w-full"
                    data-testid="button-watch-ad"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Watch Ad for +30 Minutes
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {watchingAd && (
              <Card className="border-primary/20">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <PlayCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Playing ad... Please wait
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!usageInfo?.canEarnAdCredits && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You've earned the maximum ad credits (2 hours) this month.
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="border-primary hover-elevate" data-testid="card-upgrade-premium">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Unlimited translation + exclusive features
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">$4.99/month</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setShowLimitModal(false);
                    navigate("/premium");
                  }} 
                  className="w-full"
                  variant="default"
                  data-testid="button-upgrade-premium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              variant="outline" 
              onClick={() => setShowLimitModal(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
