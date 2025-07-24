import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import CustomButton2 from '../../Component/CustomButton/CustomButton2';
import CustomButton from '../../Component/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import LanguageModal from '../../Component/CustomAlert/Lan_Modal';
import { styles } from './style';
import { Colors } from '../../Themes/Colors';

type ProfileProps={
    navigation:any
}

const Profile:React.FC<ProfileProps> = () => {
   const navigation=useNavigation()
   const [alertVisible, setAlertVisible] = useState<boolean>(false);
    
  const showAlert = () => {
  setAlertVisible(true)};
   
  const hideAlert = () => {
  setAlertVisible(false);  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      console.log('User signed out!');
      navigation.navigate('Login')
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Bg }}>
               <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />

       <View style={styles.Container} >
            <Text style={styles.Header_Txt} >Profile</Text>
            <View style={styles.Button_Cont} >
              <CustomButton2 title='Account' onPress={() =>{navigation.navigate('AccountScreen')} } />
              <CustomButton2 title='Reedem Histroy' onPress={() => {navigation.navigate('ReedemHistroy')}} />
              <CustomButton2 title='Language' onPress={() =>{showAlert()}} />
            </View>
            <View style={styles.Logout_cont}>
            <CustomButton title='Logout' onPress={() => {handleLogout()}} />
            </View>
        </View>
        <LanguageModal
        visible={alertVisible}
        onClose={() => { hideAlert() }}
      />
        </SafeAreaView>
    );
}


export default Profile;
