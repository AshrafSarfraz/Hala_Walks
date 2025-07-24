import React, { useEffect, useState } from 'react';
import { TextInput, View,Text,Image,Alert } from 'react-native';
import { ManIcon, West_NB } from '../../../../theme/Images';
import CustomButton from '../../../../components/buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import CustomHeader from '../../../../components/header/CustomHeader';
import { auth, firestore } from '../../../../firebase/firebaseconfig';
import ActivityIndicatorModal from '../../../../components/Loader/ActivityIndicator';
import { getStyles } from './style';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';



interface LoginProps {
  navigation: any;
}

const StaffForgetPassword: React.FC<LoginProps> = ({ navigation }) => {
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [email, setEmail] = useState('');
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


 

  const handlePasswordReset = async () => {
    if (!email) {
      showToast(language === 'ar' ? 'يرجى إدخال بريدك الإلكتروني' : 'Please enter your email', 'ERROR');
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
        showToast(language === 'ar' ? 'هذا البريد غير مسجل لدينا' : 'This email is not registered with us', 'ERROR');
        setIsLoading(false);
        return;
      }
  

      await auth().sendPasswordResetEmail(email.trim());
      showToast(language === 'ar' ? 'تم إرسال البريد بنجاح' : 'Password reset email sent. Please check your inbox.', 'SUCCESS');
      
      setTimeout(() => { navigation.goBack();}, 3000);
      
    } catch (error: any) {
      showToast(language === 'ar' ? 'فشل في إرسال البريد' : 'Failed to send reset email.', 'ERROR');
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
      <AnimatedToast  message={alertMessage} visible={alertVisible} duration={1000} type={alertType} />

    </View>
  );
};

export default StaffForgetPassword;


