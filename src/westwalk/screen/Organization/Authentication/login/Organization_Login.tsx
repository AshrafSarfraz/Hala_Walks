import AuthLayout from '../../../../components/AuthLayout';
import BrandTitle from '../../../../components/BrandTitle';
import {Text} from '../../../../components/Text';
import React, {useState} from 'react';
import {
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import {Hide, Lock, ManIcon, Show, West_NB} from '../../../../theme/Images';
import CustomButton from '../../../../components/buttons/CustomButton';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../redux/store';
import CustomCheckbox from '../../../../components/checkbox/checkbox';
import {languageData} from '../../../../redux/language/languageSlice';
import CustomHeader from '../../../../components/header/CustomHeader';
import {fetch_OrgEmp_Data} from '../../../../firebase/firebaseutils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActivityIndicatorModal from '../../../../components/Loader/ActivityIndicator';
import {getStyles} from './style';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';
import {CommonActions} from '@react-navigation/native';

interface LoginProps {
  navigation: any;
}

const OrgEmp_Login: React.FC<LoginProps> = ({navigation}) => {
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
      const employees = await fetch_OrgEmp_Data();

      const matchedTenant = employees.find(
        OrgEmp => OrgEmp.empId === employeeId && OrgEmp.password === password,
      );

      if (matchedTenant) {
        const empWithDocId = {
          ...matchedTenant,
          docId: matchedTenant.id, // ✅ Add Firestore doc ID
        };

        await AsyncStorage.setItem(
          'org_emp_data',
          JSON.stringify(empWithDocId),
        );

        // console.log('Org Employee Saved in AsyncStorage:', empWithDocId); // ✅ See what's saved

        showToast('Login Success', 'SUCCESS');
        setTimeout(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'CorporationTab'}],
            }),
          );
        }, 1000);
      } else {
        showToast('Login Failed, Invalid ID or Password', 'ERROR');
      }
    } catch (error) {
      console.error('❌ Login Error:', error);
      showToast('Something went wrong. Please try again.', 'ERROR');
    }
  };

  return (
    <AuthLayout
      title={languageData[language].Organization_Login}
      onBackPress={() => navigation.goBack()}
      overlay={
        <AnimatedToast
          message={alertMessage}
          visible={alertVisible}
          duration={2000}
          type={alertType}
        />
      }>
      <BrandTitle
        style={{
          fontSize: 22,
          textAlign: language === 'ar' ? 'right' : 'left',
          marginBottom: 26,
        }}
      />
      <Text style={styles.Title}>
        {language === 'ar' ? 'مرحبًا بعودتك' : 'Welcome back'}
      </Text>
      <Text style={styles.Subtitle}>
        {languageData[language].Enter_credentials}
      </Text>

      <View
        style={[
          styles.InputContainer,
          employeeId !== '' && styles.Active_Input_Field,
        ]}>
        <Image
          source={ManIcon}
          style={[styles.Icon, employeeId !== '' && styles.Active_Image]}
        />
        <TextInput
          placeholder={languageData[language].Enter_your_ID}
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
          placeholderTextColor="#737873"
        />
      </View>

      <View
        style={[
          styles.InputContainer,
          password !== '' && styles.Active_Input_Field,
        ]}>
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
          placeholderTextColor="#737873"
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
    </AuthLayout>
  );
};

export default OrgEmp_Login;
