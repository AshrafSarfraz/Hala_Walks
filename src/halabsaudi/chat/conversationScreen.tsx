// src/halabsaudi/chat/conversationScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type Conversation = {
  _id: string;
  participant: { _id: string; name: string };
  lastMessage: { text: string } | null;
  lastMessageAt: string;
};

type RootStackParamList = {
  ChatScreen: { chatId: string; participantName: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

export default function ConversationsScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState(''); // For creating new chat

  // 1️⃣ Load JWT token
  useEffect(() => {
    const getToken = async () => {
      const t = await AsyncStorage.getItem('hala_token');
      setToken(t);
    };
    getToken();
  }, []);

  // 2️⃣ Fetch chats
  useEffect(() => {
    if (!token) return;

    axios
      .get('http://10.0.2.2:3000/api/chat', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setConversations(res.data))
      .catch(err => console.log('Server error:', err.response?.data || err.message));
  }, [token]);

  // 3️⃣ Open chat
  const openChat = (chat: Conversation) => {
    navigation.navigate('ChatScreen', {
      chatId: chat._id,
      participantName: chat.participant.name,
    });
  };

  // 4️⃣ Create or get chat
  const createChat = async () => {
    if (!newUserId.trim()) {
      Alert.alert('Enter participant user ID');
      return;
    }

    try {
      const res = await axios.post(
        `http://10.0.2.2:3000/api/chat/with/${newUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chat = res.data;

      // Add new chat to list
      setConversations(prev => [chat, ...prev]);
      setNewUserId('');

      // Navigate to chat screen
      console.log('chat id:', chat._id);
      navigation.navigate('ChatScreen', {
        chatId: chat._id,
        participantName: chat.participant.name,
      });
    } catch (err: any) {
      console.log('Create chat error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.error || 'Failed to create chat');
      
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          style={styles.input}
          placeholder="Enter user ID to chat"
          value={newUserId}
          onChangeText={setNewUserId}
        />
        <Button title="Start Chat" onPress={createChat} />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>
            <Text style={styles.name}>{item.participant.name}</Text>
            <Text style={styles.lastMessage}>
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No conversations yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { padding: 15, borderBottomWidth: 0.5, borderColor: '#ccc' },
  name: { fontSize: 16, fontWeight: '600' },
  lastMessage: { color: '#555', marginTop: 5 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    marginTop: 50,
  },
});
