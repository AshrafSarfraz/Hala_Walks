import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React,{ useCallback,useEffect,useRef,useState } from 'react';
import {
Image,
KeyboardAvoidingView,
Platform,
ScrollView,
TouchableOpacity,
View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Text } from '../../../../ui/Text';
import { TextInput } from '../../../../ui/TextInput';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import { useStatusBar } from '../../../Component/UseStatusBar/useStatusBar';
import { Back_Icon,Otpverification } from '../../../Themes/Images';
import { apiPost } from '../../../firebase/api/client';
import { hbsText } from '../../../i18n/translations';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { RootState } from '../../../redux_toolkit/store';
import { AuthColors,getStyles } from './style';

interface OtpProps extends NativeStackScreenProps<any> {}
const Otp: React.FC<OtpProps> = ({route, navigation}) => {
  useStatusBar('dark-content', AuthColors.background);
  const {Phone, CountryCode, isDummy} = route.params || {};
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [focused, setFocused] = useState<boolean>(false);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const ar = language === 'ar';
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    const permissionsAsked = await AsyncStorage.getItem(
      'hala_permissions_v2',
    );

    navigation.dispatch(
      CommonActions.reset({
        index: 0,

        routes: [{name: permissionsAsked ? 'BottomTab' : 'LocationDisclosure'}],
      }),
    );
  };

  const saveUserData = async (token: string, user: any) => {
    try {
      await AsyncStorage.setItem('hala_user', 'true');

      await AsyncStorage.setItem(
        'hala_user_data',
        JSON.stringify({phoneNumber: Phone, countryCode: CountryCode}),
      );
      await AsyncStorage.setItem('hala_token', token);
      await AsyncStorage.setItem('hala_user_backend', JSON.stringify(user));
      if (user?.avatar) {
        FastImage.preload([
          {
            uri: user.avatar,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          },
        ]);
      }
    } catch (e) {
      console.log('❌ Error saving data:', e);
    }
  };

  const confirmCode = async (code?: string) => {
    if (isVerifying || isResending) return;
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
          [
            'hala_user_data',
            JSON.stringify({phoneNumber: Phone, countryCode: CountryCode}),
          ],
          [
            'hala_user_backend',
            JSON.stringify({
              id: 'apple_review_user',
              name: 'Saudi Visitor',
              email: '',
              phone: Phone,
            }),
          ],
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
    if (resendCooldown > 0 || isDummy || isResending || isVerifying) return;
    setIsResending(true);
    setError(null);
    try {
      await apiPost('/phoneAuth/login/request-otp', {phone: Phone});
      startTimer(60);
    } catch (err: any) {
      if (err?.status === 429) {
        const match = err?.message?.match(/(\d+) seconds/);
        const remaining = match ? parseInt(match[1], 10) : 60;
        setError(err?.message || 'Please wait before resending OTP');
        startTimer(remaining);
      } else {
        setError(err?.message || 'Error resending OTP');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.Root}>
      <KeyboardAvoidingView
        style={styles.Flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.Flex}
          contentContainerStyle={styles.MainContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={ar ? 'رجوع' : 'Back'}
            style={styles.Header}
            onPress={() => navigation.goBack()}>
            <Image source={Back_Icon} style={styles.BackIcon} />
          </TouchableOpacity>
          <View style={styles.HeroBlock}>
            <Image
              source={Otpverification}
              style={styles.H_Logo}
              resizeMode="contain"
            />
            <Text style={styles.Welcome_Txt}>
              {ar ? 'تحقق من رقمك' : 'Verify your number'}
            </Text>
            <Text style={styles.SignUp_Txt}>
              {ar
                ? 'أدخل الرمز المكون من 6 أرقام المرسل إلى'
                : 'Enter the 6-digit code sent to'}
            </Text>
            <Text style={styles.PhoneNumber}>{Phone}</Text>
            <TouchableOpacity
              style={styles.Link_Btn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.Link_Txt}>
                {ar ? 'تعديل الرقم' : 'Edit number'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.CodeWrap}>
            <View
              pointerEvents="none"
              style={styles.CodeRow}
              accessible={false}>
              {Array.from({length: 6}, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.CodeCell,
                    focused &&
                      index === Math.min(otp.length, 5) &&
                      styles.CodeActive,
                  ]}>
                  <Text style={styles.CodeDigit}>
                    {otp[index] || (focused && index === otp.length ? '│' : '')}
                  </Text>
                </View>
              ))}
            </View>
            <TextInput
              value={otp}
              onChangeText={value => {
                setOtp(value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              importantForAutofill="yes"
              style={styles.CodeNative}
              caretHidden
              selectionColor="transparent"
              editable={!isVerifying && !isResending}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (otp.length === 6) confirmCode();
              }}
              accessibilityLabel={
                ar
                  ? 'أدخل رمز التحقق المكون من 6 أرقام'
                  : 'Enter 6 digit verification code'
              }
            />
          </View>
          <View style={styles.ErrorSlot}>
            {error ? <Text style={styles.Error}>{error}</Text> : null}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={otp.length !== 6 || isVerifying || isResending}
            style={[
              styles.PrimaryButton,
              (otp.length !== 6 || isVerifying || isResending) &&
                styles.Disabled,
            ]}
            onPress={() => confirmCode()}>
            <Text style={styles.PrimaryText}>
              {ar ? 'تحقق ومتابعة' : 'Verify & continue'}
            </Text>
          </TouchableOpacity>
          {!isDummy && (
            <View style={styles.resendRow}>
              <Text style={styles.resendHint}>
                {hbsText(ar, 'ui_didn_t_receive_a_code')}
              </Text>
              <TouchableOpacity
                style={{padding: 12}}
                disabled={resendCooldown > 0 || isResending || isVerifying}
                onPress={handleResendOtp}>
                <Text
                  style={[
                    styles.resendLink,
                    (resendCooldown > 0 || isResending || isVerifying) &&
                      styles.resendLinkDisabled,
                  ]}>
                  {resendCooldown > 0
                    ? `${languageData[language].resend_in} ${resendCooldown}${languageData[language].seconds_short}`
                    : languageData[language].resend_code}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.Footer}>
            <Text style={styles.Privacy}>
              {ar ? 'تحقق آمن' : 'Secure verification'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {(isVerifying || isResending) && (
        <ActivityIndicatorModal visible={isVerifying || isResending} />
      )}
    </SafeAreaView>
  );
};
export default Otp;
