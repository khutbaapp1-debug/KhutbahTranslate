import { useEffect } from "react";
import { isNativeApp, showBannerAd } from "@/lib/mobile-ads";
import { setBannerHeight as publishBannerHeight } from "@/lib/banner-height";

let bannerInitialized = false;

export function BannerAd() {
  const native = isNativeApp();

  useEffect(() => {
    if (!native) return;

    let cancelled = false;
    let listenerHandle: { remove: () => unknown } | null = null;

    async function setup() {
      try {
        if (bannerInitialized) return;
        bannerInitialized = true;
        const { AdMob, BannerAdPluginEvents } = await import(
          "@capacitor-community/admob"
        );
        if (cancelled) return;
        const handle = await AdMob.addListener(
          BannerAdPluginEvents.SizeChanged,
          (size) => {
            // Add ~48dp for the system nav bar so page content clears the
            // banner — the AdMob plugin lifts the banner above the nav bar
            // on Android 15+, but the WebView still extends under it.
            const totalHeight = size.height + 48;
            publishBannerHeight(totalHeight);
            document.documentElement.style.setProperty('--banner-height', `${totalHeight}px`);
          },
        );
        if (cancelled) {
          handle.remove();
          return;
        }
        listenerHandle = handle;
        await showBannerAd(0);
      } catch {
        // ad failed — --banner-height stays unset; App.tsx keeps the 108px fallback
      }
    }

    setup();

    return () => {
      cancelled = true;
      listenerHandle?.remove();
    };
  }, [native]);

  return null;
}
