import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Compass, Clock, Heart, MicVocal, Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Your Islamic Companion
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Khutbah Companion
            </h1>
            <p className="text-xl text-muted-foreground">
              Real-time sermon translation, prayer times, Quran, duas, and more. 
              All in one beautiful app designed for your spiritual journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" asChild data-testid="button-login">
                <a href="/api/login">
                  Sign In with Google or Apple
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-explore">
                <a href="/">
                  Explore Features
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardHeader>
              <MicVocal className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Live Translation</CardTitle>
              <CardDescription>
                Real-time Arabic to English sermon translation with AI
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover-elevate">
            <CardHeader>
              <Clock className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Prayer Times</CardTitle>
              <CardDescription>
                Accurate prayer times based on your location
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover-elevate">
            <CardHeader>
              <BookOpen className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Quran Reader</CardTitle>
              <CardDescription>
                Full Quran with audio recitations by renowned reciters
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover-elevate">
            <CardHeader>
              <Heart className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Duas & Dhikr</CardTitle>
              <CardDescription>
                Collection of authentic duas and tasbih counter
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover-elevate">
            <CardHeader>
              <Compass className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Qibla Compass</CardTitle>
              <CardDescription>
                Find the direction of the Kaaba from anywhere
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover-elevate">
            <CardHeader>
              <Building2 className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Mosque Finder</CardTitle>
              <CardDescription>
                Locate nearby mosques with directions and details
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground space-y-3">
          <p>Khutbah Companion — Supporting your spiritual journey</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a href="/privacy" className="hover:text-foreground" data-testid="link-privacy">Privacy Policy</a>
            <span aria-hidden="true">·</span>
            <a href="/terms" className="hover:text-foreground" data-testid="link-terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
