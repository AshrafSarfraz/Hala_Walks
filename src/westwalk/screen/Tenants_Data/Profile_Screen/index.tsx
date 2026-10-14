import PageLayout from '../../../components/PageLayout';
import ProfileView from '../../../components/ProfileView';
import {memberName, memberPhoto} from '../../../utils/member';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {languageData} from '../../../redux/language/languageSlice';
import NoDataFound from '../../../components/NoDataFound/No_data_found';

const TenantsProfile: React.FC<{navigation: any}> = ({navigation}) => {
  const language = useSelector((state: RootState) => state.language.language);
  const ar = language === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    AsyncStorage.getItem('tenant_data')
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
          name={memberName(user) || t('Tenant', 'مستأجر')}
          photo={memberPhoto(user)}
          subtitle={user.tenantCategory}
          idLabel={t('ID', 'المعرف')}
          idValue={user.tenantId}
          status={
            user.status
              ? {
                  label:
                    user.status === 'active'
                      ? t('Active', 'نشط')
                      : t('Inactive', 'غير نشط'),
                  active: user.status === 'active',
                }
              : undefined
          }
          sections={[
            {
              title: t('Contact Info', 'معلومات التواصل'),
              icon: 'call-outline',
              rows: [
                {label: t('Mobile', 'الجوال'), value: user.phoneNumber},
                {label: t('Email', 'البريد الإلكتروني'), value: user.email},
                {label: t('Nationality', 'الجنسية'), value: user.nationality},
                {label: t('QID', 'رقم البطاقة'), value: user.qid},
                {
                  label: t('Date of Birth', 'تاريخ الميلاد'),
                  value: user.dateOfBirth,
                },
              ],
            },
            {
              title: t('Residence Info', 'معلومات السكن'),
              icon: 'home-outline',
              rows: [
                {label: t('Category', 'الفئة'), value: user.tenantCategory},
                {label: t('Unit Number', 'رقم الوحدة'), value: user.unitNumber},
                {label: t('Building', 'المبنى'), value: user.buildingNo},
                {label: t('Tower', 'البرج'), value: user.tower},
                {label: t('Occupants', 'عدد السكان'), value: user.occupants},
              ],
            },
            {
              title: t('Contract Info', 'معلومات العقد'),
              icon: 'document-text-outline',
              rows: [
                {
                  label: t('Contract Start', 'بداية العقد'),
                  value: user.joiningDate,
                },
                {
                  label: t('Contract End', 'نهاية العقد'),
                  value: user.contractExpiry,
                },
              ],
            },
          ]}
        />
      ) : null}
    </PageLayout>
  );
};

export default TenantsProfile;
