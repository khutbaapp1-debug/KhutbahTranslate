import { useEffect, useState } from "react";
import { isNativeApp, showBannerAd } from "@/lib/mobile-ads";
import { setBannerHeight as publishBannerHeight } from "@/lib/banner-height";

let bannerInitialized = false;

/**
 * Read env(safe-area-inset-bottom) as a numeric pixel value so we can pass it
 * to the native AdMob plugin (which takes a numeric margin, not CSS).
 * This lifts the banner above the phone's gesture bar / 3-button nav.
 */
function getSafeAreaInsetBottomPx(): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;bottom:0;left:0;width:0;height:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom);";
  document.body.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  document.body.removeChild(probe);
  return Math.round(px);
}

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
        await showBannerAd(getSafeAreaInsetBottomPx());
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
