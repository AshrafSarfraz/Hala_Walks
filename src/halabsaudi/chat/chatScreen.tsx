import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, Text, Platform, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import {
  GiftedChat,
  Bubble,
  Day,
  IMessage,
  InputToolbar,
  Composer,
  Send,
} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {BASE_URL} from '../../config/api';
import {Colors} from '../Themes/Colors';
import {getAvatarColor} from '../Themes/avatarColor';
import {getSocket} from './socket';
import ChatScreenHeader from '../Component/ChatHeaders/ChatScreenHeader';

type TempMessage = IMessage & {
  tempId?: string;
  status?: 'sending' | 'sent' | 'failed';
  deleted?: boolean;
};

export default function ChatScreen({route, navigation}: any) {
  const {
    chatId,
    participantName = 'User',
    participantId = '',
    participantAvatar = null,
  } = route.params || {};

  const [messages, setMessages] = useState<TempMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const currentUserIdRef = useRef('');
  const messagesRef = useRef<TempMessage[]>([]);
  const socketJoinedRef = useRef(false);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const normalizeIncomingMessages = (data: any): TempMessage[] => {
    const rawMessages = data?.messages || data || [];

    return rawMessages.map((m: any) => ({
      _id: m._id,
      text: m.text || '',
      createdAt: new Date(m.createdAt),
      user: {
        _id: String(m.sender?._id || m.user?._id || ''),
        name: m.sender?.name || m.user?.name || 'User',
      },
      status: 'sent',
    }));
  };

  const loadMessages = async (token: string) => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/api/messages/chat/${chatId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      const normalized = normalizeIncomingMessages(res.data);

      setMessages(
        normalized.sort(
          (a, b) =>
            new Date(b.createdAt as any).getTime() -
            new Date(a.createdAt as any).getTime(),
        ),
      );
    } catch (error) {
      console.log('loadMessages error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('hala_token');
        if (!token || !mounted) {
          setLoading(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        const userId = String(decoded?.id || decoded?._id || '');

        setCurrentUserId(userId);

        await loadMessages(token);
      } catch (error) {
        console.log('init chat error:', error);
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [chatId]);

  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleReceiveMessage = (msg: any) => {
    // Deduplicate by _id or tempId
    setMessages(prev => {
      const exists = prev.some(
        m =>
          m._id === msg._id ||
          (msg.tempId && m.tempId === msg.tempId)
      );
      if (exists) return prev;

      return GiftedChat.append(prev, [{
        _id: String(msg._id),
        tempId: msg.tempId,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        user: {
          _id: String(msg.sender?._id || msg.user?._id),
          name: msg.sender?.name || msg.user?.name || 'User',
        },
        status: 'sent',
      }]);
    });
  };

  socket.on("receive-message", handleReceiveMessage);

  return () => {
    socket.off("receive-message", handleReceiveMessage);
  };
}, [chatId]);

  const onSend = useCallback(
    (msgs: TempMessage[] = []) => {
      const socket = getSocket();
      if (!socket || !currentUserIdRef.current) return;

      msgs.forEach(msg => {
        const text = String(msg.text || '').trim();
        if (!text) return;

        const tempId =
          Date.now().toString() + Math.random().toString(36).slice(2);

        const optimistic: TempMessage = {
          _id: tempId,
          tempId,
          text,
          createdAt: new Date(),
          user: {
            _id: currentUserIdRef.current,
            name: 'Me',
          },
          status: 'sending',
        };

        setMessages(prev => GiftedChat.append(prev, [optimistic]));

        socket.emit('send-message', {
          chatId,
          text,
          tempId,
        });
      });
    },
    [chatId],
  );

  const deleteMessage = (message: TempMessage) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('delete-message', {
    messageId: message._id,
    chatId,
  });
};

  const renderBubble = (props: any) => {
  const m = props.currentMessage as TempMessage;
  const isMe = String(m?.user?._id || '') === currentUserId;
  const isDeleted = m.deleted;

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {backgroundColor: Colors.Green},
        left: {backgroundColor: '#EEF2F6'},
      }}
      textStyle={{
        right: {color: isDeleted ? '#ccc' : '#fff'},
        left: {color: isDeleted ? '#999' : '#111'},
      }}
    >
      {isDeleted ? (
        <Text style={{fontSize: 12, fontStyle: 'italic', color: '#BFC9D1'}}>
          This message was deleted
        </Text>
      ) : isMe && m.status === 'sending' ? (
        <Text style={styles.sendingText}>sending...</Text>
      ) : null}
    </Bubble>
  );
};

  const renderDay = (props: any) => (
    <Day {...props} textStyle={styles.dayText} />
  );

  const renderAvatar = (props: any) => {
    const m = props.currentMessage;
    const name = m?.user?.name || 'U';
    const userId = String(m?.user?._id || '');
    const color = getAvatarColor(userId);

    return (
      <View style={[styles.messageAvatar, {backgroundColor: color}]}>
        <Text style={styles.messageAvatarText}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputToolbarPrimary}
    />
  );

  const renderComposer = (props: any) => (
    <Composer
      {...props}
      textInputStyle={styles.composer}
      placeholder="Type a message..."
      placeholderTextColor="#98A2B3"
    />
  );

  const renderSend = (props: any) => {
    const text = String(props?.text || '').trim();

    return (
      <Send {...props} disabled={!text} containerStyle={styles.sendContainer}>
        <View
          style={[
            styles.sendButton,
            !text ? styles.sendButtonDisabled : null,
          ]}>
          <Ionicons name="send" size={18} color="#fff" />
        </View>
      </Send>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.Green} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ChatScreenHeader
          name={participantName}
          userId={participantId}
          avatarUri={participantAvatar}
          onBackPress={() => navigation.goBack()}
        />

        <GiftedChat
          messages={messages}
          onSend={msg => onSend(msg as TempMessage[])}
          user={{_id: currentUserId}}
          renderBubble={renderBubble}
          renderDay={renderDay}
          renderAvatar={renderAvatar}
          renderInputToolbar={renderInputToolbar}
          renderComposer={renderComposer}
          renderSend={renderSend}
          alwaysShowSend
          scrollToBottom
          showAvatarForEveryMessage={false}
          bottomOffset={Platform.OS === 'ios' ? 10 : 0}
          keyboardShouldPersistTaps="handled"
          onLongPressMessage={(context, message) => {
  if (String(message.user._id) !== currentUserId) return;

  Alert.alert(
    'Delete Message',
    'Do you want to delete this message?',
    [
      {
        text: 'Delete',
        onPress: () => deleteMessage(message),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.Green,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
  },
  dayText: {
    color: '#98A2B3',
    fontSize: 12,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  sendingText: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
    marginLeft: 2,
  },
  inputToolbar: {
    borderTopWidth: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
  },
  inputToolbarPrimary: {
    alignItems: 'center',
  },
  composer: {
    backgroundColor: '#F2F4F7',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
    fontSize: 15,
    color: '#111827',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.Green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
});