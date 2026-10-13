import PageLayout from '../../../components/PageLayout';
import Avatar from '../../../components/Avatar';
import {memberName, memberPhoto} from '../../../utils/member';
import {Text} from '../../../components/Text';
import React, {useEffect, useState} from 'react';
import {View, Image, ScrollView, StatusBar} from 'react-native';
import {styles} from './style';
import {Colors} from '../../../theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoDataFound from '../../../components/NoDataFound/No_data_found';

const CorporationProfile: React.FC<{navigation: any}> = ({navigation}) => {
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
      <PageLayout title="Profile" onBackPress={() => navigation.goBack()}>
        <NoDataFound />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile" onBackPress={() => navigation.goBack()}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Avatar
            name={memberName(userData)}
            uri={memberPhoto(userData)}
            size={72}
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
    </PageLayout>
  );
};

export default CorporationProfile;
