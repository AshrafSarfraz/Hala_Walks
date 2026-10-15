import React, {useRef, useState} from 'react';
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
import AccountNotFoundModal from '../../../Component/CustomAlert/NoAccountFound';
import {apiPost} from '../../../firebase/api/client';
import {useStatusBar} from '../../../Component/UseStatusBar/useStatusBar';
import {Logo_G} from '../../../Themes/Images';
import {getStyles, AuthColors} from './style';

const normalizeDigits = (input: string) =>
  input
    .replace(/[٠-٩]/g, digit =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    )
    .replace(/[۰-۹]/g, digit =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace(/\D/g, '');

const buildFullPhoneNumber = (
  countryCode: string,
  input: string,
) => `${countryCode}${normalizeDigits(input)}`;

const Login: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  useStatusBar('dark-content', AuthColors.background);

  const insets = useSafeAreaInsets();
  const language = useSelector(
    (state: RootState) => state.language.language,
  );
  const styles = getStyles(language);
  const ar = language === 'ar';

  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const submitting = useRef(false);

  const handlePhoneChange = (input: string) => {
    const digits = normalizeDigits(input);

    // Interpret the prefix only while Saudi is selected.
    // Once switched, the actual Qatar/Bahrain number is left intact.
    if (countryCode === '+966' && digits.startsWith('123')) {
      setCountryCode('+974');
      setPhoneNumber(digits.slice(3));
    } else if (countryCode === '+966' && digits.startsWith('321')) {
      setCountryCode('+973');
      setPhoneNumber(digits.slice(3));
    } else {
      setPhoneNumber(digits);
    }

    setError(null);
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    setPhoneNumber('');
    setError(null);
  };

  async function sendVerificationCode() {
    if (submitting.current) return;

    const digits = normalizeDigits(phoneNumber);

    if (!digits) {
      setError(
        ar
          ? 'يرجى إدخال رقم الهاتف'
          : 'Please enter your phone number',
      );
      return;
    }

    Keyboard.dismiss();
    setError(null);
    setShowNotFoundModal(false);

    // Preserve the existing test-number flow.
    // The backend must still validate the OTP/session.
    if (countryCode === '+966' && digits === '1234567890') {
      navigation.navigate('OTP', {
        Phone: '+9661234567890',
        CountryCode: '+966',
        isDummy: true,
      });
      return;
    }

    submitting.current = true;
    setIsLoading(true);

    try {
      const fullPhoneNumber = buildFullPhoneNumber(
        countryCode,
        digits,
      );

      await apiPost('/phoneAuth/login/request-otp', {
        phone: fullPhoneNumber,
      });

      navigation.navigate('OTP', {
        Phone: fullPhoneNumber,
        CountryCode: countryCode,
      });
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;

      if (status === 404) {
        setShowNotFoundModal(true);
      } else {
        setError(
          err?.message ||
            (ar
              ? 'تعذر إرسال رمز التحقق'
              : 'Error sending verification code'),
        );
      }
    } finally {
      submitting.current = false;
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
                countryCode={countryCode}
                disabled={isLoading}
                onSelectCountry={handleCountryChange}
              />

              <TextInput
                value={phoneNumber}
                placeholder={languageData[language].phone_number}
                placeholderTextColor={AuthColors.muted}
                onChangeText={handlePhoneChange}
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
              {error ? (
                <Text style={styles.Error}>{error}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              disabled={isLoading}
              style={[
                styles.PrimaryButton,
                isLoading && styles.Disabled,
              ]}
              onPress={sendVerificationCode}>
              <Text style={styles.PrimaryText}>
                {ar ? 'إرسال الرمز' : 'Send code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isLoading}
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

              <Text style={styles.DividerTxt}>
                {ar ? 'أو' : 'or'}
              </Text>

              <View style={styles.DividerLine} />
            </View>

            <TouchableOpacity
              disabled={isLoading}
              style={styles.Partner_Btn}
              onPress={() => navigation.navigate('HalaInfo')}>
              <Text style={styles.Partner_Txt}>
                {languageData[language].become_a_Partner}
              </Text>
            </TouchableOpacity>

            <Text style={styles.Privacy}>
              {ar
                ? 'رقم هاتفك يبقى خاصاً'
                : 'Your number stays private'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <ActivityIndicatorModal visible />}

      <AccountNotFoundModal
        visible={showNotFoundModal}
        onClose={() => setShowNotFoundModal(false)}
      />
    </View>
  );
};

export default Login;