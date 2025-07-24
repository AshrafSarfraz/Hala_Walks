import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  Linking,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Logo_W } from '../../../Themes/Images';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { Colors } from '../../../Themes/Colors';
import CountryDropdown from '../../../Component/Dropdown/SelectCountry';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomCheckbox from '../../../Component/checkbox/checkbox';
import { auth } from '../../../firebase/firebaseconfig'; // Removed firestore import from here
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import ActivityIndicatorModal from '../../../Component/Loader/ActivityIndicator';

const Login: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState('+966'); // Default
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Added for loader


  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  const handleCountrySelect = (countryCode: string) => {
    setCountryCode(countryCode);
  };

  // Send verification code
  async function sendVerificationCode() {
    if (!phoneNumber || !name) {
      setError('Please enter a valid phone number and Name');
      return;
    }
    if (!isChecked) {
      setError('Please agree to the terms and privacy policy');
      return;
    }

    // Concatenate country code with phone number
    const fullPhoneNumber = countryCode + phoneNumber;

    setIsLoading(true); // Show loader
    setError(null); // Clear previous errors

    try {
      // Send verification code with full phone number
      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      setConfirm(confirmation);

      // Navigate to OTP screen with user data
      navigation.navigate('OTP', {
        Phone: fullPhoneNumber,
        Confirmation: confirmation,
        Name: name, // Pass name to OTP screen
        CountryCode: countryCode, // Pass country code to OTP screen
      });
    } catch (error: any) {
      setError('Error sending verification code: ' + error.message);
      // console.error('Error Code:', error.code, 'Message:', error.message);
    } finally {
      setIsLoading(false); // Hide loader
    }
  }



  return (
    <ScrollView contentContainerStyle={styles.MainContainer}>
              <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />
      <View>
        <Image source={Logo_W} style={styles.H_Logo} resizeMode="contain" />
        <Text style={styles.Welcome_Txt}>{languageData[language].welcome_back}</Text>
        <Text style={styles.SignUp_Txt}>{languageData[language].sign_in_message}</Text>
      
        <View style={styles.InputContainer}>
          <View style={[styles.Input_Field, name !== '' ? styles.Active_Input_Field : null]}>
            <TextInput  placeholder={languageData[language].full_name} value={name}
             placeholderTextColor={Colors.Grey9}  onChangeText={setName}style={styles.User_Input}/>
          </View>

          <View style={[styles.PhoneInput_Field, phoneNumber !== '' ? styles.Active_Input_Field : null]}>
            <CountryDropdown onSelectCountry={handleCountrySelect} />
            <TextInput
              placeholder={languageData[language].phone_number}
              value={phoneNumber}
              placeholderTextColor={Colors.Grey9}
              onChangeText={setPhoneNumber}
              style={styles.PhoneNumber_Input}
              keyboardType="phone-pad"
            />
          </View>

          <CustomCheckbox
            label={languageData[language].agree_to}
            isChecked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
            linkText={languageData[language].privacy_policy}
            linkTerm={languageData[language].terms_of_use}
            onLinkPress={() => Linking.openURL('https://halabsaudi.com/privacy-policy-2/')}
            onLinkPress1={() => Linking.openURL('https://halabsaudi.com/terms-of-use/')}
          />
            {error && <Text style={styles.Error}>{error}</Text>}
          <View style={{height:10}} />
          
          <CustomButton
            title={languageData[language].login}
            onPress={sendVerificationCode}
          />
         

          <View style={{marginTop:100,alignSelf:"center",}} >
            <TouchableOpacity style={styles.Partner_Btn} onPress={()=>{navigation.navigate('HalaInfo')}} >
              <Text style={styles.Partner_Txt} >Become a Partner</Text>
            </TouchableOpacity>
          </View>
          <View style={{marginTop:100,alignSelf:"center",}} >
            <TouchableOpacity style={styles.Partner_Btn} onPress={()=>{navigation.navigate('WestwalkStack')}} >
              <Text style={styles.Partner_Txt} >Loyalty Program</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <ActivityIndicatorModal visible={isLoading} />
          )}

      
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
