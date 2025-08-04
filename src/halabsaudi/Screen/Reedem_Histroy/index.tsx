// src/screens/Redeem/Redeem_His.tsx

import React, { useEffect, useState } from 'react';
import { Text, View, SafeAreaView, FlatList, StatusBar, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Themes/Colors';
import firestore from '@react-native-firebase/firestore';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { useNavigation } from '@react-navigation/native';

import { styles } from './style';
import Discount_Redeem2 from '../../Component/CustomAlert/DiscountRedeem2';

type RedeemItem = {
  code: string;
  percentage: string;
  createdAt: any;
  id: string;
};

const Redeem_His: React.FC = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState<RedeemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RedeemItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userDataString = await AsyncStorage.getItem('hala_user_data');
        if (!userDataString) return;

        const userData = JSON.parse(userDataString);
        const phoneNumber = userData.phoneNumber;
         console.log('Your number is   :  ',phoneNumber)
        const snapshot = await firestore()
        .collection('hala_redeemed_discounts') // ✅ correct
        .where('phoneNumber', '==', phoneNumber)
        .get();
      

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as RedeemItem[];

        setHistory(data);
      } catch (error) {
        console.error('❌ Firestore fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }: { item: RedeemItem }) => {
    const date = item.createdAt?.toDate?.().toLocaleString() ?? 'Unknown';
    return (
      <TouchableOpacity onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}>
        <View style={styles.itemContainer}>
          <Text style={styles.codeText}>{item.brand}</Text>
          <Text style={styles.percentageText}>{item.percentage}</Text>
          <Text style={styles.dateText}>Used on:{date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor={Colors.White4} barStyle="dark-content" />
      <View style={styles.Container}>
        <CustomHeader title="Redeem History" onBackPress={() => navigation.goBack()} />
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : history.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
            <Text style={styles.emptyStateText}>No Redeem Codes Found</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Discount_Redeem2
          visible={modalVisible}
          item={selectedItem}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
};

export default Redeem_His;
