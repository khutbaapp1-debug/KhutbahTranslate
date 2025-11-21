// Prayer times calculation based on solar position
// Using standard calculation method (similar to ISNA)

interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
  };
  date: string;
}

export type CalculationMethod = 
  | 'ISNA' 
  | 'MWL' 
  | 'EGYPTIAN' 
  | 'KARACHI' 
  | 'MAKKAH' 
  | 'JAFARI'
  | 'TEHRAN';

export const CALCULATION_METHODS = {
  ISNA: {
    name: 'Islamic Society of North America',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  MWL: {
    name: 'Muslim World League',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  EGYPTIAN: {
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  KARACHI: {
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  MAKKAH: {
    name: 'Umm Al-Qura University, Makkah',
    fajrAngle: 18.5,
    ishaAngle: 90, // 90 minutes after Maghrib (handled separately)
  },
  JAFARI: {
    name: 'Shia Ithna-Ashari (Jafari)',
    fajrAngle: 16,
    ishaAngle: 14,
  },
  TEHRAN: {
    name: 'Institute of Geophysics, University of Tehran',
    fajrAngle: 17.7,
    ishaAngle: 14,
  },
};

interface PrayerTimesOptions {
  latitude: number;
  longitude: number;
  date?: Date;
  method?: CalculationMethod;
  asrMethod?: 1 | 2; // 1 = Shafi, 2 = Hanafi
}

export function calculatePrayerTimes(options: PrayerTimesOptions): PrayerTimesResult {
  const {
    latitude,
    longitude,
    date = new Date(),
    method = 'ISNA',
    asrMethod = 1, // Shafi method (shadow = object length)
  } = options;

  const methodConfig = CALCULATION_METHODS[method];
  const fajrAngle = methodConfig.fajrAngle;
  const ishaAngle = methodConfig.ishaAngle;

  // Julian date calculation
  const julianDate = getJulianDate(date);
  
  // Calculate equation of time and sun declination
  const { eqTime, declination } = getSolarPosition(julianDate);
  
  // Calculate prayer times
  const times: any = {};
  
  // Dhuhr (Solar noon + 1 minute to ensure sun has passed meridian)
  times.dhuhr = 12 - longitude / 15 - eqTime / 60 + 1 / 60;
  
  // Sunrise and Sunset
  const sunriseTime = times.dhuhr - timeDiff(-0.833, latitude, declination) / 60;
  const sunsetTime = times.dhuhr + timeDiff(-0.833, latitude, declination) / 60;
  
  times.sunrise = sunriseTime;
  times.maghrib = sunsetTime;
  
  // Fajr (before sunrise)
  times.fajr = times.dhuhr - timeDiff(-fajrAngle, latitude, declination) / 60;
  
  // Isha (after sunset)
  times.isha = times.dhuhr + timeDiff(-ishaAngle, latitude, declination) / 60;
  
  // Asr
  const asrAltitude = asrMethod === 1 
    ? Math.atan(1 / (1 + Math.tan(Math.abs(latitude - declination) * Math.PI / 180)))
    : Math.atan(1 / (2 + Math.tan(Math.abs(latitude - declination) * Math.PI / 180)));
  const asrAngle = -radToDeg(Math.asin(Math.sin(asrAltitude) / Math.cos(declination * Math.PI / 180)));
  times.asr = times.dhuhr + timeDiff(asrAngle, latitude, declination) / 60;
  
  // Apply timezone offset
  const timezoneOffset = -date.getTimezoneOffset() / 60;
  for (const key in times) {
    times[key] += timezoneOffset;
  }
  
  // Format times as HH:MM
  const formattedTimes: any = {};
  for (const key in times) {
    formattedTimes[key] = formatTime(times[key]);
  }
  
  return {
    fajr: formattedTimes.fajr,
    sunrise: formattedTimes.sunrise,
    dhuhr: formattedTimes.dhuhr,
    asr: formattedTimes.asr,
    maghrib: formattedTimes.maghrib,
    isha: formattedTimes.isha,
    location: {
      latitude,
      longitude,
    },
    date: date.toISOString().split('T')[0],
  };
}

// Helper functions

function getJulianDate(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getSolarPosition(jd: number): { eqTime: number; declination: number } {
  const t = (jd - 2451545.0) / 36525.0;
  
  // Mean longitude of sun
  const L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const L0Norm = normalizeAngle(L0);
  
  // Mean anomaly of sun
  const M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const MRad = degToRad(M);
  
  // Equation of center
  const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(MRad) +
            (0.019993 - 0.000101 * t) * Math.sin(2 * MRad) +
            0.000289 * Math.sin(3 * MRad);
  
  // True longitude
  const theta = L0Norm + C;
  
  // Apparent longitude
  const omega = 125.04 - 1934.136 * t;
  const lambda = theta - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
  
  // Obliquity of ecliptic
  const epsilon0 = 23.439291 - 0.0130042 * t - 0.00000164 * t * t + 0.000000504 * t * t * t;
  const epsilon = epsilon0 + 0.00256 * Math.cos(degToRad(omega));
  
  // Declination
  const declination = radToDeg(Math.asin(Math.sin(degToRad(epsilon)) * Math.sin(degToRad(lambda))));
  
  // Equation of time
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  const y = Math.tan(degToRad(epsilon) / 2) * Math.tan(degToRad(epsilon) / 2);
  
  const eqTime = 4 * radToDeg(
    y * Math.sin(2 * degToRad(L0Norm)) -
    2 * e * Math.sin(MRad) +
    4 * e * y * Math.sin(MRad) * Math.cos(2 * degToRad(L0Norm)) -
    0.5 * y * y * Math.sin(4 * degToRad(L0Norm)) -
    1.25 * e * e * Math.sin(2 * MRad)
  );
  
  return { eqTime, declination };
}

function timeDiff(angle: number, latitude: number, declination: number): number {
  const latRad = degToRad(latitude);
  const declRad = degToRad(declination);
  const angleRad = degToRad(angle);
  
  const cosH = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declRad)) / 
               (Math.cos(latRad) * Math.cos(declRad));
  
  if (cosH > 1 || cosH < -1) {
    return 0; // Sun doesn't reach this angle (polar regions)
  }
  
  const arcCosH = Math.acos(cosH);
  return 60 * radToDeg(arcCosH) / 15;
}

function formatTime(time: number): string {
  // Normalize time to 0-24 range
  time = ((time % 24) + 24) % 24;
  
  const hours = Math.floor(time);
  const minutes = Math.floor((time - hours) * 60);
  
  // Convert to 12-hour format with AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

function radToDeg(radians: number): number {
  return radians * 180 / Math.PI;
}

function normalizeAngle(angle: number): number {
  return angle - 360 * Math.floor(angle / 360);
}

// Calculate time remaining until next prayer
export function getTimeUntilNextPrayer(prayerTimes: PrayerTimesResult, currentTime: Date = new Date()): {
  nextPrayer: string;
  timeRemaining: string;
  hours: number;
  minutes: number;
  seconds: number;
} | null {
  // Only include actual prayer times, not sunrise (which is informational only)
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
  
  for (const prayer of prayers) {
    const prayerTimeStr = prayerTimes[prayer as keyof PrayerTimesResult] as string;
    const prayerMinutes = parseTimeToMinutes(prayerTimeStr);
    
    if (prayerMinutes > currentMinutes) {
      const diffMinutes = prayerMinutes - currentMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = Math.floor(diffMinutes % 60);
      const seconds = Math.floor((diffMinutes % 1) * 60);
      
      return {
        nextPrayer: prayer.charAt(0).toUpperCase() + prayer.slice(1),
        timeRemaining: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        hours,
        minutes,
        seconds,
      };
    }
  }
  
  // If no prayer left today, next is Fajr tomorrow
  const fajrMinutes = parseTimeToMinutes(prayerTimes.fajr);
  const diffMinutes = (24 * 60) - currentMinutes + fajrMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = Math.floor(diffMinutes % 60);
  const seconds = Math.floor((diffMinutes % 1) * 60);
  
  return {
    nextPrayer: 'Fajr',
    timeRemaining: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    hours,
    minutes,
    seconds,
  };
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3];
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}
