import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View,Image, Platform, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import { DocIcon, HistroyIcon, ManIcon, P_IMG, ProfileIcon, Show, West_Icon } from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountProps={
  navigation:any
}


const CorporationAccount:React.FC<AccountProps> = ({navigation}) => {
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
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const handleLogout = async (navigation: any) => {
    try {
      await AsyncStorage.removeItem('tenant_data'); // or AsyncStorage.clear()
      navigation.navigate('Role');
    } catch (error) {
      console.log('Error during logout:', error);
    }}
    

  
    return (
       <SafeAreaView style={{flex:1,backgroundColor:Colors.Bg}} >
         <View style={styles.Header_Cont} >
         {userData?.profileImg ? (
       <Image   source={{ uri: userData.profileImg }}style={styles.profileImage}/>) : (
       <Image source={P_IMG} style={styles.profileImage} />)}

          <Text style={styles.name}>{userData.name}</Text>
               <Text style={styles.staffId}>{userData.empId}</Text>
         </View>
         <View style={styles.Button_Cont} >
          <CustomButton2  title='Account Info' image={ProfileIcon} onPress={()=>{navigation.navigate('CorporationProfile')}} />
          <CustomButton2  title='Redeem History' image={HistroyIcon} onPress={()=>{navigation.navigate('CorporationHistroyScreen')}} />
         </View>
          <View style={styles.Logout_Cont} >
            <CustomButton title='Logout' onPress={()=>handleLogout(navigation)}  />
          </View>

       </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Header_Cont:{
        width:'100%',
        height:Platform.OS==='ios'?300:270,
        backgroundColor:Colors.PrimaryColor,
        justifyContent:"flex-end",
        alignItems:"center",
        borderBottomLeftRadius:30,
        borderBottomRightRadius:30,

    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom:14,
      },
      name: {
        fontSize: 20,
        color: '#fff',
        lineHeight:26,
        fontFamily:Fonts.F_Bold
      },
      staffId: {
        fontSize: 14,
        color: '#fff',
        marginVertical: 4,
        lineHeight:18,
        fontFamily:Fonts.F_Medium,
        marginBottom: 40,
      },
      Button_Cont:{
        marginVertical:20
      },
      Logout_Cont:{
        width:'92%',
        alignSelf:"center",
        position:"absolute",
        bottom:40
      }
})

export default CorporationAccount;
