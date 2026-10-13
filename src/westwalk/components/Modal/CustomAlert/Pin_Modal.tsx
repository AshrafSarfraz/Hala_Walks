import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Text} from '../../Text';
import {Fonts} from '../../../theme/Fonts';
import {Colors} from '../../../theme/Colors';
import {RootState} from '../../../redux/store';
import {sanitizePin} from '../../../utils/offers';
type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  correctPin?: unknown;
};
export default function Pin_Modal({visible, onClose, onSubmit}: Props) {
  const [pin, setPin] = useState('');
  const [help, setHelp] = useState(false);
  const input = useRef<TextInput>(null);
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  useEffect(() => {
    setPin('');
    setHelp(false);
  }, [visible]);
  const submit = () => {
    if (pin.length === 6) {
      onSubmit(pin);
      setPin('');
    }
  };
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => input.current?.focus()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {ar ? 'أدخل رمز الاستبدال' : 'Enter redeem PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {ar
                ? 'اطلب من موظف المتجر إدخال الرمز المكون من ٦ أرقام.'
                : 'Ask the venue staff to enter the 6-digit PIN.'}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={ar ? 'أدخل ٦ أرقام' : 'Enter six digits'}
              onPress={() => input.current?.focus()}
              style={styles.digits}>
              {Array.from({length: 6}, (_, i) => (
                <View
                  key={i}
                  style={[styles.digit, i === pin.length && styles.current]}>
                  <Text style={styles.dot}>{pin[i] ? '•' : ''}</Text>
                </View>
              ))}
            </TouchableOpacity>
            <TextInput
              ref={input}
              value={pin}
              onChangeText={v => setPin(sanitizePin(v))}
              maxLength={6}
              keyboardType="number-pad"
              secureTextEntry
              accessibilityLabel={ar ? 'رمز الاستبدال' : 'Redeem PIN'}
              caretHidden
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setHelp(v => !v)}
              style={styles.help}>
              <Text style={styles.helpText}>
                {ar ? 'من أين أحصل على الرمز؟' : 'Where to get the redeem PIN?'}
              </Text>
            </TouchableOpacity>
            {help && (
              <Text style={styles.subtitle}>
                {ar
                  ? 'قم بزيارة المتجر. الرمز معروف لموظفي المتجر فقط. استبدل العرض عندما تكون مستعدًا للاستفادة منه.'
                  : 'Visit the venue. The PIN is known only to its staff. Redeem when you are ready to use the offer.'}
              </Text>
            )}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{disabled: pin.length !== 6}}
              disabled={pin.length !== 6}
              onPress={submit}
              style={[styles.submit, pin.length !== 6 && {opacity: 0.45}]}>
              <Text style={styles.submitText}>{ar ? 'تأكيد' : 'Submit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onClose}
              style={styles.cancel}>
              <Text>{ar ? 'إلغاء' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: '#00000088'},
  scroll: {flexGrow: 1, justifyContent: 'center', padding: 20},
  card: {backgroundColor: Colors.White, padding: 22, borderRadius: 22},
  title: {fontSize: 21, fontFamily: Fonts.F_Bold, textAlign: 'center'},
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  digits: {flexDirection: 'row', gap: 6, marginTop: 24},
  digit: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  current: {borderColor: Colors.PrimaryColor},
  dot: {fontSize: 23, color: Colors.PrimaryColor},
  input: {
    width: 1,
    height: 1,
    position: 'absolute',
    opacity: 0,
    top: 100,
    left: 20,
  },
  help: {paddingVertical: 14},
  helpText: {fontSize: 12, color: Colors.PrimaryColor, textAlign: 'center'},
  submit: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Colors.PrimaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {color: Colors.White, fontFamily: Fonts.F_Bold, fontSize: 15},
  cancel: {alignItems: 'center', padding: 14},
});
