import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {
  Hide,
  Lock,
  ManIcon,
  Show,
  West_NB,
} from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import CustomButton from '../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import CustomCheckbox from '../../../components/checkbox/checkbox';
import { languageData } from '../../../redux/language/languageSlice';
import CustomHeader from '../../../components/header/CustomHeader';
import { auth, firestore } from '../../../firebase/firebaseconfig';
import ActivityIndicatorModal from '../../../components/Loader/ActivityIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginProps {
  navigation: any;
}

const EmployeeLogin: React.FC<LoginProps> = ({ navigation }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const language = useSelector(
    (state: RootState) => state.language.language
  );
  const styles = getStyles(language);


  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert('Please enter Staff ID and Password');
      return;
    }
     setIsLoading(true);
    try {
      // Step 1: Get email from emp_id
      const snapshot = await firestore()
        .collection('Westwalk_Staff')
        .where('staffId', '==', employeeId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        Alert.alert('Staff ID not found');
        setIsLoading(false)
        return;
      }
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const { email } = userDoc.data();
 
  
      if (!email) {
        Alert.alert('Email not found for this Staff ID');
        setIsLoading(false)
        return;
      }
      // Step 2: Login with email and password
      await auth().signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem('staff_data', JSON.stringify(userData));
      // Success: Navigate to employee dashboard
      navigation.navigate('EmployeeTab');
      setIsLoading(false)
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login failed. Please check your credentials.');
    }
    setIsLoading(false)
  };
  

  return (
    <View style={styles.Container}>
      
      <CustomHeader title=' ' onBackPress={()=>{navigation.goBack()}} />
      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>Staff Login</Text>
      <Text style={styles.Subtitle}>Enter your credentials to continue</Text>

      <View
        style={[
          styles.InputContainer,
          employeeId !== '' && styles.Active_Input_Field,
        ]}
      >57333
        <Image
          source={ManIcon}
          style={[
            styles.Icon,
            employeeId !== '' && styles.Active_Image,
          ]}
        />
        <TextInput
          placeholder="Enter your Staff ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
          placeholderTextColor="#888"
        />
      </View>

      <View
        style={[
          styles.InputContainer,
          password !== '' && styles.Active_Input_Field,
        ]}
      >
        <Image
          source={Lock}
          style={[
            styles.Icon,
            password !== '' && styles.Active_Image,
          ]}
        />
        <TextInput
          secureTextEntry={hide}
          placeholder="Enter your Password"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordinput}
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={() => setHide(!hide)}>
          <Image
            source={hide ? Hide : Show}
            style={[
              styles.HideIcon,
              password !== '' && styles.Active_Image,
            ]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.forgotContainer}>
        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            label={languageData[language].agree_to}
            isChecked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
            linkText={languageData[language].privacy_policy}
            onLinkPress={() =>
              Linking.openURL('https://halabsaudi.com/privacy-policy-2/')
            }
          />
        </View>
        <TouchableOpacity
          onPress={() =>
             {navigation.navigate("StaffForgetPassword")}
          }
        >
          <Text style={styles.ForgotText}>
            {languageData[language]?.forget_password || 'Forgot Password?'}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Login"
        onPress={handleLogin}
      />
      {isLoading && (
            <ActivityIndicatorModal visible={isLoading} />
          )}
    </View>
  );
};

export default EmployeeLogin;

// ===================== STYLES =====================
const getStyles = (language: string) =>
  StyleSheet.create({
    Container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    Logo: {
      width: 180,
      height: 100,
      alignSelf: 'center',
      resizeMode: 'contain',
      marginBottom: 40,
    },
    Title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#222',
      textAlign: 'center',
      marginBottom: 8,
    },
    Subtitle: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginBottom: 30,
    },
    InputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#CCC',
      borderRadius: 10,
      height: 50,
      marginBottom: 16,
      backgroundColor: '#fff',
      paddingHorizontal: 10,
    },
    Icon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      marginRight: 10,
      tintColor: Colors.Grey,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: '#000',
      height:40
    },
    passwordinput: {
      flex: 1,
      fontSize: 14,
      color: '#000',
      height:40
    },
    HideIcon: {
      width: 24,
      height: 24,
      tintColor: Colors.Grey,
      resizeMode: 'contain',
    },
    Active_Input_Field: {
      borderColor: Colors.PrimaryColor,
    },
    Active_Image: {
      tintColor: Colors.PrimaryColor,
    },
    ForgotText: {
      color: Colors.PrimaryColor,
      fontSize: 13,
      textDecorationLine: 'underline',
    },
    forgotContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    checkboxContainer: {
      flex: 1,
    },
  });
