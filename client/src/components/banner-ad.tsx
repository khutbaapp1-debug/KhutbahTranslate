import { useEffect, useState } from "react";
import { isNativeApp, showBannerAd } from "@/lib/mobile-ads";
import { setBannerHeight as publishBannerHeight } from "@/lib/banner-height";

let bannerInitialized = false;

// Largest bottom margin we'll ever pass to AdMob — caps the native nav-bar
// height so a bad reading can't push the banner far up the screen.
const MAX_BANNER_MARGIN = 80;

// Read the navigation bar height injected by MainActivity as
// window.__navBarHeight (set from a WindowInsets listener). Returns 0 when
// unavailable — on web, or before the native listener has fired. The value
// is clamped to MAX_BANNER_MARGIN.
function getNavBarHeight(): number {
  const native = (window as any).__navBarHeight;
  if (typeof native === "number" && native > 0) {
    return Math.min(native, MAX_BANNER_MARGIN);
  }
  return 0;
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
            const systemNavReserve = 0;
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
