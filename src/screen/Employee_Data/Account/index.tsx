import React, {useEffect, useState} from 'react';
import {
  SafeAreaView, View, Image,Text,
  StatusBar,
  Alert,} from 'react-native';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import {Contact_us, DocIcon, HistroyIcon, P_IMG, Phone, ProfileIcon, Show} from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { languageData } from '../../../redux/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';
import { Colors } from '../../../theme/Colors';
import NoDataFound from '../../../components/NoDataFound/No_data_found';

type AccountProps = {
  navigation: any;
};

const Account: React.FC<AccountProps> = ({navigation}) => {
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const [userData, setUserData] = useState<any>(null);
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('staff_data');
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
    <NoDataFound/>
    );
  }

  const handleLogout = async (navigation: any) => {
    try {
      await AsyncStorage.removeItem('staff_data');
      navigation.replace('Role');
    } catch (error) {
       console.log('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f4f4f4'}}>
      <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.PrimaryColor} barStyle={'light-content'} />
      <View style={styles.Header_Cont}>
        <Image  source={ userData?.profileImg ? { uri: userData.profileImg } : P_IMG}style={styles.profileImage}/>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.staffId}>{userData.staffId}</Text>
      </View>
      <View style={styles.Button_Cont}>
        <CustomButton2
          title={languageData[language].Account_Info}
          image={ProfileIcon}
          onPress={() => {
            Alert.alert('Waiting for Accessing the data from Hr System')
            // navigation.navigate('ProfileScreen');
          }}
        />
        <CustomButton2
          title={languageData[language].Documents}
          image={DocIcon}
          onPress={() => {
            navigation.navigate('StaffDocumentControlScreen');
          }}
        />
        <CustomButton2
          title={languageData[language].Redeem_History}
          image={HistroyIcon}
          onPress={() => {
            navigation.navigate('StaffHistroyScreen');
          }}
        />
        <CustomButton2
          title={languageData[language].Contact_Us}
          image={Contact_us}
          onPress={() => {
            navigation.navigate('StaffContactUs');
          }}
        />
        {/* <CustomButton2
          title={languageData[language].Directory}
          image={Phone}
          onPress={() => {
            navigation.navigate('PhoneDirectory');
          }}
        /> */}
      </View>
      <View style={styles.Logout_Cont}>
        <CustomButton
          title={languageData[language].logout}
          onPress={() => {
            handleLogout(navigation);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Account;
