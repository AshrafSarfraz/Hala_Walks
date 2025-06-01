import React, {useEffect, useState} from 'react';
import {
  SafeAreaView, View, Image,Text,} from 'react-native';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import {DocIcon, HistroyIcon, ProfileIcon, Show} from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles} from './style';

type AccountProps = {
  navigation: any;
};

const Account: React.FC<AccountProps> = ({navigation}) => {
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
      <View style={{flex:1, justifyContent:'center', alignItems:"center"}}>
        <Text>Loading ....</Text>
      </View>
    );
  }

  const handleLogout = async (navigation: any) => {
    try {
      await AsyncStorage.removeItem('staff_data');
      navigation.navigate('Role');
    } catch (error) {
       console.log('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f4f4f4'}}>
      <View style={styles.Header_Cont}>
        <Image
          source={{uri: userData.profileImg}}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.staffId}>Staff ID: {userData.staffId}</Text>
      </View>
      <View style={styles.Button_Cont}>
        <CustomButton2
          title="Profile"
          image={ProfileIcon}
          onPress={() => {
            navigation.navigate('ProfileScreen');
          }}
        />
        <CustomButton2
          title="Document"
          image={DocIcon}
          onPress={() => {
            navigation.navigate('StaffDocumentControlScreen');
          }}
        />
        <CustomButton2
          title="Redeem History"
          image={HistroyIcon}
          onPress={() => {
            navigation.navigate('StaffHistroyScreen');
          }}
        />
        <CustomButton2
          title="Contact Us"
          image={HistroyIcon}
          onPress={() => {
            navigation.navigate('StaffContactUs');
          }}
        />
        <CustomButton2
          title="Directory"
          image={HistroyIcon}
          onPress={() => {
            navigation.navigate('PhoneDirectory');
          }}
        />
      </View>
      <View style={styles.Logout_Cont}>
        <CustomButton
          title="Logout"
          onPress={() => {
            handleLogout(navigation);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Account;
