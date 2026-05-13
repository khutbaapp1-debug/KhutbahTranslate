import { useEffect } from "react";
import { isNativeApp, initMobileAds } from "@/lib/mobile-ads";

export function AdsLoader() {
  useEffect(() => {
    if (isNativeApp()) {
      initMobileAds();
    }
  }, []);
  return null;
}
