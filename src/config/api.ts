// src/config/api.ts
import { Platform } from 'react-native';

export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.100.5:3000' // Android emulator localhost
    : 'http://localhost:3000'; // iOS simulator localhost