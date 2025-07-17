import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Hide,
  Lock,
  ManIcon,
  Show,
  West_NB,
} from '../../../../theme/Images';
import CustomButton from '../../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { languageData } from '../../../../redux/language/languageSlice';
import CustomHeader from '../../../../components/header/CustomHeader';
import { fetch_Tenant_Data } from '../../../../firebase/firebaseutils';
import { getStyles } from './style';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';
import { CommonActions } from '@react-navigation/native';

interface LoginProps {
  navigation: any;
}

const TenantsLogin: React.FC<LoginProps> = ({ navigation }) => {
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'SUCCESS' | 'ERROR'>('SUCCESS');

  const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 1000);
  };

  const handleLogin = async () => {
    if (!employeeId || !password) {
      showToast('Please enter both ID and Password', 'ERROR');
      return;
    }
  
    try {
      const tenants = await fetch_Tenant_Data();
      const matchedTenant = tenants.find(
        tenant =>
          tenant.tenantId === employeeId && tenant.password === password
      );
  
      if (matchedTenant) {
        if (matchedTenant.status !== 'active') {
          showToast('Your account is not active.', 'ERROR');
          return;
        }
  
        const tenantWithDocId = {
          ...matchedTenant,
          docId: matchedTenant.id, // ✅ Firestore docId
        };
  
        // Save in AsyncStorage
        await AsyncStorage.setItem(
          'tenant_data',
          JSON.stringify(tenantWithDocId)
        );
  
        // ✅ Log the stored data to console
        // console.log('✅ Saved to AsyncStorage (tenant_data):', tenantWithDocId);
  
        showToast('Login successful', 'SUCCESS');
            setTimeout(() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'TenantsTab' }],
                })
              );
            }, 1000);
      } else {
        showToast('Invalid ID or Password', 'ERROR');
      }
    } catch (error) {
      console.error('Login Error:', error);
      showToast('Something went wrong. Please try again.', 'ERROR');
    }
  };
  

  const getFieldStyle = (value: string, baseStyle: any, activeStyle: any) => {
    return value !== '' ? [baseStyle, activeStyle] : baseStyle;
  };

  return (
    <View style={styles.Container}>
      <CustomHeader title=" " onBackPress={() => navigation.goBack()} />

      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>{languageData[language].Tenants_Login}</Text>
      <Text style={styles.Subtitle}>
        {languageData[language].Enter_credentials}
      </Text>

      {/* ID Input */}
      <View style={getFieldStyle(employeeId, styles.InputContainer, styles.Active_Input_Field)}>
        <Image
          source={ManIcon}
          style={getFieldStyle(employeeId, styles.Icon, styles.Active_Image)}
        />
        <TextInput
          placeholder={languageData[language].Enter_your_ID}
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
          placeholderTextColor="#888"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={getFieldStyle(password, styles.InputContainer, styles.Active_Input_Field)}>
        <Image
          source={Lock}
          style={getFieldStyle(password, styles.Icon, styles.Active_Image)}
        />
        <TextInput
          secureTextEntry={hide}
          placeholder={languageData[language].Enter_your_Password}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordinput}
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={() => setHide(prev => !prev)}>
          <Image
            source={hide ? Hide : Show}
            style={getFieldStyle(password, styles.HideIcon, styles.Active_Image)}
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <CustomButton
        title={languageData[language].login}
        onPress={handleLogin}
      />

      {/* Toast Notification */}
      <AnimatedToast
        message={alertMessage}
        visible={alertVisible}
        duration={3000}
        type={alertType}
      />
    </View>
  );
};

export default TenantsLogin;
