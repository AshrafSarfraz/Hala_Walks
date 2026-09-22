// src/config/api.ts
import {Platform} from 'react-native';

// The backend runs on this Mac. Android Emulator uses 10.0.2.2 as the
// alias for the host machine's localhost; iOS Simulator can use localhost.
// ✅ FIX: pehle yahan localhost tha aur production URL COMMENT me pada tha.
//    Ye build store par jati to kuch bhi kaam na karta — na login, na chat.
const PRODUCTION_URL = 'https://hala-b-saudi.onrender.com';

// Local backend par test karna ho to isay true karein.
// Release build me (__DEV__ false) ye AUTOMATICALLY ignore ho jata hai,
// is liye galti se true chhut jaye to bhi store par production hi jayega.
const USE_LOCAL = false;

const LOCAL_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'    // Android emulator ka host alias
  : 'http://localhost:3000';

export const BASE_URL = __DEV__ && USE_LOCAL ? LOCAL_API_URL : PRODUCTION_URL;
export const HBS_API = BASE_URL;


export const GOOGLE_PLACES_API_KEY = 'AIzaSyB6CWvlf9f5twQnSjWbEjeNrxmGW2DOins';
