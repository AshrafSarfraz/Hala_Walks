import React, { useEffect, useState } from 'react';
import { SafeAreaView,View,Image,Text,} from 'react-native';
import { Colors } from '../../../theme/Colors';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import { Contact_us, DocIcon, HistroyIcon, ProfileIcon, Show } from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languageData } from '../../../redux/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';

type AccountProps={
  navigation:any
}


const TenantsAccount:React.FC<AccountProps> = ({navigation}) => {
     const language = useSelector((state: RootState) => state.language.language);
      const styles = getStyles(language);
       const [userData, setUserData] = useState<any>(null);
      
      useEffect(() => {
        const fetchUserData = async () => {
          try {
            const storedUserData = await AsyncStorage.getItem('tenant_data');
            if (storedUserData) {
              setUserData(JSON.parse(storedUserData));
            }
          } catch (error) {
            console.log('Error fetching user data:', error);}};
    
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
         <Image source={{ uri:userData.profileImg }} style={styles.profileImage} />
          <Text style={styles.name}>{userData.name}</Text>
               <Text style={styles.staffId}>{userData.tenantId}</Text>
         </View>
         <View style={styles.Button_Cont} >
          <CustomButton2  title={languageData[language].Account_Info}   image={ProfileIcon} onPress={()=>{navigation.navigate('TenantsProfile')}} />
          <CustomButton2  title={languageData[language].Documents} image={DocIcon} onPress={()=>{navigation.navigate('TenantDocumentControlScreen')}} />
          <CustomButton2  title={languageData[language].Redeem_History}  image={HistroyIcon} onPress={()=>{navigation.navigate('TenantsHistroyScreen')}} />
          <CustomButton2  title={languageData[language].Contact_Us}  image={Contact_us} onPress={()=>{navigation.navigate('TenantsContactUs')}} />
         </View>
          <View style={styles.Logout_Cont} >
            <CustomButton title={languageData[language].logout} onPress={()=>{handleLogout(navigation)}}  />
          </View>

       </SafeAreaView>
    );
}



export default TenantsAccount;
