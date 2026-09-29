import {Text} from '../../../ui/Text';
import {Alert} from '../../../ui/Alert';
import React, { useState } from 'react';
import {View, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import { showNotification } from '../../Notifications';

import {Colors} from '../../Themes/Colors';

const TEST_VENUES = [
  { id: '693a90ac7cb8c3489f12842c', name: 'Katara' },
  { id: '693a90ac7cb8c3489f12842f', name: 'West Walk' },
];

const NotificationTestScreen: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const testNotification = async (venueName: string, venueId: string) => {
    try {
      addLog(`🔔 Sending notification for: ${venueName}`);
      await showNotification(venueName, venueId);
      addLog(`✅ Notification sent! Now click it to test navigation.`);
    } catch (e) {
      addLog(`❌ Error: ${e}`);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Notification Test</Text>
      <Text style={styles.subtitle}>
        Button dabaao → Notification aayegi → Click karo → SelectedVenue khulna chahiye
      </Text>

      {TEST_VENUES.map(venue => (
        <TouchableOpacity
          key={venue.id}
          style={styles.button}
          onPress={() => testNotification(venue.name, venue.id)}>
          <Text style={styles.buttonText}>
            🔔 Test: {venue.name}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
        <Text style={styles.clearText}>🗑️ Clear Logs</Text>
      </TouchableOpacity>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>📋 Logs:</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyLog}>Koi log nahi abhi...</Text>
        ) : (
          logs.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.info,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
  },
  logTitle: {
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  emptyLog: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  logText: {
    color: Colors.success,
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Courier',
  },
});

export default NotificationTestScreen;
