import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import {Colors} from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {languageData} from '../../../redux/language/languageSlice';
import {styles} from './style';
import {P_IMG} from '../../../theme/Images';

type ProfileProps = {navigation: any};

const DUMMY_DATA = {
  Name: 'N/A',
  EmployeeCode: 'N/A',
  CompanyName: 'N/A',
  Email: 'N/A',
  MobilePhone: 'N/A',
  BirthDate: '',
  Department: 'N/A',
  Title: 'N/A',
  DepManagerName: 'N/A',
  DateHired: '',
  ContractEndDate: '',
  EmpStatus: false,
  Nationality: 'N/A',
  PassportNo: 'N/A',
  QID: 'N/A',
  Absence: 0,
  LeaveBalance: 0,
  profileImg: '',
};

const fetchWithTimeout = async (
  url: string,
  options: any = {},
  timeout = 8000,
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {...options, signal: controller.signal});
    return res;
  } finally {
    clearTimeout(id);
  }
};

const ProfileScreen: React.FC<ProfileProps> = ({navigation}) => {
  const language = useSelector((state: RootState) => state.language.language);

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mountedRef = useRef(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchAndStoreData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('staff_data');
      if (!storedData) return null;

      const {qid: localQid, profileImg} = JSON.parse(storedData);

      const response: any = await fetchWithTimeout(
        'https://hala-b-saudi.onrender.com/hr/employees/mongo',
        {},
        8000,
      );

      if (!response?.ok) {
        throw new Error(`API error: ${response?.status}`);
      }

      const staffList = await response.json();
      const matchedStaff = staffList.find((staff: any) => staff.QID === localQid);

      if (!matchedStaff) return null;

      const fullUserData = {...matchedStaff, profileImg};
      await AsyncStorage.setItem('profile_cache', JSON.stringify(fullUserData));

      return fullUserData;
    } catch (error) {
      console.log('Profile fetch error:', error);
      return null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const loadFast = async () => {
      setLoading(true);

      // ✅ 1) Show cache immediately (FAST UI)
      try {
        const cached = await AsyncStorage.getItem('profile_cache');
        if (cached && mountedRef.current) {
          setUserData(JSON.parse(cached));
          setLoading(false); // ✅ UI instantly
        } else if (mountedRef.current) {
          setUserData(DUMMY_DATA);
          setLoading(false);
        }
      } catch (e) {
        if (mountedRef.current) {
          setUserData(DUMMY_DATA);
          setLoading(false);
        }
      }

      // ✅ 2) Fetch fresh in background (doesn't block UI)
      const fresh = await fetchAndStoreData();
      if (fresh && mountedRef.current) {
        setUserData(fresh);
      }
    };

    loadFast();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!userData) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={Colors.PrimaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.Bg}
        barStyle={'dark-content'}
      />

      <CustomHeader
        title={languageData[language].Profile}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.Profile_container}>
        <Image
          source={P_IMG}
          style={styles.profileImage}
        />

        <Text style={styles.name}>{userData?.Name || 'N/A'}</Text>
        <Text style={styles.staffId}>
          Employee Code : {userData?.EmployeeCode || 'N/A'}
        </Text>
        <Text style={styles.company}>{userData?.Title  || 'N/A'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoItem label="Email" value={userData?.Email || 'N/A'} />
          <InfoItem label="Phone" value={userData?.MobilePhone || 'N/A'} />
          <InfoItem label="Date of Birth" value={formatDate(userData?.BirthDate)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Info</Text>
          <InfoItem label="Department" value={userData?.Department || 'N/A'} />
          <InfoItem label="Position" value={userData?.Title || 'N/A'} />
          <InfoItem label="Dep Manager Name" value={userData?.DepManagerName || 'N/A'} />
          <InfoItem label="Joining Date" value={formatDate(userData?.DateHired)} />
          <InfoItem label="Contract Expiry" value={userData?.ContractEndDate || 'N/A'} />
          <InfoItem label="Status" value={userData?.EmpStatus ? 'Active' : 'Inactive'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID Info</Text>
          <InfoItem label="Nationality" value={userData?.Nationality || 'N/A'} />
          <InfoItem label="Passport Number" value={userData?.PassportNo || 'N/A'} />
          <InfoItem label="QID" value={userData?.QID || 'N/A'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Overview</Text>
          <InfoItem label="Leave Taken" value={String(userData?.Absence || 0)} />
          <InfoItem label="Leave Balance" value={String(userData?.LeaveBalance || 0)} />
        </View>
      </ScrollView>
    </View>
  );
};

type InfoItemProps = {label: string; value: string};

const InfoItem: React.FC<InfoItemProps> = ({label, value}) => (
  <View style={styles.infoBox}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default ProfileScreen;
