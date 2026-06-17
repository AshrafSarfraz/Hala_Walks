import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import { Hbk_White, HBS_Logo, Message, Profile_Img } from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { Colors } from '../../../Themes/Colors';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomCheckbox from '../../../Component/checkbox/checkbox';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import { apiPost } from '../../../firebase/api/client';
import { useStatusBar } from '../../../Component/UseStatusBar/useStatusBar';

/**
 * Build E.164 phone number.
 * Prepend selected country code.
 */
const buildFullPhoneNumber = (countryCode: string, input: string) => {
  const clean = (input || '').replace(/\s|-/g, '');

  // Already in E.164
  if (clean.startsWith('+')) return clean;

  // Default behavior
  const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cc}${clean}`;
};

const SignUp: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  useStatusBar('light-content', Colors.dargBg);
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

  // 🔹 Sign Up flow (API based)
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
      // 🔹 Backend: POST /api/phoneAuth/register
      const res = await apiPost<{
        message: string;
        user?: {
          id: string;
          name: string;
          email: string;
          phone: string;
        };
      }>('/phoneAuth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: fullPhoneNumber, // backend me field name "phone" tha
      });

      console.log('Register success:', res);

      // 3) Go to Login
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err?.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.MainContainer}>
      <View>
        <CustomHeader title="" onBackPress={() => { navigation.goBack(); }} backgroundColor={Colors.dargBg} />
      </View>

      <View>
        <Image
          source={Hbk_White}
          style={styles.H_Logo}
        />
        <Text style={styles.Welcome_Txt}>{languageData[language].Register_yourself}</Text>
        <Text style={styles.SignUp_Txt}>{languageData[language].Join_Hala_to_Get_started}</Text>

        <View style={styles.InputContainer}>
          {/* Full Name */}
          <View style={[styles.Input_Field, name !== '' ? styles.Active_Input_Field : null]}>
            <Image
              source={Profile_Img}
              style={{
                width: 15,
                height: 15,
                resizeMode: 'contain',
                marginRight: 5,
                tintColor: name === '' ? Colors.Grey9 : '#000000',
              }}
            />
            <TextInput
              placeholder={languageData[language].full_name}
              value={name}
              placeholderTextColor={Colors.Grey9}
              onChangeText={(t) => { setName(t); clearError(); }}
              style={styles.User_Input}
            />
          </View>

          {/* Email */}
          <View style={[styles.Input_Field, email !== '' ? styles.Active_Input_Field : null]}>
            <Image
              source={Message}
              style={{
                width: 15,
                height: 15,
                resizeMode: 'contain',
                marginRight: 5,
                tintColor: email === '' ? Colors.Grey9 : '#000000',
              }}
            />
            <TextInput
              placeholder={languageData[language].Enter_Email}
              value={email}
              placeholderTextColor={Colors.Grey9}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              style={styles.User_Input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Phone */}
          <View style={[styles.PhoneInput_Field, phoneNumber !== '' ? styles.Active_Input_Field : null]}>
            <CountryDropdown onSelectCountry={handleCountrySelect} />
            <TextInput
              placeholder={languageData[language].phone_number}
              value={phoneNumber}
              placeholderTextColor={Colors.Grey9}
              onChangeText={(t) => { setPhoneNumber(t); clearError(); }}
              style={styles.PhoneNumber_Input}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          {/* Terms */}
          <CustomCheckbox
            label={languageData[language].agree_to}
            isChecked={isChecked}
            onPress={() => { setIsChecked(!isChecked); clearError(); }}
            linkText={languageData[language].privacy_policy}
            onLinkPress={() => Linking.openURL('https://halabsaudi.com/privacy-policies/')}
          />

          {/* Error */}
          {error && <Text style={styles.Error}>{error}</Text>}

          <View style={{ height: 50 }} />
          <CustomButton title={languageData[language].Create_account} onPress={handleSignUp} />

          {isLoading && <ActivityIndicatorModal visible={isLoading} />}
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;