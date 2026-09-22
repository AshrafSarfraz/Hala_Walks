import {Text} from '../../../../ui/Text';
import {TextInput} from '../../../../ui/TextInput';
import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Hbk_White} from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import {Colors} from '../../../Themes/Colors';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import AccountNotFoundModal from '../../../Component/CustomAlert/NoAccountFound';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import {apiPost} from '../../../firebase/api/client';
import {useStatusBar} from '../../../Component/UseStatusBar/useStatusBar';

// ─────────────────────────────────────────────
// Apple Review dummy credentials
const APPLE_REVIEW_PHONE = '1234567890';
const APPLE_REVIEW_CODE = '+966';
// ─────────────────────────────────────────────

const buildFullPhoneNumber = (countryCode: string, input: string) => {
  const clean = (input || '').replace(/\s|-/g, '');
  if (clean.startsWith('+')) return clean;
  const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cc}${clean}`;
};

const isDummyLogin = (code: string, phone: string) =>
  code === APPLE_REVIEW_CODE && phone.replace(/\s|-/g, '') === APPLE_REVIEW_PHONE;

const Login: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  useStatusBar('light-content', Colors.dargBg);
  const insets = useSafeAreaInsets();

  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const handleCountrySelect = (code: string) => setCountryCode(code);
  const clearError = () => error && setError(null);

  async function sendVerificationCode() {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    // Dummy: go to OTP screen with isDummy flag — no API call, no skip
    if (isDummyLogin(countryCode, phoneNumber)) {
      navigation.navigate('OTP', {
        Phone: '+9661234567890',
        CountryCode: '+966',
        isDummy: true,
      });
      return;
    }

    const fullPhoneNumber = buildFullPhoneNumber(countryCode, phoneNumber);
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiPost<{message: string; status?: string}>(
        '/phoneAuth/login/request-otp',
        {phone: fullPhoneNumber},
      );
      console.log('OTP request success:', res);
      navigation.navigate('OTP', {
        Phone: fullPhoneNumber,
        CountryCode: countryCode,
      });
    } catch (err: any) {
      console.log('OTP request error:', err);
      if (err?.status === 404) {
        setShowNotFoundModal(true);
      } else if (err?.status === 429) {
        setError(err?.message || 'Please wait before resending OTP');
      } else {
        setError(err?.message || 'Error sending verification code');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={[styles.Root, {paddingTop: insets.top}]}>
      <CustomHeader
        title=""
        onBackPress={() => navigation.goBack()}
        backgroundColor={Colors.dargBg}
      />

      <KeyboardAvoidingView
        style={styles.Flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.MainContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* ── Hero ── */}
          <View style={styles.HeroBlock}>
            <Image source={Hbk_White} style={styles.H_Logo} resizeMode="contain" />
            <Text style={styles.Welcome_Txt}>
              {languageData[language].welcome_back}
            </Text>
            <Text style={styles.SignUp_Txt}>
              {languageData[language].sign_in_message}
            </Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.InputContainer}>
            <View
              style={[
                styles.PhoneInput_Field,
                phoneNumber !== '' && styles.Active_Input_Field,
              ]}>
              <CountryDropdown onSelectCountry={handleCountrySelect} />
              <TextInput
                placeholder={languageData[language].phone_number}
                value={phoneNumber}
                placeholderTextColor={Colors.Grey9}
                onChangeText={t => {
                  setPhoneNumber(t);
                  clearError();
                }}
                style={styles.PhoneNumber_Input}
                keyboardType="phone-pad"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={sendVerificationCode}
              />
            </View>

            <View style={styles.ErrorSlot}>
              {error ? <Text style={styles.Error}>{error}</Text> : null}
            </View>

            <CustomButton
              title={languageData[language].login}
              onPress={sendVerificationCode}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.Link_Btn}>
              <Text style={styles.Link_Txt}>
                {languageData[language].Dont_have_an_account_Register}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.Footer}>
            <View style={styles.DividerRow}>
              <View style={styles.DividerLine} />
              <Text style={styles.DividerTxt}>
                {language === 'en' ? 'or' : 'أو'}
              </Text>
              <View style={styles.DividerLine} />
            </View>

            <TouchableOpacity
              style={styles.Partner_Btn}
              onPress={() => navigation.navigate('HalaInfo')}>
              <Text style={styles.Partner_Txt}>
                {languageData[language].become_a_Partner}
              </Text>
            </TouchableOpacity>
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
