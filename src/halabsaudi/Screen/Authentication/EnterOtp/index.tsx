import React, {useState, useEffect, useRef, useCallback} from 'react';
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
import {Back_Icon, HBS_Logo} from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import {Colors} from '../../../Themes/Colors';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getStyles} from './style';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux_toolkit/store';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiPost} from '../../../firebase/api/client';
import FastImage from 'react-native-fast-image';

interface OtpProps extends NativeStackScreenProps<any> {}

const Otp: React.FC<OtpProps> = ({route, navigation}) => {
  const {Phone, CountryCode, isDummy} = route.params || {};

  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Clean timer start — backend se jo seconds aaye wahi se shuru
  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCooldown(seconds);

    timerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 📋 Clipboard polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const clip = await Clipboard.getString();
        if (/^\d{6}$/.test(clip) && otp !== clip) {
          setOtp(clip);
          await Clipboard.setString('');
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [otp]);

  const navigateAfterLogin = async () => {
    const permissionsAsked = await AsyncStorage.getItem('hala_permissions_asked');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: permissionsAsked ? 'BottomTab' : 'LocationDisclosure'}],
      }),
    );
  };

  // const saveUserData = async (token: string, user: any) => {
  //   try {
  //     await AsyncStorage.setItem('hala_user', 'true');
  //     await AsyncStorage.setItem(
  //       'hala_user_data',
  //       JSON.stringify({phoneNumber: Phone, countryCode: CountryCode}),
  //     );
  //     await AsyncStorage.setItem('hala_token', token);
  //     await AsyncStorage.setItem('hala_user_backend', JSON.stringify(user));
  //   } catch (e) {
  //     console.log('❌ Error saving data:', e);
  //   }
  // };

  const saveUserData = async (token: string, user: any) => {
    try {
      await AsyncStorage.setItem('hala_user', 'true');
      await AsyncStorage.setItem(
        'hala_user_data',
        JSON.stringify({phoneNumber: Phone, countryCode: CountryCode}),
      );
      await AsyncStorage.setItem('hala_token', token);
      await AsyncStorage.setItem('hala_user_backend', JSON.stringify(user));
  
      // ✅ Login ke waqt hi avatar prefetch + cache kar lo
      // Toh Profile screen pe jaate hi image ready milegi
      if (user?.avatar) {
        FastImage.preload([
          {
            uri: user.avatar,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable, // permanently cache karo
          },
        ]);
      }
    } catch (e) {
      console.log('❌ Error saving data:', e);
    }
  };

  const confirmCode = async (code?: string) => {
    const pin = (code ?? otp).trim();
    if (pin.length !== 6) {
      setError('Please enter 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    if (isDummy) {
      if (pin !== '123456') {
        setError('Invalid OTP. Please try again.');
        setIsVerifying(false);
        return;
      }
      try {
        await AsyncStorage.multiSet([
          ['hala_user', 'true'],
          ['hala_token', 'apple_review_token'],
          ['hala_user_data', JSON.stringify({phoneNumber: Phone, countryCode: CountryCode})],
          ['hala_user_backend', JSON.stringify({id: 'apple_review_user', name: 'Saudi Visitor', email: '', phone: Phone})],
        ]);
        await navigateAfterLogin();
      } catch (e) {
        console.log('Dummy OTP save error:', e);
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    try {
      const res = await apiPost<{
        message: string;
        token: string;
        user: {id: string; name: string; email: string; phone: string};
      }>('/phoneAuth/login/verify-otp', {phone: Phone, code: pin});

      await saveUserData(res.token, res.user);
      await navigateAfterLogin();
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isDummy) return;

    setIsResending(true);
    setError(null);

    try {
      await apiPost('/phoneAuth/login/request-otp', {phone: Phone});
      // ✅ Backend 60 second cooldown set karta hai — same yahan bhi
      startTimer(60);
    } catch (err: any) {
      if (err?.status === 429) {
        // ✅ Backend se exact remaining seconds parse karo
        // Backend message: "Please wait 38 seconds before requesting a new OTP"
        const match = err?.message?.match(/(\d+) seconds/);
        const remaining = match ? parseInt(match[1], 10) : 60;
        setError(err?.message || 'Please wait before resending OTP');
        startTimer(remaining); // ✅ 38 sy shuru hoga agar 38 bacha ha
      } else {
        setError(err?.message || 'Error resending OTP');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.dargBg}}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.dargBg}
        barStyle="dark-content"
      />
      <ScrollView contentContainerStyle={styles.MainCont}>
        <View>
          <TouchableOpacity
            style={styles.Header}
            onPress={() => navigation.goBack()}>
            <Image source={Back_Icon} style={styles.BackIcon} />
          </TouchableOpacity>
        </View>

        <Image source={HBS_Logo} style={styles.Logo} />
        <Text style={styles.digit_Txt}>{languageData[language].enter_otp}</Text>
        <Text style={styles.PhoneNumber}>{Phone}</Text>

        <View style={{width: '100%', marginTop: 20}}>
          <TextInput
            value={otp}
            onChangeText={val => {
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

        {!isDummy && (
          <View style={{marginTop: 16, alignItems: 'center'}}>
            <TouchableOpacity
              disabled={resendCooldown > 0 || isResending}
              onPress={handleResendOtp}>
              <Text
                style={{
                  color:
                    resendCooldown > 0 || isResending
                      ? Colors.Grey9
                      : Colors.Green,
                  textDecorationLine: 'underline',
                  fontWeight: '500',
                }}>
               {resendCooldown > 0
  ? `${languageData[language].resend_in} ${resendCooldown}${languageData[language].seconds_short}`
  : languageData[language].resend_code}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{height: 100}} />
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