import React from 'react';
import { View, Text,  Image, ScrollView } from 'react-native';
import { styles } from './style';

type UserProfile = {
  name: string;
  staffId: string;
  company: string;
  imageUrl: string;
  absences: number;
  pendingHolidays: number;
  email: string;
  phone: string;
  department: string;
  position: string;
  nationality: string;
  visaNumber: string;
  passportNumber: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  location: string;
  joiningDate: string;
  contractExpiry: string;
  supervisor: string;
};

const user: UserProfile = {
  name: 'John Doe',
  staffId: 'EMP123456',
  company: 'ABC Properties',
  imageUrl: 'https://i.pravatar.cc/300',
  absences: 4,
  pendingHolidays: 10,
  email: 'john.doe@example.com',
  phone: '+123 456 7890',
  department: 'Maintenance',
  position: 'Senior Technician',
  nationality: 'Indian',
  visaNumber: 'VISA987654321',
  passportNumber: 'P123456789',
  status: 'Active',
  location: 'West Walk Tower B',
  joiningDate: '2020-03-15',
  contractExpiry: '2025-03-14',
  supervisor: 'Mr. Smith',
};

const ProfileScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.staffId}>Staff ID: {user.staffId}</Text>
      <Text style={styles.company}>Company: {user.company}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <InfoItem label="Email" value={user.email} />
        <InfoItem label="Phone" value={user.phone} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Info</Text>
        <InfoItem label="Department" value={user.department} />
        <InfoItem label="Position" value={user.position} />
        <InfoItem label="Supervisor" value={user.supervisor} />
        <InfoItem label="Work Location" value={user.location} />
        <InfoItem label="Joining Date" value={user.joiningDate} />
        <InfoItem label="Contract Expiry" value={user.contractExpiry} />
        <InfoItem label="Status" value={user.status} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ID Info</Text>
        <InfoItem label="Nationality" value={user.nationality} />
        <InfoItem label="Visa Number" value={user.visaNumber} />
        <InfoItem label="Passport Number" value={user.passportNumber} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leave Overview</Text>
        <InfoItem label="Absences" value={user.absences.toString()} />
        <InfoItem label="Pending Holidays" value={user.pendingHolidays.toString()} />
      </View>
    </ScrollView>
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
