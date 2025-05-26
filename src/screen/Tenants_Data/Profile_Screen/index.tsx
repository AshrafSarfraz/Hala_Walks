import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StatusBar } from 'react-native';
import { styles } from './style';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TenantProfile = {
  name: string;
  qid: string;
  mobile: string;
  email?: string;
  nationality: string;
  dateOfBirth?: string;

  roomNumber: string;
  unitNumber: string;
  buildingName: string;
  tower?: string;

  checkInDate: string;
  contractStart: string;
  contractEnd: string;

  numberOfOccupants: number;
  emergencyContactName?: string;
  emergencyContactNumber?: string;

  profileImage?: string;
  contractFileUrl?: string;
  status: 'Active' | 'Moved Out' | 'Notice Given';
};



const TenantsProfile: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('tenant_data');
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
        translucent
        animated
        backgroundColor={Colors.Bg}
        barStyle="dark-content"
      />
      <CustomHeader title="Tenant Profile" onBackPress={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.Profile_container}
      >
          <Image source={{ uri: userData.profileImg }} style={styles.profileImage} />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.staffId}>QID: {userData.qid}</Text>
        <Text style={styles.company}>Status: {userData.status}</Text>
        

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Info</Text>
          <InfoItem label="Mobile" value={userData.phoneNumber} />
          <InfoItem label="Nationality" value={userData.nationality} />
          {userData.email && <InfoItem label="Email" value={userData.email} />}
          {userData.dateOfBirth && <InfoItem label="Date of Birth" value={userData.dateOfBirth} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Residence Info</Text>

          <InfoItem label="Category" value={userData.tenantCategory} />
          <InfoItem label="Room Number" value={userData.roomNumber} />
          <InfoItem label="Unit Number" value={userData.unitNumber} />
          <InfoItem label="Building" value={userData.buildingNo} />
          {userData.tower && <InfoItem label="Tower" value={userData.tower} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Info</Text>
          <InfoItem label="Contract Start" value={userData.joiningDate} />
          <InfoItem label="Contract End" value={userData.contractExpiry} />
        <InfoItem label="Occupants" value={userData.occupants} />
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

export default TenantsProfile;
