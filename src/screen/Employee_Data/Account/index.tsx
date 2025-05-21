import React from 'react';
import { SafeAreaView, StyleSheet, View,Image, Platform, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import { DocIcon, HistroyIcon, ProfileIcon, Show } from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';

type AccountProps={
  navigation:any
}


const Account:React.FC<AccountProps> = ({navigation}) => {
    return (
       <SafeAreaView style={{flex:1,backgroundColor:Colors.Bg}} >
         <View style={styles.Header_Cont} >
         <Image source={{ uri:'https://i.pravatar.cc/300' }} style={styles.profileImage} />
          <Text style={styles.name}>STAFF NAME</Text>
               <Text style={styles.staffId}>Staff ID: Ashraf07255</Text>
         </View>
         <View style={styles.Button_Cont} >
          <CustomButton2  title='Profile' image={ProfileIcon} onPress={()=>{navigation.navigate('ProfileScreen')}} />
          <CustomButton2  title='Document' image={DocIcon} onPress={()=>{navigation.navigate('StaffDocumentControlScreen')}} />
          <CustomButton2  title='Redeem History' image={HistroyIcon} onPress={()=>{navigation.navigate('StaffHistroyScreen')}} />
          <CustomButton2  title='Contact Us' image={HistroyIcon} onPress={()=>{navigation.navigate('StaffContactUs')}} />
         </View>
          <View style={styles.Logout_Cont} >
            <CustomButton title='Logout' onPress={()=>{navigation.navigate('Role')}}  />
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
        marginBottom:20,
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

export default Account;
