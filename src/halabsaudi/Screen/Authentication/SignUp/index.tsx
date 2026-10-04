import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Linking,
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
import {Message, Phonelogin, Profile_Img} from '../../../Themes/Images';
import CustomCheckbox from '../../../Component/checkbox/checkbox';
const SignUp: React.FC<NativeStackScreenProps<any>> = ({navigation}) => {
  useStatusBar('dark-content', AuthColors.background);
  const insets = useSafeAreaInsets();
  const language = useSelector((state: RootState) => state.language.language);
  const ar = language === 'ar';
  const styles = getStyles(language);
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  async function handleSignUp() {
    if (isLoading) return;
    if (!name.trim()) {
      setError(ar ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError(ar ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }
    if (!phoneNumber.trim()) {
      setError(
        ar ? 'يرجى إدخال رقم الهاتف' : 'Please enter a valid phone number',
      );
      return;
    }
    if (!isChecked) {
      setError(
        ar
          ? 'يرجى الموافقة على الشروط وسياسة الخصوصية'
          : 'Please agree to the terms and privacy policy',
      );
      return;
    }
    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);
    try {
      await apiPost('/phoneAuth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: buildFullPhoneNumber(countryCode, phoneNumber),
      });
      navigation.navigate('Login');
    } catch (err: any) {
      setError(
        err?.message || (ar ? 'تعذر إنشاء الحساب' : 'Error creating account'),
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
              source={Phonelogin}
              style={[styles.H_Logo, {width: 140, height: 140}]}
              resizeMode="contain"
            />
            <Text style={styles.Welcome_Txt}>
              {languageData[language].Register_yourself}
            </Text>
            <Text style={styles.SignUp_Txt}>
              {languageData[language].Join_Hala_to_Get_started}
            </Text>
          </View>
          <View style={styles.InputContainer}>
            <Text style={styles.Label}>{languageData[language].full_name}</Text>
            <View
              style={[
                styles.Input_Field,
                name !== '' && styles.Active_Input_Field,
              ]}>
              <Image source={Profile_Img} style={styles.Field_Icon} />
              <TextInput
                value={name}
                placeholder={languageData[language].full_name}
                placeholderTextColor={AuthColors.muted}
                onChangeText={t => {
                  setName(t);
                  setError(null);
                }}
                style={styles.User_Input}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <Text style={styles.Label}>
              {languageData[language].Enter_Email}
            </Text>
            <View
              style={[
                styles.Input_Field,
                email !== '' && styles.Active_Input_Field,
              ]}>
              <Image source={Message} style={styles.Field_Icon} />
              <TextInput
                value={email}
                placeholder={languageData[language].Enter_Email}
                placeholderTextColor={AuthColors.muted}
                onChangeText={t => {
                  setEmail(t);
                  setError(null);
                }}
                style={[
                  styles.User_Input,
                  {textAlign: 'left', writingDirection: 'ltr'},
                ]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
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
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                editable={!isLoading}
              />
            </View>
            <View style={styles.CheckboxRow}>
              <CustomCheckbox
                label={languageData[language].agree_to}
                isChecked={isChecked}
                onPress={() => {
                  setIsChecked(!isChecked);
                  setError(null);
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
            <TouchableOpacity
              accessibilityRole="button"
              disabled={isLoading}
              onPress={handleSignUp}
              style={[styles.PrimaryButton, isLoading && styles.Disabled]}>
              <Text style={styles.PrimaryText}>
                {languageData[language].Create_account}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.Link_Btn}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.Link_Txt}>
                {ar
                  ? 'لديك حساب بالفعل؟ تسجيل الدخول'
                  : 'Already have an account? Log in'}
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
