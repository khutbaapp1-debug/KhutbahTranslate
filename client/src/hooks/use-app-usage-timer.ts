import { useEffect, useState } from "react";

const STORAGE_KEY = "appUsageMs";
const TICK_MS = 10_000; // 10s
const IDLE_THRESHOLD_MS = 60_000; // count user as idle after 1 min of no activity

function readUsage(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function writeUsage(ms: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ms));
  } catch {}
}

/**
 * Tracks accumulated active app usage time across all sessions.
 * Only counts time when the tab is visible AND the user has interacted recently.
 * Returns the current total in milliseconds.
 */
export function useAppUsageTimer(): number {
  const [usageMs, setUsageMs] = useState<number>(() => readUsage());

  useEffect(() => {
    let lastActivity = Date.now();

    const markActive = () => {
      lastActivity = Date.now();
    };

    const events: (keyof DocumentEventMap)[] = [
      "click",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];
    events.forEach((e) => document.addEventListener(e, markActive, { passive: true }));

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActivity > IDLE_THRESHOLD_MS) return;

      const next = readUsage() + TICK_MS;
      writeUsage(next);
      setUsageMs(next);
    }, TICK_MS);

    return () => {
      window.clearInterval(interval);
      events.forEach((e) => document.removeEventListener(e, markActive));
    };
  }, []);

  return usageMs;
}
