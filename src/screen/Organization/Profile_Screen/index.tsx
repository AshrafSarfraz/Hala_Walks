import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StatusBar } from 'react-native';
import { styles } from './style';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { P_IMG } from '../../../theme/Images';

const CorporationProfile: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('org_emp_data');
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
        <Text style={styles.loadingText}>Loading profile...</Text>
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
      <CustomHeader title="Employee Profile" onBackPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Image
            source={userData.profileImage ? { uri: userData.profileImage } : P_IMG}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.label}>Employee ID</Text>
          <Text style={styles.value}>{userData.empId}</Text>
          <Text style={styles.label}>QID</Text>
          <Text style={styles.value}>{userData.qid}</Text>
          <Text style={styles.label}>Organization</Text>
          <Text style={styles.value}>{userData.companyName}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default CorporationProfile;
