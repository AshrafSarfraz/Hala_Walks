// src/config/api.ts
import { Platform } from 'react-native';

/** Android emulator → host machine localhost is 10.0.2.2 (not 127.0.0.1) */
export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

// Production (physical device / no local backend):
// export const BASE_URL = 'https://hala-b-saudi.onrender.com';