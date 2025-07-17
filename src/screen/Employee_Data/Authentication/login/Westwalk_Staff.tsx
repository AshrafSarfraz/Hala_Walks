import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import CustomButton from '../../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { languageData } from '../../../../redux/language/languageSlice';
import CustomHeader from '../../../../components/header/CustomHeader';
import { auth, firestore } from '../../../../firebase/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { getStyles } from './style';
import { Hide, Lock, ManIcon, Show, West_NB } from '../../../../theme/Images';

const EmployeeLogin: React.FC = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'SUCCESS' | 'ERROR'>('SUCCESS');

  const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 3000);
  };

  const handleLogin = async () => {
    if (!employeeId || !password) {
      showToast('Please enter Staff ID and Password', 'ERROR');
      return;
    }

    try {
      const snapshot = await firestore()
        .collection('Westwalk_Staff')
        .where('staffId', '==', employeeId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        showToast('Staff ID not found', 'ERROR');
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id; // Firestore document ID

      const { email } = userData;
      if (!email) {
        showToast('Email not found for this Staff ID', 'ERROR');
        return;
      }
      await auth().signInWithEmailAndPassword(email, password);
      // Add userId to userData before saving
      const userDataWithId = { ...userData, userId };
      await AsyncStorage.setItem('staff_data', JSON.stringify(userDataWithId));
      showToast('Successfully Login', 'SUCCESS');
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'EmployeeTab' }],
          })
        );
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      showToast('Login failed. Please check your credentials.', 'ERROR');
    }
  };

  return (
    <SafeAreaView style={styles.SafeViewCont}>
      <View style={styles.Container}>
        <StatusBar
          hidden={false}
          translucent={true}
          animated={true}
          backgroundColor={'#FFFFFF'}
          barStyle="dark-content"
        />
        <CustomHeader title=" " onBackPress={() => navigation.goBack()} />
        <Image source={West_NB} style={styles.Logo} />
        <Text style={styles.Title}>{languageData[language].Staff_Login}</Text>
        <Text style={styles.Subtitle}>{languageData[language].Enter_credentials}</Text>

        <View
          style={[
            styles.InputContainer,
            employeeId !== '' && styles.Active_Input_Field,
          ]}
        >
          <Image
            source={ManIcon}
            style={[styles.Icon, employeeId !== '' && styles.Active_Image]}
          />
          <TextInput
            placeholder={languageData[language].Enter_your_ID}
            value={employeeId}
            onChangeText={setEmployeeId}
            style={styles.input}
            placeholderTextColor="#888"
          />
        </View>

        <View
          style={[styles.InputContainer, password !== '' && styles.Active_Input_Field]}
        >
          <Image
            source={Lock}
            style={[styles.Icon, password !== '' && styles.Active_Image]}
          />
          <TextInput
            secureTextEntry={hide}
            placeholder={languageData[language].Enter_your_Password}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordinput}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={() => setHide(!hide)}>
            <Image
              source={hide ? Hide : Show}
              style={[styles.HideIcon, password !== '' && styles.Active_Image]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.forgotContainer}>
          <View style={styles.checkboxContainer}>
    
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('StaffForgetPassword')}>
            <Text style={styles.ForgotText}>
              {languageData[language]?.forget_password || 'Forgot Password?'}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton title={languageData[language].login} onPress={handleLogin} />
      </View>
      <AnimatedToast
        message={alertMessage}
        visible={alertVisible}
        duration={3000}
        type={alertType}
      />
    </SafeAreaView>
  );
};

export default EmployeeLogin;
