import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Colors} from '../../theme/Colors';
type Mode = 'cover' | 'contain';
function Content({
  uri,
  style,
  priority,
  resizeMode,
  fallbackUri,
  fallbackResizeMode,
}: {
  uri: string;
  style: StyleProp<ViewStyle>;
  priority: 'normal' | 'high';
  resizeMode: Mode;
  fallbackUri?: string;
  fallbackResizeMode: Mode;
}) {
  // Agar main uri khaali hai lekin fallback hai, to seedha fallback se shuru karo.
  const [useFallback, setUseFallback] = useState(!uri && !!fallbackUri);
  const activeUri = useFallback ? fallbackUri || '' : uri;
  const activeMode = useFallback ? fallbackResizeMode : resizeMode;
  const [state, setState] = useState(activeUri ? 'loading' : 'error');
  const [attempt, setAttempt] = useState(0);
  return (
    <View
      style={[
        {backgroundColor: Colors.surfaceRaised, overflow: 'hidden'},
        style,
      ]}>
      {!!activeUri && (
        <FastImage
          key={`${useFallback ? 'f' : 'm'}:${attempt}`}
          source={{uri: activeUri, priority, cache: FastImage.cacheControl.web}}
          style={StyleSheet.absoluteFill}
          resizeMode={activeMode}
          onLoad={() => setState('ready')}
          onError={() => {
            // Photo fail -> logo (fallback) try karo, warna error dikhao.
            if (!useFallback && fallbackUri && fallbackUri !== uri) {
              setUseFallback(true);
              setState('loading');
              return;
            }
            setState('error');
          }}
        />
      )}
      {state === 'loading' && (
        <View pointerEvents="none" style={styles.placeholder}>
          <ActivityIndicator color={Colors.PrimaryColor} />
        </View>
      )}
      {state === 'error' && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Retry image"
          disabled={!uri && !fallbackUri}
          style={styles.placeholder}
          onPress={() => {
            // Retry dobara asal photo se shuru karta hai.
            setUseFallback(!uri && !!fallbackUri);
            setAttempt(n => n + 1);
            setState('loading');
          }}>
          <Ionicons name="image-outline" size={26} color={Colors.Grey} />
        </TouchableOpacity>
      )}
    </View>
  );
}
export default React.memo(function CachedImage({
  uri,
  style,
  priority = 'normal',
  resizeMode = 'cover',
  fallbackUri,
  fallbackResizeMode = 'contain',
}: {
  uri: string;
  style: StyleProp<ViewStyle>;
  priority?: 'normal' | 'high';
  resizeMode?: Mode;
  /** Optional: uri load na ho to ye image dikhao (jaise brand logo). */
  fallbackUri?: string;
  fallbackResizeMode?: Mode;
}) {
  return (
    <Content
      key={`${uri}|${fallbackUri || ''}`}
      uri={uri}
      style={style}
      priority={priority}
      resizeMode={resizeMode}
      fallbackUri={fallbackUri}
      fallbackResizeMode={fallbackResizeMode}
    />
  );
});
const styles = StyleSheet.create({
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
});
