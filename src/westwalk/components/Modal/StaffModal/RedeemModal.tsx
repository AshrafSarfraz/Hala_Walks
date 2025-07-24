import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { West_NB } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '../../../firebase/firebaseconfig';

type Props = {
  visible: boolean;
  onClose: () => void;
  data: {
    code: string;
    createdAt: string;
    validity?: string;
    eligibility?: string;
    staffId?: string;
    qid?: string;
    BrandName: string;
    nameEng?: string;
    discount?: string;
    percentage?: string;
  } | null;
};

const RedeemReceiptModal: React.FC<Props> = ({ visible, onClose, data }) => {
  const [userData, setUserData] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('staff_data');
        console.log(storedUserData)
        if (storedUserData) {
          const parsed = JSON.parse(storedUserData);
          setUserData(parsed);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    if (visible) {
      fetchUserData();
      generateCurrentDate();
      generatePin();
    }
  }, [visible]);

  const generateCurrentDate = () => {
    const today = new Date();
    const formatted = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;
    setCurrentDate(formatted);
  };

  const generatePin = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPin(result);
  };

  const getEligibility = () => {
    if (userData?.staffId) return 'Staff & Family';
    if (userData?.tenantId) return 'Husband & Wife';
    if (userData?.orgEmpId) return '1 Person Only';
    return 'N/A';
  };

  const handleClose = async () => {
    if (!userData || !data) return;
  
    try {
      // Generate eligibility text
      let eligibility = '';
      if (userData.staffId) eligibility = 'Staff & Family';
      else if (userData.tenantId) eligibility = 'Husband & Wife';
      else if (userData.orgEmpId) eligibility = '1 Person Only';
  
      const redeemData = {
        brandName: data.nameEng || data.BrandName,
        employeeId: userData.staffId || userData.tenantId || userData.orgEmpId || 'Unknown',
        qid: userData.qid || NaN,
        code: pin,
        date: currentDate,
        discount: data.discount || data.percentage || 'N/A',
        validity: '3 days',
        eligibility: eligibility,
        userId: userData.userId || 'N/A', 
        createdAt: new Date().toISOString(),
      };
  
      // Save to new global collection
      await firestore().collection('redeem_history').add(redeemData);
      // Alert.alert('Success', 'Redeem history saved successfully.');
      onClose();
    } catch (error) {
      console.error('Error saving redeem history:', error);
      Alert.alert('Error', 'Failed to save redeem history.');
    }
  };
  
  

  if (!data || !userData) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ImageBackground
            source={require('../../../assets/images/westwalk_icon.png')}
            style={styles.BgImg}
            imageStyle={{
              resizeMode: 'contain',
              margin: 20,
              marginVertical: 80,
              opacity: 0.08,
            }}
          >
            <Image source={West_NB} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Redeem</Text>

            <Detail label="Brand Name" value={data.nameEng || data.BrandName} />
            <Detail label="Employee ID" value={userData.staffId || userData.tenantId || userData.orgEmpId || 'N/A'} />
            <Detail label="QID" value={userData.qid || NaN} />
            <Detail label="Discount"value={data.discount || data.percentage ? `${String(data.discount || data.percentage).replace('%', '')}%` : 'N/A'}/>
            <Detail label="Date" value={currentDate} />
            <Detail label="Valid for" value="3 days" />
            <Detail label="Eligibility" value={getEligibility()} />

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailBlock}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  BgImg: {
    backgroundColor: Colors.White,
    padding: 20,
    borderRadius: 20,
    width: '100%',
    resizeMode: 'contain',
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2f2f75',
    textAlign: 'center',
  },
  detailBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#444',
    width: '40%',
  },
  value: {
    fontSize: 15,
    color: '#000',
    width: '55%',
    textAlign: 'right',
  },
  closeButton: {
    backgroundColor: '#2f2f75',
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RedeemReceiptModal;


