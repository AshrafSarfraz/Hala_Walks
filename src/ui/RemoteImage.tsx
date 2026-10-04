import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ImageStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Text} from './Text';
import {Colors} from '../halabsaudi/Themes/Colors';
import {experienceCopy} from '../halabsaudi/i18n/translations';

/** The image stays mounted underneath its placeholder, including during loading. */
export function RemoteImage({
  uri,
  style,
  resizeMode = 'cover',
  priority = 'normal',
}: {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain';
  priority?: 'normal' | 'high' | 'low';
}) {
  const language: 'en' | 'ar' = useSelector((s: any) => s.language.language);
  const t = experienceCopy[language];
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(
    uri ? 'loading' : 'failed',
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setStatus(uri ? 'loading' : 'failed');
    if (!uri) return;
    const timer = setTimeout(
      () => setStatus(value => (value === 'loading' ? 'failed' : value)),
      12000,
    );
    return () => clearTimeout(timer);
  }, [uri, attempt]);
  return (
    <View style={[style, s.frame]}>
      {!!uri && (
        <FastImage
          key={`${uri}:${attempt}`}
          source={{
            uri,
            priority: FastImage.priority[priority],
            cache: FastImage.cacheControl.web,
          }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode[resizeMode]}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('failed')}
        />
      )}
      {status !== 'ready' && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t.imageRetry}
          disabled={status === 'loading' || !uri}
          onPress={() => setAttempt(value => value + 1)}
          style={s.placeholder}>
          <Ionicons
            name={status === 'failed' ? 'image-outline' : 'images-outline'}
            size={26}
            color={Colors.textSecondary}
          />
          {status === 'failed' && (
            <>
              <Text style={s.text}>{t.imageFailed}</Text>
              {!!uri && <Text style={s.retry}>{t.imageRetry}</Text>}
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  frame: {overflow: 'hidden', backgroundColor: Colors.surfaceRaised},
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceRaised,
  },
  text: {fontSize: 12, color: Colors.textSecondary},
  retry: {fontSize: 12, color: Colors.accent},
});
