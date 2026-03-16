import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initBackgroundVenueTracker } from '../../Notifications';


const LocationDisclosure = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const requestLocationFlow = async () => {
    try {
      setLoading(true);

      if (Platform.OS === 'android') {
        // ✅ STEP 1: Request foreground location FIRST (required before background)
        const fineGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to detect nearby venues.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          }
        );

        if (fineGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to detect nearby venues.',
          );
          setLoading(false);
          return;
        }

        // ✅ STEP 2: Only AFTER foreground is granted, request background
        // Android 10+ (API 29+) requires separate background permission request
        if (Platform.Version >= 29) {
          // ✅ Google Play requires you show your OWN explanation before triggering
          // the system dialog for background location — this screen IS that disclosure.
          // Now trigger the system dialog:
          const bgGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message:
                'To send you notifications about nearby venues even when the app is closed, ' +
                'please select "Allow all the time" on the next screen.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Deny',
              buttonPositive: 'Go to Settings',
            }
          );

          if (bgGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Background Location Not Enabled',
              'You can still use the app, but you won\'t receive nearby venue notifications when the app is closed.',
              [{ text: 'OK' }]
            );
            // ✅ Still proceed — don't block the user
          }
        }
      }

      // ✅ Mark disclosure as accepted
      await AsyncStorage.setItem('hala_location_disclosure_accepted', 'true');

      // ✅ NOW init the tracker — AFTER permissions are handled
      await initBackgroundVenueTracker();

      navigation.replace('BottomTab');
    } catch (error) {
      console.log('Disclosure permission error:', error);
      await AsyncStorage.setItem('hala_location_disclosure_accepted', 'true');
      navigation.replace('BottomTab');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hala_location_disclosure_accepted', 'true');
    navigation.replace('BottomTab');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Icon / visual */}
      <Text style={styles.icon}>📍</Text>

      <Text style={styles.title}>Location Access</Text>

      {/* ✅ Google requires "prominent disclosure" — clear, readable, before any permission */}
      <Text style={styles.sectionTitle}>Why we need your location</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Hala B Saudi</Text> collects location data to detect
        when you are near partner venues and sends you exclusive offers and
        notifications — <Text style={styles.bold}>even when the app is closed or not in use.</Text>
      </Text>

      <Text style={styles.sectionTitle}>What we use it for</Text>
      <Text style={styles.text}>
        • Detect nearby restaurants, shops, and venues{'\n'}
        • Send relevant discount and offer notifications{'\n'}
        • Improve venue recommendation accuracy
      </Text>

      <Text style={styles.sectionTitle}>What we do NOT do</Text>
      <Text style={styles.text}>
        • We do not sell your location data{'\n'}
        • We do not share it with third parties{'\n'}
        • Location is only used for venue-based features
      </Text>

      <Text style={styles.note}>
        You can change this permission anytime in your device Settings.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={requestLocationFlow}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Please wait...' : 'Allow Location Access'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        disabled={loading}
      >
        <Text style={styles.skipText}>Not Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LocationDisclosure;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E7A31',
    marginTop: 16,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  bold: {
    fontWeight: '700',
  },
  note: {
    fontSize: 13,
    color: '#888',
    marginTop: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#1E7A31',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingBottom: 30,
  },
  skipText: {
    color: '#888',
    fontSize: 15,
  },
});