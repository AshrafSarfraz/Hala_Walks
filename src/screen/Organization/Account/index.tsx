import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View,Image, Platform, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Colors } from '../../../theme/Colors';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import {  HistroyIcon,P_IMG, } from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';
import { languageData } from '../../../redux/language/languageSlice';

type AccountProps={
  navigation:any
}


const CorporationAccount:React.FC<AccountProps> = ({navigation}) => {
  const [userData, setUserData] = useState<any>(null);
  const language = useSelector((state: RootState) => state.language.language);
   const styles = getStyles(language);
      
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
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const handleLogout = async (navigation: any) => {
    try {
      await AsyncStorage.removeItem('org_emp_data'); // or AsyncStorage.clear()
      navigation.navigate('Role');
    } catch (error) {
      console.log('Error during logout:', error);
    }}
    

  
    return (
       <SafeAreaView style={{flex:1,backgroundColor:Colors.Bg}} >
            <StatusBar hidden={false} translucent={true} animated={true} barStyle={'light-content'} />
         <View style={styles.Header_Cont} >
         {userData?.profileImg ? (
       <Image   source={{ uri: userData.profileImg }}style={styles.profileImage}/>) : (
       <Image source={P_IMG} style={styles.profileImage} />)}

          <Text style={styles.name}>{userData.name}</Text>
               <Text style={styles.staffId}>{userData.empId}</Text>
         </View>
         <View style={styles.Button_Cont} >
          {/* <CustomButton2  title='Account Info' image={ProfileIcon} onPress={()=>{navigation.navigate('CorporationProfile')}} /> */}
          <CustomButton2  title={languageData[language].Redeem_History} image={HistroyIcon} onPress={()=>{navigation.navigate('CorporationHistroyScreen')}} />
         </View>
          <View style={styles.Logout_Cont} >
            <CustomButton title={languageData[language].logout} onPress={()=>handleLogout(navigation)}  />
          </View>

       </SafeAreaView>
    );
}



export default CorporationAccount;
