import React, { useEffect, useRef, useState } from 'react';
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
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import RBSheet from 'react-native-raw-bottom-sheet';
import FilterRBSheet from '../BottomSheet/bottom_sheet';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import IncorrectPin from './IncorrectPin';
import Discount_Redeem from './DiscountRedeem';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { languageData } from '../../redux_toolkit/language/languageSlice';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (enteredPin: string) => void;
  correctPin: string;
  discount: number;
  brand: string;
  address: string;
};

export type RedeemItem = {
  id: string;
  code: string;
  percentage: string; // "-10%"
  brand: string;
  address: string;
  date: string; // "YYYY-MM-DD"
  Username: string;
  phoneNumber: string;
};

const Pin_Modal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  correctPin,
  discount,
  brand,
  address,
}) => {
  const refRBSheet = useRef<RBSheet>(null);
  const [pin, setPin] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [incorrectPinModal, setIncorrectPinModal] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<RedeemItem | null>(null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    if (visible) {
      setDiscountCode(generateCode());
      setPin('');
      setLoading(false);
      // reset child modals on fresh open
      setIncorrectPinModal(false);
      setSuccessVisible(false);
      setRedeemedItem(null);
    }
  }, [visible]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  const handleRedeem = async () => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('No authenticated user.');

      if (!brand) throw new Error('Missing brand prop.');
      if (!address) throw new Error('Missing address prop.');
      if (!discount && discount !== 0) throw new Error('Missing discount prop.');

      const snap = await firestore()
        .collection('hala_users')
        .where('phoneNumber', '==', user.phoneNumber)
        .limit(1)
        .get();

      if (snap.empty) throw new Error('User not found in hala_users');

      const userDoc = snap.docs[0].data();
      const today = new Date().toISOString().split('T')[0];

      const redeemedSnap = await firestore()
        .collection('hala_redeemed_discounts')
        .where('phoneNumber', '==', userDoc.phoneNumber)
        .where('brand', '==', brand)
        .where('address', '==', address)
        .where('date', '==', today)
        .limit(1)
        .get();

      if (!redeemedSnap.empty) {
        setMessage(`${languageData[language].Already_redeemed_today}`);
        setIncorrectPinModal(true);
        return;
      }

      await firestore()
        .collection('hala_redeemed_discounts')
        .add({
          Username: userDoc?.name || 'N/A',
          phoneNumber: userDoc.phoneNumber || 'N/A',
          countryCode: userDoc?.countryCode || 'N/A',
          uid: user.uid,
          brand,
          address,
          code: discountCode,
          percentage: `-${discount}`,
          date: today,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      const localItem: RedeemItem = {
        id: Math.random().toString(36).slice(2),
        code: discountCode,
        percentage: `-${discount}`,
        brand,
        address,
        date: today,
        Username: userDoc?.name || 'N/A',
        phoneNumber: userDoc.phoneNumber || 'N/A',
      };

      setRedeemedItem(localItem);
      setSuccessVisible(true);
    } catch (err: any) {
      console.error('❌ Redeem failed:', err);
      setMessage(err?.message || 'Unknown error');
      setIncorrectPinModal(true);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    const trimmed = pin.trim();

    if (!trimmed) {
      setMessage(`${languageData[language].PIN_required}`);
      setIncorrectPinModal(true);
      return;
    }

    if (trimmed !== correctPin) {
      setMessage(`${languageData[language].Pin_incorrect}`);
      setIncorrectPinModal(true);
      return;
    }

    try {
      setLoading(true);
      onSubmit?.(trimmed);
      await handleRedeem();
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  return (
    <>
      {/* Parent PIN modal ONLY when no child modal is visible */}
      <Modal
        transparent
        animationType="fade"
        visible={visible && !incorrectPinModal && !successVisible}
        onRequestClose={onClose}
        presentationStyle="overFullScreen"
      >
        <StatusBar hidden translucent animated />
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.headerText}>{languageData[language].Enter_Pin}</Text>

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
              style={styles.Redeem_btn}
            >
              <Text style={styles.use_txt}>
                {languageData[language].Where_to_Get_Redeem_PIN}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.White} />
              ) : (
                <Text style={styles.languageText}>
                  {languageData[language].Submit}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>
                {languageData[language].cancel}
              </Text>
            </TouchableOpacity>
          </View>

          <FilterRBSheet ref={refRBSheet} />
        </View>
      </Modal>

      {/* Error/info modal (separate) */}
      <IncorrectPin
        visible={incorrectPinModal}
        message={message}
        onClose={() => {
          setMessage('');
          setIncorrectPinModal(false);
        }}
      />

      {/* Success modal (separate) */}
      <Discount_Redeem
        visible={successVisible}
        data={redeemedItem}
        onClose={() => {
          setSuccessVisible(false);
          setRedeemedItem(null);
          onClose(); // also close PIN modal in parent
        }}
      />
    </>
  );
};

// styles unchanged
const getStyles = (language: string) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    container: {
      backgroundColor: 'white',
      width: '90%',
      paddingVertical: 30,
      borderRadius: 12,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    headerText: {
      fontSize: 20,
      fontFamily: Fonts.SF_Bold,
      color: Colors.Black,
      marginBottom: 15,
    },
    InputField: {
      borderWidth: 2,
      borderColor: Colors.Grey4,
      width: '85%',
      height: 55,
      borderRadius: 8,
      marginBottom: 4,
      paddingHorizontal: '3%',
      color: Colors.Black,
      fontSize: 14,
      fontFamily: Fonts.SF_Medium,
      lineHeight: 18,
    },
    Redeem_btn: {
      marginLeft: language === 'en' ? '9%' : 0,
      marginRight: language === 'en' ? '0%' : '9%',
      marginVertical: 4,
      alignSelf: language === 'en' ? 'flex-start' : 'flex-end',
    },
    use_txt: {
      fontSize: 14,
      fontFamily: Fonts.SF_SemiBold,
      textDecorationLine: 'underline',
      marginBottom: 20,
    },
    languageButton: {
      backgroundColor: Colors.Green,
      width: '85%',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
      height: 55,
    },
    languageText: {
      color: Colors.White,
      fontSize: 16,
      fontFamily: Fonts.SF_Bold,
      lineHeight: 22,
      letterSpacing: 0.3,
    },
    closeButton: {
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderColor: Colors.Green,
    },
    closeButtonText: {
      fontSize: 16,
      color: Colors.Black,
      fontFamily: Fonts.SF_Bold,
    },
  });

export default Pin_Modal;


// import React, {useEffect, useRef, useState} from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   StatusBar,
//   ActivityIndicator,
// } from 'react-native';
// import {Colors} from '../../Themes/Colors';
// import {Fonts} from '../../Themes/Fonts';
// import RBSheet from 'react-native-raw-bottom-sheet';
// import FilterRBSheet from '../BottomSheet/bottom_sheet';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
// import IncorrectPin from './IncorrectPin';

// import Discount_Redeem from './DiscountRedeem';
// import {useSelector} from 'react-redux';
// import {RootState} from '../../redux_toolkit/store';
// import {languageData} from '../../redux_toolkit/language/languageSlice';


// type Props = {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit?: (enteredPin: string) => void; // optional
//   correctPin: string;
//   discount: number;
//   brand: string;
//   address: string;
// };

// export type RedeemItem = {
//   id: string;
//   code: string;
//   percentage: string; // e.g. "-10%"
//   brand: string;
//   address: string;
//   date: string; // "YYYY-MM-DD"
//   Username: string;
//   phoneNumber: string;
// };

// const Pin_Modal: React.FC<Props> = ({
//   visible,
//   onClose,
//   onSubmit,
//   correctPin,
//   discount,
//   brand,
//   address,
// }) => {
//   const refRBSheet = useRef<RBSheet>(null);
//   const [pin, setPin] = useState('');
//   const [discountCode, setDiscountCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [incorrectPinModal, setIncorrectPinModal] = useState(false);
//   const [successVisible, setSuccessVisible] = useState(false);
//   const [redeemedItem, setRedeemedItem] = useState<RedeemItem | null>(null);
//   const language = useSelector((state: RootState) => state.language.language);
//   const styles = getStyles(language);




//   useEffect(() => {
//     if (visible) {
//       setDiscountCode(generateCode());
//       setPin('');
//       setLoading(false);
//     }
//   }, [visible]);

//   const generateCode = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     return Array.from({length: 6}, () =>
//       chars.charAt(Math.floor(Math.random() * chars.length)),
//     ).join('');
//   };

//   const handleRedeem = async () => {
//     try {
//       const user = auth().currentUser;
//       if (!user) throw new Error('No authenticated user.');

//       if (!brand) throw new Error('Missing brand prop.');
//       if (!address) throw new Error('Missing address prop.');
//       if (!discount) throw new Error('Missing discount prop.');

//       const snap = await firestore()
//         .collection('hala_users')
//         .where('phoneNumber', '==', user.phoneNumber)
//         .limit(1)
//         .get();

//       if (snap.empty) throw new Error('User not found in hala_users');

//       const userDoc = snap.docs[0].data();
//       const today = new Date().toISOString().split('T')[0];

//       const redeemedSnap = await firestore()
//         .collection('hala_redeemed_discounts')
//         .where('phoneNumber', '==', userDoc.phoneNumber)
//         .where('brand', '==', brand)
//         .where('address', '==', address)
//         .where('date', '==', today)
//         .limit(1)
//         .get();

//       if (!redeemedSnap.empty) {
//         setMessage(`${languageData[language].Already_redeemed_today}`);
//         setIncorrectPinModal(true);
//         return;
//       }

//       // Create record in Firestore
//       await firestore()
//         .collection('hala_redeemed_discounts')
//         .add({
//           Username: userDoc?.name || 'N/A',
//           phoneNumber: userDoc.phoneNumber || 'N/A',
//           countryCode: userDoc?.countryCode || 'N/A',
//           uid: user.uid,
//           brand,
//           address,
//           code: discountCode,
//           percentage: `-${discount}`,
//           date: today,
//           createdAt: firestore.FieldValue.serverTimestamp(),
//         });

//       // Prepare data for success modal (local state)
//       const localItem: RedeemItem = {
//         id: Math.random().toString(36).slice(2),
//         code: discountCode,
//         percentage: `-${discount}`,
//         brand,
//         address,
//         date: today,
//         Username: userDoc?.name || 'N/A',
//         phoneNumber: userDoc.phoneNumber || 'N/A',
//       };

//       setRedeemedItem(localItem);
//       setSuccessVisible(true); // ✅ show success modal
//       // onClose();  // ❌ نہ چلائیں—Close بٹن پر چلائیں گے
//     } catch (err) {
//       console.error('❌ Redeem failed:', err);
//       setMessage(err instanceof Error ? err.message : 'Unknown error');
//       setIncorrectPinModal(true);
//     }
//   };

//   const handleSubmit = async () => {
//     if (loading) return;

//     const trimmed = pin.trim();

//     // PIN empty
//     if (!trimmed) {
//       setMessage(`${languageData[language].PIN_required}`);
//       setIncorrectPinModal(true);
//       return;
//     }

//     // PIN incorrect
//     if (trimmed !== correctPin) {
//       setMessage(`${languageData[language].Pin_incorrect}`);
//       setIncorrectPinModal(true);
//       return;
//     }

//     try {
//       setLoading(true);
//       onSubmit?.(trimmed); // optional: inform parent that PIN was correct
//       await handleRedeem(); // only runs on correct PIN
//     } finally {
//       setLoading(false);
//       setPin('');
//     }
//   };

//   return (
//     <Modal transparent visible={visible} animationType="fade">
//       <StatusBar hidden translucent animated />
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <Text style={styles.headerText}>{languageData[language].Enter_Pin}</Text>

//           <TextInput
//             placeholder="Enter Pin"
//             style={styles.InputField}
//             value={pin}
//             onChangeText={setPin}
//             keyboardType="number-pad"
//             secureTextEntry
//             maxLength={6}
//           />

//           <TouchableOpacity
//             onPress={() => refRBSheet.current?.open()}
//             style={styles.Redeem_btn}>
//             <Text style={styles.use_txt}>
//               {languageData[language].Where_to_Get_Redeem_PIN}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.languageButton, {opacity: loading ? 0.7 : 1}]}
//             onPress={handleSubmit}
//             disabled={loading}>
//             {loading ? (
//               <ActivityIndicator color={Colors.White} />
//             ) : (
//               <Text style={styles.languageText}>
//                 {languageData[language].Submit}
//               </Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={onClose}
//             disabled={loading}>
//             <Text style={styles.closeButtonText}>
//               {languageData[language].cancel}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <FilterRBSheet ref={refRBSheet} />
//       </View>

//       {/* Custom message modal */}
//       <IncorrectPin
//         visible={incorrectPinModal}
//         message={message}
//         onClose={() => {
//           setMessage('');
//           setIncorrectPinModal(false);
//         }}
//       />

//       <Discount_Redeem
//         visible={successVisible}
//         data={redeemedItem}
//         onClose={() => {
//           setSuccessVisible(false);
//           setRedeemedItem(null);
//           onClose(); // ✅ PIN والا موڈل بھی بند
//         }}
//       />
//     </Modal>
//   );
// };

// // styles unchanged
// const getStyles =(language:String)=> StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//   },
//   container: {
//     backgroundColor: 'white',
//     width: '90%',
//     paddingVertical: 30,
//     borderRadius: 12,
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 3},
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   headerText: {
//     fontSize: 20,
//     fontFamily: Fonts.SF_Bold,
//     color: Colors.Black,
//     marginBottom: 15,
//   },
//   InputField: {
//     borderWidth: 2,
//     borderColor: Colors.Grey4,
//     width: '85%',
//     height: 55,
//     borderRadius: 8,
//     marginBottom: 4,
//     paddingHorizontal: '3%',
//     color: Colors.Black,
//     fontSize: 14,
//     fontFamily: Fonts.SF_Medium,
//     lineHeight: 18,
//   },
//   Redeem_btn: {
//     marginLeft:language==='en'?'9%':0,
//     marginRight:language==='en'?'0%':'9%',
//     marginVertical: 4, 
//     alignSelf: language==='en'?'flex-start':'flex-end'},
//   use_txt: {
//     fontSize: 14,
//     fontFamily: Fonts.SF_SemiBold,
//     textDecorationLine: 'underline',
//     marginBottom: 20,
//   },
//   languageButton: {
//     backgroundColor: Colors.Green,
//     width: '85%',
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 4,
//     height: 55,
//   },
//   languageText: {
//     color: Colors.White,
//     fontSize: 16,
//     fontFamily: Fonts.SF_Bold,
//     lineHeight: 22,
//     letterSpacing: 0.3,
//   },
//   closeButton: {
//     marginTop: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderColor: Colors.Green,
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: Colors.Black,
//     fontFamily: Fonts.SF_Bold,
//   },
// });

// export default Pin_Modal;
