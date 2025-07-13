import React, { useState, useEffect } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomHeader from '../../../components/header/CustomHeader';
import RedeemHistoryModal from '../../../components/Modal/StaffModal/RedeemhistoryModal';
import { firestore } from '../../../firebase/firebaseconfig';
import { styles } from './style';
import { NoDataFound } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';

interface StoredTenant {
  uid: string;
  qid: string;
}

const TenantHistoryScreen: React.FC = () => {
  const navigation = useNavigation();

  const [tenant, setTenant] = useState<StoredTenant | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadTenantHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('tenant_data');
        const parsedTenant = stored ? JSON.parse(stored) : null;

        console.log('📦 Stored Tenant:', parsedTenant);

        if (!parsedTenant) return;

        setTenant(parsedTenant);

        const snapshot = await firestore()
          .collection('redeem_history')
          .where('qid', '==', parsedTenant.qid)
          .get();

        const fetchedHistory = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(fetchedHistory);
      } catch (error) {
        console.error('❌ Error fetching history:', error);
      }
    };

    loadTenantHistory();
  }, []);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
      <Text style={styles.itemCode}>Brand: {item.brandName}</Text>
      <Text>{item.discount}%</Text>
      <Text>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {tenant === null ? (
        <>
          <Text style={styles.loadingText}>Data is loading, please wait…</Text>
          <ActivityIndicator
            size="large"
            color={Colors.PrimaryColor}
            style={styles.loader}
          />
        </>
      ) : (
        <>
          <Image
            source={NoDataFound}
            style={styles.noDataImage}
          />
          <Text style={styles.noDataText}>No data found</Text>
        </>
      )}
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

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={renderHistoryItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
      />

      <RedeemHistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedItem}
      />
    </SafeAreaView>
  );
};

export default TenantHistoryScreen;
