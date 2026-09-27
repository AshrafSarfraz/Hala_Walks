import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HalaStackParamList} from '../../Navigation/types';
import {Text} from '../../../ui/Text';
import {TextInput} from '../../../ui/TextInput';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';

import {Colors} from '../../Themes/Colors';
import {RootState} from '../../redux_toolkit/store';
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';
import {
  clearPendingImageSend,
  getPendingImageSend,
} from './imagePreviewBridge';

type Props = NativeStackScreenProps<HalaStackParamList, 'ImagePreview'>;

export default function ImagePreviewScreen({route, navigation}: Props) {
  const {asset} = route.params;
  const insets = useSafeAreaInsets();

  const language = useSelector((state: RootState) => state.language.language);
  const isRTL = language === 'ar';

  useStatusBar('light-content', Colors.Black, true);

  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      // Screen close hone par stale callback ko clear kar do.
      clearPendingImageSend();
    };
  }, []);

  const closePreview = () => {
    if (sending) return;
    clearPendingImageSend();
    navigation.goBack();
  };

  const handleSend = async () => {
    if (sending) return;

    const send = getPendingImageSend();

    if (!send) {
      // Is case me silent failure nahi honi chahiye.
      console.warn('[ImagePreview] send handler missing');
      return;
    }

    setSending(true);

    try {
      // Keyboard close karne se send button/footer jump nahi karega.
      Keyboard.dismiss();

      await send(asset, caption.trim());

      clearPendingImageSend();
      navigation.goBack();
    } catch (error) {
      console.log('[ImagePreview] send failed:', error);
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView
        style={s.keyboardRoot}
        behavior="padding"
        keyboardVerticalOffset={0}>

        {/* TOP BAR — always fixed inside layout */}
        <View style={s.topBar}>
          <TouchableOpacity
            onPress={closePreview}
            style={s.topButton}
            activeOpacity={0.75}
            disabled={sending}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={s.topTitle}>Preview</Text>

          <View style={s.topButton} />
        </View>

        {/* IMAGE — uses remaining available space, no fixed screen height */}
        <View style={s.imageWrap}>
          <Image
            source={{uri: asset?.uri}}
            style={s.image}
            resizeMode="contain"
          />
        </View>

        {/* FOOTER — stays immediately above keyboard */}
        <View
          style={[
            s.bottomBar,
            {
              paddingBottom: keyboardVisible
                ? 10
                : Math.max(insets.bottom, 10),
            },
          ]}>
          <View style={s.captionBox}>
            <Ionicons
              name="happy-outline"
              size={22}
              color="#9CA3AF"
              style={isRTL ? {marginLeft: 8} : {marginRight: 8}}
            />

            <TextInput
              ref={inputRef}
              style={[
                s.captionInput,
                {
                  textAlign: isRTL ? 'right' : 'left',
                  writingDirection: isRTL ? 'rtl' : 'ltr',
                },
              ]}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.48)"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={500}
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity
            style={[s.sendBtn, sending && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.8}
            hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  keyboardRoot: {
    flex: 1,
    backgroundColor: '#000',
  },

  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 4,
    zIndex: 10,
  },

  topButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },

  imageWrap: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    paddingHorizontal: 10,
    backgroundColor: '#111318',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },

  captionBox: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262D',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  captionInput: {
    flex: 1,
    maxHeight: 92,
    paddingVertical: 0,
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },

  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Green,
    flexShrink: 0,
  },

  sendBtnDisabled: {
    opacity: 0.65,
  },
});
