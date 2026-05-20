import { Capacitor } from "@capacitor/core";

/**
 * Initialize native-only behaviour (status bar, splash, back button, etc.).
 * Safe no-op on the web.
 */
export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Status bar: draw behind content; page headers use .pt-safe to clear it
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {}

  // Permissions: request all three during splash, then hide it
  try {
    const [{ SplashScreen }, { Geolocation }, { LocalNotifications }] = await Promise.all([
      import("@capacitor/splash-screen"),
      import("@capacitor/geolocation"),
      import("@capacitor/local-notifications"),
    ]);

    const micPromise = navigator.mediaDevices
      ? navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => stream.getTracks().forEach(t => t.stop()))
          .catch(() => {})
      : Promise.resolve();

    await Promise.allSettled([
      Geolocation.requestPermissions(),
      LocalNotifications.requestPermissions(),
      micPromise,
    ]);

    await SplashScreen.hide({ fadeOutDuration: 500 });
  } catch {}

  // Android hardware back button: go back through history, exit on home page
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", () => {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "") {
        App.exitApp();
      } else {
        window.history.back();
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

  // Re-schedule notifications whenever the app returns to the foreground
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        const { scheduleAllNotifications } = await import("@/lib/notification-service");
        scheduleAllNotifications().catch(console.error);
      }
    });
  } catch (err) {
    console.warn("App state listener failed:", err);
  }

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
