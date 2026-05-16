import { CalculationMethod, Coordinates, PrayerTimes, Madhab } from 'adhan';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimesResult {
  date: string;
  timezone: string;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

const METHOD_MAP: Record<string, () => any> = {
  MWL: () => CalculationMethod.MuslimWorldLeague(),
  ISNA: () => CalculationMethod.NorthAmerica(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Makkah: () => CalculationMethod.UmmAlQura(),
  Karachi: () => CalculationMethod.Karachi(),
  Tehran: () => CalculationMethod.Tehran(),
  Dubai: () => CalculationMethod.Dubai(),
  Kuwait: () => CalculationMethod.Kuwait(),
  Qatar: () => CalculationMethod.Qatar(),
  Singapore: () => CalculationMethod.Singapore(),
  Turkey: () => CalculationMethod.Turkey(),
  JAFARI: () => CalculationMethod.Tehran(),
  EGYPTIAN: () => CalculationMethod.Egyptian(),
  KARACHI: () => CalculationMethod.Karachi(),
  MAKKAH: () => CalculationMethod.UmmAlQura(),
  UMM_AL_QURA: () => CalculationMethod.UmmAlQura(),
  TEHRAN: () => CalculationMethod.Tehran(),
  KUWAIT: () => CalculationMethod.Kuwait(),
  QATAR: () => CalculationMethod.Qatar(),
  SINGAPORE: () => CalculationMethod.Singapore(),
  GULF: () => CalculationMethod.Dubai(),
  DUBAI: () => CalculationMethod.Dubai(),
  TURKEY: () => CalculationMethod.Turkey(),
};

export function computePrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date(),
  method: string = 'MWL',
  asrMethod: string = 'Standard'
): PrayerTimesResult {
  const coords = new Coordinates(lat, lng);
  const params = (METHOD_MAP[method] ?? METHOD_MAP['MWL'])();
  params.madhab = asrMethod === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  const pt = new PrayerTimes(coords, date, params);
  return {
    date: date.toISOString().split('T')[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };
}

const CACHE_KEY = 'prayer-coords-cache-v1';

export interface CachedCoords {
  latitude: number;
  longitude: number;
  cachedAt: number;
}

export function getCachedCoords(): CachedCoords | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCoords;
    if (Date.now() - parsed.cachedAt > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch { return null; }
}

export function setCachedCoords(latitude: number, longitude: number): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      latitude, longitude, cachedAt: Date.now(),
    }));
  } catch {}
}
