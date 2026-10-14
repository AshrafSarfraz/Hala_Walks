import AuthLayout from '../../../components/AuthLayout';
import {Text} from '../../../components/Text';
import React, {useEffect, useRef, useState} from 'react';
import {TextInput, View, Image, TouchableOpacity, Linking} from 'react-native';
import {Colors} from '../../../theme/Colors';
import CustomButton from '../../../components/buttons/CustomButton';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {languageData} from '../../../redux/language/languageSlice';
import {auth, firestore} from '../../../firebase/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedToast from '../../../components/Modal/CustomAlert/CustomAlert';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {getStyles} from './style';
import {Hide, Lock, ManIcon, Show, West_NB} from '../../../theme/Images';

// Login mein masla ho to Yonus ka WhatsApp khulta hai.
// Number country code ke saath, bina + aur spaces ke (Qatar = 974)
const SUPPORT_WHATSAPP = '97450311208';

const openSupportWhatsApp = async (ar: boolean) => {
  const text = encodeURIComponent(
    ar
      ? 'مرحبًا فريق الإدارة، أواجه مشكلة في تسجيل الدخول إلى تطبيق ويست ووك.'
      : 'Hello Management Team, I am having trouble logging in to the West Walk app.',
  );
  const app = `whatsapp://send?phone=${SUPPORT_WHATSAPP}&text=${text}`;
  const web = `https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`;
  try {
    await Linking.openURL(app); // WhatsApp app
  } catch {
    Linking.openURL(web).catch(() => {}); // app na ho to browser
  }
};

type Result =
  | {ok: true; storageKey: string; data: any; route: string}
  | {ok: false; reason: 'not_found' | 'wrong_password' | 'inactive' | 'auth'; code?: string};

const ALL_KEYS = ['staff_data', 'tenant_data', 'org_emp_data'];

const findOne = async (collection: string, field: string, id: string) => {
  const snap = await firestore()
    .collection(collection)
    .where(field, '==', id)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
};

const tryStaff = async (id: string, password: string): Promise<Result> => {
  const doc = await findOne('Westwalk_Staff', 'staffId', id);
  if (!doc) return {ok: false, reason: 'not_found'};
  const data = doc.data();
  if (!data.email) return {ok: false, reason: 'not_found'};
  try {
    await auth().signInWithEmailAndPassword(data.email, password);
  } catch (e: any) {
    const code = e?.code || '';
    const wrong =
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials';
    return {ok: false, reason: wrong ? 'wrong_password' : 'auth', code};
  }
  return {
    ok: true,
    storageKey: 'staff_data',
    data: {...data, userId: doc.id},
    route: 'EmployeeTab',
  };
};

const tryTenant = async (id: string, password: string): Promise<Result> => {
  const doc = await findOne('Tenants', 'tenantId', id);
  if (!doc) return {ok: false, reason: 'not_found'};
  const data = doc.data();
  if (data.password !== password) return {ok: false, reason: 'wrong_password'};
  if (data.status !== 'active') return {ok: false, reason: 'inactive'};
  return {
    ok: true,
    storageKey: 'tenant_data',
    data: {...data, id: doc.id, docId: doc.id},
    route: 'TenantsTab',
  };
};

const tryOrg = async (id: string, password: string): Promise<Result> => {
  const doc = await findOne('Employees', 'empId', id);
  if (!doc) return {ok: false, reason: 'not_found'};
  const data = doc.data();
  if (data.password !== password) return {ok: false, reason: 'wrong_password'};
  return {
    ok: true,
    storageKey: 'org_emp_data',
    data: {...data, id: doc.id, docId: doc.id},
    route: 'CorporationTab',
  };
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const ar = language === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'SUCCESS' | 'ERROR'>('SUCCESS');

  const passwordRef = useRef<TextInput>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    later(() => setAlertVisible(false), 3000);
  };

  const errorMessage = (results: Result[]) => {
    const fails = results.filter(r => !r.ok) as Extract<Result, {ok: false}>[];
    if (fails.some(r => r.code === 'auth/too-many-requests'))
      return t(
        'Too many attempts. Please try again later.',
        'محاولات كثيرة. يرجى المحاولة لاحقًا.',
      );
    if (fails.some(r => r.code === 'auth/network-request-failed'))
      return t(
        'No internet connection. Please try again.',
        'لا يوجد اتصال بالإنترنت. حاول مرة أخرى.',
      );
    if (fails.some(r => r.reason === 'inactive'))
      return t('Your account is not active.', 'حسابك غير نشط.');
    if (fails.some(r => r.reason === 'wrong_password' || r.reason === 'auth'))
      return t('Incorrect password.', 'كلمة المرور غير صحيحة.');
    return t('ID not found.', 'المعرف غير موجود.');
  };

  const handleLogin = async () => {
    if (loading) return;
    const id = userId.trim();
    if (!id || !password) {
      showToast(
        t('Please enter your ID and password', 'يرجى إدخال المعرف وكلمة المرور'),
        'ERROR',
      );
      return;
    }

    setLoading(true);
    try {
      // Ek ek kar ke try karte hain, jo pehle match ho wahi login.
      const results: Result[] = [];
      let success: Extract<Result, {ok: true}> | null = null;
      for (const attempt of [tryStaff, tryTenant, tryOrg]) {
        const r = await attempt(id, password).catch(
          (): Result => ({ok: false, reason: 'auth', code: 'unknown'}),
        );
        results.push(r);
        if (r.ok) {
          success = r;
          break;
        }
      }

      if (!success) {
        showToast(errorMessage(results), 'ERROR');
        setLoading(false);
        return;
      }

      // Purana kisi aur role ka data saaf kar dein, phir naya save karein
      await AsyncStorage.multiRemove(ALL_KEYS);
      await AsyncStorage.setItem(success.storageKey, JSON.stringify(success.data));

      const route = success.route;
      showToast(t('Login successful', 'تم تسجيل الدخول بنجاح'), 'SUCCESS');
      // loading true hi rehta hai taake dobara tap na ho
      later(() => {
        navigation.dispatch(
          CommonActions.reset({index: 0, routes: [{name: route}]}),
        );
      }, 800);
    } catch (error) {
      console.error('Login error:', error);
      showToast(
        t('Something went wrong. Please try again.', 'حدث خطأ. حاول مرة أخرى.'),
        'ERROR',
      );
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title=""
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
        <Text style={styles.Title}>
          {t('Welcome to West Walk', 'مرحبًا بك في ويست ووك')}
        </Text>
        <Text style={styles.Subtitle}>
          {languageData[language].Enter_credentials}
        </Text>
      </View>

      {/* ID */}
      <Text style={styles.Label}>{t('ID', 'المعرف')}</Text>
      <View
        style={[styles.InputContainer, userId !== '' && styles.Active_Input_Field]}>
        <Image
          source={ManIcon}
          style={[styles.Icon, userId !== '' && styles.Active_Image]}
        />
        <TextInput
          placeholder={t(
            'Staff ID, Tenant ID or Partners-Emp ID',
            'رقم الموظف أو المستأجر أو الموظف',
          )}
          value={userId}
          onChangeText={setUserId}
          style={styles.input}
          placeholderTextColor="#9A9E9A"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
      </View>

      {/* Password */}
      <Text style={styles.Label}>{t('Password', 'كلمة المرور')}</Text>
      <View
        style={[styles.InputContainer, password !== '' && styles.Active_Input_Field]}>
        <Image
          source={Lock}
          style={[styles.Icon, password !== '' && styles.Active_Image]}
        />
        <TextInput
          ref={passwordRef}
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
          title={
            loading
              ? t('Signing in...', 'جارٍ تسجيل الدخول...')
              : languageData[language].login
          }
          onPress={handleLogin}
        />
      </View>

      <Text
        accessibilityRole="link"
        onPress={() => openSupportWhatsApp(ar)}
        suppressHighlighting
        style={[styles.Footer, {color: Colors.PrimaryColor}]}>
        {t(
          'Having trouble? Contact the management office',
          'تواجه مشكلة؟ تواصل مع الإدارة',
        )}
      </Text>
    </AuthLayout>
  );
};

export default LoginScreen;
