import {Text} from '../../../ui/Text';
import {Alert} from '../../../ui/Alert';

import React, {useRef, useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet, Modal, Pressable, Animated} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Colors} from '../../Themes/Colors';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {RootState} from '../../redux_toolkit/store';

import {hbsText} from '../../i18n/translations';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onDocument?: () => void;
  onRemoveAvatar?: () => void; // ✅ optional — sirf EditAccount se aata hai
};

export default function AttachmentSheet({
  visible, onClose, onCamera, onGallery, onDocument, onRemoveAvatar,
}: Props) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {toValue: 0,   duration: 280, useNativeDriver: true}),
        Animated.timing(fadeAnim,  {toValue: 1,   duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {toValue: 300, duration: 220, useNativeDriver: true}),
        Animated.timing(fadeAnim,  {toValue: 0,   duration: 180, useNativeDriver: true}),
      ]).start();
    }
  }, [visible]);

  const options = [
    {
      icon: 'image-outline',
      label: t.camera,
      sublabel: t.camera_sub,
      color: Colors.textPrimary,
      bg: Colors.successSoft,
      onPress: () => { onClose(); setTimeout(onCamera, 250); },
    },
    {
      icon: 'videocam-outline',
      label: t.gallery,
      sublabel: t.gallery_sub,
      color: Colors.purple,
      bg: Colors.purpleSoft,
      onPress: () => { onClose(); setTimeout(onGallery, 250); },
    },
    ...(onDocument
      ? [{
          icon: 'document-outline',
          label: t.document,
          sublabel: t.document_sub,
          color: Colors.warning,
          bg: Colors.warningSoft,
          onPress: () => { onClose(); setTimeout(onDocument!, 250); },
        }]
      : []),
  ];

  // ✅ Remove avatar — confirm alert
  const handleRemove = () => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        hbsText(isRTL, 'ui_remove_photo'),
        hbsText(isRTL, 'ui_are_you_sure_you_want_to_remove_your_photo'),
        [
          {text: hbsText(isRTL, 'ui_cancel'), style: 'cancel'},
          {
            text: hbsText(isRTL, 'ui_remove'),
            style: 'destructive',
            onPress: onRemoveAvatar,
          },
        ],
      );
    }, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.backdrop, {opacity: fadeAnim}]}>
        <Pressable style={{flex: 1}} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[s.sheet, {transform: [{translateY: slideAnim}]}]}>
        <View style={s.handle} />

        <Text style={s.title}>{t.share_content}</Text>
        <Text style={s.subtitle}>{t.choose_to_send}</Text>

        {/* Options row */}
        <View style={s.optionsRow}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={s.optionBtn}
              onPress={opt.onPress}
              activeOpacity={0.75}>
              <View style={[s.optionIcon, {backgroundColor: opt.bg}]}>
                <Ionicons name={opt.icon as any} size={26} color={opt.color} />
              </View>
              <Text style={s.optionLabel}>{opt.label}</Text>
              <Text style={s.optionSub}>{opt.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ✅ Bottom buttons row — Cancel + Delete (sirf jab avatar ho) */}
        <View style={[s.bottomRow, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>

          <TouchableOpacity
            style={s.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={s.cancelText}>{t.Cancel}</Text>
          </TouchableOpacity>

          {/* ✅ Sirf tab dikhao jab onRemoveAvatar prop aaye */}
          {onRemoveAvatar && (
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={handleRemove}
              activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={18} color={Colors.accent} />
              <Text style={s.deleteText}>
                {hbsText(isRTL, 'ui_delete_photo')}
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlaySoft,
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 14,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.surface,
    alignSelf: 'center', marginBottom: 18,
  },
  title:    {fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center'},
  subtitle: {fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 24},

  optionsRow: {flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24},
  optionBtn:  {alignItems: 'center', flex: 1, maxWidth: 100},
  optionIcon: {
    width: 64, height: 64, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  optionLabel: {fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3},
  optionSub:   {fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 15},

  // ✅ Bottom row
  bottomRow: {
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {fontSize: 15, fontWeight: '600', color: Colors.textPrimary},

  // ✅ Delete button
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
  },
  deleteText: {fontSize: 15, fontWeight: '600', color: Colors.accent},
});
