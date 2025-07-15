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
import NoDataFound from '../../../components/NoDataFound/No_data_found';

type ProfileProps = {
  navigation: any;
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

  const fetchAndStoreData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('staff_data');
      if (!storedData) return null;

      const { qid: localQid, profileImg } = JSON.parse(storedData);

      console.log(`Local QID: ${localQid}`);

      // fetch employees from API
      const response = await fetch('https://awh-api.onrender.com/employees/mongo');
      const staffList = await response.json();

      console.log(`Fetched ${staffList.length} employees`);

      // find employee with matching QID
      const matchedStaff = staffList.find((staff: any) => staff.QID === localQid);

      if (!matchedStaff) {
        console.log(`No employee found with QID: ${localQid}`);
        return null;
      }

      const fullUserData = {
        ...matchedStaff,
        profileImg,
      };

      // store in AsyncStorage for later use
      await AsyncStorage.setItem('profile_cache', JSON.stringify(fullUserData));

      return fullUserData;
    } catch (error) {
      console.log('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const cached = await AsyncStorage.getItem('profile_cache');

        if (cached) {
          console.log('Using cached data');
          setUserData(JSON.parse(cached));
          setLoading(false);

          // background update
          fetchAndStoreData().then((freshData) => {
            if (freshData) {
              setUserData(freshData);
            }
          });

        } else {
          const freshData = await fetchAndStoreData();
          if (freshData) {
            setUserData(freshData);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.PrimaryColor} />
      </View>
    );
  }

  if (!userData) {
    return <NoDataFound />;
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
        contentContainerStyle={styles.Profile_container}
      >
        {/* <Image
          source={userData?.profileImg ? { uri: userData.profileImg } : P_IMG}
          style={styles.profileImage}
        /> */}
       <Image  source={P_IMG}style={styles.profileImage}/>
        <Text style={styles.name}>{userData.Name}</Text>
        <Text style={styles.staffId}>Employee Code : {userData.EmployeeCode}</Text>
        <Text style={styles.company}>{userData.CompanyName || 'Al Wessil Holding'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoItem label="Email" value={userData.Email} />
          <InfoItem label="Phone" value={userData.MobilePhone || 'N/A'} />
          <InfoItem label="Date of Birth" value={formatDate(userData.BirthDate)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Info</Text>
          <InfoItem label="Department" value={userData.Department} />
          <InfoItem label="Position" value={userData.Title} />
          <InfoItem label="Dep Manager Name" value={userData.DepManagerName || 'N/A'} />
          {/* <InfoItem label="Work Location" value={userData.WorkLocation || 'N/A'} /> */}
          <InfoItem label="Joining Date" value={formatDate(userData.DateHired)} />
          <InfoItem label="Contract Expiry" value={userData.ContractEndDate || 'N/A'} />
          <InfoItem label="Status" value={userData.EmpStatus ? 'Active' : 'Inactive'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID Info</Text>
          <InfoItem label="Nationality" value={userData.Nationality} />
          <InfoItem label="Passport Number" value={userData.PassportNo || 'N/A'} />
          <InfoItem label="QID" value={userData.QID || 'N/A'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Overview</Text>
          <InfoItem label="Leave Taken" value={String(userData.Absence || 0)} />
          <InfoItem label="Leave Balance" value={String(Math.floor(userData.LeaveBalance || 0))} />
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
