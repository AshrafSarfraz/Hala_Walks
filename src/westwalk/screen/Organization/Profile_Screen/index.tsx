import PageLayout from '../../../components/PageLayout';
import ProfileView from '../../../components/ProfileView';
import {memberName, memberPhoto} from '../../../utils/member';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {languageData} from '../../../redux/language/languageSlice';
import NoDataFound from '../../../components/NoDataFound/No_data_found';

const CorporationProfile: React.FC<{navigation: any}> = ({navigation}) => {
  const language = useSelector((state: RootState) => state.language.language);
  const ar = language === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    AsyncStorage.getItem('org_emp_data')
      .then(raw => setUser(raw ? JSON.parse(raw) : null))
      .catch(() => setUser(null));
  }, []);

  return (
    <PageLayout
      title={languageData[language].Profile}
      onBackPress={() => navigation.goBack()}>
      {user === null ? (
        <NoDataFound />
      ) : user ? (
        <ProfileView
          name={memberName(user) || t('Member', 'عضو')}
          photo={memberPhoto(user)}
          subtitle={user.companyName}
          idLabel={t('ID', 'المعرف')}
          idValue={user.empId}
          sections={[
            {
              title: t('Employee Info', 'معلومات الموظف'),
              icon: 'person-outline',
              rows: [
                {label: t('Employee ID', 'رقم الموظف'), value: user.empId},
                {label: t('QID', 'رقم البطاقة'), value: user.qid},
                {label: t('Organization', 'المؤسسة'), value: user.companyName},
                {label: t('Mobile', 'الجوال'), value: user.phoneNumber},
                {label: t('Email', 'البريد الإلكتروني'), value: user.email},
              ],
            },
          ]}
        />
      ) : null}
    </PageLayout>
  );
};

export default CorporationProfile;
