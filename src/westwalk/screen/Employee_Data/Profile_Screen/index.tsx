import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { languageData } from '../../../redux/language/languageSlice';
import { styles } from './style';
import { P_IMG } from '../../../theme/Images';

type ProfileProps = {
  navigation: any;
};

// 🔹 Dummy data (fallback)
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

// 🔹 Fetch with timeout
const fetchWithTimeout = (url: string, options = {}, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    ),
  ]);
};

// 🔹 Fetch and store data
const fetchAndStoreData = async () => {
  try {
    const storedData = await AsyncStorage.getItem('staff_data');
    if (!storedData) return null;

    const { qid: localQid, profileImg } = JSON.parse(storedData);

    const response: any = await fetchWithTimeout(
      'https://awh-api.onrender.com/employees/mongo',
      {},
      5000
    );
    const staffList = await response.json();

    const matchedStaff = staffList.find((staff: any) => staff.QID === localQid);
    if (!matchedStaff) return null;

    const fullUserData = { ...matchedStaff, profileImg };
    await AsyncStorage.setItem('profile_cache', JSON.stringify(fullUserData));
    return fullUserData;
  } catch (error) {
    console.log('Error fetching user data or timeout:', error);
    return null;
  }
};

const ProfileScreen: React.FC<ProfileProps> = ({ navigation }) => {
  const language = useSelector((state: RootState) => state.language.language);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // 🔹 Step 1: Show cached data first if available
        const cached = await AsyncStorage.getItem('profile_cache');
        if (cached) {
          setUserData(JSON.parse(cached));
        } else {
          // agar cache hi nahi mila to dummy dikhado
          setUserData(DUMMY_DATA);
        }

        // 🔹 Step 2: Background me fresh fetch
        const freshData = await fetchAndStoreData();
        if (freshData) {
          setUserData(freshData);
        } else if (!cached) {
          // agar API bhi fail ho jaye aur cache bhi na ho
          setUserData(DUMMY_DATA);
        }
      } catch (err) {
        console.log(err);
        setUserData(DUMMY_DATA); // agar koi bhi error aaya
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading && !userData) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.PrimaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
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
   
        <Image source={P_IMG}
          style={styles.profileImage} />
        
        <Text style={styles.name}>{userData?.Name || 'N/A'}</Text>
        <Text style={styles.staffId}>
          Employee Code : {userData?.EmployeeCode || 'N/A'}
        </Text>
        <Text style={styles.company}>{userData?.CompanyName || 'N/A'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoItem label="Email" value={userData?.Email || 'N/A'} />
          <InfoItem label="Phone" value={userData?.MobilePhone || 'N/A'} />
          <InfoItem
            label="Date of Birth"
            value={formatDate(userData?.BirthDate)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Info</Text>
          <InfoItem label="Department" value={userData?.Department || 'N/A'} />
          <InfoItem label="Position" value={userData?.Title || 'N/A'} />
          <InfoItem
            label="Dep Manager Name"
            value={userData?.DepManagerName || 'N/A'}
          />
          <InfoItem
            label="Joining Date"
            value={formatDate(userData?.DateHired)}
          />
          <InfoItem
            label="Contract Expiry"
            value={userData?.ContractEndDate || 'N/A'}
          />
          <InfoItem
            label="Status"
            value={userData?.EmpStatus ? 'Active' : 'Inactive'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID Info</Text>
          <InfoItem label="Nationality" value={userData?.Nationality || 'N/A'} />
          <InfoItem
            label="Passport Number"
            value={userData?.PassportNo || 'N/A'}
          />
          <InfoItem label="QID" value={userData?.QID || 'N/A'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Overview</Text>
          <InfoItem
            label="Leave Taken"
            value={String(userData?.Absence || 0)}
          />
          <InfoItem
            label="Leave Balance"
            value={String(userData?.LeaveBalance || 0)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

type InfoItemProps = {
  label: string;
  value: string;
};

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <View style={styles.infoBox}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default ProfileScreen;
