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
import RedeemHistoryModal3 from '../../../components/Modal/OrgEmp/RedeemhistoryModal3';
import { languageData } from '../../../redux/language/languageSlice';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';
import { useSelector } from 'react-redux';



const CorporationHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const language = useSelector( (state: RootState) => state.language.language);
  const styles = getStyles(language);
  
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
      const stored = await AsyncStorage.getItem('org_emp_data');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const EmpId = parsed.empId;

      const OrgEmpSnapshot = await firestore()
        .collection('Employees')
        .where('empId', '==', EmpId)
        .get();

      if (OrgEmpSnapshot.empty) {
        console.warn('Tenant not found');
        return;
      }

      const OrgEmpDocId = OrgEmpSnapshot.docs[0].id;

      const redeemSnapshot = await firestore()
        .collection('Employees')
        .doc(OrgEmpDocId)
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
        title={languageData[language].discount_history}
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

      <RedeemHistoryModal3
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedItem}
      />
    </SafeAreaView>
  );
};



export default CorporationHistoryScreen;


