// src/halabsaudi/chat/components/ImagePreviewScreen.tsx
// ✅ WhatsApp-style image preview before sending
//    User image select kare → yeh screen → caption type kare → Send

import React, {useState, useRef} from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  StyleSheet,ActivityIndicator,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Colors} from '../../Themes/Colors';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {RootState} from '../../redux_toolkit/store';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

const {width: W, height: H} = Dimensions.get('window');

type Props = {
  route: {
    params: {
      asset: {
        uri: string;
        type?: string;
        fileName?: string;
      };
      onSend: (asset: any, caption: string) => void;
    };
  };
  navigation: any;
};

export default function ImagePreviewScreen({route, navigation}: Props) {
  const {asset, onSend} = route.params;
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar'; 
  useStatusBar('light-content', Colors.Black, true);
  const [caption,  setCaption]  = useState('');
  const [sending,  setSending]  = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      await onSend(asset, caption.trim());
      navigation.goBack();
    } catch {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
    {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={s.topTitle}>Preview</Text>
        <View style={{width: 44}} />
      </View>

      {/* ── Image ── */}
      <View style={s.imageWrap}>
        <Image
          source={{uri: asset.uri}}
          style={s.image}
          resizeMode="contain"
        />
      </View>

      {/* ── Caption + Send ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.bottomBar}>
          {/* Caption input */}
          <View style={s.captionBox}>
            <Ionicons name="happy-outline" size={22} color="#9CA3AF" style={{marginRight: 8}} />
            <TextInput
              ref={inputRef}
              style={[s.captionInput, {textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr'}]}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={500}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            style={s.sendBtn}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.85}>
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={22} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#000'},

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backBtn: {
    width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  topTitle: {
    flex: 1, textAlign: 'center',
    color: '#fff', fontSize: 17, fontWeight: '600',
  },

  imageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: W,
    height: H * 0.65,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    gap: 10,
  },
  captionBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  captionInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    paddingVertical: 0,
    maxHeight: 100,
  },
  sendBtn: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: Colors.Green,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
