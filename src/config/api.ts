// src/config/api.ts
import {Platform} from 'react-native';

// The backend runs on this Mac. Android Emulator uses 10.0.2.2 as the
// alias for the host machine's localhost; iOS Simulator can use localhost.
const LOCAL_API_URL = Platform.OS === 'android'
  ? 'http://10.112.17.2:3000'
  : 'http://localhost:3000';
// const LOCAL_API_URL = 'https://hala-b-saudi.onrender.com';

export const BASE_URL = LOCAL_API_URL;
export const HBS_API = BASE_URL;


export const GOOGLE_PLACES_API_KEY = 'AIzaSyB6CWvlf9f5twQnSjWbEjeNrxmGW2DOins';
