import { useEffect, useState } from "react";
import { isNativeApp, showBannerAd } from "@/lib/mobile-ads";
import { setBannerHeight as publishBannerHeight } from "@/lib/banner-height";

let bannerInitialized = false;

// Largest bottom margin we'll ever pass to AdMob. AdMob's BOTTOM_CENTER
// already insets the banner above the nav bar on some devices, so an
// uncapped safe-area value can make the banner float far up the screen.
// Temporarily 0 to confirm the banner sits flush against the nav bar.
const MAX_BANNER_MARGIN = 0;

// Measure the bottom safe-area inset (gesture / nav bar). Some Android
// WebViews report 0 here even with a visible nav bar — the banner is then
// left unchanged. The result is clamped to MAX_BANNER_MARGIN.
function getNavBarHeight(): number {
  const el = document.createElement('div');
  el.style.height = 'env(safe-area-inset-bottom)';
  el.style.position = 'fixed';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  const height = el.getBoundingClientRect().height || 0;
  document.body.removeChild(el);
  return Math.min(Math.max(height, 0), MAX_BANNER_MARGIN);
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
        await showBannerAd(getNavBarHeight());
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
