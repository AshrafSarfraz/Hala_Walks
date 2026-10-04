import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import FastImage, {ResizeMode} from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';
import {Text} from '../../../ui/Text';
import {Colors} from '../../Themes/Colors';
import {RootState} from '../../redux_toolkit/store';

function ImageContent({
  uri,
  style,
  resizeMode,
  priority,
}: {
  uri: string;
  style: StyleProp<ViewStyle>;
  resizeMode: ResizeMode;
  priority: 'low' | 'normal' | 'high';
}) {
  const ar = useSelector(
    (state: RootState) => state.language.language === 'ar',
  );
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(
    uri ? 'loading' : 'error',
  );
  const [attempt, setAttempt] = useState(0);
  return (
    <View style={[styles.container, style]}>
      {!!uri && (
        <FastImage
          key={attempt}
          style={StyleSheet.absoluteFill}
          source={{uri, priority, cache: FastImage.cacheControl.web}}
          resizeMode={resizeMode}
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
        />
      )}
      {state === 'loading' && (
        <View pointerEvents="none" style={styles.placeholder}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      )}
      {state === 'error' && (
        <TouchableOpacity
          style={styles.placeholder}
          disabled={!uri}
          accessibilityRole="button"
          accessibilityLabel={ar ? 'إعادة تحميل الصورة' : 'Retry image'}
          onPress={() => {
            setState('loading');
            setAttempt(value => value + 1);
          }}>
          <Ionicons
            name="image-outline"
            size={28}
            color={Colors.textSecondary}
          />
          <Text style={styles.label}>
            {uri
              ? ar
                ? 'اضغط لإعادة المحاولة'
                : 'Tap to retry'
              : ar
              ? 'لا توجد صورة'
              : 'No photo'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
export default function CachedImage({
  uri,
  style,
  resizeMode = FastImage.resizeMode.cover,
  priority = 'normal',
}: {
  uri: string;
  style: StyleProp<ViewStyle>;
  resizeMode?: ResizeMode;
  priority?: 'low' | 'normal' | 'high';
}) {
  return (
    <ImageContent
      key={uri}
      uri={uri}
      style={style}
      resizeMode={resizeMode}
      priority={priority}
    />
  );
}
const styles = StyleSheet.create({
  container: {overflow: 'hidden', backgroundColor: Colors.surfaceRaised},
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceRaised,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
