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
function Content({
  uri,
  style,
  priority,
  resizeMode,
}: {
  uri: string;
  style: StyleProp<ViewStyle>;
  priority: 'normal' | 'high';
  resizeMode: 'cover' | 'contain';
}) {
  const [state, setState] = useState(uri ? 'loading' : 'error');
  const [attempt, setAttempt] = useState(0);
  return (
    <View
      style={[
        {backgroundColor: Colors.surfaceRaised, overflow: 'hidden'},
        style,
      ]}>
      {!!uri && (
        <FastImage
          key={attempt}
          source={{uri, priority, cache: FastImage.cacheControl.web}}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
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
          disabled={!uri}
          style={styles.placeholder}
          onPress={() => {
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
}: {
  uri: string;
  style: StyleProp<ViewStyle>;
  priority?: 'normal' | 'high';
  resizeMode?: 'cover' | 'contain';
}) {
  return (
    <Content
      key={uri}
      uri={uri}
      style={style}
      priority={priority}
      resizeMode={resizeMode}
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
