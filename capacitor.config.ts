import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khutbahtranslate.app',
  appName: 'Khutbah Translate',
  webDir: 'dist',
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
