import React, { useState, useEffect } from 'react';
import {Text,FlatList,TouchableOpacity,StatusBar,} from 'react-native';

import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, firestore } from '../../../firebase/firebaseconfig';
import RedeemHistoryModal from '../../../components/Modal/StaffModal/RedeemhistoryModal';
import { styles } from './style';



const StaffHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
 

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const snapshot = await firestore() .collection('Westwalk_Staff').doc(user.uid) .collection('redeemed_discounts')
            .orderBy('createdAt', 'desc') .get();
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), })) as any[];
          setHistory(data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {

      }
    };
    fetchHistory();
  }, []);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={false} backgroundColor={Colors.Bg} barStyle="dark-content" />
      <CustomHeader  title="Redeem History" onBackPress={() => {  navigation.goBack(); }} />   
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text style={styles.itemCode}>Brand: {item.brandName}</Text>
            <Text>{item.discount}</Text>
            <Text>{new Date(item.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>)}/>

     <RedeemHistoryModal  visible={modalVisible} onClose={() => setModalVisible(false)}   data={selectedItem}/>
    </SafeAreaView>
  );
};

export default StaffHistoryScreen;
