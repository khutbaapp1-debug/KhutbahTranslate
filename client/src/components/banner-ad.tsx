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
            // On Android 15+ the AdMob plugin auto-adds the system window inset
            // (gesture/3-button nav bar, ~48dp) below the banner. The visible
            // "occupied" area on screen is therefore taller than just the ad.
            // Reserve ~56dp extra so page content (rows of tiles, etc.) clears
            // the entire region the banner & system nav take up.
            const systemNavReserve = 56;
            const totalReserved = size.height + systemNavReserve;
            setBannerHeight(totalReserved);
            publishBannerHeight(totalReserved);
            document.documentElement.style.setProperty('--banner-height', `${totalReserved}px`);
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
