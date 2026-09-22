import {Text} from '../../../../ui/Text';
import {TextInput} from '../../../../ui/TextInput';
import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Hbk_White, Message, Profile_Img} from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import {Colors} from '../../../Themes/Colors';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import CustomCheckbox from '../../../Component/checkbox/checkbox';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux_toolkit/store';
import {getStyles} from './style';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import {apiPost} from '../../../firebase/api/client';
import {useStatusBar} from '../../../Component/UseStatusBar/useStatusBar';

/**
 * Build E.164 phone number. Prepends the selected country code.
 */
const buildFullPhoneNumber = (countryCode: string, input: string) => {
  const clean = (input || '').replace(/\s|-/g, '');
  if (clean.startsWith('+')) return clean;
  const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cc}${clean}`;
};

const SignUp: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  useStatusBar('light-content', Colors.dargBg);
  const insets = useSafeAreaInsets();

  const [countryCode, setCountryCode] = useState('+966'); // Default (KSA)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const handleCountrySelect = (code: string) => setCountryCode(code);
  const clearError = () => error && setError(null);

  async function handleSignUp() {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!isChecked) {
      setError('Please agree to the terms and privacy policy');
      return;
    }

    const fullPhoneNumber = buildFullPhoneNumber(countryCode, phoneNumber);

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiPost<{
        message: string;
        user?: {id: string; name: string; email: string; phone: string};
      }>('/phoneAuth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: fullPhoneNumber,
      });

      console.log('Register success:', res);
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err?.message || 'Error creating account');
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
          showsVerticalScrollIndicator={false}>
          {/* ── Hero ── */}
          <View style={styles.HeroBlock}>
            <Image source={Hbk_White} style={styles.H_Logo} resizeMode="contain" />
            <Text style={styles.Welcome_Txt}>
              {languageData[language].Register_yourself}
            </Text>
            <Text style={styles.SignUp_Txt}>
              {languageData[language].Join_Hala_to_Get_started}
            </Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.InputContainer}>
            {/* Full Name */}
            <View
              style={[styles.Input_Field, name !== '' && styles.Active_Input_Field]}>
              <Image
                source={Profile_Img}
                style={[
                  styles.Field_Icon,
                  {tintColor: name === '' ? Colors.Grey9 : Colors.White},
                ]}
              />
              <TextInput
                placeholder={languageData[language].full_name}
                value={name}
                placeholderTextColor={Colors.Grey9}
                onChangeText={t => {
                  setName(t);
                  clearError();
                }}
                style={styles.User_Input}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View
              style={[styles.Input_Field, email !== '' && styles.Active_Input_Field]}>
              <Image
                source={Message}
                style={[
                  styles.Field_Icon,
                  {tintColor: email === '' ? Colors.Grey9 : Colors.White},
                ]}
              />
              <TextInput
                placeholder={languageData[language].Enter_Email}
                value={email}
                placeholderTextColor={Colors.Grey9}
                onChangeText={t => {
                  setEmail(t);
                  clearError();
                }}
                style={styles.User_Input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {/* Phone */}
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
                onSubmitEditing={handleSignUp}
              />
            </View>

            {/* Terms */}
            <View style={styles.CheckboxRow}>
              <CustomCheckbox
                label={languageData[language].agree_to}
                isChecked={isChecked}
                onPress={() => {
                  setIsChecked(!isChecked);
                  clearError();
                }}
                linkText={languageData[language].privacy_policy}
                onLinkPress={() =>
                  Linking.openURL('https://halabsaudi.com/privacy-policies/')
                }
              />
            </View>

            <View style={styles.ErrorSlot}>
              {error ? <Text style={styles.Error}>{error}</Text> : null}
            </View>

            <CustomButton
              title={languageData[language].Create_account}
              onPress={handleSignUp}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.Link_Btn}>
              <Text style={styles.Link_Txt}>
                {language === 'en'
                  ? 'Already have an account? Log in'
                  : 'لديك حساب بالفعل؟ تسجيل الدخول'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <ActivityIndicatorModal visible={isLoading} />}
    </View>
  );
};

export default SignUp;
