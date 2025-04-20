import React, { useState } from 'react';
import { View,Text,Image,ScrollView, KeyboardAvoidingView,Platform, ImageBackground, TouchableOpacity, Alert,} from 'react-native';
import CustomDropdown from '../../../components/Role';
import EmployeeLogin from '../../../components/Logins/Westwalk_Staff';
import TenantsLogin from '../../../components/Logins/Tenant';
import BrandsLogin from '../../../components/Logins/Brands';
import CorporationLogin from '../../../components/Logins/Corporation';
import CustomButton from '../../../components/buttons/CustomButton';
import { West_NB } from '../../../theme/Images';
import { styles } from './style';



const LoginScreen = ({navigation}) => {
  const [userType, setUserType] = useState<'none' | 'staff' | 'tenant' | 'brands' | 'organization'>('none');


  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/images/image.png')}  style={{flex:1,width:'100%',height:"100%"}} > 
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={West_NB} style={styles.logo} resizeMode="contain" />
        
          {userType === 'none' && (
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Please select your role to login</Text>

            <Text style={styles.label}>Role</Text>
            <CustomDropdown selected={userType} onSelect={setUserType} />
            {userType === 'none' && (
               <TouchableOpacity style={styles.button} onPress={()=>{Alert.alert('Select Role')}} >
               <Text style={styles.buttonText}>Login</Text>
             </TouchableOpacity>
            )}
              </View>)}

            {userType !== 'none' && (
           <View>
             <Text style={styles.subtitle}>Enter your credentials to login</Text>
           <CustomDropdown selected={userType} onSelect={setUserType} />
            {userType === 'staff' && (
              <EmployeeLogin navigation={navigation} />
            )}
            {userType === 'tenant' && (
              <TenantsLogin  navigation={navigation} />
            )}
            {userType === 'brands' && (
              <BrandsLogin navigation={navigation} />
            )}
            {userType === 'organization' && (
              <CorporationLogin  navigation={navigation} />
            )}
            </View>
          )}
            
              
        
             
            
        </ScrollView>
      </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
