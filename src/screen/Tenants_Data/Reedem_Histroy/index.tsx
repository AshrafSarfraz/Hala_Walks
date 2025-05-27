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

import CustomHeader from '../../../components/header/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/Colors';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '../../../firebase/firebaseconfig';
import RedeemHistoryModal2 from '../../../components/Modal/Tenant/RedeemhistoryModal2';



const TenantHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedeemHistory();
  }, []);

  const fetchRedeemHistory = async () => {
    
    try {
      const stored = await AsyncStorage.getItem('tenant_data');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const tenantId = parsed.tenantId;

      const tenantSnapshot = await firestore()
        .collection('Tenants')
        .where('tenantId', '==', tenantId)
        .get();

      if (tenantSnapshot.empty) {
        console.warn('Tenant not found');
        return;
      }

      const tenantDocId = tenantSnapshot.docs[0].id;

      const redeemSnapshot = await firestore()
        .collection('Tenants')
        .doc(tenantDocId)
        .collection('redeemed_discounts')
        .orderBy('createdAt', 'desc')
        .get();

      const data = redeemSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHistory(data);
    } catch (error) {
      console.error('Error fetching redeem history:', error);
    } finally {
      setLoading(false);
    }
  };





  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={false} backgroundColor={Colors.Bg} barStyle="dark-content" />
      <CustomHeader
        title="Redeem History"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text style={styles.itemCode}>Code: {item.brandName}</Text>
            <Text>{item.code}</Text>
            <Text>{item.discount}</Text>
            <Text>{item.eligibility}</Text>
          </TouchableOpacity>
        )}
      />

      <RedeemHistoryModal2
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
    paddingTop: Platform.OS === 'ios'? '0%':20,
  },
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
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
  },
});

export default TenantHistoryScreen;
