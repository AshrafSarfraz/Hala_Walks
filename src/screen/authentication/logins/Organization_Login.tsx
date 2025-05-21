import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
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

interface LoginProps {
  navigation: any;
}

const OrgEmp_Login: React.FC<LoginProps> = ({ navigation }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const language = useSelector(
    (state: RootState) => state.language.language
  );

  const styles = getStyles(language);

  return (
    <View style={styles.Container}>
       <CustomHeader title=' ' onBackPress={()=>{navigation.goBack()}} />
      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>Organization Login</Text>
      <Text style={styles.Subtitle}>Enter your credentials to continue</Text>

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

      </View>

      <CustomButton
        title="Login"
        onPress={() => navigation.navigate('CorporationTab')}
      />
    </View>
  );
};

export default OrgEmp_Login;

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
    },
    passwordinput: {
      flex: 1,
      fontSize: 14,
      color: '#000',
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
