// Prayer times calculation using the Adhan library
import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Madhab } from 'adhan';
import { toZonedTime } from 'date-fns-tz';
import { find } from 'geo-tz';

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

export type CalculationMethodType = 
  | 'ISNA' 
  | 'MWL' 
  | 'EGYPTIAN' 
  | 'KARACHI' 
  | 'MAKKAH' 
  | 'JAFARI'
  | 'TEHRAN';

interface PrayerTimesOptions {
  latitude: number;
  longitude: number;
  date?: Date;
  method?: CalculationMethodType;
  asrMethod?: 'standard' | 'hanafi';
}

function getAdhanCalculationMethod(method: CalculationMethodType): ReturnType<typeof CalculationMethod.NorthAmerica> {
  switch (method) {
    case 'ISNA':
      return CalculationMethod.NorthAmerica();
    case 'MWL':
      return CalculationMethod.MuslimWorldLeague();
    case 'EGYPTIAN':
      return CalculationMethod.Egyptian();
    case 'KARACHI':
      return CalculationMethod.Karachi();
    case 'MAKKAH':
      return CalculationMethod.UmmAlQura();
    case 'JAFARI':
      return CalculationMethod.Tehran(); // Closest available for Jafari
    case 'TEHRAN':
      return CalculationMethod.Tehran();
    default:
      return CalculationMethod.NorthAmerica();
  }
}

export function calculatePrayerTimes(options: PrayerTimesOptions): PrayerTimesResult {
  const {
    latitude,
    longitude,
    date = new Date(),
    method = 'ISNA',
    asrMethod = 'standard',
  } = options;

  const coordinates = new Coordinates(latitude, longitude);
  const params = getAdhanCalculationMethod(method);
  
  // Set Asr method
  params.madhab = asrMethod === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Get timezone for the coordinates
  const timezones = find(latitude, longitude);
  const timezone = timezones[0] || 'UTC';

  // Format time in the local timezone of the coordinates
  function formatTime(date: Date): string {
    const zonedDate = toZonedTime(date, timezone);
    let hours = zonedDate.getHours();
    const minutes = zonedDate.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  return {
    fajr: formatTime(prayerTimes.fajr),
    sunrise: formatTime(prayerTimes.sunrise),
    dhuhr: formatTime(prayerTimes.dhuhr),
    asr: formatTime(prayerTimes.asr),
    maghrib: formatTime(prayerTimes.maghrib),
    isha: formatTime(prayerTimes.isha),
    location: {
      latitude,
      longitude,
    },
    date: date.toISOString().split('T')[0],
  };
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
