import { useEffect } from "react";

interface GoogleAdProps {
  slot: string; // AdSense ad slot ID
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  testMode?: boolean; // For development/testing
}

export function GoogleAd({ slot, format = "auto", className = "", testMode = true }: GoogleAdProps) {
  useEffect(() => {
    if (!testMode) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("Error loading Google AdSense:", error);
      }
    }
  }, [testMode]);

  if (testMode) {
    // Show placeholder in development/test mode
    return (
      <div
        className={`bg-muted/30 border border-border rounded-lg flex items-center justify-center ${className}`}
        aria-label="Advertisement placeholder"
      >
        <div className="text-center p-4">
          <p className="text-xs text-muted-foreground font-medium">Advertisement</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Google AdSense</p>
        </div>
      </div>
    );
  }

  // Production AdSense implementation
  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // TODO: Replace with actual AdSense client ID
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

// Pre-configured ad types for common placements
export function HomepageBannerAd() {
  return (
    <GoogleAd
      slot="1234567890" // TODO: Replace with actual slot ID
      format="horizontal"
      className="min-h-[100px] w-full"
      testMode={true}
    />
  );
}

export function InlineAd() {
  return (
    <GoogleAd
      slot="0987654321" // TODO: Replace with actual slot ID
      format="rectangle"
      className="min-h-[250px] w-full max-w-md mx-auto my-6"
      testMode={true}
    />
  );
}

export function SidebarAd() {
  return (
    <GoogleAd
      slot="1122334455" // TODO: Replace with actual slot ID
      format="vertical"
      className="min-h-[600px] w-full"
      testMode={true}
    />
  );
}
