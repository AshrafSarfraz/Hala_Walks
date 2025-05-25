import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StatusBar } from 'react-native';
import { styles } from './style';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('staff_data');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
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
      <CustomHeader title="Profile" onBackPress={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.Profile_container}
      >
        <Image source={{ uri: userData.profileImg }} style={styles.profileImage} />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.staffId}>Staff ID: {userData.staffId}</Text>
        <Text style={styles.company}>Company: {userData.company}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoItem label="Email" value={userData.email} />
          <InfoItem label="Phone" value={userData.phoneNumber} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Info</Text>
          <InfoItem label="Department" value={userData.department} />
          <InfoItem label="Position" value={userData.position} />
          <InfoItem label="Supervisor" value={userData.superVisor} />
          <InfoItem label="Work Location" value={userData.workLocation} />
          <InfoItem label="Joining Date" value={userData.joiningDate} />
          <InfoItem label="Contract Expiry" value={userData.contractExpiry} />
          <InfoItem label="Status" value={userData.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID Info</Text>
          <InfoItem label="Nationality" value={userData.nationality} />
          <InfoItem label="Visa Number" value={userData.visa || 'N/A'} />
          <InfoItem label="Passport Number" value={userData.passportNumber} />
          <InfoItem label="QID" value={userData.qid || 'N/A'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Overview</Text>
          <InfoItem label="Absences" value={userData.absences} />
          <InfoItem label="Pending Holidays" value={userData.pendingHoliday} />
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
