import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';

const phoneDirectoryData = [
  {
    id: '1',
    name: 'Ashraf Sarfraz',
    position: 'Manager',
    phone: '+97412345678',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    name: 'Asad Malik',
    position: 'HR Officer',
    phone: '+97487654321',
    image: 'https://via.placeholder.com/100',
  },
  // Add more entries as needed
];

const makeCall = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url);
};

const PhoneDirectoryScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');

  // Filter data based on search
  const filteredData = phoneDirectoryData.filter(
    item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.position.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => makeCall(item.phone)}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.position}>{item.position}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <CustomHeader title="Directory" onBackPress={() => navigation.goBack()} />
        </View>

        {/* Search Box */}
        <TextInput
          placeholder="Search by name or position"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchBox}
        />

        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
              No matches found.
            </Text>
          }
        />
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
  },
  searchBox: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
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
