import {Text} from '../../../ui/Text';
// /src/halabsaudi/Component/CustomAlert/CustomAlertModal.tsx
//
// Drop-in replacement for RN's `Alert.alert(title, message, buttons)`.
// Usage inside a component:
//
//   const {alert, AlertComponent} = useCustomAlert();
//   alert('Missing photo', 'Please add at least one photo.');
//   alert('Delete?', 'This cannot be undone.', [
//     {text: 'Cancel', style: 'cancel'},
//     {text: 'Delete', style: 'destructive', onPress: doDelete},
//   ]);
//   // then somewhere in JSX (once per screen):
//   <AlertComponent />

import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type AlertState = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
};

const DEFAULT_BUTTONS: AlertButton[] = [{text: 'OK', style: 'default'}];

export const useCustomAlert = () => {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    message: undefined,
    buttons: DEFAULT_BUTTONS,
  });

  const alert = useCallback(
    (title: string, message?: string, buttons?: AlertButton[]) => {
      setState({
        visible: true,
        title,
        message,
        buttons: buttons && buttons.length ? buttons : DEFAULT_BUTTONS,
      });
    },
    [],
  );

  const hide = useCallback(() => {
    setState(prev => ({...prev, visible: false}));
  }, []);

  const handlePress = (btn: AlertButton) => {
    hide();
    // let the close animation start before firing the callback,
    // same behavior users are used to from the native Alert
    setTimeout(() => {
      btn.onPress?.();
    }, 150);
  };

  const AlertComponent = useCallback(
    () => (
      <Modal
        isVisible={state.visible}
        onBackdropPress={hide}
        backdropOpacity={0.45}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver
        style={styles.modalWrap}>
        <View style={styles.card}>
          <Text style={styles.title}>{state.title}</Text>
          {!!state.message && (
            <Text style={styles.message}>{state.message}</Text>
          )}
          <View
            style={[
              styles.btnRow,
              state.buttons.length > 2 && styles.btnCol,
            ]}>
            {state.buttons.map((btn, idx) => (
              <TouchableOpacity
                key={`${btn.text}_${idx}`}
                style={[
                  styles.btn,
                  idx > 0 &&
                    state.buttons.length <= 2 &&
                    styles.btnDivider,
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.btnText,
                    btn.style === 'cancel' && styles.btnTextCancel,
                    btn.style === 'destructive' &&
                      styles.btnTextDestructive,
                  ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return {alert, hide, AlertComponent};
};

const styles = StyleSheet.create({
  modalWrap: {justifyContent: 'center', alignItems: 'center', margin: 24},
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#191B20',
    borderRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F6F8',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#ABB2BF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#343841',
    marginTop: 8,
  },
  btnCol: {flexDirection: 'column'},
  btn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDivider: {
    borderLeftWidth: 1,
    borderColor: '#343841',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F6F8',
  },
  btnTextCancel: {
    color: '#ABB2BF',
    fontWeight: '500',
  },
  btnTextDestructive: {
    color: '#ef4444',
  },
});