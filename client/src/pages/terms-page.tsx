import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

export default function TermsPage() {
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
            Terms of Service
          </h1>
        </div>
      </header>

      <main className="p-6 max-w-screen-md mx-auto space-y-5 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground">Last updated: April 17, 2026</p>

        <p>
          By using Khutbah Companion you agree to these terms. The app is provided free of
          charge to support your spiritual practice.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Use of the app</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You agree to use the app respectfully and in accordance with Islamic etiquette.</li>
            <li>You will not use the app to harass others, distribute unlawful content, or interfere with the service.</li>
            <li>You are responsible for keeping your account credentials secure.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Translation accuracy</h2>
          <p className="text-muted-foreground">
            Live translation is generated automatically by AI. While we work hard to provide
            faithful, context-aware translations of Islamic content, there may be inaccuracies.
            Translations are provided for personal understanding and should not be treated as a
            substitute for qualified scholarly interpretation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Religious content</h2>
          <p className="text-muted-foreground">
            Quran, hadith, duas and prayer-time calculations are sourced from established public
            datasets and calculation methods. Always consult a qualified scholar for religious
            rulings and personal guidance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Availability</h2>
          <p className="text-muted-foreground">
            We may update, change or temporarily suspend the app at any time. We do not guarantee
            uninterrupted availability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Liability</h2>
          <p className="text-muted-foreground">
            The app is provided "as is" without warranties of any kind. We are not liable for any
            losses or damages arising from use of the app, to the maximum extent permitted by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            For questions about these terms, please contact the app maintainer through the
            support channel listed in the app store or repository.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
