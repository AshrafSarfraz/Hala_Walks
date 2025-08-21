import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  Linking,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { HBS_Logo, Message, Profile_Img } from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { Colors } from '../../../Themes/Colors';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomCheckbox from '../../../Component/checkbox/checkbox';
// import { auth } from '../../../firebase/firebaseconfig'; // ❌ removed (unused)
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';

/**
 * Build E.164 phone number with secret overrides.
 * - "123" prefix → Qatar (+974)
 * - "321" prefix → Bahrain (+973)
 * Otherwise, prepend selected country code.
 */
const buildFullPhoneNumber = (countryCode: string, input: string) => {
  const clean = (input || '').replace(/\s|-/g, '');

  // Already in E.164
  if (clean.startsWith('+')) return clean;

  // 🔐 Secret overrides
  if (clean.startsWith('123')) {
    return `+974${clean.slice(3)}`; // Qatar
  }
  if (clean.startsWith('321')) {
    return `+973${clean.slice(3)}`; // Bahrain
  }

  // Default behavior
  const cc = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cc}${clean}`;
};

const SignUp: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
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

  // Sign Up flow
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
      // 1) Check if account already exists
      const snap = await firestore()
        .collection('hala_users')
        .where('phoneNumber', '==', fullPhoneNumber)
        .limit(1)
        .get();

      if (!snap.empty) {
        setError('Account already exists. Please log in.');
        setIsLoading(false);
        return;
      }

      // 2) Create user
      await firestore().collection('hala_users').add({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: fullPhoneNumber,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 3) Go to Login
      navigation.navigate('Login');
    } catch (err: any) {
      console.error('Error:', err?.code, err?.message);
      setError('Error creating account: ' + (err?.message ?? 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.MainContainer}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.White4}
        barStyle="dark-content"
      />

      <View>
        <CustomHeader title="" onBackPress={() => { navigation.goBack(); }} />
      </View>

      <View>
        <Image
          source={HBS_Logo}
          style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 20, marginBottom: 40 }}
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

        {/* Optional: quick link to Login if account exists */}
        {/* <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: 16 }}>
          <Text style={{ color: Colors.Green, fontWeight: '600' }}>Already have an account? Log in</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

export default SignUp;
