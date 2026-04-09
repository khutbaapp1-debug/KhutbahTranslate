import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <XCircle className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Checkout Cancelled</h2>
            <p className="text-muted-foreground">
              No worries — your payment was not processed. You can upgrade to Premium anytime.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => setLocation("/premium")}
              className="w-full"
              data-testid="button-try-again"
            >
              View Premium Plans
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="w-full"
              data-testid="button-go-home"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
