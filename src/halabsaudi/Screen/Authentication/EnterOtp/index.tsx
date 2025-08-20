import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,

} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Back_Icon, Logo_W } from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { Colors } from '../../../Themes/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStyles } from './style';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OtpProps extends NativeStackScreenProps<any> {}

const Otp: React.FC<OtpProps> = ({ route, navigation }) => {
  const { Phone, Confirmation,CountryCode } = route.params || {};
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRef = useRef<Array<TextInput | null>>([]);
  const [showError, setShowError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    setShowError(otp.some(pin => pin === ''));
  }, [otp]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const clipboard = await Clipboard.getString();
      const isValid = /^\d{6}$/.test(clipboard);
  
      if (isValid) {
        const digits = clipboard.split('');
        if (otp.join('') !== clipboard) {
          setOtp(digits);
          setTimeout(() => {
            inputRef.current[5]?.focus();
          }, 100);
          await Clipboard.setString(''); // clear it to prevent re-pasting
        }
      }
    }, 3000);
  
    return () => clearInterval(interval);
  }, [otp]);
  
  

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
  
    if (value) {
      newOtp[index] = value;
  
      // Clear the rest of the digits after current
      for (let i = index + 1; i < newOtp.length; i++) {
        newOtp[i] = '';
      }
  
      setOtp(newOtp);
  
      // Move focus to next box if available
      if (index < inputRef.current.length - 1) {
        inputRef.current[index + 1]?.focus();
      }
    } else {
      // If backspacing, clear current and focus previous
      newOtp[index] = '';
      setOtp(newOtp);
  
      if (index > 0) {
        inputRef.current[index - 1]?.focus();
      }
    }
  };
  

  const handleOtpKeyPress = (event: { nativeEvent: { key: string } }, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRef.current[index - 1]?.focus();
    }
  };

  
  const saveUserData = async () => {
    try {
  

      await AsyncStorage.setItem('hala_user', 'true');
      await AsyncStorage.setItem('hala_user_data', JSON.stringify({
        phoneNumber: Phone,
        countryCode: CountryCode,
      }));
  
      console.log('✅ User data saved to Firestore & AsyncStorage');
    } catch (e) {
      console.log('❌ Error saving data:', e);
      setError('Error saving user data.');
    }
  };
  
  
  
  const confirmCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Confirmation.confirm(otp.join(''));
  
      await saveUserData();
  
      // Navigate to Hala main stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HalabStack' }],
        })
      );
    } catch (err: any) {
      console.log('❌ OTP failed:', err.message);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Bg }}>
      <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.MainCont}>
        <View>
          <TouchableOpacity style={styles.Header} onPress={() => navigation.goBack()}>
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
              keyboardType="number-pad"
              autoFocus={index === 0}
              textContentType={index === 0 ? 'oneTimeCode' : 'none'} // ✅ iOS autofill only on first input
              autoComplete={index === 0 ? 'sms-otp' : 'off'}          // ✅ Android autofill
            />
          ))}
        </View>

        {error && <Text style={styles.Error}>{error}</Text>}

        <View style={{ height: 100 }} />
        <CustomButton title={languageData[language].verify_otp} onPress={confirmCode} />

        {isLoading && <ActivityIndicatorModal visible={isLoading} />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Otp;
