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
import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '../../../firebase/firebaseconfig';
import RedeemHistoryModal from '../../../components/Modal/StaffModal/RedeemhistoryModal';
import { styles } from './style';
import { NoDataFound } from '../../../theme/Images';


interface StoredStaff {
  uid: string;
  qid: string;
}

const CorporationHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [staff, setStaff] = useState<StoredStaff | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = await AsyncStorage.getItem('org_emp_data');
        const parsedStaff = stored ? JSON.parse(stored) : null;
        console.log(parsedStaff)
        if (!parsedStaff) return;
  
        setStaff(parsedStaff);
  
        const snapshot = await firestore()
          .collection('redeem_history')
          .where('qid', '==', parsedStaff.qid) // filter here
          .get();
  
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
  
    fetchData();
  }, []);
  

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

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
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text style={styles.itemCode}>Brand: {item.brandName}</Text>
            <Text>{item.discount}%</Text>
            <Text>{new Date(item.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1,  alignItems: 'center', justifyContent: 'center', paddingTop: 200 }}>
            {staff === null ? (
              <>
                <Text style={{ fontSize: 16, color: '#555' }}>
                  Data is loading, please wait…
                </Text>
                <ActivityIndicator size="large" color={Colors.PrimaryColor} style={{ marginTop: 20 }} />
              </>
            ) : (
              <>
                <Image
                  source={NoDataFound}
                  style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 20 }}
                />
                <Text style={{ fontSize: 16, color: '#888' }}>No data found</Text>
              </>
            )}
          </View>
        }
      />

      <RedeemHistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedItem}
      />
    </SafeAreaView>
  );
};

export default CorporationHistoryScreen;




