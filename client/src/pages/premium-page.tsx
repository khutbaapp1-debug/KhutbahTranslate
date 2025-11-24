import { useEffect } from "react";
import { Crown, Check, BookMarked, BookOpen, BarChart3, Sparkles, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { isPremiumUser } from "@/lib/premium";

export default function PremiumPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isPremium = isPremiumUser(user);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const premiumFeatures = [
    {
      icon: BookMarked,
      title: "Khutbah Database",
      description: "Access thousands of sermons from mosques worldwide with full Arabic transcripts and English translations",
    },
    {
      icon: Sparkles,
      title: "AI Action Points",
      description: "Get personalized, actionable insights extracted from each khutbah to apply Islamic teachings in daily life",
    },
    {
      icon: BookOpen,
      title: "Reflection Journal",
      description: "Guided journal prompts help you reflect on sermon teachings and track your spiritual journey",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Visualize your spiritual progress with detailed stats on prayers, dhikr, Quran reading, and sermon attendance",
    },
    {
      icon: TrendingUp,
      title: "Personalized Recommendations",
      description: "Receive khutbah suggestions based on your interests, spiritual goals, and listening history",
    },
    {
      icon: Award,
      title: "Custom Summaries",
      description: "AI-generated summaries of key themes, Quranic verses, and hadith references from each sermon",
    },
  ];

  const handleUpgrade = () => {
    // If not logged in, redirect to auth page first
    if (!user) {
      setLocation("/auth");
      return;
    }
    // TODO: Implement Stripe checkout flow when ready
    console.log("Upgrade to Premium clicked");
  };

  if (isPremium) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="p-4 max-w-screen-xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
              <Crown className="w-6 h-6 text-yellow-500" />
              Premium
            </h1>
            <p className="text-sm text-muted-foreground mt-1">You're already a Premium member!</p>
          </div>
        </header>

        <main className="p-6 max-w-4xl mx-auto">
          <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-primary/5">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Crown className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-semibold">Thank You for Being Premium!</h2>
              <p className="text-muted-foreground">
                You have access to all premium features including the khutbah database, AI insights, analytics, and more.
              </p>
              <Button
                onClick={() => setLocation("/")}
                variant="default"
                className="mt-4"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Your Premium Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature) => (
                <Card key={feature.title} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to Premium
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Unlock powerful features for your spiritual journey</p>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Hero Card */}
        <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-primary/5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Crown className="w-10 h-10 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Premium Membership</h2>
              <p className="text-4xl font-bold text-primary">$4.99<span className="text-lg text-muted-foreground">/month</span></p>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Deepen your understanding of Islam with AI-powered insights, comprehensive sermon archives, and personalized spiritual growth tracking
            </p>
            <Button
              size="lg"
              onClick={handleUpgrade}
              className="w-full max-w-sm"
              data-testid="button-upgrade-premium"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade Now
            </Button>
            <p className="text-xs text-muted-foreground">Cancel anytime • Secure payment via Stripe</p>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature) => (
              <Card key={feature.title} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {feature.title}
                        <Check className="w-4 h-4 text-green-500 ml-auto" />
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Plus All Free Features</CardTitle>
            <CardDescription>Premium includes everything in the free plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Prayer Times</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Qur'an Reader</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Tasbih Counter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Qibla Compass</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Daily Duas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>99 Names of Allah</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Mosque Finder</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Ramadan Features</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
