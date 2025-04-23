import React from 'react';
import { View, Text, Image, ScrollView, StatusBar } from 'react-native';
import { styles } from './style';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';

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

const tenant: TenantProfile = {
  name: 'Ahmed Ali',
  qid: 'QID12345678',
  mobile: '+974 5555 1234',
  email: 'ahmed.ali@example.com',
  nationality: 'Pakistani',
  dateOfBirth: '1992-06-10',
  roomNumber: 'A-204',
  unitNumber: 'U14',
  buildingName: 'West Walk Tower B',
  tower: 'B',
  checkInDate: '2022-01-10',
  contractStart: '2022-01-10',
  contractEnd: '2025-01-09',
  numberOfOccupants: 2,
  emergencyContactName: 'Zeeshan Khan',
  emergencyContactNumber: '+974 6666 4321',
  profileImage: 'https://i.pravatar.cc/300',
  contractFileUrl: 'https://example.com/contract.pdf',
  status: 'Active',
};

const TenantsProfile: React.FC<{ navigation: any }> = ({ navigation }) => {
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
        <Image source={{ uri: tenant.profileImage }} style={styles.profileImage} />
        <Text style={styles.name}>{tenant.name}</Text>
        <Text style={styles.staffId}>QID: {tenant.qid}</Text>
        <Text style={styles.company}>Status: {tenant.status}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Info</Text>
          <InfoItem label="Mobile" value={tenant.mobile} />
          {tenant.email && <InfoItem label="Email" value={tenant.email} />}
          {tenant.dateOfBirth && <InfoItem label="Date of Birth" value={tenant.dateOfBirth} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Residence Info</Text>
          <InfoItem label="Room Number" value={tenant.roomNumber} />
          <InfoItem label="Unit Number" value={tenant.unitNumber} />
          <InfoItem label="Building" value={tenant.buildingName} />
          {tenant.tower && <InfoItem label="Tower" value={tenant.tower} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Info</Text>
          <InfoItem label="Check-In Date" value={tenant.checkInDate} />
          <InfoItem label="Contract Start" value={tenant.contractStart} />
          <InfoItem label="Contract End" value={tenant.contractEnd} />
          <InfoItem label="Occupants" value={tenant.numberOfOccupants.toString()} />
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
