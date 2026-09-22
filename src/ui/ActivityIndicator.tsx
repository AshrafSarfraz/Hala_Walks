import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, ActivityIndicatorProps, Animated, View} from 'react-native';
import {theme} from './theme';
/** Three soft pulses, shared by inline, full-page and modal loading states. */
export function ActivityIndicator({size = 'small', color = theme.accent, animating = true, style, ...props}: ActivityIndicatorProps) {
  const phase = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!animating || reduceMotion) { phase.setValue(0.5); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(phase, {toValue: 1, duration: 650, useNativeDriver: true}),
      Animated.timing(phase, {toValue: 0, duration: 650, useNativeDriver: true}),
    ]));
    loop.start();
    return () => loop.stop();
  }, [animating, reduceMotion, phase]);
  if (!animating) return null;
  const dot = size === 'large' ? 9 : typeof size === 'number' ? Math.max(3, size / 4) : 4;
  return <View {...props} accessibilityRole="progressbar" accessibilityLabel="Loading" style={[{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: dot / 2, minHeight: dot * 2}, style]}>
    {[0, 1, 2].map(i => <Animated.View key={i} style={{width: dot, height: dot, borderRadius: dot, backgroundColor: color,
      opacity: phase.interpolate({inputRange: [0, .5, 1], outputRange: i === 1 ? [.4, 1, .4] : i === 0 ? [1, .4, .2] : [.2, .4, 1]}),
    }} />)}
  </View>;
}
