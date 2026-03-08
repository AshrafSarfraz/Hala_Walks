// src/halabsaudi/chat/startChatScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type User = {
  _id: string;
  name: string;
};

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

export default function StartChatScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load token
  useEffect(() => {
    const getToken = async () => {
      const t = await AsyncStorage.getItem('hala_token');
      setToken(t);
    };
    getToken();
  }, []);

  // 2️⃣ Fetch all users
  useEffect(() => {
    if (!token) return;

    axios
      .get('http://10.0.2.2:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setUsers(res.data))
      .catch(err => console.log('Fetch users error:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // 3️⃣ Start chat with selected user
  const startChat = async (user: User) => {
    try {
      const res = await axios.post(
        `http://10.0.2.2:3000/api/chat/with/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chat: Conversation = res.data;

      // Navigate to chat screen
      navigation.navigate('ChatScreen', {
        chatId: chat._id,
        participantName: chat.participant.name,
      });
    } catch (err: any) {
      console.log('Create chat error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to create or get chat');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => startChat(item)}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No users found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { padding: 15, borderBottomWidth: 0.5, borderColor: '#ccc' },
  name: { fontSize: 16, fontWeight: '600' },
});
