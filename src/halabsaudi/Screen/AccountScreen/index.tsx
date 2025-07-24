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

type AccountProps = {
  navigation: any;
};

const AccountScreen: React.FC<AccountProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [redeemCount, setRedeemCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;

        if (user) {
          const userDoc = await firestore().collection('H-users').doc(user.uid).get();
          const data = userDoc.data();
          setName(data?.name ?? '');
          setEmail(user.email ?? '');

          const redeemedSnapshot = await firestore()
            .collection('H-users')
            .doc(user.uid)
            .collection('redeemed_discounts')
            .get();

          setRedeemCount(redeemedSnapshot.size);
        }
      } catch (err) {
        console.error('Error loading account info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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

          <Text style={styles.label}>Total Redeems</Text>
          <Text style={styles.value}>{redeemCount}</Text>
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
