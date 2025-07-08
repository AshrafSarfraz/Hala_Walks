import React, { useState } from 'react';
import { TextInput, View,Text, Image, TouchableOpacity, Linking,Alert, StatusBar,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Hide,Lock, ManIcon,Show,West_NB} from '../../../../theme/Images';
import CustomButton from '../../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import CustomCheckbox from '../../../../components/checkbox/checkbox';
import { languageData } from '../../../../redux/language/languageSlice';
import CustomHeader from '../../../../components/header/CustomHeader';
import { fetch_Tenant_Data } from '../../../../firebase/firebaseutils';
import ActivityIndicatorModal from '../../../../components/Loader/ActivityIndicator';
import { getStyles } from './style';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';

interface LoginProps {
  navigation: any;
}

const TenantsLogin: React.FC<LoginProps> = ({ navigation }) => {
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
      showToast('Missing Fields, Please enter both ID and Password', 'ERROR');
      return;
    }
    try {
      const tenants = await fetch_Tenant_Data();
      const matchedTenant = tenants.find(
        tenant =>
          tenant.tenantId === employeeId &&
          tenant.password === password
      );
      if (matchedTenant) {
        await AsyncStorage.setItem( 'tenant_data', JSON.stringify(matchedTenant) );
        showToast('Login Success',"SUCCESS");
        setTimeout(()=>{
          navigation.navigate('TenantsTab', { userData: matchedTenant });
        },1000)   
      } else {
        showToast('Login Failed, Invalid ID or Password ', 'ERROR');
      }
    } catch (error) {
      console.error('❌ Login Error:', error);
      showToast('Something went wrong',"ERROR");
    }
  };

  return (
   
   <View style={styles.Container}>
      <CustomHeader title=" " onBackPress={() => navigation.goBack()} />
      <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={'#FFFFFF'}  barStyle="dark-content" />
      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>{languageData[language].Tenants_Login}</Text>
      <Text style={styles.Subtitle}>{languageData[language].Enter_credentials}</Text>

      <View
        style={[
          styles.InputContainer,
          employeeId !== '' && styles.Active_Input_Field,
        ]}
      >
        <Image
          source={ManIcon}
          style={[
            styles.Icon,
            employeeId !== '' && styles.Active_Image,
          ]}
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
          placeholder={languageData[language].Enter_your_Password}
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
          {/* <CustomCheckbox
            label={languageData[language].agree_to}
            isChecked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
            linkText={languageData[language].privacy_policy}
            onLinkPress={() =>
              Linking.openURL('https://halabsaudi.com/privacy-policy-2/')
            }
          /> */}
        </View>
      </View>

      <CustomButton
        title={languageData[language].login}
        onPress={handleLogin}
      />

<AnimatedToast  message={alertMessage} visible={alertVisible} duration={3000} type={alertType} />
   
    </View>
  );
};

export default TenantsLogin;



