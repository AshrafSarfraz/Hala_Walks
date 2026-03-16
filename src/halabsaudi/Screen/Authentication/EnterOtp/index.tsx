
import React, { useState, useEffect } from 'react';
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

import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost } from '../../../firebase/api/client';



interface OtpProps extends NativeStackScreenProps<any> {}

const Otp: React.FC<OtpProps> = ({ route, navigation }) => {
  const { Phone, CountryCode } = route.params || {};

  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0); // seconds

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  // 🔁 Cooldown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1 && timer) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Optional: clipboard polling (auto-read OTP)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const clip = await Clipboard.getString();
        if (/^\d{6}$/.test(clip) && otp !== clip) {
          setOtp(clip);
          await Clipboard.setString(''); // clear so it doesn't re-paste
        }
      } catch (e) {
        // silent fail
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [otp]);

  const saveUserData = async (token: string, user: any) => {
    try {
      // Pehle jaisa flag + basic data
    
      await AsyncStorage.setItem('hala_user', 'true');
      await AsyncStorage.setItem(
        'hala_user_data',
        JSON.stringify({
          phoneNumber: Phone,
          countryCode: CountryCode,
        }),
      );

      // Extra: token + full user (backend se aya)
      await AsyncStorage.setItem('hala_token', token);
      await AsyncStorage.setItem('hala_user_backend', JSON.stringify(user));

      console.log('✅ User data & token saved in AsyncStorage');
    } catch (e) {
      console.log('❌ Error saving data:', e);
      // yaha hard error show nahi kar rahe, kyun ke login ho chuka hoga
    }
  };

  // 🔐 Verify OTP via backend
  const confirmCode = async (code?: string) => {
    const pin = (code ?? otp).trim();

    if (pin.length !== 6) {
      setError('Please enter 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // POST /api/phoneAuth/login/verify-otp
      const res = await apiPost<{
        message: string;
        token: string;
        user: {
          id: string;
          name: string;
          email: string;
          phone: string;
        };
      }>('/phoneAuth/login/verify-otp', {
        phone: Phone,
        code: pin,
      });

      console.log('✅ OTP verified:', res);

      await saveUserData(res.token, res.user);
      const disclosureAccepted = await AsyncStorage.getItem('hala_location_disclosure_accepted');
      // Navigate to main app stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ 
            // If never seen → show disclosure first, else go straight to app
            name: disclosureAccepted ? 'BottomTab' : 'LocationDisclosure' 
          }],
        }),
      );
    } catch (err: any) {
      console.log('❌ OTP verification error:', err);
      setError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 🔁 Resend OTP via backend
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
  
    setIsResending(true);
    setError(null);
  
    try {
      const res = await apiPost('/phoneAuth/login/request-otp', {
        phone: Phone,
      });
  
      console.log('🔁 Resend OTP success:', res);
      setResendCooldown(60);   // yahan bhi 60 sec ka local timer
    } catch (err: any) {
      console.log('🔁 Resend OTP error:', err);
  
      if (err?.status === 429) {
        setError(err?.message || 'Please wait before resending OTP');
        setResendCooldown(30);
      } else {
        setError(err?.message || 'Error resending OTP');
      }
    } finally {
      setIsResending(false);
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Bg }}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.White4}
        barStyle="dark-content"
      />
      <ScrollView contentContainerStyle={styles.MainCont}>
        <View>
          <TouchableOpacity style={styles.Header} onPress={() => navigation.goBack()}>
            <Image source={Back_Icon} style={styles.BackIcon} />
          </TouchableOpacity>
        </View>

        <Image source={Logo_W} style={styles.Logo} />
        <Text style={styles.digit_Txt}>{languageData[language].enter_otp}</Text>
        <Text style={styles.PhoneNumber}>{Phone}</Text>

        {/* ✅ Single OTP input */}
        <View style={{ width: '100%', marginTop: 20 }}>
          <TextInput
            value={otp}
            onChangeText={(val) => {
              const onlyDigits = val.replace(/\D/g, '').slice(0, 6);
              setOtp(onlyDigits);
              error && setError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            importantForAutofill="yes"
    
            style={{
              backgroundColor: Colors.White4,
              borderColor: otp.length === 6 ? Colors.Green : '#E0E0E0',
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              fontSize: 24,
              letterSpacing: 12,
              textAlign: 'center',
              color: Colors.Black,
            }}
            placeholder="••••••"
            placeholderTextColor="#BDBDBD"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (otp.length === 6) confirmCode();
            }}
            accessible
            accessibilityLabel="Enter 6 digit verification code"
          />

          {!!error && <Text style={styles.Error}>{error}</Text>}
        </View>

        {/* Resend section */}
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <TouchableOpacity
            disabled={resendCooldown > 0 || isResending}
            onPress={handleResendOtp}
          >
            <Text
              style={{
                color:
                  resendCooldown > 0 || isResending ? Colors.Grey9 : Colors.Green,
                textDecorationLine: 'underline',
                fontWeight: '500',
              }}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
        <CustomButton
          title={languageData[language].verify_otp}
          onPress={() => confirmCode()}
          disabled={otp.length !== 6 || isVerifying}
        />

        {(isVerifying || isResending) && (
          <ActivityIndicatorModal visible={isVerifying || isResending} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Otp;

