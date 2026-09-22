import {Text} from '../../../ui/Text';
import React from 'react';
import {Modal, View} from 'react-native';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';
import {theme} from '../../../ui/theme';
export default function ActivityIndicatorModal({visible, label = 'Loading…'}) {
  return <Modal visible={!!visible} transparent animationType="fade" onRequestClose={() => {}}>
    <View style={{flex: 1, backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center'}}>
      <View style={{backgroundColor: theme.surface, borderRadius: 20, padding: 28, gap: 16, alignItems: 'center'}}>
        <ActivityIndicator size="large" />
        <Text style={{color: theme.muted, fontSize: 14}}>{label}</Text>
      </View>
    </View>
  </Modal>;
}
