// src/halabsaudi/chat/components/DeleteChatModal.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Colors} from '../Themes/Colors';

type Props = {
  visible: boolean;
  participantName: string;
  onClose: () => void;
  onDelete: () => void;
};

export default function DeleteConversation({
  visible,
  participantName,
  onClose,
  onDelete,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.box} onPress={() => {}}>
          {/* Icon */}
          <View style={s.iconWrap}>
            <Ionicons name="trash-outline" size={28} color="#EF4444" />
          </View>

          {/* Title */}
          <Text style={s.title}>Delete Chat</Text>
          <Text style={s.subtitle}>
            Are you sure you want to delete your chat with{' '}
            <Text style={s.name}>{participantName}</Text>? This cannot be
            undone.
          </Text>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => {
                onDelete();
                onClose();
              }}
              activeOpacity={0.7}>
              <Text style={s.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  name: {
    fontWeight: '700',
    color: '#111827',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});