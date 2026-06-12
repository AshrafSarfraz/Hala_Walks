import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/Colors';

const API_URL = 'https://awh-api.onrender.com/employees/mongo';

const makeCall = (phoneNumber: string) => {
  if (!phoneNumber) return;
  Linking.openURL(`tel:${phoneNumber}`);
};

const getInitials = (name: string) => {
  if (!name || typeof name !== 'string') return '?';

  const names = name
    .trim()
    .split(/\s+/)      // split by spaces, ignore extra spaces
    .filter(Boolean);  // remove empty parts

  if (names.length === 0) return '?';

  const first = names[0][0].toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0].toUpperCase() : '';

  return (first + last) || '?';
};


const PhoneDirectoryScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [directoryData, setDirectoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const cached = await AsyncStorage.getItem('phone_directory');
      let cachedData: any[] = cached ? JSON.parse(cached) : [];
      if (cachedData.length > 0) {
        setDirectoryData(cachedData);
      }

      const res = await fetch(API_URL);
      const freshData = await res.json();

      // map API fields to expected fields
      const mappedData = freshData.map((item: any) => ({
        id: item._id,
        name: item.Name,
        position: item.Title,
        phone: item.MobilePhone,
      }));

      if (JSON.stringify(mappedData) !== JSON.stringify(cachedData)) {
        await AsyncStorage.setItem(
          'phone_directory',
          JSON.stringify(mappedData)
        );
        setDirectoryData(mappedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = directoryData.filter(
    item =>
      (item.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (item.position?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => makeCall(item.phone)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.position}>{item.position}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderShimmer = () => (
    <View>
      {[...Array(10)].map((_, idx) => (
        <View key={idx} style={styles.card}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{ width: '90%', height: 15, marginBottom: 6 }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{ width: '70%', height: 12, marginBottom: 6 }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{ width: '50%', height: 12 }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
             hidden={false}
             backgroundColor={Colors.Bg}
             barStyle="dark-content"
           />
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <CustomHeader
            title="Directory"
            onBackPress={() => navigation.goBack()}
          />
        </View>

        <TextInput
          placeholder="Search by name or position"
          placeholderTextColor={Colors.Black}
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchBox}
        />

        {loading ? (
          renderShimmer()
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text
                style={{ textAlign: 'center', marginTop: 20, color: '#888' }}
              >
                No matches found.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default PhoneDirectoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 20,
    marginTop:Platform.OS==='ios'?0:20
  },
  searchBox: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    height:55,
    borderWidth:1,
    borderColor:Colors.Grey
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  position: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  phone: {
    fontSize: 14,
    color: '#005029',
    marginTop: 4,
  },
});
