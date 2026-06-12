// src/halabsaudi/chat/components/WhatsAppMessageModal.tsx

import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import {Colors} from '../../Themes/Colors';

const {height: SCREEN_H, width: SCREEN_W} = Dimensions.get('window');

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🙏', '🔥'];

export type MessageAction = {
  label: string;
  icon: string;
  destructive?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  messageText?: string;
  isMe: boolean;
  messageY: number;
  currentUserEmoji?: string | null;
  onReact: (emoji: string | null) => void;
  actions: MessageAction[];
};

export default function WhatsAppMessageModal({
  visible,
  onClose,
  messageText,
  isMe,
  messageY,
  currentUserEmoji,
  onReact,
  actions,
}: Props) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.88)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 220,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleReact = (emoji: string) => {
    const newEmoji = currentUserEmoji === emoji ? null : emoji;
    onReact(newEmoji);
    handleClose();
  };

  // ✅ COPY + TOAST FIXED
  const handleCopy = () => {
    if (messageText) {
      Clipboard.setString(messageText);

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleAction = (action: MessageAction) => {
    // Pehle modal close karo
    Animated.parallel([
      Animated.timing(backdropOpacity, {toValue: 0, duration: 140, useNativeDriver: true}),
      Animated.timing(contentOpacity, {toValue: 0, duration: 120, useNativeDriver: true}),
    ]).start(() => {
      onClose(); // ✅ pehle close complete karo
      setTimeout(() => {
        action.onPress(); // ✅ phir next modal open karo
      }, 50); // iOS ko thoda time do
    });
  };

  const placeBelow = messageY < SCREEN_H / 2;

  return (
    <Modal visible={visible} transparent statusBarTranslucent>
      {/* BACKDROP */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[styles.backdrop, {opacity: backdropOpacity}]}
        />
      </TouchableWithoutFeedback>

      {/* COPIED TOAST */}
      {copied && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Copied</Text>
        </View>
      )}

      {/* CONTENT */}
      <Animated.View
        style={[
          styles.wrapper,
          isMe ? styles.right : styles.left,
          placeBelow
            ? {top: messageY + 20}
            : {top: Math.max(messageY - 200, 60)},
          {
            opacity: contentOpacity,
            transform: [{scale: contentScale}],
          },
        ]}>

        {/* REACTIONS (NO PLUS BUTTON) */}
        <View style={styles.reactionBar}>
          {REACTION_EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              style={styles.reactionBtn}
              onPress={() => handleReact(e)}>
              <Text style={styles.emoji}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACTIONS */}
        <View style={styles.menu}>
          {actions.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.item,
                i !== actions.length - 1 && styles.border,
              ]}
              onPress={() => {
                if (a.label === 'Copy') {
                  handleCopy();   // ✅ FIXED COPY
                  handleClose();
                } else {
                  handleAction(a);
                }
              }}>
              <Text
                style={[
                  styles.label,
                  a.destructive && {color: 'red'},
                ]}>
                {a.label}
              </Text>
              <Ionicons
                name={a.icon}
                size={18}
                color={a.destructive ? 'red' : '#333'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  wrapper: {
    position: 'absolute',
    width: SCREEN_W * 0.72,
  },
  left: {left: 10},
  right: {right: 10},

  reactionBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  reactionBtn: {
    padding: 6,
  },
  emoji: {
    fontSize: 22,
  },

  menu: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  border: {
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  label: {
    fontSize: 15,
    color: '#111',
  },

  // ✅ TOAST
  toast: {
    position: 'absolute',
    top: SCREEN_H * 0.4,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});


