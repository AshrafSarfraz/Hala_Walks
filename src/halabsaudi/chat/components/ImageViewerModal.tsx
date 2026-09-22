import {Text} from '../../../ui/Text';
// src/halabsaudi/chat/components/ImageViewerModal.tsx
import React, {useRef, useState} from 'react';
import {Modal, View, Image, TouchableOpacity, StyleSheet, StatusBar, Animated, PanResponder, Dimensions, Share, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

const {width: W, height: H} = Dimensions.get('window');

type Props = {
  visible: boolean;
  uri: string | null;
  senderName?: string;
  timestamp?: string;
  onClose: () => void;
};

export default function ImageViewerModal({
  visible,
  uri,
  senderName,
  timestamp,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  // ── Zoom + pan state ──────────────────────────────────────────────────────
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const currentScale = useRef(1);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const lastTap = useRef(0);

  const [showControls, setShowControls] = useState(true);

  // ── Reset helper ─────────────────────────────────────────────────────────
  const resetTransform = (animated = true) => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scale, {toValue: 1, useNativeDriver: true}),
        Animated.spring(translateX, {toValue: 0, useNativeDriver: true}),
        Animated.spring(translateY, {toValue: 0, useNativeDriver: true}),
      ]).start();
    } else {
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
    }
    currentScale.current = 1;
    currentX.current = 0;
    currentY.current = 0;
  };

  // ── Double-tap zoom ───────────────────────────────────────────────────────
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (currentScale.current > 1) {
        resetTransform();
      } else {
        Animated.parallel([
          Animated.spring(scale, {toValue: 2.5, useNativeDriver: true}),
          Animated.spring(translateX, {toValue: 0, useNativeDriver: true}),
          Animated.spring(translateY, {toValue: 0, useNativeDriver: true}),
        ]).start();
        currentScale.current = 2.5;
      }
    } else {
      // single tap — toggle controls
      setShowControls(p => !p);
    }
    lastTap.current = now;
  };

  // ── PanResponder for pinch + drag ─────────────────────────────────────────
  let initialDistance = useRef(0);
  let initialScale = useRef(1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2 || g.numberActiveTouches === 2,

      onPanResponderGrant: (e) => {
        if (e.nativeEvent.changedTouches.length === 2) {
          const [t1, t2] = e.nativeEvent.changedTouches;
          initialDistance.current = Math.hypot(
            t2.pageX - t1.pageX,
            t2.pageY - t1.pageY,
          );
          initialScale.current = currentScale.current;
        }
      },

      onPanResponderMove: (e, g) => {
        if (e.nativeEvent.changedTouches.length === 2) {
          // Pinch to zoom
          const [t1, t2] = e.nativeEvent.changedTouches;
          const dist = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
          const newScale = Math.min(
            Math.max(initialScale.current * (dist / initialDistance.current), 0.8),
            4,
          );
          scale.setValue(newScale);
          currentScale.current = newScale;
        } else if (currentScale.current > 1) {
          // Pan when zoomed
          translateX.setValue(currentX.current + g.dx);
          translateY.setValue(currentY.current + g.dy);
        }
      },

      onPanResponderRelease: (_, g) => {
        currentX.current = currentX.current + g.dx;
        currentY.current = currentY.current + g.dy;

        // Snap back if zoomed out too much
        if (currentScale.current < 1) {
          resetTransform();
        }

        // Close on vertical swipe down when not zoomed
        if (
          currentScale.current <= 1.1 &&
          g.dy > 120 &&
          Math.abs(g.dx) < 80
        ) {
          resetTransform(false);
          onClose();
        }
      },
    }),
  ).current;

  // ── Share ─────────────────────────────────────────────────────────────────
  // const handleShare = async () => {
  //   if (!uri) return;
  //   try {
  //     await Share.share({
  //       url: uri,
  //       message: Platform.OS === 'android' ? uri : undefined,
  //     });
  //   } catch {}
  // };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.bg} {...panResponder.panHandlers}>
        {/* Image */}
        {uri ? (
          <View onTouchEnd={handleTap}><Animated.Image
            source={{uri}}
            style={[
              styles.image,
              {
                transform: [
                  {scale},
                  {translateX},
                  {translateY},
                ],
              },
            ]}
            resizeMode="contain"
          /></View>
        ) : null}

        {/* Top bar */}
        {showControls && (
          <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{flex: 1, marginLeft: 12}}>
              {senderName ? (
                <Text style={styles.senderName} numberOfLines={1}>
                  {senderName}
                </Text>
              ) : null}
              {timestamp ? (
                <Text style={styles.timestamp}>{timestamp}</Text>
              ) : null}
            </View>
            {/* <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity> */}
          </View>
        )}

        {/* Bottom hint */}
        {showControls && (
          <View style={[styles.bottomBar, {paddingBottom: insets.bottom + 12}]}>
            <Text style={styles.hint}>Double-tap to zoom · Swipe down to close</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: W,
    height: H,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  senderName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  timestamp: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  hint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
