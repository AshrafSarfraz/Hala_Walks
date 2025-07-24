import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';
import {Giftpack} from '../../Themes/Images';
import CustomButton from '../CustomButton/CustomButton';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type LanProps = {
  visible: boolean;
  onClose: () => void;
  discount: number; 
};

const Discount_Redeem: React.FC<LanProps> = ({visible, onClose,discount}) => {
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
    const user = auth().currentUser;
    if (user) {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('redeemed_discounts')
        .add({
          code: discountCode,
          percentage: `-${discount}%`,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    }
    onClose();
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
