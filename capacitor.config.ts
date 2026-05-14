import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.khutbahcompanion.app',
  appName: 'Khutbah Companion',
  webDir: 'dist/public',
  backgroundColor: '#0F766E',
  ios: {
    contentInset: 'always',
    backgroundColor: '#0F766E',
  },
  android: {
    backgroundColor: '#0F766E',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0F766E',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
