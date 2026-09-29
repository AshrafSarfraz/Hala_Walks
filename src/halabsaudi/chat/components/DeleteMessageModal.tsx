import {Text} from '../../../ui/Text';

// src/halabsaudi/chat/components/DeleteMessageModal.tsx
import React, {useEffect, useRef} from 'react';
import {Modal, View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {RootState} from '../../redux_toolkit/store';

import {Colors} from '../../Themes/Colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onDeleteForEveryone?: () => void;
  onDeleteForMe: () => void;
  isMe: boolean;
};

export default function DeleteMessageModal({
  visible, onClose, onDeleteForEveryone, onDeleteForMe, isMe,
}: Props) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const scaleAnim   = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   {toValue: 1, useNativeDriver: true, damping: 18, stiffness: 240}),
        Animated.timing(opacityAnim, {toValue: 1, duration: 160, useNativeDriver: true}),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
    }
  }, [visible]);

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
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={28} color={Colors.accent} />
          </View>

          <Text style={styles.title}>{t.delete_message_title}</Text>
          <Text style={styles.subtitle}>{t.delete_undone}</Text>

          <View style={styles.divider} />

          {/* Delete for Everyone — sender only */}
          {isMe && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => { onClose(); setTimeout(() => onDeleteForEveryone?.(), 200); }}
              activeOpacity={0.7}>
              <View style={[styles.optionRow, {paddingHorizontal: 0, paddingVertical: 0, flexDirection: rowDir}]}>
                <View style={styles.optionIconWrap}>
                  <Ionicons name="people-outline" size={18} color={Colors.accent} />
                </View>
                <View style={{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
                  <Text style={[styles.optionLabel, {textAlign: isRTL ? 'right' : 'left'}]}>
                    {t.delete_for_everyone}
                  </Text>
                  <Text style={[styles.optionSub, {textAlign: isRTL ? 'right' : 'left'}]}>
                    {t.delete_for_everyone_sub}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Delete for Me */}
          <TouchableOpacity
            style={[styles.optionRow, isMe && styles.optionBorder]}
            onPress={() => { onClose(); setTimeout(() => onDeleteForMe(), 200); }}
            activeOpacity={0.7}>
            <View style={[{flexDirection: rowDir, alignItems: 'center', gap: 14, flex: 1}]}>
              <View style={[styles.optionIconWrap, {backgroundColor: Colors.surface}]}>
                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
              </View>
              <View style={{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
                <Text style={[styles.optionLabel, {color: Colors.textPrimary, textAlign: isRTL ? 'right' : 'left'}]}>
                  {t.delete_for_me}
                </Text>
                <Text style={[styles.optionSub, {textAlign: isRTL ? 'right' : 'left'}]}>
                  {t.delete_for_me_sub}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelRow} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>{t.cancel}</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlaySoft},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32},
  card: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.black, shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15, shadowRadius: 28, elevation: 18,
  },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginTop: 24, marginBottom: 12,
  },
  title: {fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 4},
  subtitle: {fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 20},
  divider: {height: 0.5, backgroundColor: Colors.surface},
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 14,
  },
  optionBorder: {borderTopWidth: 0.5, borderTopColor: Colors.border},
  optionIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLabel: {fontSize: 15, fontWeight: '600', color: Colors.accent},
  optionSub:   {fontSize: 12, color: Colors.textMuted, marginTop: 1},
  cancelRow:   {paddingVertical: 16, alignItems: 'center'},
  cancelText:  {fontSize: 15, fontWeight: '600', color: Colors.textSecondary},
});



