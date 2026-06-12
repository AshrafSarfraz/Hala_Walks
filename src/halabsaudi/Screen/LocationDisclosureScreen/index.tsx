// src/halabsaudi/Notifications/LocationDisclosure.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initVenueTracker } from '../../Notifications/index'
const LocationDisclosure = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {

        // ─── Step 1: Foreground location ─────────────────────────────────────
        const fine = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title:          'Location Permission',
            message:        'Hala B Saudi needs your location to detect nearby venues and send exclusive offers.',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          }
        );

        // ─── Step 2: Background location (sirf foreground granted ho tab) ───
        // ✅ NO activity recognition — sirf location
        if (fine === PermissionsAndroid.RESULTS.GRANTED && Platform.Version >= 29) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title:          'Background Location',
              message:        'To receive offers when the app is closed, please select "Allow all the time".',
              buttonNegative: 'While Using App Only',
              buttonPositive: 'Allow All The Time',
            }
          );
        }

        // ✅ NO activity recognition request — removed
      }

      // ─── Save + start tracker ─────────────────────────────────────────────
      await AsyncStorage.multiSet([
        ['hala_permissions_asked', 'true'],
        ['hala_location_permission_granted', 'true'],
      ]);

      await initVenueTracker();

    } catch (e) {
      console.log('[Disclosure] Error:', e);
    } finally {
      setLoading(false);
      navigation.replace('BottomTab');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.multiSet([
      ['hala_permissions_asked', 'true'],
      ['hala_location_permission_granted', 'false'],
    ]);
    navigation.replace('BottomTab');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Location Access</Text>

      <Text style={styles.sectionTitle}>Why we need your location</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Hala B Saudi</Text> uses your location to
        detect nearby venues and send exclusive offers —{' '}
        <Text style={styles.bold}>even when the app is closed.</Text>
      </Text>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Important</Text>
        <Text style={styles.tipText}>
          You will see <Text style={styles.bold}>2 location prompts</Text>:{'\n\n'}
          1️⃣ First: select{' '}
          <Text style={styles.bold}>"Allow"</Text>
          {'\n'}
          2️⃣ Second: select{' '}
          <Text style={styles.bold}>"Allow All The Time"</Text>
          {'\n\n'}
          This lets us notify you near venues even when the app is closed.
        </Text>
      </View>

      <Text style={styles.note}>
        You can change this permission anytime in your device Settings.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAllow}
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
  container:    { flexGrow: 1, padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  icon:         { fontSize: 24, marginBottom: 12 },
  title:        { fontSize: 26, fontWeight: '700', marginBottom: 24, color: '#000' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E7A31', marginTop: 16, marginBottom: 6 },
  text:         { fontSize: 15, lineHeight: 24, color: '#333' },
  bold:         { fontWeight: '700' },
  tipBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  tipTitle:   { fontWeight: '700', color: '#F57C00', marginBottom: 8, fontSize: 15 },
  tipText:    { fontSize: 12, lineHeight: 22, color: '#555' },
  note:       { fontSize: 10, color: '#999', marginTop: 20, marginBottom: 8, fontStyle: 'italic' },
  button:     { backgroundColor: '#1E7A31', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipButton: { marginTop: 12, alignItems: 'center', paddingBottom: 30 },
  skipText:   { color: '#aaa', fontSize: 14 },
});
