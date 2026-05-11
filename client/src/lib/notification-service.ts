import { LocalNotifications } from "@capacitor/local-notifications";
import type { LocalNotificationSchema } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

function getCoords(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      reject,
      { timeout: 5000 }
    );
  });
}

function parseTimeString(timeStr: string): Date | null {
  if (!timeStr) return null;

  // "5:12 AM" / "12:30 PM" format (API prayer times)
  const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // "07:00" / "HH:MM" format (settings dua/hadith times)
  const hhmmMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    const hours = parseInt(hhmmMatch[1], 10);
    const minutes = parseInt(hhmmMatch[2], 10);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  return null;
}

export async function scheduleAllNotifications(): Promise<void> {
  // Step 1 — Web no-op
  if (!Capacitor.isNativePlatform()) return;

  // Step 2 — Permission
  const { display } = await LocalNotifications.requestPermissions();
  if (display !== "granted") return;

  // Step 3 — Settings
  const stored = localStorage.getItem("notification-settings");
  if (!stored) return;
  let settings: Record<string, any>;
  try {
    settings = JSON.parse(stored);
  } catch {
    return;
  }
  if (!settings.notificationsEnabled) return;

  // Step 4 — Cancel all existing scheduled notifications
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  }

  // Step 5 — Coordinates
  let coords: GeolocationCoordinates;
  try {
    coords = await getCoords();
  } catch {
    return;
  }

  // Step 6 — Fetch prayer times
  const method = localStorage.getItem("prayerCalculationMethod") || "ISNA";
  const asrMethod = localStorage.getItem("asrCalculationMethod") || "standard";
  let prayerData: Record<string, any>;
  try {
    const res = await fetch(
      `/api/prayer-times?latitude=${coords.latitude}&longitude=${coords.longitude}&method=${method}&asrMethod=${asrMethod}`
    );
    if (!res.ok) return;
    prayerData = await res.json();
  } catch {
    return;
  }

  const toSchedule: LocalNotificationSchema[] = [];
  const now = new Date();

  // Step 7 — Prayer notifications
  if (settings.prayerRemindersEnabled) {
    const prayers: Array<{ name: string; field: string; toggle: string; id: number }> = [
      { name: "Fajr",    field: "fajr",    toggle: "fajrReminderEnabled",    id: 1 },
      { name: "Dhuhr",   field: "dhuhr",   toggle: "dhuhrReminderEnabled",   id: 2 },
      { name: "Asr",     field: "asr",     toggle: "asrReminderEnabled",     id: 3 },
      { name: "Maghrib", field: "maghrib", toggle: "maghribReminderEnabled", id: 4 },
      { name: "Isha",    field: "isha",    toggle: "ishaReminderEnabled",    id: 5 },
    ];

    for (const prayer of prayers) {
      if (!settings[prayer.toggle]) continue;
      const at = parseTimeString(prayerData[prayer.field]);
      if (!at || at <= now) continue;
      toSchedule.push({
        id: prayer.id,
        title: "Prayer Time",
        body: `It's time for ${prayer.name} prayer`,
        schedule: { at },
        smallIcon: "ic_launcher",
      });
    }

    // Jummah
    if (settings.jummahReminderEnabled && now.getDay() === 5) {
      const at = parseTimeString(settings.jummahReminderTime);
      if (at && at > now) {
        toSchedule.push({
          id: 6,
          title: "Prayer Time",
          body: "Jummah Mubarak — Friday prayer time",
          schedule: { at },
          smallIcon: "ic_launcher",
        });
      }
    }
  }

  // Step 8 — Dua notifications
  if (settings.duaRemindersEnabled) {
    const morningAt = parseTimeString(settings.duaMorningTime);
    if (morningAt && morningAt > now) {
      toSchedule.push({
        id: 10,
        title: "Morning Dua",
        body: "Time for your morning dua — tap to open",
        schedule: { at: morningAt },
        smallIcon: "ic_launcher",
      });
    }
    const eveningAt = parseTimeString(settings.duaEveningTime);
    if (eveningAt && eveningAt > now) {
      toSchedule.push({
        id: 11,
        title: "Evening Dua",
        body: "Time for your evening dua — tap to open",
        schedule: { at: eveningAt },
        smallIcon: "ic_launcher",
      });
    }
  }

  // Step 9 — Hadith notification
  if (settings.dailyHadithEnabled) {
    const at = parseTimeString(settings.dailyHadithTime);
    if (at && at > now) {
      toSchedule.push({
        id: 20,
        title: "Daily Hadith",
        body: "Your daily hadith is ready — tap to read",
        schedule: { at },
        smallIcon: "ic_launcher",
      });
    }
  }

  if (toSchedule.length > 0) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
}
