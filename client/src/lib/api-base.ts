import { Capacitor } from '@capacitor/core';

export function getApiBase(): string {
  if (Capacitor.isNativePlatform()) {
    return 'https://khutbah-translate.replit.app';
  }
  return '';
}
