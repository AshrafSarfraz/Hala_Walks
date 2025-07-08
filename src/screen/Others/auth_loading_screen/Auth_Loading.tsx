import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/Colors';

const AuthLoadingScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkUserType = async () => {
      const [staffData, tenantData, orgEmpData] = await Promise.all([
        AsyncStorage.getItem('staff_data'),
        AsyncStorage.getItem('tenant_data'),
        AsyncStorage.getItem('org_emp_data'),
      ]);

      if (staffData) {
        navigation.replace('EmployeeTab');
      } else if (tenantData) {
        navigation.replace('TenantsTab');
      } else if (orgEmpData) {
        navigation.replace('CorporationTab');
      } else {
        navigation.replace('SplashScreen');
      }
    };

    checkUserType().catch((error) => {
      console.error('Error checking user type:', error);
      navigation.replace('SplashScreen');
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.PrimaryColor, justifyContent: 'center', alignItems: 'center' }}>
    </View>
  );
};

export default AuthLoadingScreen;
