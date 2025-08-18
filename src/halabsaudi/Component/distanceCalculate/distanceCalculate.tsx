/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useCallback} from 'react';
import {Text, PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Fonts } from '../../Themes/Fonts';

interface DistanceFromDeviceProps {
  targetLat: number;
  targetLong: number;
  kmText: string;
  mText: string;
  loadingText: string;
}

const DistanceFromDevice: React.FC<DistanceFromDeviceProps> = ({
  targetLat,
  targetLong,
  kmText,
  mText,
  loadingText,
}) => {
  const [distance, setDistance] = useState<string | null>(null);

  const haversineDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (v: number) => (v * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const promptToEnableLocation = () => {
    Alert.alert(
      'Turn on Location',
      'Location services are off. Please enable to show distance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };

  const requestAndroidPermission = async () => {
    // First, check existing state so we don’t spam the prompt.
    const already = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (already) return 'granted' as const;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need access to your location to show distance.',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    // Possible values: 'granted' | 'denied' | 'never_ask_again'
    return result as 'granted' | 'denied' | 'never_ask_again';
  };

  const requestIOSPermission = async () => {
    // iOS: if user once denies, system prompt dobara nahi aata – settings kholna padta hai
    const status = await Geolocation.requestAuthorization('whenInUse');
    return status; // 'granted' | 'denied' | 'disabled' | 'restricted'
  };

  const calculateDistance = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude: userLat, longitude: userLong } = pos.coords;
        const km = haversineDistance(userLat, userLong, targetLat, targetLong);

        if (km < 1) {
          setDistance(`${(km * 1000).toFixed(0)} ${mText}`);
        } else {
          setDistance(`${km.toFixed(2)} ${kmText}`);
        }
      },
      err => {
        // Common codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (err.code === 1) {
          // Permission issue
          Alert.alert(
            'Permission Needed',
            'Please allow location to show distance.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openAppSettings },
            ]
          );
        } else if (err.code === 2) {
          // Services off or no fix
          promptToEnableLocation();
        }
        setDistance('?');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        // Android-only helpers (react-native-geolocation-service supports these):
        forceRequestLocation: true,    // try to get fresh fix
        showLocationDialog: true,      // show “Turn on location” dialog if off
      }
    );
  };

  useEffect(() => {
    const run = async () => {
      if (Platform.OS === 'android') {
        const res = await requestAndroidPermission();

        if (res === 'granted') {
          calculateDistance();
        } else if (res === 'never_ask_again') {
          Alert.alert(
            'Permission Blocked',
            'You have blocked location permission. Enable it from Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openAppSettings },
            ]
          );
          setDistance('?');
        } else {
          // denied (but not permanently)
          setDistance('?');
        }
      } else {
        const status = await requestIOSPermission();
        if (status === 'granted') {
          calculateDistance();
        } else {
          // 'denied' | 'disabled' | 'restricted'
          setDistance('?');
          if (status === 'disabled') {
            promptToEnableLocation();
          } else {
            Alert.alert(
              'Permission Needed',
              'Please allow location in Settings to show distance.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: openAppSettings },
              ]
            );
          }
        }
      }
    };

    run();
    // re-run if target changes or text props change
  }, [kmText, mText, targetLat, targetLong, haversineDistance]);

  return (
    <>
      <Text
        style={{
          fontSize: 10,
          color: 'green',
          fontFamily: Fonts.SF_Medium,
          lineHeight: 14,
          marginLeft: 2,
        }}
      >
        {distance ?? loadingText}
      </Text>
    </>
  );
};

export default DistanceFromDevice;



// /* eslint-disable react-native/no-inline-styles */
// import React, {useState, useEffect} from 'react';
// import {Text, PermissionsAndroid, Platform} from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
// import { Fonts } from '../../Themes/Fonts';

// interface DistanceFromDeviceProps {
//   targetLat: number;
//   targetLong: number;
//   kmText: string;
//   mText: string;
//   loadingText: string;
// }

// const DistanceFromDevice: React.FC<DistanceFromDeviceProps> = ({
//   targetLat,
//   targetLong,
//   kmText,
//   mText,
//   loadingText,
// }) => {
//   const [distance, setDistance] = useState<string | null>(null);

//   useEffect(() => {
//     const requestLocationPermission = async () => {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message:
//               'We need access to your location to provide better services.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           calculateDistance();
//         } else {
//           setDistance('?');
//         }
//       } else {
//         const authStatus = await Geolocation.requestAuthorization('whenInUse');

//         if (authStatus === 'granted') {
//           console.log('Permission granted');
//           calculateDistance();
//         }
//       }
//     };

//     const calculateDistance = () => {
//       Geolocation.getCurrentPosition(
//         position => {
//           //console.log('myPosition', position.coords);
//           const {latitude: userLat, longitude: userLong} = position.coords;

//           const haversineDistance = (
//             lat1: number,
//             lon1: number,
//             lat2: number,
//             lon2: number,
//           ) => {
//             const toRad = (value: number) => (value * Math.PI) / 180;
//             const R = 6371; // Radius of the Earth in km
//             const dLat = toRad(lat2 - lat1);
//             const dLon = toRad(lon2 - lon1);
//             const a =
//               Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//               Math.cos(toRad(lat1)) *
//                 Math.cos(toRad(lat2)) *
//                 Math.sin(dLon / 2) *
//                 Math.sin(dLon / 2);
//             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//             return R * c; // Distance in km
//           };

//           const distanceInKm = haversineDistance(
//             userLat,
//             userLong,
//             targetLat,
//             targetLong,
//           );   // i add 2.5 bcz haversineDistance gave straight line distance which is less than by google map 

//           // Display in meters if less than 1 km
//           if (distanceInKm < 1) {
//             const distanceInMeters = distanceInKm * 1000;
//             setDistance(distanceInMeters.toFixed(0) + ' ' + mText);
//           } else {
//             setDistance(distanceInKm.toFixed(2) + ' ' + kmText);
//           }
//         },
//         error => {
//           console.error(error);
//           setDistance('?');
//         },
//         {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
//       );
//     };

//     requestLocationPermission();
//   }, [kmText, mText, targetLat, targetLong]);

//   return distance ? (
//     <Text style={{fontSize: 10, color: 'green', fontFamily: Fonts.SF_Medium, lineHeight: 14, marginLeft: 2,}}>{(distance)}</Text>
//   ) : (
//     <Text style={{fontSize: 10, color: 'green', fontFamily: Fonts.SF_Medium, lineHeight: 14, marginLeft: 2,}}>{loadingText}</Text>
//   );
// };

// export default DistanceFromDevice;
