import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PermissionCard from './PermissionCard';
import {
  attachPermissionHost,
  finishPermissionPrompt,
  PermissionKind,
} from './service';
import {Colors} from '../Themes/Colors';

export default function PermissionHost() {
  const [prompt, setPrompt] = useState<{
    kind: PermissionKind;
  } | null>(null);

  useEffect(() => attachPermissionHost(setPrompt), []);

  return (
    <Modal
      visible={!!prompt}
      transparent={false}
      presentationStyle="fullScreen"
      animationType="fade"
      onRequestClose={() => finishPermissionPrompt(false)}>
      <SafeAreaView style={styles.screen}>
        {prompt && (
          <PermissionCard
            key={prompt.kind}
            kind={prompt.kind}
            onDone={() => finishPermissionPrompt(true)}
            onSkip={() => finishPermissionPrompt(false)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});