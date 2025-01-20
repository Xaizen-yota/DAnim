import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.danime.app',
  appName: 'Danime',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'android/app/keystore.jks',
      keystoreAlias: 'danime',
      keystorePassword: 'your_keystore_password',
      storeFile: 'keystore.jks',
      storePassword: 'your_store_password',
      keyAlias: 'danime',
      keyPassword: 'your_key_password'
    }
  }
}

export default config;
