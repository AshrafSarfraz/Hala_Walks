import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { HBS_Logo } from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { Colors } from '../../../Themes/Colors';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import AccountNotFoundModal from '../../../Component/CustomAlert/NoAccountFound';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import { apiPost } from '../../../firebase/api/client';


// ───────────────────────────────────────────────────────────────────────────────
// Helper: build full phone with secret Qatar/Bahrain override
const buildFullPhoneNumber = (countryCode: string, input: string) => {
  const clean = (input || '').replace(/\s|-/g, '');

  // 🔑 Secret override: 123 → Qatar (+974)
  if (clean.startsWith('123')) {
    return `+974${clean.slice(3)}`;
  }

  // 🔑 Secret override: 321 → Bahrain (+973)
  if (clean.startsWith('321')) {
    return `+973${clean.slice(3)}`;
  }

  // Default flow: prepend selected country code (e.g., +966)
  const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cc}${clean}`;
};
// ───────────────────────────────────────────────────────────────────────────────

const Login: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const language = useSelector((state: RootState) => state.language.language);
  const handleCountrySelect = (code: string) => setCountryCode(code);
  const styles = getStyles(language);

  async function sendVerificationCode() {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    const fullPhoneNumber = buildFullPhoneNumber(countryCode, phoneNumber);

    setIsLoading(true);
    setError(null);

    try {
      // 🔹 Backend check + OTP send
      // POST https://hala-b-saudi.onrender.com/api/phoneAuth/login/request-otp
      const res = await apiPost<{
        message: string;
        status?: string;
      }>('/phoneAuth/login/request-otp', {
        phone: fullPhoneNumber,
      });

      console.log('OTP request success:', res);

      // 🔹 Account exists → OTP sent → go to OTP screen
      navigation.navigate('OTP', {
        Phone: fullPhoneNumber,
        CountryCode: countryCode,
        // Ab confirmation / Firebase ki zarurat nahi, verify backend pe hoga
      });
    } catch (err: any) {
      console.log('OTP request error:', err);

      if (err?.status === 404) {
        // User not found (same logic: "agar number register nai ha to login nai")
        setShowNotFoundModal(true);
      } else if (err?.status === 429) {
        // Cooldown (backend ka message: "Please XYZ second wait karo...")
        setError(err?.message || 'Please wait before resending OTP');
      } else {
        setError(err?.message || 'Error sending verification code');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.MainContainer}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.White4}
        barStyle="dark-content"
      />
      <CustomHeader title='' onBackPress={() => { navigation.goBack(); }} />
      <View style={{ marginBottom: '17%' }} />

      {/* Logo */}
      <Image source={HBS_Logo} style={styles.H_Logo} resizeMode="contain" />

      {/* Texts */}
      <Text style={styles.Welcome_Txt}>{languageData[language].welcome_back}</Text>
      <Text style={styles.SignUp_Txt}>{languageData[language].sign_in_message}</Text>

      {/* Inputs */}
      <View style={styles.InputContainer}>
        <View
          style={[
            styles.PhoneInput_Field,
            phoneNumber !== '' ? styles.Active_Input_Field : null,
          ]}
        >
          <CountryDropdown onSelectCountry={handleCountrySelect} />
          <TextInput
            placeholder={languageData[language].phone_number}
            value={phoneNumber}
            placeholderTextColor={Colors.Grey9}
            onChangeText={(t) => {
              setPhoneNumber(t);
              error && setError(null);
            }}
            style={styles.PhoneNumber_Input}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        {/* Error */}
        {error && <Text style={styles.Error}>{error}</Text>}

        {/* Login Btn */}
        <CustomButton
          title={languageData[language].login}
          onPress={sendVerificationCode}
        />

        {/* Register Btn */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={{ alignSelf: 'center', marginTop: 20 }}
        >
          <Text style={{ color: Colors.Green, fontWeight: '600', textDecorationLine: 'underline' }}>
            {languageData[language].Dont_have_an_account_Register}
          </Text>
        </TouchableOpacity>

        {/* Partner Btn */}
        <TouchableOpacity
          style={styles.Partner_Btn}
          onPress={() => navigation.navigate('HalaInfo')}
        >
          <Text style={styles.Partner_Txt}>{languageData[language].become_a_Partner}</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicatorModal visible={isLoading} />}
      <AccountNotFoundModal
        visible={showNotFoundModal}
        onClose={() => setShowNotFoundModal(false)}
      />
    </ScrollView>
  );
};

export default Login;







// import React, { useState } from 'react';
// import {  View, Text, ScrollView, TextInput, Image, StatusBar,TouchableOpacity,} from 'react-native';
// import { HBS_Logo, languageIcon } from '../../../Themes/Images';
// import CustomButton from '../../../Component/CustomButton/CustomButton';
// import { Colors } from '../../../Themes/Colors';
// import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { auth } from '../../../firebase/firebaseconfig';
// import firestore from '@react-native-firebase/firestore';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { languageData } from '../../../redux_toolkit/language/languageSlice';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../redux_toolkit/store';
// import { getStyles } from './style';
// import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
// import AccountNotFoundModal from '../../../Component/CustomAlert/NoAccountFound';
// import CustomHeader from '../../../Component/CustomHeader/CustomHeader';


// // ───────────────────────────────────────────────────────────────────────────────
// // Helper: build full phone with secret Qatar override
// const buildFullPhoneNumber = (countryCode: string, input: string) => {
//   const clean = (input || '').replace(/\s|-/g, '');

// // 🔑 Secret override: 123 → Qatar (+974)
// if (clean.startsWith('123')) {
//   return `+974${clean.slice(3)}`;
// }

// // 🔑 Secret override: 321 → Bahrain (+973)
// if (clean.startsWith('321')) {
//   return `+973${clean.slice(3)}`;
// }
//   // Default flow: prepend selected country code (e.g., +966)
//   const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
//   return `${cc}${clean}`;
// };
// // ───────────────────────────────────────────────────────────────────────────────

// const Login: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
//   const [countryCode, setCountryCode] = useState('+966');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [showNotFoundModal, setShowNotFoundModal] = useState(false);


//   const language = useSelector((state: RootState) => state.language.language);
//   const handleCountrySelect = (code: string) => setCountryCode(code);
//   const styles = getStyles(language);

  


 


//   async function sendVerificationCode() {
//     if (!phoneNumber) {
//       setError('Please enter a valid phone number');
//       return;
//     }

//     const fullPhoneNumber = buildFullPhoneNumber(countryCode, phoneNumber);

//     setIsLoading(true);
//     setError(null);

//     try {
//       // 🔹 1) Firestore check
//       const snap = await firestore()
//         .collection('hala_users')
//         .where('phoneNumber', '==', fullPhoneNumber)
//         .limit(1)
//         .get();

//       if (snap.empty) {
//         setIsLoading(false);
//         setShowNotFoundModal(true); 
//         return;
//       }

//       // 🔹 2) Account exists → proceed with OTP login
//       const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);

//       navigation.navigate('OTP', {
//         Phone: fullPhoneNumber,
//         Confirmation: confirmation,
//         CountryCode: countryCode,
//         onLoginSuccess: async () => {
//           // 🔹 3) Save user details in AsyncStorage7
//           const userDoc = snap.docs[0].data();
//           await AsyncStorage.setItem('hala_user', JSON.stringify(userDoc));
//           // 🔹 4) Navigate to Home (or dashboard)
//           navigation.reset({
//             index: 0,
//             routes: [{ name: 'Home' }],
//           });
//         },
//       });
//     } catch (error: any) {
//       setError('Error sending verification code: ' + (error?.message ?? 'Unknown error'));
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.MainContainer}>
//       <StatusBar
//         hidden={false}
//         translucent={true}
//         animated={true}
//         backgroundColor={Colors.White4}
//         barStyle="dark-content"
//       />
//             <CustomHeader title='' onBackPress={()=>{navigation.goBack()}} />
//               <View style={{marginBottom:"17%"}} />
//       {/* Logo */}
//       <Image source={HBS_Logo} style={styles.H_Logo} resizeMode="contain" />

//       {/* Texts */}
//       <Text style={styles.Welcome_Txt}>{languageData[language].welcome_back}</Text>
//       <Text style={styles.SignUp_Txt}>{languageData[language].sign_in_message}</Text>

//       {/* Inputs */}
//       <View style={styles.InputContainer}>
//         <View
//           style={[
//             styles.PhoneInput_Field,
//             phoneNumber !== '' ? styles.Active_Input_Field : null,
//           ]}
//         >
//           <CountryDropdown onSelectCountry={handleCountrySelect} />
//           <TextInput
//             placeholder={languageData[language].phone_number}
//             value={phoneNumber}
//             placeholderTextColor={Colors.Grey9}
//             onChangeText={setPhoneNumber}
//             style={styles.PhoneNumber_Input}
//             keyboardType="phone-pad"
//             autoCapitalize="none"
//           />
//         </View>

//         {/* Error */}
//         {error && <Text style={styles.Error}>{error}</Text>}

//         {/* Login Btn */}
//         <CustomButton
//           title={languageData[language].login}
//           onPress={sendVerificationCode}
//         />

//         {/* Register Btn */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('SignUp')}
//           style={{ alignSelf: 'center', marginTop: 20 }}
//         >
//           <Text style={{ color: Colors.Green, fontWeight: '600', textDecorationLine: 'underline' }}>
//            {languageData[language].Dont_have_an_account_Register}
//           </Text>
//         </TouchableOpacity>

//         {/* Partner Btn */}
//         <TouchableOpacity
//           style={styles.Partner_Btn}
//           onPress={() => navigation.navigate('HalaInfo')}
//         >
//           <Text style={styles.Partner_Txt}>{languageData[language].become_a_Partner}</Text>
//         </TouchableOpacity>
//       </View>

//       {isLoading && <ActivityIndicatorModal visible={isLoading} />}
//       <AccountNotFoundModal  visible={showNotFoundModal}  onClose={() => setShowNotFoundModal(false)} />
   
//     </ScrollView>

//   );
// };

// export default Login;


