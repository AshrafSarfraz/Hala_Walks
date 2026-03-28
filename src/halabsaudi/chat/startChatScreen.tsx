import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getAvatarColor } from '../Themes/avatarColor';
import { BASE_URL } from '../../config/api';

type User = { _id: string; name: string; isOnline?: boolean };
type Conversation = { _id: string; participant: { _id: string; name: string } };

type RootStackParamList = {
  ChatScreen: { chatId: string; participantName: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

export default function StartChatScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Load token
  useEffect(() => {
    const getToken = async () => {
      const t = await AsyncStorage.getItem('hala_token');
      console.log('Loaded jwt token:', t);
      setToken(t);
    };
    getToken();
  }, []);

  // Fetch users
  useEffect(() => {
    console.log('Fetching users with token:', token);
    if (!token) return;

    setLoading(true);
    axios
      .get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setUsers(res.data))
      .catch(err => console.log('Fetch users error:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Start chat with selected user
  const startChat = async (user: User) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat/with/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chat: Conversation = res.data;

      navigation.navigate('ChatScreen', {
        chatId: chat._id,
        participantName: chat.participant.name,
      });
    
    } catch (err: any) {
      console.log('Create chat error:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to create or get chat');
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4e73df" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search users..."
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item._id}
        renderItem={({ item }) => {
          const avatarLetter = item.name.charAt(0).toUpperCase();
          const avatarColor = getAvatarColor(item._id);

          return (
            <TouchableOpacity style={styles.row} onPress={() => startChat(item)}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
                {item.isOnline && <View style={styles.onlineIndicator} />}
              </View>
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No users found</Text>}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 10 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
    marginTop:30,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1cc88a',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },

  name: { fontSize: 16, fontWeight: 'bold' },

  empty: { textAlign: 'center', marginTop: 40, fontSize: 15, color: '#777' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
