import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAppUsageTimer } from "@/hooks/use-app-usage-timer";
import {
  isNativeApp,
  initMobileAds,
  showBannerAd,
  hideBannerAd,
  removeBannerAd,
} from "@/lib/mobile-ads";

const ADSENSE_CLIENT = "ca-pub-6514143339893635";
const USAGE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const NO_AD_PATHS = ["/khutbah"]; // never show ads on the translation page
const SCRIPT_ID = "adsbygoogle-script";
const HIDE_STYLE_ID = "adsbygoogle-hide-style";

function injectScript() {
  if (document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(s);
}

function setHideAds(hide: boolean) {
  const existing = document.getElementById(HIDE_STYLE_ID);
  if (hide) {
    if (existing) return;
    const style = document.createElement("style");
    style.id = HIDE_STYLE_ID;
    style.textContent = `
      .adsbygoogle,
      ins.adsbygoogle,
      [id^="aswift_"],
      [id^="google_ads"],
      .google-auto-placed { display: none !important; }
    `;
    document.head.appendChild(style);
  } else if (existing) {
    existing.remove();
  }
}

/**
 * Loads AdSense Auto Ads after the user has used the app for 30 minutes total.
 * Hides all ads while on the live-translation page.
 */
export function AdsLoader() {
  const usageMs = useAppUsageTimer();
  const [location] = useLocation();

  const onNoAdPage = NO_AD_PATHS.some(
    (p) => location === p || location.startsWith(p + "/")
  );

  const thresholdMet = usageMs >= USAGE_THRESHOLD_MS;

  // Web: inject AdSense Auto Ads script after the threshold.
  useEffect(() => {
    if (!isNativeApp() && thresholdMet) {
      injectScript();
    }
  }, [thresholdMet]);

  // Web: hide ads on the translation page.
  useEffect(() => {
    if (!isNativeApp()) setHideAds(onNoAdPage);
  }, [onNoAdPage]);

  // Native (iOS / Android): initialize AdMob once.
  useEffect(() => {
    if (isNativeApp()) {
      initMobileAds();
    }
    return () => {
      if (isNativeApp()) removeBannerAd();
    };
  }, []);

  // Native: show / hide banner based on threshold + route.
  useEffect(() => {
    if (!isNativeApp()) return;
    if (thresholdMet && !onNoAdPage) {
      showBannerAd();
    } else {
      hideBannerAd();
    }
  }, [thresholdMet, onNoAdPage]);

  return null;
}
