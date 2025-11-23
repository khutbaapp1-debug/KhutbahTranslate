import type { CapacitorConfig } from '@capacitor/cli';

// French variant for France, Morocco, Algeria, Tunisia, Senegal markets
const config: CapacitorConfig = {
  appId: 'com.khutbahtranslate.french',
  appName: 'Khutbah Companion - Français',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F766E',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default'
    }
  }
};

export default config;
