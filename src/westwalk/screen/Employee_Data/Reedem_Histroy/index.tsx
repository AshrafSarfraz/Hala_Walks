import React, { useState, useEffect } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '../../../firebase/firebaseconfig';
import RedeemHistoryModal from '../../../components/Modal/StaffModal/RedeemhistoryModal';
import { styles } from './style';
import EmptyStateScreen from '../../../components/NoDataFound/No_data_found';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

interface StoredStaff {
  uid: string;
  qid: string;
}

const StaffHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StoredStaff | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const stored = await AsyncStorage.getItem('staff_data');
        const parsedStaff = stored ? JSON.parse(stored) : null;
        if (!parsedStaff) return;

        setStaff(parsedStaff);

        const snapshot = await firestore()
          .collection('redeem_history')
          .where('qid', '==', parsedStaff.qid)
          .get();

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderShimmerItem = () => (
    <View style={styles.item}>
      <ShimmerPlaceholder
        style={{ height: 20, marginBottom: 5, borderRadius: 4 }}
      />
      <ShimmerPlaceholder
        style={{ height: 20, marginBottom: 5, borderRadius: 4 }}
      />
      <ShimmerPlaceholder
        style={{ height: 20, width: '50%', borderRadius: 4 }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        hidden={false}
        backgroundColor={Colors.Bg}
        barStyle="dark-content"
      />
      <CustomHeader
        title="Redeem History"
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]} // fake data for shimmer
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderShimmerItem}
          showsVerticalScrollIndicator={false}
        />
      ) : history.length === 0 ? (
        <EmptyStateScreen />
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => openModal(item)}
            >
              <Text style={styles.itemCode}>Brand: {item.brandName}</Text>
              <Text>{item.discount}%</Text>
              <Text>{new Date(item.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <RedeemHistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedItem}
      />
    </SafeAreaView>
  );
};

export default StaffHistoryScreen;
