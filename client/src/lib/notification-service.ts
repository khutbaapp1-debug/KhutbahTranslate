import { LocalNotifications } from "@capacitor/local-notifications";
import type { LocalNotificationSchema } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

const MAX_NOTIFICATIONS = 50;
const DAYS_AHEAD = 7;

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

function getAdhanMethod(method: string) {
  switch (method) {
    case 'MWL':      return CalculationMethod.MuslimWorldLeague();
    case 'EGYPTIAN': return CalculationMethod.Egyptian();
    case 'KARACHI':  return CalculationMethod.Karachi();
    case 'MAKKAH':   return CalculationMethod.UmmAlQura();
    case 'JAFARI':
    case 'TEHRAN':   return CalculationMethod.Tehran();
    default:         return CalculationMethod.NorthAmerica(); // ISNA
  }
}

function parseHHMM(timeStr: string): { hours: number; minutes: number } | null {
  const m = timeStr?.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return { hours: parseInt(m[1], 10), minutes: parseInt(m[2], 10) };
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

  const method = localStorage.getItem("prayerCalculationMethod") || "ISNA";
  const asrMethod = localStorage.getItem("asrCalculationMethod") || "standard";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const toSchedule: LocalNotificationSchema[] = [];
  const now = new Date();

  // Step 6 — Prayer notifications for next 7 days (computed client-side via adhan)
  if (settings.prayerRemindersEnabled) {
    const coordinates = new Coordinates(coords.latitude, coords.longitude);
    const params = getAdhanMethod(method);
    params.madhab = asrMethod === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

    const prayers: Array<{ name: string; key: keyof PrayerTimes; toggle: string; idx: number }> = [
      { name: "Fajr",    key: "fajr",    toggle: "fajrReminderEnabled",    idx: 0 },
      { name: "Dhuhr",   key: "dhuhr",   toggle: "dhuhrReminderEnabled",   idx: 1 },
      { name: "Asr",     key: "asr",     toggle: "asrReminderEnabled",     idx: 2 },
      { name: "Maghrib", key: "maghrib", toggle: "maghribReminderEnabled", idx: 3 },
      { name: "Isha",    key: "isha",    toggle: "ishaReminderEnabled",    idx: 4 },
    ];

    for (let day = 0; day < DAYS_AHEAD; day++) {
      if (toSchedule.length >= MAX_NOTIFICATIONS) break;

      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      const pt = new PrayerTimes(coordinates, date, params);

      for (const prayer of prayers) {
        if (toSchedule.length >= MAX_NOTIFICATIONS) break;
        if (!settings[prayer.toggle]) continue;
        const at = pt[prayer.key] as unknown as Date;
        if (!(at instanceof Date) || at <= now) continue;
        // IDs 1-70: day * 10 + prayerIdx + 1
        toSchedule.push({
          id: day * 10 + prayer.idx + 1,
          title: "Prayer Time",
          body: `It's time for ${prayer.name} prayer`,
          schedule: { at },
          smallIcon: "ic_launcher",
        });
      }

      // Jummah (Friday)
      if (settings.jummahReminderEnabled && date.getDay() === 5 && settings.jummahReminderTime) {
        const parsed = parseHHMM(settings.jummahReminderTime);
        if (parsed) {
          const at = new Date(date);
          at.setHours(parsed.hours, parsed.minutes, 0, 0);
          if (at > now && toSchedule.length < MAX_NOTIFICATIONS) {
            toSchedule.push({
              id: 200 + day, // IDs 200-206 for Jummah
              title: "Prayer Time",
              body: "Jummah Mubarak — Friday prayer time",
              schedule: { at },
              smallIcon: "ic_launcher",
            });
          }
        }
      }
    }
  }

  // Step 7 — Dua notifications for next 7 days (HH:MM times in device local timezone)
  if (settings.duaRemindersEnabled) {
    const morningParsed = parseHHMM(settings.duaMorningTime);
    const eveningParsed = parseHHMM(settings.duaEveningTime);

    for (let day = 0; day < DAYS_AHEAD; day++) {
      if (toSchedule.length >= MAX_NOTIFICATIONS) break;

      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      if (morningParsed) {
        const at = new Date(date);
        at.setHours(morningParsed.hours, morningParsed.minutes, 0, 0);
        if (at > now && toSchedule.length < MAX_NOTIFICATIONS) {
          toSchedule.push({
            id: 100 + day, // IDs 100-106 for morning dua
            title: "Morning Dua",
            body: "Time for your morning dua — tap to open",
            schedule: { at },
            smallIcon: "ic_launcher",
          });
        }
      }

      if (eveningParsed) {
        const at = new Date(date);
        at.setHours(eveningParsed.hours, eveningParsed.minutes, 0, 0);
        if (at > now && toSchedule.length < MAX_NOTIFICATIONS) {
          toSchedule.push({
            id: 110 + day, // IDs 110-116 for evening dua
            title: "Evening Dua",
            body: "Time for your evening dua — tap to open",
            schedule: { at },
            smallIcon: "ic_launcher",
          });
        }
      }
    }
  }

  // Step 8 — Hadith notifications for next 7 days
  if (settings.dailyHadithEnabled) {
    const hadithParsed = parseHHMM(settings.dailyHadithTime);
    if (hadithParsed) {
      for (let day = 0; day < DAYS_AHEAD; day++) {
        if (toSchedule.length >= MAX_NOTIFICATIONS) break;

        const date = new Date();
        date.setDate(date.getDate() + day);
        const at = new Date(date);
        at.setHours(hadithParsed.hours, hadithParsed.minutes, 0, 0);
        if (at > now) {
          toSchedule.push({
            id: 120 + day, // IDs 120-126 for hadith
            title: "Daily Hadith",
            body: "Your daily hadith is ready — tap to read",
            schedule: { at },
            smallIcon: "ic_launcher",
          });
        }
      }
    }
  }

  if (toSchedule.length > 0) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
}
