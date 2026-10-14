import PageLayout from '../../../components/PageLayout';
import ProfileView from '../../../components/ProfileView';
import {memberName, memberPhoto} from '../../../utils/member';
import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {Colors} from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {languageData} from '../../../redux/language/languageSlice';

type ProfileProps = {navigation: any};

const fetchWithTimeout = async (url: string, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {signal: controller.signal});
  } finally {
    clearTimeout(id);
  }
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
};

// TODO (backend): ye endpoint saare employees ka data (passport, QID waghera)
// bina login ke deta hai aur app usay phone pe filter karti hai. Behtar hai ke
// backend pe `/hr/employees/mongo/:qid` jaisa endpoint ho jo sirf ek employee
// ka record de, aur login token check kare.
const fetchProfile = async () => {
  try {
    const stored = await AsyncStorage.getItem('staff_data');
    if (!stored) return null;
    const {qid, profileImg} = JSON.parse(stored);
    const res = await fetchWithTimeout(
      'https://hala-b-saudi.onrender.com/hr/employees/mongo',
    );
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const list = await res.json();
    const match = list.find((s: any) => String(s.QID) === String(qid));
    if (!match) return null;
    const full = {...match, profileImg};
    await AsyncStorage.setItem('profile_cache', JSON.stringify(full));
    return full;
  } catch (error) {
    console.log('Profile fetch error:', error);
    return null;
  }
};

const ProfileScreen: React.FC<ProfileProps> = ({navigation}) => {
  const language = useSelector((state: RootState) => state.language.language);
  const ar = language === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);

  const [user, setUser] = useState<any>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      // 1) Cache ya session se foran kuch dikhao
      try {
        const session = JSON.parse(
          (await AsyncStorage.getItem('staff_data')) || '{}',
        );
        const raw = await AsyncStorage.getItem('profile_cache');
        const cached = raw ? JSON.parse(raw) : null;
        if (!mounted.current) return;
        if (cached && String(cached.QID) === String(session.qid)) {
          setUser(cached);
        } else {
          setUser({
            Name: memberName(session),
            QID: session.qid,
            EmployeeCode: session.staffId,
            Email: session.email,
            profileImg: memberPhoto(session),
          });
        }
      } catch {
        if (mounted.current) setUser({});
      }
      // 2) Background mein fresh data
      const fresh = await fetchProfile();
      if (fresh && mounted.current) setUser(fresh);
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <PageLayout
      title={languageData[language].Profile}
      onBackPress={() => navigation.goBack()}>
      {!user ? (
        <ActivityIndicator
          size="large"
          color={Colors.PrimaryColor}
          style={{marginTop: 40}}
        />
      ) : (
        <ProfileView
          name={user.Name || memberName(user) || t('Member', 'عضو')}
          photo={memberPhoto(user)}
          subtitle={user.Title}
          idLabel={t('Code', 'الرقم')}
          idValue={user.EmployeeCode}
          status={
            typeof user.EmpStatus === 'boolean'
              ? {
                  label: user.EmpStatus
                    ? t('Active', 'نشط')
                    : t('Inactive', 'غير نشط'),
                  active: user.EmpStatus,
                }
              : undefined
          }
          sections={[
            {
              title: t('Contact', 'التواصل'),
              icon: 'call-outline',
              rows: [
                {label: t('Email', 'البريد الإلكتروني'), value: user.Email},
                {label: t('Phone', 'الهاتف'), value: user.MobilePhone},
                {
                  label: t('Date of Birth', 'تاريخ الميلاد'),
                  value: formatDate(user.BirthDate),
                },
              ],
            },
            {
              title: t('Company Info', 'معلومات العمل'),
              icon: 'briefcase-outline',
              rows: [
                {label: t('Company', 'الشركة'), value: user.CompanyName},
                {label: t('Department', 'القسم'), value: user.Department},
                {label: t('Position', 'المنصب'), value: user.Title},
                {label: t('Manager', 'المدير'), value: user.DepManagerName},
                {
                  label: t('Joining Date', 'تاريخ الانضمام'),
                  value: formatDate(user.DateHired),
                },
                {
                  label: t('Contract Expiry', 'انتهاء العقد'),
                  value: formatDate(user.ContractEndDate),
                },
              ],
            },
            {
              title: t('ID Info', 'معلومات الهوية'),
              icon: 'card-outline',
              rows: [
                {label: t('Nationality', 'الجنسية'), value: user.Nationality},
                {label: t('Passport No.', 'رقم الجواز'), value: user.PassportNo},
                {label: t('QID', 'رقم البطاقة'), value: user.QID},
              ],
            },
            {
              title: t('Leave Overview', 'ملخص الإجازات'),
              icon: 'calendar-outline',
              rows: [
                {label: t('Leave Taken', 'الإجازات المأخوذة'), value: user.Absence},
                {
                  label: t('Leave Balance', 'رصيد الإجازات'),
                  value: user.LeaveBalance,
                },
              ],
            },
          ]}
        />
      )}
    </PageLayout>
  );
};

export default ProfileScreen;
