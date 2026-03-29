import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestAllPermissions,
  initBackgroundVenueTracker,
} from '../../Notifications';

const LocationDisclosure = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    try {
      setLoading(true);
      // Ask all permissions at once — only ever called once
      await requestAllPermissions();
      // Start tracker only if granted
      await initBackgroundVenueTracker();
    } catch (e) {
      console.log('[Disclosure] Error:', e);
    } finally {
      setLoading(false);
      navigation.replace('BottomTab');
    }
  };

  const handleSkip = async () => {
    // Mark as asked but not granted — never show this screen again
    await AsyncStorage.setItem('hala_permissions_asked', 'true');
    await AsyncStorage.setItem('hala_location_permission_granted', 'false');
    navigation.replace('BottomTab');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Location Access</Text>

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
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24, color: '#000' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E7A31', marginTop: 16, marginBottom: 6 },
  text: { fontSize: 15, lineHeight: 24, color: '#333' },
  bold: { fontWeight: '700' },
  note: { fontSize: 13, color: '#888', marginTop: 20, marginBottom: 10, fontStyle: 'italic' },
  button: { backgroundColor: '#1E7A31', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipButton: { marginTop: 14, alignItems: 'center', paddingBottom: 30 },
  skipText: { color: '#888', fontSize: 15 },
});