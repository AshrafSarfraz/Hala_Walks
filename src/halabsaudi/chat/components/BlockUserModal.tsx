// src/halabsaudi/chat/components/BlockUserModal.tsx
import React, {useEffect, useRef} from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, TouchableWithoutFeedback, ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {RootState} from '../../redux_toolkit/store';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBlocked: boolean;
  participantName: string;
  loading?: boolean;
};

export default function BlockUserModal({
  visible, onClose, onConfirm, isBlocked, participantName, loading = false,
}: Props) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const scaleAnim   = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220}),
        Animated.timing(opacityAnim, {toValue: 1, duration: 160, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim,   {toValue: 0.85, duration: 150, useNativeDriver: true}),
        Animated.timing(opacityAnim, {toValue: 0,    duration: 130, useNativeDriver: true}),
      ]).start();
    }
  }, [visible]);

  // Replace {{name}} placeholder
  const descText = isBlocked
    ? t.unblock_desc_text.replace('{{name}}', participantName)
    : t.block_desc_text.replace('{{name}}', participantName);

  const bullets = isBlocked
    ? [t.unblock_b1, t.unblock_b2, t.unblock_b3]
    : [t.block_b1,   t.block_b2,   t.block_b3];

  const bulletIcon = isBlocked ? 'checkmark' : 'remove';
  const bulletColor = isBlocked ? '#16A34A' : '#DC2626';

  return (
    <Modal
      visible={visible} transparent animationType="none"
      statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, {opacity: opacityAnim}]} />
      </TouchableWithoutFeedback>

      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.card, {opacity: opacityAnim, transform: [{scale: scaleAnim}]}]}>

          {/* Icon */}
          <View style={[styles.iconCircle, {backgroundColor: isBlocked ? '#DCFCE7' : '#FEE2E2'}]}>
            <Ionicons
              name={isBlocked ? 'checkmark-circle-outline' : 'ban-outline'}
              size={34}
              color={isBlocked ? '#16A34A' : '#DC2626'}
            />
          </View>

          <Text style={styles.title}>{isBlocked ? t.unblock_title : t.block_title}</Text>
          <Text style={[styles.desc, {textAlign: isRTL ? 'right' : 'center'}]}>{descText}</Text>

          {/* Bullet list */}
          <View style={styles.bulletList}>
            {bullets.map((item, i) => (
              <View key={i} style={[styles.bulletRow, {flexDirection: rowDir}]}>
                <Ionicons name={bulletIcon} size={14} color={bulletColor} style={{marginTop: 1}} />
                <Text style={[styles.bulletText, {textAlign: isRTL ? 'right' : 'left'}]}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={[styles.btnRow, {flexDirection: rowDir}]}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, {backgroundColor: isBlocked ? '#16A34A' : '#DC2626'}]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmText}>
                  {isBlocked ? t.unblock_btn : t.block_btn}
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32},
  card: {
    width: '100%', backgroundColor: '#fff', borderRadius: 24,
    padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 16,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: {fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8},
  desc:  {fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 16},
  bulletList: {
    width: '100%', backgroundColor: '#F9FAFB',
    borderRadius: 14, padding: 14, gap: 8, marginBottom: 20,
  },
  bulletRow: {alignItems: 'flex-start', gap: 8},
  bulletText: {fontSize: 13, color: '#374151', flex: 1, lineHeight: 18},
  btnRow: {gap: 10, width: '100%'},
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6',
  },
  cancelText:  {fontSize: 15, fontWeight: '600', color: '#374151'},
  confirmBtn:  {flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  confirmText: {fontSize: 15, fontWeight: '700', color: '#fff'},
});

