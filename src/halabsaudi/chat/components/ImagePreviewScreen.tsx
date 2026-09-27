import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HalaStackParamList} from '../../Navigation/types';
import {Text} from '../../../ui/Text';
import {TextInput} from '../../../ui/TextInput';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';

import React, {useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';

import {Colors} from '../../Themes/Colors';
import {RootState} from '../../redux_toolkit/store';
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';
import {enqueueMediaJob} from '../mediaOutbox';

type Props = NativeStackScreenProps<HalaStackParamList, 'ImagePreview'>;

export default function ImagePreviewScreen({route, navigation}: Props) {
  const {asset, chatId} = route.params;
  const insets = useSafeAreaInsets();
  const language = useSelector((state: RootState) => state.language.language);
  const isRTL = language === 'ar';

  useStatusBar('light-content', Colors.Black, true);

  const [caption, setCaption] = useState('');
  const [queuing, setQueuing] = useState(false);

  const close = () => {
    if (!queuing) navigation.goBack();
  };

  const handleSend = async () => {
    if (queuing || !asset?.uri || !chatId) return;

    setQueuing(true);

    try {
      Keyboard.dismiss();

      // Only make a persistent LOCAL copy and queue it.
      // No network upload happens on this preview screen.
      await enqueueMediaJob(String(chatId), asset, caption);

      // Return to chat immediately. Chat screen displays local image at once,
      // while upload continues there in the background.
      navigation.goBack();
    } catch (error: any) {
      console.log('[IMAGE PREVIEW] queue failed:', error);
      setQueuing(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView
        style={s.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>

        <View style={s.topBar}>
          <TouchableOpacity
            onPress={close}
            style={s.topButton}
            disabled={queuing}
            activeOpacity={0.75}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Ionicons name="close" size={27} color="#fff" />
          </TouchableOpacity>

          <Text style={s.topTitle}>Preview</Text>
          <View style={s.topButton} />
        </View>

        <View style={s.imageWrap}>
          <Image
            source={{uri: asset.uri}}
            style={s.image}
            resizeMode="contain"
          />
        </View>

        <View
          style={[
            s.bottomBar,
            {
              paddingBottom:
                Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
            },
          ]}>
          <View style={s.captionBox}>
            <Ionicons
              name="happy-outline"
              size={21}
              color="#9CA3AF"
              style={isRTL ? {marginLeft: 8} : {marginRight: 8}}
            />

            <TextInput
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
            />
          </View>

          <TouchableOpacity
            style={[s.sendBtn, queuing && {opacity: 0.7}]}
            onPress={handleSend}
            disabled={queuing}
            activeOpacity={0.8}>
            {queuing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={21} color="#fff" />
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

  // Slightly lower/shorter than before so the X is not too high.
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: Platform.OS === 'ios' ? 4 : 0,
    backgroundColor: '#000',
  },

  topButton: {
    width: 46,
    height: 46,
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
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 7,
    paddingHorizontal: 10,
    backgroundColor: '#111318',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },

  captionBox: {
    flex: 1,
    minHeight: 44,
    maxHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262D',
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },

  captionInput: {
    flex: 1,
    maxHeight: 78,
    paddingVertical: 0,
    color: '#fff',
    fontSize: 15,
    lineHeight: 19,
    minHeight: 30,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.Green,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
