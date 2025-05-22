import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import RedeemReceiptModal from '../../../components/Modal/RedeemModal';
import CustomHeader from '../../../components/header/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/Colors';
import {SafeAreaView} from 'react-native-safe-area-context';
import {auth, firestore} from '../../../firebase/firebaseconfig';

const RedeemHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [redeemHistory, setRedeemHistory] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;

        const snapshot = await firestore()
          .collection('Westwalk_Staff')
          .doc(user.uid)
          .collection('redeemed_discounts')
          .orderBy('createdAt', 'desc')
          .get();

        const history = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRedeemHistory(history);
      } catch (error) {
        console.error('Error fetching redeem history:', error);
      }
    };

    fetchHistory();
  }, []);

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
      <Text style={styles.itemCode}>Brand: {item.brandName}</Text>
      <Text>Code: {item.code}</Text>
      <Text>Date: {item.date || new Date(item.createdAt).toLocaleString()}</Text>
      <Text>Discount: {item.discount}</Text>
      <Text>Eligibility: {item.eligibility}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={false} backgroundColor={Colors.Bg} barStyle="dark-content" />
      <CustomHeader title="Redeem History" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={redeemHistory}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No redeem history found.</Text>}
        contentContainerStyle={{paddingBottom: 20}}
      />

      <RedeemReceiptModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  item: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.Grey,
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default RedeemHistoryScreen;
