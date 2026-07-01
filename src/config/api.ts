// src/config/api.ts
import {Platform} from 'react-native';

/**
 * Your Mac's LAN IP — used when testing on a physical Android device against
 * a local backend. Find it with: ipconfig getifaddr en0
 *
 * Android emulator → use '10.0.2.2' instead (host machine from emulator).
 */
const DEV_LAN_IP = '10.182.97.140';

const devBaseUrl =
  Platform.OS === 'ios'
    ? 'http://localhost:3000'
    : `http://${DEV_LAN_IP}:3000`;

/** Map gallery routes (suggestions, check-in) — run local backend in dev. */
// export const BASE_URL ='http://10.182.97.140:3000';
export const BASE_URL ='https://hala-b-saudi.onrender.com';

/** Venues, brands, and other HBS data — always production (stable HTTPS). */
export const HBS_API = 'https://hala-b-saudi.onrender.com';


export const GOOGLE_PLACES_API_KEY= 'AIzaSyB6CWvlf9f5twQnSjWbEjeNrxmGW2DOins';