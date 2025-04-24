import React from 'react';
import { View, Text, Image, ScrollView, StatusBar } from 'react-native';
import { styles } from './style';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';

type CorporationEmployeeProfile = {
  name: string;
  qid: string;
  id: string;
  role: string;
  organizationName: string;
  profileImage?: string;
  status: 'Active' | 'Inactive' | 'Pending';
};

const employee: CorporationEmployeeProfile = {
  name: 'Ahmed Ali',
  qid: 'QID12345678',
  id: 'EMP00123',
  role: 'Sales Manager',
  organizationName: 'Qatar Enterprises',
  profileImage: 'https://i.pravatar.cc/300',
  status: 'Active',
};

const CorporationProfile: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.Bg}
        barStyle="dark-content"
      />
      <CustomHeader title="Employee Profile" onBackPress={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.Profile_container}
      >
        <Image source={{ uri: employee.profileImage }} style={styles.profileImage} />
        <Text style={styles.name}>{employee.name}</Text>
        <Text style={styles.staffId}>ID: {employee.id}</Text>
        <Text style={styles.staffId}>QID: {employee.qid}</Text>
        <Text style={styles.company}>Organization: {employee.organizationName}</Text>
        <Text style={styles.company}>Role: {employee.role}</Text>
        <Text style={styles.company}>Status: {employee.status}</Text>
      </ScrollView>
    </View>
  );
};

export default CorporationProfile;
