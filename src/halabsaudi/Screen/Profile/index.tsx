import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import CustomButton2 from '../../Component/CustomButton/CustomButton2';
import CustomButton from '../../Component/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import LanguageModal from '../../Component/CustomAlert/Lan_Modal';

import { Colors } from '../../Themes/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';

type ProfileProps={
    navigation:any
}

const Profile:React.FC<ProfileProps> = () => {
   const navigation=useNavigation()
   const [alertVisible, setAlertVisible] = useState<boolean>(false);
   const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
   const styles = getStyles(language);
  
    
  const showAlert = () => {
  setAlertVisible(true)};
   
  const hideAlert = () => {
  setAlertVisible(false);  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeScreen' }],
      });
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Bg }}>
               <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.Bg} barStyle='dark-content' />

       <View style={styles.Container} >
            <Text style={styles.Header_Txt} >{languageData[language].Profile}</Text>
            <View style={styles.Button_Cont} >
              <CustomButton2 title={languageData[language].account} onPress={() =>{navigation.navigate('AccountScreen')} } />
              <CustomButton2 title={languageData[language].redeem_history} onPress={() => {navigation.navigate('ReedemHistroy')}} />
                <CustomButton2 title={languageData[language].Wishlist} onPress={() => {navigation.navigate('Wishlist')}} />
              <CustomButton2 title={languageData[language].language} onPress={() =>{showAlert()}} />
            </View>
            <View style={styles.Logout_cont}>
            <CustomButton title={languageData[language].logout} onPress={() => {handleLogout()}} />
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
