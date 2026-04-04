// src/halabsaudi/chat/conversationScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Colors} from '../Themes/Colors';
import {Chat} from '../Themes/Images';
import {getAvatarColor} from '../Themes/avatarColor';
import ChatSearchModal from '../Component/Modal/ChatSearchModal';

import {BASE_URL} from '../../config/api';
import {connectSocket, getSocket} from './socket';
import ConversationHeader from '../Component/ChatHeaders/conversation';

type Conversation = {
  _id: string;
  participant: {_id: string; name: string};
  lastMessage: {text: string} | null;
  lastMessageAt: string;
  unreadCount?: number;
};

export default function ConversationsScreen({navigation}: any) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);


  const insets = useSafeAreaInsets();

  // load token
 useEffect(() => {
  const initSocket = async () => {
    const t = await AsyncStorage.getItem('hala_token');
    if (!t) return;
    setToken(t);
    connectSocket(t); // socket connect hote hi ready to listen
  };
  initSocket();
}, []);

  // fetch chats
  useEffect(() => {
    if (!token) return;

    const loadChats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chat`, {
          headers: {Authorization: `Bearer ${token}`},
        });

        const sorted = res.data.sort(
          (a: Conversation, b: Conversation) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
        );

        setConversations(sorted);
      } catch (err: any) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [token]);

// live chat update
useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  socket.on('chat-updated', (data: any) => {
    setConversations(prev => {
      // check if chat already exists
      const exists = prev.find(c => c._id === data.chatId);

      if (exists) {
        // update existing chat
        const updated = prev.map(chat =>
          chat._id === data.chatId
            ? {
                ...chat,
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt,
              }
            : chat
        );
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );
      }

      // 🔹 if chat doesn't exist (new chat or previously deleted)
      const newChat = {
        _id: data.chatId,
        participant: data.participant, // backend se zaruri bhejna
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt,
      };

      return [newChat, ...prev];
    });
  });

  return () => {
    socket.off('chat-updated');
  };
}, []);

  

  const openChat = (chat: Conversation) => {
    navigation.navigate('ChatScreen', {
      chatId: chat._id,
      participantName: chat.participant?.name || 'User',
    });
  };

  const deleteConversation = async (chatId: string) => {
  try {
    if (!token) return;

    await axios.delete(`${BASE_URL}/api/chat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // UI se remove
    setConversations(prev =>
      prev.filter(chat => chat._id !== chatId),
    );

  } catch (err) {
    console.log("delete error:", err);
  }
};

  const handleMenu = () => {
  Alert.alert(
    'Options',
    '',
    [
      {
        text: 'New Chat',
        onPress: () => navigation.navigate('StartChatScreen'),
      },
      {
        text: 'Refresh',
        onPress: fetchChats,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    { cancelable: true },
  );
};

  const renderItem = ({ item }: { item: Conversation }) => {
  const name = item.participant?.name || 'User';
  const last = item.lastMessage?.text || 'Start conversation';

  const handleLongPress = () => {
    Alert.alert(
      'Delete Chat',
      `Delete chat with ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConversation(item._id),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => openChat(item)}
      onLongPress={handleLongPress}   // ✅ YE IMPORTANT LINE
      delayLongPress={300}            // optional (smooth feel)
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: getAvatarColor(item.participant?._id) },
        ]}>
        <Text style={styles.avatarText}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {last}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <ConversationHeader
  title="Chats"
  onSearchPress={() => setSearchVisible(true)}
  onMenuPress={handleMenu}
/>

      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity
         style={[
    styles.floatingButton,
    { bottom: 80 + insets.bottom } // 👈 yahan fix
  ]}
        onPress={() => navigation.navigate('StartChatScreen')}>
        <Image source={Chat} style={styles.floatingButtonicon} />
      </TouchableOpacity>

      <ChatSearchModal
  visible={searchVisible}
  onClose={() => setSearchVisible(false)}
  token={token}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f6fa'},

  header: {
    padding: 15,
    backgroundColor: Colors.Green,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  row: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  lastMessage: {
    color: '#666',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  floatingButton: {
    position: 'absolute',
    bottom: 10,
    right: 25,
    backgroundColor: Colors.Green,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  floatingButtonicon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
});
