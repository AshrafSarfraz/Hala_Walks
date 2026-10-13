// import AuthLayout from '../../../../components/AuthLayout';
// import BrandTitle from '../../../../components/BrandTitle';
// import {Text} from '../../../../components/Text';
// import React, {useState} from 'react';
// import {
//   TextInput,
//   View,
//   Image,
//   TouchableOpacity,
//   Linking,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import CustomButton from '../../../../components/buttons/CustomButton';
// import {useSelector} from 'react-redux';
// import {RootState} from '../../../../redux/store';
// import {languageData} from '../../../../redux/language/languageSlice';
// import CustomHeader from '../../../../components/header/CustomHeader';
// import {auth, firestore} from '../../../../firebase/firebaseconfig';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';
// import {CommonActions, useNavigation} from '@react-navigation/native';
// import {getStyles} from './style';
// import {Hide, Lock, ManIcon, Show, West_NB} from '../../../../theme/Images';

// const EmployeeLogin: React.FC = () => {
//   const navigation = useNavigation<any>();
//   const language = useSelector((state: RootState) => state.language.language);
//   const styles = getStyles(language);

//   const [employeeId, setEmployeeId] = useState('');
//   const [password, setPassword] = useState('');
//   const [hide, setHide] = useState(true);
//   const [isChecked, setIsChecked] = useState<boolean>(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertType, setAlertType] = useState<'SUCCESS' | 'ERROR'>('SUCCESS');

//   const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setAlertVisible(true);
//     setTimeout(() => setAlertVisible(false), 3000);
//   };

//   const handleLogin = async () => {
//     if (!employeeId || !password) {
//       showToast('Please enter Staff ID and Password', 'ERROR');
//       return;
//     }

//     try {
//       const snapshot = await firestore()
//         .collection('Westwalk_Staff')
//         .where('staffId', '==', employeeId)
//         .limit(1)
//         .get();

//       if (snapshot.empty) {
//         showToast('Staff ID not found', 'ERROR');
//         return;
//       }

//       const userDoc = snapshot.docs[0];
//       const userData = userDoc.data();
//       const userId = userDoc.id; // Firestore document ID

//       const {email} = userData;
//       if (!email) {
//         showToast('Email not found for this Staff ID', 'ERROR');
//         return;
//       }
//       await auth().signInWithEmailAndPassword(email, password);
//       // Add userId to userData before saving
//       const userDataWithId = {...userData, userId};
//       await AsyncStorage.setItem('staff_data', JSON.stringify(userDataWithId));
//       showToast('Successfully Login', 'SUCCESS');
//       setTimeout(() => {
//         navigation.dispatch(
//           CommonActions.reset({
//             index: 0,
//             routes: [{name: 'EmployeeTab'}],
//           }),
//         );
//       }, 1000);
//     } catch (error) {
//       console.error('Login error:', error);
//       showToast('Login failed. Please check your credentials.', 'ERROR');
//     }
//   };

//   return (
//     <AuthLayout
//       title={languageData[language].Staff_Login}
//       onBackPress={() => navigation.goBack()}
//       overlay={
//         <AnimatedToast
//           message={alertMessage}
//           visible={alertVisible}
//           duration={3000}
//           type={alertType}
//         />
//       }>
//       <BrandTitle
//         style={{
//           fontSize: 22,
//           textAlign: language === 'ar' ? 'right' : 'left',
//           marginBottom: 26,
//         }}
//       />
//       <Text style={styles.Title}>
//         {language === 'ar' ? 'مرحبًا بعودتك' : 'Welcome back'}
//       </Text>
//       <Text style={styles.Subtitle}>
//         {languageData[language].Enter_credentials}
//       </Text>

//       <View
//         style={[
//           styles.InputContainer,
//           employeeId !== '' && styles.Active_Input_Field,
//         ]}>
//         <Image
//           source={ManIcon}
//           style={[styles.Icon, employeeId !== '' && styles.Active_Image]}
//         />
//         <TextInput
//           placeholder={languageData[language].Enter_your_ID}
//           value={employeeId}
//           onChangeText={setEmployeeId}
//           style={styles.input}
//           placeholderTextColor="#737873"
//         />
//       </View>

//       <View
//         style={[
//           styles.InputContainer,
//           password !== '' && styles.Active_Input_Field,
//         ]}>
//         <Image
//           source={Lock}
//           style={[styles.Icon, password !== '' && styles.Active_Image]}
//         />
//         <TextInput
//           secureTextEntry={hide}
//           placeholder={languageData[language].Enter_your_Password}
//           value={password}
//           onChangeText={setPassword}
//           style={styles.passwordinput}
//           placeholderTextColor="#737873"
//         />
//         <TouchableOpacity onPress={() => setHide(!hide)}>
//           <Image
//             source={hide ? Hide : Show}
//             style={[styles.HideIcon, password !== '' && styles.Active_Image]}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* <View style={styles.forgotContainer}>
//           <View style={styles.checkboxContainer}>
    
//           </View>
//           <TouchableOpacity onPress={() => navigation.navigate('StaffForgetPassword')}>
//             <Text style={styles.ForgotText}>
//               {languageData[language]?.forget_password || 'Forgot Password?'}
//             </Text>
//           </TouchableOpacity>
//         </View> */}

//       <CustomButton
//         title={languageData[language].login}
//         onPress={handleLogin}
//       />
//     </AuthLayout>
//   );
// };

// export default EmployeeLogin;




import AuthLayout from '../../../../components/AuthLayout';
import {Text} from '../../../../components/Text';
import React, {useState} from 'react';
import {TextInput, View, Image, TouchableOpacity} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import CustomButton from '../../../../components/buttons/CustomButton';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../redux/store';
import {languageData} from '../../../../redux/language/languageSlice';
import {auth, firestore} from '../../../../firebase/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedToast from '../../../../components/Modal/CustomAlert/CustomAlert';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {getStyles} from './style';
import {Colors} from '../../../../theme/Colors';
import {Hide, Lock, ManIcon, Show, West_NB} from '../../../../theme/Images';

const EmployeeLogin: React.FC = () => {
  const navigation = useNavigation<any>();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const ar = language === 'ar';

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'SUCCESS' | 'ERROR'>('SUCCESS');

  const t = (en: string, arText: string) => (ar ? arText : en);

  const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 3000);
  };

  const handleLogin = async () => {
    if (loading) return;
    const id = employeeId.trim();

    if (!id || !password) {
      showToast(t('Please enter Staff ID and Password', 'يرجى إدخال رقم الموظف وكلمة المرور'), 'ERROR');
      return;
    }

    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('Westwalk_Staff')
        .where('staffId', '==', id)
        .limit(1)
        .get();

      if (snapshot.empty) {
        showToast(t('Staff ID not found', 'رقم الموظف غير موجود'), 'ERROR');
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const {email} = userData;

      if (!email) {
        showToast(t('Email not found for this Staff ID', 'لا يوجد بريد إلكتروني لهذا الرقم'), 'ERROR');
        return;
      }

      await auth().signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem(
        'staff_data',
        JSON.stringify({...userData, userId: userDoc.id}),
      );

      showToast(t('Login successful', 'تم تسجيل الدخول بنجاح'), 'SUCCESS');
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({index: 0, routes: [{name: 'EmployeeTab'}]}),
        );
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      showToast(
        t('Login failed. Please check your credentials.', 'فشل تسجيل الدخول. يرجى التحقق من البيانات.'),
        'ERROR',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={languageData[language].Staff_Login}
      onBackPress={() => navigation.goBack()}
      overlay={
        <AnimatedToast
          message={alertMessage}
          visible={alertVisible}
          duration={3000}
          type={alertType}
        />
      }>
      {/* Logo + heading */}
      <View style={styles.Hero}>
        <View style={styles.LogoWrap}>
          <Image source={West_NB} style={styles.Logo} />
        </View>
        <View style={styles.RoleBadge}>
          <Ionicons name="person-outline" size={14} color={Colors.PrimaryColor} />
          <Text style={styles.RoleBadgeText}>
            {t('West Walk Employee', 'موظف ويست ووك')}
          </Text>
        </View>
        <Text style={styles.Title}>{t('Welcome back', 'مرحبًا بعودتك')}</Text>
        <Text style={styles.Subtitle}>
          {languageData[language].Enter_credentials}
        </Text>
      </View>

      {/* Staff ID */}
      <Text style={styles.Label}>{t('Staff ID', 'رقم الموظف')}</Text>
      <View style={[styles.InputContainer, employeeId !== '' && styles.Active_Input_Field]}>
        <Image
          source={ManIcon}
          style={[styles.Icon, employeeId !== '' && styles.Active_Image]}
        />
        <TextInput
          placeholder={languageData[language].Enter_your_ID}
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
          placeholderTextColor="#9A9E9A"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      {/* Password */}
      <Text style={styles.Label}>{t('Password', 'كلمة المرور')}</Text>
      <View style={[styles.InputContainer, password !== '' && styles.Active_Input_Field]}>
        <Image
          source={Lock}
          style={[styles.Icon, password !== '' && styles.Active_Image]}
        />
        <TextInput
          secureTextEntry={hide}
          placeholder={languageData[language].Enter_your_Password}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#9A9E9A"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity onPress={() => setHide(!hide)} hitSlop={10}>
          <Image
            source={hide ? Hide : Show}
            style={[styles.HideIcon, password !== '' && styles.Active_Image]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.ButtonWrap}>
        <CustomButton
          title={loading ? t('Signing in...', 'جارٍ تسجيل الدخول...') : languageData[language].login}
          onPress={handleLogin}
        />
      </View>

      <Text style={styles.Footer}>
        {t('Having trouble? Contact the management office', 'تواجه مشكلة؟ تواصل مع الإدارة')}
      </Text>
    </AuthLayout>
  );
};

export default EmployeeLogin;