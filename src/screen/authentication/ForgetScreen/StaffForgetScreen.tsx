import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ManIcon, West_NB } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import CustomButton from '../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import CustomHeader from '../../../components/header/CustomHeader';
import { auth, firestore } from '../../../firebase/firebaseconfig';
import ActivityIndicatorModal from '../../../components/Loader/ActivityIndicator';

interface LoginProps {
  navigation: any;
}

const StaffForgetPassword: React.FC<LoginProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Please enter your email');
      return;
    }
  
    setIsLoading(true);
    try {
      // Step 1: Check if email exists in Firestore
      const snapshot = await firestore()
        .collection('Westwalk_Staff')
        .where('email', '==', email.trim())
        .limit(1)
        .get();
  
      if (snapshot.empty) {
        Alert.alert('This email is not registered with us');
        setIsLoading(false);
        return;
      }
  
      // Step 2: Send password reset email
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', 'This email is not registered', error.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <View style={styles.Container}>
      <CustomHeader title=" " onBackPress={() => navigation.goBack()} />
      <Image source={West_NB} style={styles.Logo} />
      <Text style={styles.Title}>
        {language === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password'}
      </Text>
      <Text style={styles.Subtitle}>
        {language === 'ar'
          ? 'أدخل بريدك الإلكتروني لاستعادة كلمة المرور'
          : 'Enter your email to reset your password'}
      </Text>

      <View style={[styles.InputContainer, email !== '' && styles.Active_Input_Field]}>
        <Image
          source={ManIcon}
          style={[styles.Icon, email !== '' && styles.Active_Image]}
        />
        <TextInput
          placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter Email'}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <CustomButton
        title={language === 'ar' ? 'إعادة تعيين' : 'Reset'}
        onPress={handlePasswordReset}
      />

      {isLoading && <ActivityIndicatorModal visible={isLoading} />}
    </View>
  );
};

export default StaffForgetPassword;

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
      height: 40,
    },
    Active_Input_Field: {
      borderColor: Colors.PrimaryColor,
    },
    Active_Image: {
      tintColor: Colors.PrimaryColor,
    },
  });
