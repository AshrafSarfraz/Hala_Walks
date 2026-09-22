import React, {useSyncExternalStore} from 'react';
import {AlertButton, AlertOptions, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {theme} from './theme';
type Dialog = {title: string; message?: string; buttons: AlertButton[]; options?: AlertOptions};
let queue: Dialog[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
const subscribe = (fn: () => void) => { listeners.add(fn); return () => {listeners.delete(fn);}; };
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
    queue = [...queue, {title, message, buttons: buttons?.length ? buttons : [{text: 'OK'}], options}];
    emit();
  },
};
function close() {queue = queue.slice(1); emit();}
export function AlertHost() {
  const dialog = useSyncExternalStore(subscribe, () => queue[0] ?? null);
  if (!dialog) return null;
  const dismiss = () => {if (dialog.options?.cancelable) {close(); dialog.options.onDismiss?.();}};
  return <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={dismiss}>
    <View style={s.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessible={false} />
      <View style={s.card} accessibilityViewIsModal>
        <ScrollView bounces={false}>
          <Text accessibilityRole="header" style={s.title}>{dialog.title}</Text>
          {!!dialog.message && <Text style={s.body}>{dialog.message}</Text>}
          <View style={s.actions}>{dialog.buttons.map((button, i) => (
            <Pressable key={i} accessibilityRole="button" onPress={() => {close(); button.onPress?.();}}
              style={({pressed}) => [s.button, button.style === 'cancel' && s.cancel, pressed && {opacity: .7}]}>
              <Text style={[s.label, button.style === 'destructive' && {color: theme.danger}]}>{button.text || 'OK'}</Text>
            </Pressable>
          ))}</View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', padding: 24},
  card: {width: '100%', maxWidth: 420, maxHeight: '80%', backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 24, padding: 24},
  title: {fontSize: 21, fontWeight: '700', color: theme.text, marginBottom: 12},
  body: {fontSize: 15, lineHeight: 23, color: theme.muted}, actions: {gap: 10, marginTop: 24},
  button: {minHeight: 48, backgroundColor: theme.raised, borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 12},
  cancel: {backgroundColor: 'transparent'}, label: {fontSize: 15, fontWeight: '600', color: theme.text},
});
