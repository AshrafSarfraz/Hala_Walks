import React, { useState } from 'react';
import {TextInput,View, Text, Image,TouchableOpacity,Linking,} from 'react-native';
import CustomButton from '../../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import CustomCheckbox from '../../../../components/checkbox/checkbox';
import { languageData } from '../../../../redux/language/languageSlice';
import CustomHeader from '../../../../components/header/CustomHeader';
import { auth, firestore } from '../../../../firebase/firebaseconfig';
import ActivityIndicatorModal from '../../../../components/Loader/ActivityIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';
import { useNavigation } from '@react-navigation/native';
import { getStyles } from './style';
import { Hide, Lock, ManIcon, Show, West_NB } from '../../../../theme/Images';


const EmployeeLogin: React.FC= () => {
  const navigation=useNavigation()
  const styles = getStyles(language);
  
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'SUCCESS' | 'ERROR'>('SUCCESS');
  
  const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 3000);
  };
  const language = useSelector(
    (state: RootState) => state.language.language
  );
 


  const handleLogin = async () => {
    if (!employeeId || !password) {
      showToast('Please enter Staff ID and Password',"ERROR")
      return;  }
     setIsLoading(true);
    try {
      const snapshot = await firestore().collection('Westwalk_Staff') 
      .where('staffId', '==', employeeId).limit(1).get();
      if (snapshot.empty) {
        showToast('Staff ID not found',"ERROR");
        setIsLoading(false)
        return;}
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const { email } = userDoc.data();
      if (!email) {
        showToast('Email not found for this Staff ID',"ERROR");
        setIsLoading(false)
        return;
      }
      await auth().signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem('staff_data', JSON.stringify(userData));
      navigation.navigate('EmployeeTab');
      showToast('Successfully Login',"SUCCESS");
      setIsLoading(false)
    } catch (error) {
      console.error('Login error:', error);
      showToast('Login failed. Please check your credentials.',"ERROR");
    }
    setIsLoading(false)
  };
  

  return (
    <View style={styles.Container}>
      
      <CustomHeader title=' ' onBackPress={()=>{navigation.goBack()}} />
      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>Staff Login</Text>
      <Text style={styles.Subtitle}>Enter your credentials to continue</Text>

      <View style={[ styles.InputContainer,employeeId !== '' && styles.Active_Input_Field,]}>
        <Image source={ManIcon} style={[ styles.Icon,employeeId !== '' && styles.Active_Image, ]}/>
        <TextInput  placeholder="Enter your Staff ID" value={employeeId} onChangeText={setEmployeeId}  style={styles.input} placeholderTextColor="#888"/>
      </View>

      <View style={[ styles.InputContainer, password !== '' && styles.Active_Input_Field, ]} >
        <Image  source={Lock} style={[ styles.Icon,  password !== '' && styles.Active_Image, ]} />
        <TextInput  secureTextEntry={hide}  placeholder="Enter your Password" value={password}  onChangeText={setPassword}
          style={styles.passwordinput}  placeholderTextColor="#888" />
       <TouchableOpacity onPress={() => setHide(!hide)}>
          <Image source={hide ? Hide : Show} style={[ styles.HideIcon, password !== '' && styles.Active_Image, ]}/>
      </TouchableOpacity>
      </View>
          
      <View style={styles.forgotContainer}>
        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            label={languageData[language].agree_to}
            isChecked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
            linkText={languageData[language].privacy_policy}
            onLinkPress={() =>  Linking.openURL('https://halabsaudi.com/privacy-policy-2/') }/>
        </View>
        <TouchableOpacity onPress={() => {navigation.navigate("StaffForgetPassword")}  } >
          <Text style={styles.ForgotText}>
            {languageData[language]?.forget_password || 'Forgot Password?'}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomButton title="Login" onPress={handleLogin}
      />
      {isLoading && ( <ActivityIndicatorModal visible={isLoading} /> )}
      <AnimatedToast  message={alertMessage} visible={alertVisible} duration={2000} type={alertType} />
    </View>
  );
};

export default EmployeeLogin;


