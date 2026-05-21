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
    backgroundColor: '#ffffff',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#0F766E',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
