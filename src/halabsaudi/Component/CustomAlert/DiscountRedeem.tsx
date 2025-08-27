import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';
import {Giftpack} from '../../Themes/Images';
import CustomButton from '../CustomButton/CustomButton';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanProps = {
  visible: boolean;
  onClose: () => void;
  discount: number; 
  brand:string;
  address:string;
};

const Discount_Redeem: React.FC<LanProps> = ({visible, onClose,discount,brand,address}) => {
  const [discountCode, setDiscountCode] = useState('');

  useEffect(() => {
    if (visible) {
      setDiscountCode(generateCode());
    }
  }, [visible]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({length: 6}, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  };

  const handleRedeem = async () => {
    try {
      const user = auth().currentUser;
      if (!user?.phoneNumber) throw new Error('No authenticated phone number found.');
  
      // 🔹 Firestore se hala_users me user ka record lo
      const snap = await firestore()
        .collection('hala_users')
        .where('phoneNumber', '==', user.phoneNumber)
        .limit(1)
        .get();
  
      if (snap.empty) throw new Error('User not found in hala_users');
  
      const userDoc = snap.docs[0].data();
  
      // 🔹 Today's date (YYYY-MM-DD format)
      const today = new Date().toISOString().split('T')[0];
  
      // 🔹 Check if already redeemed today for this brand
      const redeemedSnap = await firestore()
        .collection('hala_redeemed_discounts')
        .where('phoneNumber', '==', userDoc.phoneNumber)
        .where('brand', '==', brand)
        .where('date', '==', today) // ✅ check for today's date
        .limit(1)
        .get();
  
      if (!redeemedSnap.empty) {
        // Already redeemed today
        Alert.alert(
          'Already Redeemed Today',
          `You have already redeemed a discount for ${brand} today.`
        );
        return; // Stop execution
      }
  
      // 🔹 Create new redeem record
      await firestore()
        .collection('hala_redeemed_discounts')
        .add({
          Username: userDoc.name || 'N/A',
          phoneNumber: userDoc.phoneNumber || 'N/A',
          countryCode: userDoc.countryCode || 'N/A',
          brand: brand,
          address: address,
          code: discountCode,
          percentage: `-${discount}%`,
          date: today, // ✅ store today's date
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
  
      onClose();
    } catch (err) {
      console.error('❌ Redeem failed:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  };
  


 

  return (
    <Modal transparent visible={visible} animationType="fade">
        <StatusBar hidden={true} translucent={true} animated={true} />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            style={{width: 150, height: 150, resizeMode: 'cover', marginVertical: 20}}
            source={Giftpack}
          />
           {/* <Text style={styles.header_Text}>{address}</Text> */}
          <Text style={styles.header_Text}>Your discount code is :</Text>
          <Text style={styles.code_Text}>{discountCode}</Text>
          <Text style={styles.dis_Text}>-{discount}%</Text>
          
          <Text style={styles.desc_Text}>
            This is single use of code for your use only. Get a new code each
            time you open the App
          </Text>

          <CustomButton onPress={handleRedeem} title="Redeem" />
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    backgroundColor: 'white',
    width: '80%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginHorizontal: '3%',
    marginBottom: '7%',
    marginTop: '2%',
  },
  RemoveIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: Colors.Green,
  },
  header_Text: {
    fontSize: 16,
    fontFamily: Fonts.SF_Regular,
    lineHeight: 20,
    color: Colors.Green,
    marginVertical: 10,
  },
  code_Text: {
    fontSize: 24,
    lineHeight: 30,
     fontFamily:Fonts.SF_Bold,
    color: Colors.Green,
  },
  dis_Text: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily:Fonts.SF_Bold,
    color: Colors.Green,
    marginTop:"3%"
  
  },
  desc_Text: {
    fontSize: 10,
    lineHeight:12,
    fontFamily:Fonts.SF_Regular,
    color: Colors.Grey9,
    marginVertical:20,
    textAlign:"center"
  },
});

export default Discount_Redeem;





  // const handleRedeem = async () => {
  //   const user = auth().currentUser;
  //   const userDataString = await AsyncStorage.getItem('hala_user_data');
  //   if (!userDataString) throw new Error('User data not found');
  //   const userData = JSON.parse(userDataString);
  //   if (user) {
  //     await firestore()
  //       .collection('hala_redeemed_discounts')
  //       .add({
  //         Username: userData.name || 'N/A',
  //         phoneNumber: userData.phoneNumber || 'N/A',
  //         countryCode: userData.countryCode || 'N/A',
  //         brand:brand,
  //         address:address,
  //         code: discountCode,
  //         percentage: `-${discount}%`,
  //         createdAt: firestore.FieldValue.serverTimestamp(),
  //       });
  //   }
  //   onClose();
  // };

  