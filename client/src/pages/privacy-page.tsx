import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-2 p-4 max-w-screen-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            aria-label="Back"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            Privacy Policy
          </h1>
        </div>
      </header>

      <main className="p-6 max-w-screen-md mx-auto space-y-5 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground">Last updated: April 17, 2026</p>

        <p>
          Khutbah Companion ("we", "our", "the app") respects your privacy. This page explains
          what information we collect, how we use it, and the choices you have. The app is free
          to use and we do not sell your personal data.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Information we collect</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Account info:</strong> name, email and profile image when you sign in via Google, Apple, GitHub, X or email/password.</li>
            <li><strong className="text-foreground">Location:</strong> only when you use Prayer Times, Qibla or Mosque Finder. Coordinates are processed on the fly and not stored on our servers.</li>
            <li><strong className="text-foreground">Microphone audio:</strong> only while you actively run a Live Translation. Audio is sent to our transcription provider, transcribed and translated, then discarded.</li>
            <li><strong className="text-foreground">App usage:</strong> bookmarks, completed prayers, tasbih counts and similar progress are stored to give you a personalised experience.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How we use your information</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>To provide the features you request (translation, prayer times, Qibla, Quran progress, etc.).</li>
            <li>To keep you signed in and remember your preferences.</li>
            <li>To improve the app's reliability and performance.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Third-party services</h2>
          <p className="text-muted-foreground">
            We use trusted services to make the app work: Groq and OpenAI for transcription and
            translation, Replit Auth for sign-in, and public Islamic content APIs (Quran, hadith,
            prayer-time calculations). Each provider has its own privacy policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Your choices</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You can deny location and microphone permissions at any time in your browser or device settings — only the related features will be unavailable.</li>
            <li>You can sign out at any time from the Profile page.</li>
            <li>You can request deletion of your account and associated data by contacting us.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Children</h2>
          <p className="text-muted-foreground">
            The app is suitable for all ages but is not specifically directed at children under 13.
            We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            For any privacy questions or data requests, please contact the app maintainer through
            the support channel listed in the app store or repository.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
