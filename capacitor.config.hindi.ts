import type { CapacitorConfig } from '@capacitor/cli';

// Hindi/Urdu variant for India, Pakistan markets
const config: CapacitorConfig = {
  appId: 'com.khutbahtranslate.hindi',
  appName: 'Khutbah Translate - हिन्दी',
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
