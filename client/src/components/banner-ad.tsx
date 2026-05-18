import { useEffect, useState } from "react";
import { isNativeApp, showBannerAd } from "@/lib/mobile-ads";
import { setBannerHeight as publishBannerHeight } from "@/lib/banner-height";

let bannerInitialized = false;

export function BannerAd() {
  const native = isNativeApp();
  const [bannerHeight, setBannerHeight] = useState(0);

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
            setBannerHeight(size.height);
            publishBannerHeight(size.height);
            document.documentElement.style.setProperty('--banner-height', `${size.height}px`);
          },
        );
        if (cancelled) {
          handle.remove();
          return;
        }
        listenerHandle = handle;
        // AdMob's BOTTOM_CENTER already lays the banner above the system
        // gesture / nav bar on Android & iOS — don't add safe-area on top of
        // that or the banner ends up floating way above the screen edge.
        await showBannerAd(0);
      } catch {
        // ad failed — spacer stays 0, page layout unaffected
      }
    }

    setup();

    return () => {
      cancelled = true;
      listenerHandle?.remove();
    };
  }, [native]);

  if (!native) return null;

  return <div style={{ height: bannerHeight > 0 ? bannerHeight : 0 }} aria-hidden="true" />;
}
