import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../Themes/Colors';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';

import AsyncStorage from '@react-native-async-storage/async-storage';



type AccountProps = {
  navigation: any;
};

const AccountScreen: React.FC<AccountProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [redeemCount, setRedeemCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let isMounted = true;

  const fetchUserData = async () => {
    try {
      const user = auth().currentUser;
      let phone = user?.phoneNumber || null; // E.164 e.g. +9665...

      // Fallback: use cached phone you saved earlier
      if (!phone) {
        const cached = await AsyncStorage.getItem('hala_user_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          phone = parsed?.phoneNumber || null;
        }
      }

      if (!phone) {
        console.log('No phone number on user; cannot load hala_users doc');
        return;
      }

      // Primary: doc ID == phone number
      let snap = await firestore().collection('hala_users').doc(phone).get();

      // Fallback: if someone saved different docId but has phoneNumber field
      if (!snap.exists) {
        const q = await firestore()
          .collection('hala_users')
          .where('phoneNumber', '==', phone)
          .limit(1)
          .get();
        if (!q.empty) snap = q.docs[0];
      }

      const data = snap.exists ? snap.data() : null;

      if (isMounted) {
        setName(data?.name ?? '');
        setEmail(user?.email ?? '');
      }
    } catch (err) {
      console.error('Error loading account info:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchUserData();
  return () => { isMounted = false; };
}, []);


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.Green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
   <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />
      <View style={styles.container}>
        <CustomHeader title={'Profile'} onBackPress={() => navigation.goBack()} />
         <View style={{flex:1,justifyContent:'center'}} >
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{name || 'Not Available'}</Text>


          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{auth().currentUser?.phoneNumber ?? 'Not Available'}</Text>

        </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White4,
    marginVertical: Platform.OS === 'ios' ? '2%' : '11%',
    marginHorizontal: '3%',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.Green,
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountScreen;
