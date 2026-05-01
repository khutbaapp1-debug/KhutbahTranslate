import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg pt-safe border-b border-border">
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
        <p className="text-muted-foreground">Last updated: May 1, 2026</p>

        <p>
          Khutbah Companion ("we", "our", "the app") respects your privacy. This page explains
          what information the app collects, how it is used, and the choices you have. The app
          is free to use, requires no account, and we do not sell your personal data.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Anonymous use</h2>
          <p className="text-muted-foreground">
            The app does not require you to create an account or sign in. We do not collect your
            name, email address, phone number, or any other personally identifiable information
            to use the app's features.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Information the app accesses</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Location:</strong> when you use Prayer Times, Qibla, or Mosque Finder. Prayer time and Qibla calculations happen on the fly and your coordinates are not stored on our servers. When you use Mosque Finder, your coordinates are sent to Google Places API to look up nearby mosques.</li>
            <li><strong className="text-foreground">Microphone audio:</strong> only while you actively use the Live Khutbah Translation feature. Audio is sent to our transcription provider (Groq, with OpenAI as a fallback), transcribed and translated, then discarded. We do not save the audio recordings.</li>
            <li><strong className="text-foreground">Translated text cache:</strong> the app stores translations of common Arabic phrases in a database to improve performance and reduce processing costs. This cache contains text only — no personal information, no audio, and no link to any user identity.</li>
            <li><strong className="text-foreground">Advertising identifier:</strong> Google AdMob, our advertising provider, may collect a device-level advertising identifier (Google Advertising ID on Android, IDFA on iOS) to serve non-personalized ads. You can reset or limit this identifier in your device settings.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Advertising</h2>
          <p className="text-muted-foreground">
            The app shows ads through Google AdMob to support free distribution. We use
            non-personalized ads only — meaning ads are based on contextual signals rather than
            tracking your activity across other apps and websites. We have configured AdMob to
            block sensitive ad categories including gambling, alcohol, dating, tobacco,
            astrology, and content of other religions, so that ads remain appropriate for our
            audience.
          </p>
          <p className="text-muted-foreground">
            For details on how Google handles advertising data, see{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google's Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Third-party services</h2>
          <p className="text-muted-foreground">
            We use trusted services to provide the app's features. Each has its own privacy
            policy:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Groq</strong> — primary transcription and translation service for the Live Khutbah Translation feature</li>
            <li><strong className="text-foreground">OpenAI</strong> — fallback transcription and translation service</li>
            <li><strong className="text-foreground">Google AdMob</strong> — advertising provider</li>
            <li><strong className="text-foreground">Public Islamic content APIs</strong> — for Quran, hadith, and prayer-time data</li>
            <li><strong className="text-foreground">Google Places API</strong> — provides nearby mosque data when you use Mosque Finder. Your location coordinates are sent to Google to perform the search.</li>
            <li><strong className="text-foreground">OpenStreetMap</strong> — provides the map tiles displayed in Mosque Finder. Your IP address and the map area you view are visible to OpenStreetMap when tiles load.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Your choices</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You can deny location and microphone permissions at any time in your device settings. The features that depend on those permissions will be unavailable, but the rest of the app will continue to work.</li>
            <li>You can reset or limit your advertising identifier in your device's privacy settings (Settings → Privacy → Advertising on iOS; Settings → Privacy → Ads on Android).</li>
            <li>Because the app does not require an account, there is no user profile to delete. Uninstalling the app removes all locally stored data from your device.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Children</h2>
          <p className="text-muted-foreground">
            The app is suitable for all ages but is not specifically directed at children under
            13. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Changes to this policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. The date at the top of this
            page will reflect the most recent update. Continued use of the app after changes
            indicates acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            For any privacy questions or data requests, please contact us at{" "}
            <a href="mailto:khutba.app1@gmail.com" className="underline">
              khutba.app1@gmail.com
            </a>
            .
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
