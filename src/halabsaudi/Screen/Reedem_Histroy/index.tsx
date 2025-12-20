// src/screens/Redeem/Redeem_His.tsx

import React, { useEffect, useState } from 'react';
import { Text, View, SafeAreaView, FlatList, StatusBar, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Themes/Colors';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { useNavigation } from '@react-navigation/native';

import Discount_Redeem2 from '../../Component/CustomAlert/DiscountRedeem2';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';

type RedeemItem = {
  id: string;
  code?: string;
  percentage?: string;
  createdAt?: any; // string | number | Date
  phoneNumber?: string;
  brand?: string;
};

const BASE_URL = 'https://hala-b-saudi.onrender.com/api/hbs/redeem'; // ✅ your backend route

const Redeem_His: React.FC = () => {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<RedeemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RedeemItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const formatDate = (createdAt: any) => {
    if (!createdAt) return 'Unknown';
    try {
      const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
      if (isNaN(d.getTime())) return 'Unknown';
      return d.toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userDataString = await AsyncStorage.getItem('hala_user_data');
        if (!userDataString) {
          setHistory([]);
          return;
        }

        const userData = JSON.parse(userDataString);
        const phoneNumber = String(userData?.phoneNumber || '').trim();
        console.log('Your number is:', phoneNumber);

        if (!phoneNumber) {
          setHistory([]);
          return;
        }

        // ✅ API fetch
        const res = await fetch(BASE_URL);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('❌ Redeem API failed:', json);
          setHistory([]);
          return;
        }

        // controller can return: { success: true, data: [...] } OR direct array
        const raw = json && json.data ? json.data : json;
        const arr = Array.isArray(raw) ? raw : [];

        // ✅ normalize + filter by phoneNumber
        const filtered: RedeemItem[] = arr
          .map((r: any) => ({
            id: String(r._id || r.id),
            ...r,
          }))
          .filter((r: any) => String(r?.phoneNumber || '').trim() === phoneNumber);

        // ✅ sort latest first
        filtered.sort((a: any, b: any) => {
          const ta = new Date(a?.createdAt || 0).getTime();
          const tb = new Date(b?.createdAt || 0).getTime();
          return tb - ta;
        });

        setHistory(filtered);
      } catch (error) {
        console.error('❌ Redeem API fetch error:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }: { item: RedeemItem }) => {
    const date = formatDate(item.createdAt);

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.itemContainer}>
          <Text style={styles.codeText}>{item.brand || item.code || '—'}</Text>
          <Text style={styles.percentageText}>{item.percentage || '—'}</Text>
          <Text style={styles.dateText}>Used on: {date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor={Colors.White4} barStyle="dark-content" />
      <View style={styles.Container}>
        <CustomHeader
          title={languageData[language].redeem_history}
          onBackPress={() => navigation.goBack()}
        />

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
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
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
