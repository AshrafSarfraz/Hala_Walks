import React, { useState } from 'react';
import {TextInput, View, Text, Image, TouchableOpacity, Linking,Alert,} from 'react-native';
import { Hide, Lock,ManIcon, Show,West_NB,} from '../../../../theme/Images';
import CustomButton from '../../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import CustomCheckbox from '../../../../components/checkbox/checkbox';
import { languageData } from '../../../../redux/language/languageSlice';
import CustomHeader from '../../../../components/header/CustomHeader';
import { fetch_OrgEmp_Data } from '../../../../firebase/firebaseutils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivityIndicatorModal from '../../../../components/Loader/ActivityIndicator';
import { getStyles } from './style';

interface LoginProps {
  navigation: any;
}

const OrgEmp_Login: React.FC<LoginProps> = ({ navigation }) => {
  const language = useSelector( (state: RootState) => state.language.language);
  const styles = getStyles(language);
  
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isChecked, setIsChecked] = useState<boolean>(false);


  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert('Missing Fields', 'Please enter both ID and Password');
      return;
    }
     setIsLoading(true);
    try {
      const employees = await fetch_OrgEmp_Data();
      const matchedTenant = employees.find(
        OrgEmp =>
        OrgEmp.empId === employeeId &&
        OrgEmp.password === password
      );

      if (matchedTenant) {
        await AsyncStorage.setItem(
          'org_emp_data',
          JSON.stringify(matchedTenant)
        );

        console.log('✅ Tenant Login Success:', matchedTenant);
        navigation.navigate('CorporationTab', { userData: matchedTenant });
        setIsLoading(false)
      } else {
        Alert.alert('Login Failed', 'Invalid ID or Password');
      }
    } catch (error) {
      console.error('❌ Login Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    setIsLoading(false)
  };

  return (
    <View style={styles.Container}>
       <CustomHeader title=' ' onBackPress={()=>{navigation.goBack()}} />
      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>{languageData[language].Organization_Login}</Text>
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

      </View>

      <CustomButton
        title={languageData[language].login}
        onPress={handleLogin}
      />

       {isLoading && (
            <ActivityIndicatorModal visible={isLoading} />
          )}
    </View>
  );
};

export default OrgEmp_Login;


