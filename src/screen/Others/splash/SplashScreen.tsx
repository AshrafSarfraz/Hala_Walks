import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../theme/Colors';



type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const Splash_Screen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.navigate('onBoarding');
    }, 2000);
    return () => clearTimeout(timeout);
  }, [navigation]);
 
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const staffData = await AsyncStorage.getItem('staff_data');
        const tenantData = await AsyncStorage.getItem('tenant_data');
        const orgEmpData = await AsyncStorage.getItem('org_emp_data');

        if (staffData) {
          navigation.replace('EmployeeTab');
        } else if (tenantData) {
          navigation.replace('TenantsTab');
        } else if (orgEmpData) {
          navigation.replace('CorporationTab');
        } else {
          const timeout = setTimeout(() => {
            navigation.navigate('onBoarding');
          }, 2000);
          return () => clearTimeout(timeout);
        }
      } catch (error) {
        console.error('Error reading storage:', error);
        navigation.replace('Role');
      }
    };

    checkUserType();
  }, []);



  return (
    <View style={styles.Main_Container}>
        <StatusBar hidden={true} translucent={true} animated={true} />
      <View style={styles.Body}>
        <Image source={require('../../../assets/images/Splash2.png')} style={styles.Logo_Img} />
      </View>

    </View>
  );
};

export default Splash_Screen;

const styles = StyleSheet.create({
  Main_Container: {
    flex: 1,
    backgroundColor: Colors.PrimaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  Logo_Img: {
     height:'100%',
     width:'100%',
  },

  
});