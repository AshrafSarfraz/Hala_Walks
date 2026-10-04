import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PermissionCard from './PermissionCard';
import {
  attachPermissionHost,
  finishPermissionPrompt,
  PermissionKind,
} from './service';
import {Colors} from '../Themes/Colors';

export default function PermissionHost() {
  const [prompt, setPrompt] = useState<{kind: PermissionKind} | null>(null);
  useEffect(() => attachPermissionHost(setPrompt), []);
  return (
    <Modal
      visible={!!prompt}
      transparent
      animationType="fade"
      onRequestClose={() => finishPermissionPrompt(false)}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          {prompt && (
            <PermissionCard
              key={prompt.kind}
              kind={prompt.kind}
              onDone={() => finishPermissionPrompt(true)}
              onSkip={() => finishPermissionPrompt(false)}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlaySoft,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    maxHeight: '90%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
});
