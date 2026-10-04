import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import {Text} from '../../../../ui/Text';
import {TextInput} from '../../../../ui/TextInput';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux_toolkit/store';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import {apiPost} from '../../../firebase/api/client';
import {useStatusBar} from '../../../Component/UseStatusBar/useStatusBar';
import {getStyles, AuthColors} from './style';
const buildFullPhoneNumber = (countryCode: string, input: string) => {
  const clean = (input || '').replace(/\s|-/g, '');
  return clean.startsWith('+')
    ? clean
    : `${
        countryCode.startsWith('+') ? countryCode : `+${countryCode}`
      }${clean}`;
};
import {startDemoSession} from '../../../demo/session';
import AccountNotFoundModal from '../../../Component/CustomAlert/NoAccountFound';
import { Logo_G, Phonelogin } from '../../../Themes/Images';
const Login: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  useStatusBar('dark-content', AuthColors.background);
  const insets = useSafeAreaInsets();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const ar = language === 'ar';
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  async function handleDemoLogin() {
    if (!__DEV__ || isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);
    try {
      await startDemoSession();
      navigation.reset({index: 0, routes: [{name: 'BottomTab'}]});
    } catch {
      setError(
        ar
          ? 'تعذر فتح العرض التجريبي. حاول مرة أخرى.'
          : 'Could not open demo. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }
  async function sendVerificationCode() {
    if (isLoading) return;
    if (!phoneNumber.trim()) {
      setError(
        ar ? 'يرجى إدخال رقم الهاتف' : 'Please enter a valid phone number',
      );
      return;
    }
    Keyboard.dismiss();
    setError(null);
    if (
      countryCode === '+966' &&
      phoneNumber.replace(/\s|-/g, '') === '1234567890'
    ) {
      navigation.navigate('OTP', {
        Phone: '+9661234567890',
        CountryCode: '+966',
        isDummy: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const fullPhoneNumber = buildFullPhoneNumber(countryCode, phoneNumber);
      await apiPost('/phoneAuth/login/request-otp', {phone: fullPhoneNumber});
      navigation.navigate('OTP', {
        Phone: fullPhoneNumber,
        CountryCode: countryCode,
      });
    } catch (err: any) {
      if (err?.status === 404) setShowNotFoundModal(true);
      else
        setError(
          err?.message ||
            (ar ? 'تعذر إرسال رمز التحقق' : 'Error sending verification code'),
        );
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <View style={[styles.Root, {paddingTop: insets.top}]}>
      <CustomHeader
        title=""
        onBackPress={() => navigation.goBack()}
        backgroundColor={AuthColors.background}
      />
      <KeyboardAvoidingView
        style={styles.Flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.Flex}
          contentContainerStyle={[
            styles.MainContainer,
            {paddingBottom: Math.max(insets.bottom, 24)},
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.HeroBlock}>
            <Image
              source={Logo_G}
              style={styles.H_Logo}
              resizeMode="cover"
            />
            <Text style={styles.Welcome_Txt}>
              {languageData[language].welcome_back}
            </Text>
            <Text style={styles.SignUp_Txt}>
              {ar
                ? 'أدخل رقم هاتفك للبدء.'
                : 'Enter your phone number to get started.'}
            </Text>
          </View>
          <View style={styles.InputContainer}>
            <Text style={styles.Label}>
              {languageData[language].phone_number}
            </Text>
            <View
              style={[
                styles.PhoneInput_Field,
                phoneNumber !== '' && styles.Active_Input_Field,
              ]}>
              <CountryDropdown
                onSelectCountry={code => {
                  setCountryCode(code);
                  setError(null);
                }}
              />
              <TextInput
                value={phoneNumber}
                placeholder={languageData[language].phone_number}
                placeholderTextColor={AuthColors.muted}
                onChangeText={t => {
                  setPhoneNumber(t);
                  setError(null);
                }}
                style={styles.PhoneNumber_Input}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={sendVerificationCode}
                editable={!isLoading}
              />
            </View>
            <Text style={styles.Hint}>
              {ar
                ? 'سنرسل إليك رمز التحقق برسالة نصية.'
                : 'We’ll send you a verification code via SMS.'}
            </Text>
            <View style={styles.ErrorSlot}>
              {error ? <Text style={styles.Error}>{error}</Text> : null}
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={isLoading}
              style={[styles.PrimaryButton, isLoading && styles.Disabled]}
              onPress={sendVerificationCode}>
              <Text style={styles.PrimaryText}>
                {ar ? 'إرسال الرمز' : 'Send code'}
              </Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.Link_Btn}>
              <Text style={styles.Link_Txt}>
                {languageData[language].Dont_have_an_account_Register}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.Footer}>
            <View style={styles.DividerRow}>
              <View style={styles.DividerLine} />
              <Text style={styles.DividerTxt}>{ar ? 'أو' : 'or'}</Text>
              <View style={styles.DividerLine} />
            </View>
            <TouchableOpacity
              style={styles.Partner_Btn}
              onPress={() => navigation.navigate('HalaInfo')}>
              <Text style={styles.Partner_Txt}>
                {languageData[language].become_a_Partner}
              </Text>
            </TouchableOpacity>
            <Text style={styles.Privacy}>
              {ar ? 'رقم هاتفك يبقى خاصاً' : 'Your number stays private'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && <ActivityIndicatorModal visible={isLoading} />}
      <AccountNotFoundModal
        visible={showNotFoundModal}
        onClose={() => setShowNotFoundModal(false)}
      />
    </View>
  );
};
export default Login;
