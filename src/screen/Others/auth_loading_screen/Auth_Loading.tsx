import React, { useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
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

      let targetScreen = 'SplashScreen';
      if (staffData) targetScreen = 'EmployeeTab';
      else if (tenantData) targetScreen = 'TenantsTab';
      else if (orgEmpData) targetScreen = 'CorporationTab';

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: targetScreen }],
        })
      );
    };

    checkUserType().catch((error) => {
      console.error('Error checking user type:', error);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SplashScreen' }],
        })
      );
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.PrimaryColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
};

export default AuthLoadingScreen;
