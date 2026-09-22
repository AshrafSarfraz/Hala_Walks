import {Text} from '../../../ui/Text';

// src/halabsaudi/chat/components/MuteModal.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Modal, View, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {RootState} from '../../redux_toolkit/store';
import { Colors } from '../../Themes/Colors';

export type MuteDuration = '8h' | '1w' | 'always' | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  chatId: string;
  isMuted: boolean;
  currentMute: MuteDuration;
  onMuteChange: (val: MuteDuration) => void;
};

export default function MuteModal({
  visible, onClose, chatId, isMuted, currentMute, onMuteChange,
}: Props) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const slideAnim   = useRef(new Animated.Value(400)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<MuteDuration>(currentMute);

  // Options built from translated strings
  const OPTIONS = [
    {label: t.mute_8h,     sublabel: t.mute_8h_sub,     value: '8h'    as MuteDuration, icon: 'time-outline' as const},
    {label: t.mute_1w,     sublabel: t.mute_1w_sub,     value: '1w'    as MuteDuration, icon: 'calendar-outline' as const},
    {label: t.mute_always, sublabel: t.mute_always_sub,  value: 'always'as MuteDuration, icon: 'notifications-off-outline' as const},
  ];

  useEffect(() => { setSelected(currentMute); }, [currentMute, visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200}),
        Animated.timing(backdropAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim,    {toValue: 400, duration: 220, useNativeDriver: true}),
        Animated.timing(backdropAnim, {toValue: 0,   duration: 180, useNativeDriver: true}),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim,    {toValue: 400, duration: 220, useNativeDriver: true}),
      Animated.timing(backdropAnim, {toValue: 0,   duration: 180, useNativeDriver: true}),
    ]).start(() => onClose());
  };

  const handleUnmute = async () => {
    await AsyncStorage.removeItem(`mute_${chatId}`);
    onMuteChange(null);
    handleClose();
  };

  const handleConfirm = async () => {
    if (!selected) return;
    await AsyncStorage.setItem(
      `mute_${chatId}`,
      JSON.stringify({duration: selected, setAt: Date.now()}),
    );
    onMuteChange(selected);
    handleClose();
  };

  return (
    <Modal
      visible={visible} transparent animationType="none"
      statusBarTranslucent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, {opacity: backdropAnim}]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={[styles.header, {flexDirection: rowDir}]}>
          <View style={styles.muteIconWrap}>
            <Ionicons
              name={isMuted ? 'notifications-off' : 'notifications-outline'}
              size={22}
              color={isMuted ? '#6B7280' : '#111827'}
            />
          </View>
          <View style={[{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'},
            isRTL ? {marginRight: 12} : {marginLeft: 12}]}>
            <Text style={[styles.headerTitle, {textAlign: isRTL ? 'right' : 'left'}]}>
              {isMuted ? t.muted_title : t.mute_title}
            </Text>
            <Text style={[styles.headerSub, {textAlign: isRTL ? 'right' : 'left'}]}>
              {isMuted ? t.muted_sub : t.mute_sub}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Unmute */}
        {isMuted ? (
          <TouchableOpacity style={styles.unmuteBtn} onPress={handleUnmute} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={Colors.Red} />
            <Text style={styles.unmuteText}>{t.unmute_btn}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={[styles.sectionLabel, {textAlign: isRTL ? 'right' : 'left'}]}>
              {t.mute_for}
            </Text>

            {OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, selected === opt.value && styles.optionSelected]}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.7}>
                <View style={[styles.optionRow, {flexDirection: rowDir}]}>
                  <View style={[styles.optionIcon,
                    {backgroundColor: selected === opt.value ? '#191B20' : '#191B20'}]}>
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={selected === opt.value ? Colors.Red : '#6B7280'}
                    />
                  </View>
                  <View style={{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
                    <Text style={[
                      styles.optionLabel,
                      {textAlign: isRTL ? 'right' : 'left'},
                      selected === opt.value && {color: Colors.Red},
                    ]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.optionSub, {textAlign: isRTL ? 'right' : 'left'}]}>
                      {opt.sublabel}
                    </Text>
                  </View>
                  {/* Radio — always on opposite end from text */}
                  <View style={[styles.radio, selected === opt.value && styles.radioSelected]}>
                    {selected === opt.value && <View style={styles.radioDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.confirmBtn, {opacity: selected ? 1 : 0.5, flexDirection: rowDir}]}
              onPress={handleConfirm}
              disabled={!selected}
              activeOpacity={0.8}>
              <Ionicons
                name="notifications-off-outline"
                size={18}
                color="#fff"
                style={isRTL ? {marginLeft: 8} : {marginRight: 8}}
              />
              <Text style={styles.confirmText}>{t.mute_chat_btn}</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)'},
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#191B20',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingBottom: 40,
    shadowColor: '#000', shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#191B20',
    alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },
  header: {alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14},
  muteIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#191B20',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#F5F6F8'},
  headerSub:   {fontSize: 13, color: '#ABB2BF', marginTop: 2},
  divider: {height: 0.5, backgroundColor: '#191B20'},
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.2,
    marginHorizontal: 20, marginTop: 16, marginBottom: 8,
  },
  option: {
    paddingHorizontal: 12, paddingVertical: 6,
    marginHorizontal: 12, borderRadius: 14, marginBottom: 2,
  },
  optionRow: {alignItems: 'center', gap: 12, paddingVertical: 7},
  optionSelected: {backgroundColor: '#191B20'},
  optionIcon: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  optionLabel: {fontSize: 15, fontWeight: '500', color: '#F5F6F8'},
  optionSub:   {fontSize: 12, color: '#9CA3AF', marginTop: 1},
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#343841',
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: {borderColor: Colors.Red},
  radioDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.Red},
  confirmBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.Red, borderRadius: 16,
    height: 52, marginHorizontal: 20, marginTop: 20,
  },
  confirmText: {fontSize: 16, fontWeight: '700', color: '#fff'},
  unmuteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginHorizontal: 20, marginTop: 20,
    height: 52, borderRadius: 16,
    backgroundColor: '#191B20',
    borderWidth: 1, borderColor: '#343841',
  },
  unmuteText: {fontSize: 15, fontWeight: '600', color: Colors.Red},
});





