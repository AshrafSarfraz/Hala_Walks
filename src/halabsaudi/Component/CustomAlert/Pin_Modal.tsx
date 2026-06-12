import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';
import IncorrectPin from './IncorrectPin';
import Discount_Redeem from './DiscountRedeem';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';
import FilterRBSheet from '../BottomSheet/bottom_sheet';

const BASE_URL = 'https://hala-b-saudi.onrender.com/api/hbs/redeem';

type Props = {
  visible: boolean;
  onClose: () => void;

  correctPin: string;

  brand: string;
  brandId: string; // ✅ MUST SEND (your brand _id)

  Redeempin: string;
  address: string;

  discountText: string; // e.g. "15% Discount on Final Bill"
  discountValue: number; // e.g. 15
};

const Pin_Modal: React.FC<Props> = ({
  visible,
  onClose,
  correctPin,
  brand,
  brandId,
  address,
  Redeempin,
  discountText,
  discountValue,
}) => {
  const refRBSheet = useRef<RBSheet>(null);

  const [pin, setPin] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [incorrectPinModal, setIncorrectPinModal] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<any>(null);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    if (visible) {
      setDiscountCode(generateCode());
      setPin('');
      setLoading(false);
      setIncorrectPinModal(false);
      setSuccessVisible(false);
      setRedeemedItem(null);
      setMessage('');
    }
  }, [visible]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({length: 6}, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  };

  const handleRedeem = async () => {
    const backendRaw = await AsyncStorage.getItem('hala_user_backend');
    const halaRaw = await AsyncStorage.getItem('hala_user_data');

    if (!backendRaw) throw new Error('User not logged in');

    const backendUser = JSON.parse(backendRaw);
    const halaData = halaRaw ? JSON.parse(halaRaw) : {};

    const phoneNumber = halaData.phoneNumber || backendUser.phone || 'N/A';

    // ✅ Backend requires userId (not uid)
    const userId =
      backendUser?._id || backendUser?.id || backendUser?.uid || null;

    if (!userId) throw new Error('Missing userId');
    if (!brandId) throw new Error('Missing brandId');

    // ✅ date for rule (one per brand per day)
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      // your fields
      Username: backendUser?.name || 'N/A',
      address,
      brand,
      code: discountCode,
      phoneNumber,

      // ✅ REQUIRED fields
      userId,
      brandId,
      date: today,

      createdAt: `${Date.now()}`,

      // discount fields (backend has percentage, so keep it)
      percentage: `-${discountValue}%`,
      discountText,

      // optional
      Redeempin,
    };

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // 409 "already redeemed today" etc.
      throw new Error(data?.message || 'Redeem failed');
    }

    // Backend might return {success:true, data:saved} OR saved directly
    const savedItem = data?.data || data || payload;

    setRedeemedItem(savedItem);
    setSuccessVisible(true);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const entered = pin.trim();

    if (!entered) {
      setMessage(languageData[language].PIN_required);
      setIncorrectPinModal(true);
      return;
    }

    if (entered !== correctPin) {
      setMessage(languageData[language].Pin_incorrect);
      setIncorrectPinModal(true);
      return;
    }

    try {
      setLoading(true);
      await handleRedeem();
    } catch (err: any) {
      console.error('❌ Redeem error:', err);
      setMessage(err?.message || 'Something went wrong');
      setIncorrectPinModal(true);
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={visible && !incorrectPinModal && !successVisible}
        onRequestClose={onClose}
        presentationStyle="overFullScreen">
        <StatusBar hidden translucent />
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.headerText}>
              {languageData[language].Enter_Pin}
            </Text>

            <Text style={{marginBottom: 10}}>{discountText}</Text>

            <TextInput
              placeholder="Enter Pin"
              style={styles.InputField}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />

            <TouchableOpacity
              onPress={() => refRBSheet.current?.open()}
              style={styles.Redeem_btn}>
              <Text style={styles.use_txt}>
                {languageData[language].Where_to_Get_Redeem_PIN}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.languageButton, {opacity: loading ? 0.7 : 1}]}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.languageText}>
                  {languageData[language].Submit}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text style={styles.closeButtonText}>
                {languageData[language].cancel}
              </Text>
            </TouchableOpacity>
          </View>

          <FilterRBSheet ref={refRBSheet} />
        </View>
      </Modal>

      <IncorrectPin
        visible={incorrectPinModal}
        message={message}
        onClose={() => setIncorrectPinModal(false)}
      />

      <Discount_Redeem
        visible={successVisible}
        data={redeemedItem}
        onClose={() => {
          setSuccessVisible(false);
          setRedeemedItem(null);
          onClose();
        }}
      />
    </>
  );
};

const getStyles = (language: string) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)',
    },
    container: {
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 25,
      alignItems: 'center',
    },
    headerText: {
      fontSize: 20,
      fontFamily: Fonts.SF_Bold,
      marginBottom: 10,
    },
    InputField: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    Redeem_btn: {
      marginVertical: 4,
      alignSelf: language === 'en' ? 'flex-start' : 'flex-end',
    },
    use_txt: {
      fontSize: 14,
      fontFamily: Fonts.SF_SemiBold,
      textDecorationLine: 'underline',
      marginBottom: 10,
    },
    languageButton: {
      backgroundColor: Colors.btnRed,
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    languageText: {
      color: '#fff',
      fontFamily: Fonts.SF_Bold,
    },
    closeButtonText: {
      marginTop: 10,
      fontSize: 16,
      color: Colors.Black,
    },
  });

export default Pin_Modal;
