import { useEffect, useState } from "react";
import { isNativeApp, showBannerAd, removeBannerAd } from "@/lib/mobile-ads";

function readSafeAreaBottom(): number {
  const el = document.createElement("div");
  el.style.paddingBottom = "env(safe-area-inset-bottom)";
  el.style.position = "fixed";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const px = parseInt(getComputedStyle(el).paddingBottom) || 0;
  document.body.removeChild(el);
  return px;
}

export function BannerAd() {
  const native = isNativeApp();
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    if (!native) return;

    let cancelled = false;
    let listenerHandle: { remove: () => unknown } | null = null;

    async function setup() {
      const margin = 64 + readSafeAreaBottom();
      try {
        const { AdMob, BannerAdPluginEvents } = await import(
          "@capacitor-community/admob"
        );
        if (cancelled) return;
        const handle = await AdMob.addListener(
          BannerAdPluginEvents.SizeChanged,
          (size) => setBannerHeight(size.height),
        );
        if (cancelled) {
          handle.remove();
          return;
        }
        listenerHandle = handle;
        await showBannerAd(margin);
      } catch {
        // ad failed — spacer stays 0, page layout unaffected
      }
    }

    setup();

    return () => {
      cancelled = true;
      listenerHandle?.remove();
      removeBannerAd().catch(() => {});
    };
  }, [native]);

  if (!native) return null;

  return <div style={{ height: bannerHeight }} aria-hidden="true" />;
}
