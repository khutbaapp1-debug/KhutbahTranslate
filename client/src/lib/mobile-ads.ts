import { Capacitor } from "@capacitor/core";

/**
 * AdMob configuration.
 *
 * To activate real ads after AdMob approval:
 *   1. Replace TEST_* values below with your real AdMob IDs.
 *   2. Update GADApplicationIdentifier in ios/App/App/Info.plist
 *   3. Update com.google.android.gms.ads.APPLICATION_ID in
 *      android/app/src/main/AndroidManifest.xml
 *   4. Run `npx cap sync` and rebuild the native app.
 *
 * Google's official test IDs (always safe; show test ads):
 *   https://developers.google.com/admob/android/test-ads
 *   https://developers.google.com/admob/ios/test-ads
 */

const USE_TEST_ADS = false;

const TEST_BANNER_ANDROID = "ca-app-pub-3940256099942544/6300978111";
const TEST_BANNER_IOS = "ca-app-pub-3940256099942544/2934735716";

const REAL_BANNER_ANDROID = "ca-app-pub-6514143339893635/4741009217";
const REAL_BANNER_IOS = "ca-app-pub-6514143339893635/7057240855";

export function getBannerAdUnitId(): string {
  const platform = Capacitor.getPlatform();
  if (USE_TEST_ADS) {
    return platform === "ios" ? TEST_BANNER_IOS : TEST_BANNER_ANDROID;
  }
  return platform === "ios" ? REAL_BANNER_IOS : REAL_BANNER_ANDROID;
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

let initialized = false;

/**
 * Initialize AdMob. Safe to call multiple times.
 * Only does anything when running inside the native iOS or Android app.
 */
export async function initMobileAds(): Promise<void> {
  if (initialized) return;
  if (!isNativeApp()) return;

  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: USE_TEST_ADS,
    });
    initialized = true;
  } catch (err) {
    console.warn("AdMob initialization failed:", err);
  }
}

/**
 * Show a bottom banner. Returns true if shown.
 * Respects the calling code's gating (usage threshold, route, etc.).
 */
export async function showBannerAd(): Promise<boolean> {
  if (!isNativeApp()) return false;
  await initMobileAds();

  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import(
      "@capacitor-community/admob"
    );
    await AdMob.showBanner({
      adId: getBannerAdUnitId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    });
    return true;
  } catch (err) {
    console.warn("AdMob showBanner failed:", err);
    return false;
  }
}

export async function hideBannerAd(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.hideBanner();
  } catch {}
}

export async function removeBannerAd(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.removeBanner();
  } catch {}
}
