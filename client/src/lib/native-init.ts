import { Capacitor } from "@capacitor/core";

const BRAND_TEAL_HEX = "#0F766E";

/**
 * Initialize native-only behaviour (status bar, splash, back button, etc.).
 * Safe no-op on the web.
 */
export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Status bar: teal background, light (white) icons
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: BRAND_TEAL_HEX });
    }
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn("StatusBar init failed:", err);
  }

  // Splash screen: hide after the app is ready
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (err) {
    console.warn("SplashScreen hide failed:", err);
  }

  // Android hardware back button: go back through history, exit on home page
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn("Back button handler failed:", err);
  }

  // Keyboard: don't resize the webview, just push content above keyboard
  try {
    const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {}
}

/**
 * Open a URL in the device's in-app browser (Safari View Controller / Custom Tabs)
 * on native, and a new tab on web. Safe to use anywhere.
 */
export async function openExternal(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
      return;
    } catch (err) {
      console.warn("Browser.open failed, falling back to window.open:", err);
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
