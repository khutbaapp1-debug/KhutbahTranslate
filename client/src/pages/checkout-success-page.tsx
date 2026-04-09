import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setVerifying(false);
      return;
    }

    apiRequest("POST", "/api/stripe/verify-session", { sessionId })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          toast({
            title: "Welcome to Premium!",
            description: "Your subscription is now active.",
          });
        } else {
          setSuccess(false);
        }
      })
      .catch(() => setSuccess(false))
      .finally(() => setVerifying(false));
  }, [toast]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Confirming your subscription...</h2>
            <p className="text-muted-foreground text-sm">Please wait a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-yellow-500/50">
        <CardContent className="p-8 text-center space-y-6">
          {success ? (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Crown className="w-10 h-10 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">You're Premium!</h2>
                <p className="text-muted-foreground">
                  Your subscription is active. Enjoy unlimited AI features, the khutbah database, and everything Premium has to offer.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={() => setLocation("/")}
                  className="w-full"
                  data-testid="button-go-home"
                >
                  Go to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/khutbah")}
                  className="w-full"
                  data-testid="button-try-khutbah"
                >
                  Try Khutbah Translator
                </Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Payment Received</h2>
                <p className="text-muted-foreground">
                  Your payment was processed. If your account hasn't updated yet, please wait a moment and refresh.
                </p>
              </div>
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
