import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { Back_Icon, Logo_W } from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { Colors } from '../../../Themes/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStyles} from './style';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../../firebase/firebaseconfig';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { languageData } from '../../../redux_toolkit/language/languageSlice';


interface OtpProps extends NativeStackScreenProps<any> {}



const Otp: React.FC<OtpProps> = ({ route, navigation }) => {
  const { Phone, Confirmation, Name, CountryCode } = route.params || {}; // Receiving params from navigation
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRef = useRef<Array<TextInput | null>>([]);
  const [showError, setShowError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);


  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  useEffect(() => {
    setShowError(otp.some(pin => pin === ''));
  }, [otp]);

  const handleOtpChange = (value: string, index: number) => {
    setOtp(prevOtp => {
      const newOtp = [...prevOtp];
      newOtp[index] = value;

      if (value && index < inputRef.current.length - 1) {
        inputRef.current[index + 1]?.focus();
      }
      return newOtp;
    });
  };

  const handleOtpKeyPress = (event: { nativeEvent: { key: string } }, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  // Save user data to Firestore
const saveUserData = async () => {
  try {
    const user = auth().currentUser;

    if (!user) {
      // console.log('No user is currently signed in');
      return;
    }

    const userRef = firestore().collection('H-users').doc(user.uid);

    // Check if user already exists
    const doc = await userRef.get();
    if (!doc.exists) {
      // Create new user doc
      await userRef.set({
        name: Name,
        phoneNumber: Phone,
        countryCode: CountryCode,
        createdAt: firestore.FieldValue.serverTimestamp(),
        verified: true,
      });
      // console.log('New user added to Firestore');
    } else {
      // Update name if needed (e.g., for re-login)
      await userRef.update({
        name: Name,
        lastLogin: firestore.FieldValue.serverTimestamp(),
      });
      // console.log('Existing user updated');
    }

  } catch (error: any) {
      setError('Error saving user data: ');
    // setError('Error saving user data: ' + error.message);
    // console.error('Firestore Error:', error.message);
  }
};

  async function confirmCode() {
    setIsLoading(true); // Show loader
    setError(null); // Clear previous errors

    try {
      await Confirmation.confirm(otp.join(''));
      // console.log('OTP verified successfully');

      // Save user data to Firestore after successful verification
      await saveUserData();
      navigation.navigate('BottomTab'); // Navigate to next screen
    } catch (error: any) {
      // console.log('Invalid code:', error.message);
      setError('Invalid OTP. Please check the OTP and try again.');
    } finally {
      setIsLoading(false); // Hide loader
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Bg }}>
                 <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />
      <ScrollView contentContainerStyle={styles.MainCont}>
        <View>
          <TouchableOpacity
            style={styles.Header}
            onPress={() => navigation.goBack()}
          >
            <Image source={Back_Icon} style={styles.BackIcon} />
          </TouchableOpacity>
        </View>
        <Image source={Logo_W} style={styles.Logo} />
        <Text style={styles.digit_Txt}>{languageData[language].enter_otp}</Text>
       <Text style={styles.PhoneNumber}>{Phone}</Text>

        <View style={styles.inputContainer}>
          {otp.map((pin, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRef.current[index] = ref)}
              style={[styles.Otp, { borderColor: pin ? Colors.Green : '#E0E0E0' }]}
              value={pin}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={event => handleOtpKeyPress(event, index)}
              maxLength={1}
              keyboardType="numeric"
              autoFocus={index === 0}
            />
          ))}
        </View>
        {error && <Text style={styles.Error}>{error}</Text>}

            <View style={{height:100}} />
        <CustomButton
          title={languageData[language].verify_otp}
          onPress={confirmCode}// Disable button while loading or if OTP is incomplete
        />

        {isLoading && (
          <ActivityIndicatorModal
            visible={isLoading}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Otp;