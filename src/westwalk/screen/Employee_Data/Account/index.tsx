import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Image, Text, StatusBar, ScrollView,} from 'react-native';
import CustomButton2 from '../../../components/buttons/CustomButton2';
import { Contact_us, DocIcon, HistroyIcon,P_IMG,Phone,ProfileIcon,} from '../../../theme/Images';
import CustomButton from '../../../components/buttons/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languageData } from '../../../redux/language/languageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';
import { Colors } from '../../../theme/Colors';
import NoDataFound from '../../../components/NoDataFound/No_data_found';
import { auth } from '../../../firebase/firebaseconfig';

type AccountProps = {
  navigation: any;
};

const Account: React.FC<AccountProps> = ({ navigation }) => {
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
    return <NoDataFound />;
  }

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('staff_data');
      navigation.replace('Role');
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.PrimaryColor}
        barStyle={'light-content'}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.Header_Cont}>
          <Image source={P_IMG} style={styles.profileImage} />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.staffId}>{userData.staffId}</Text>
        </View>

        <View style={styles.Button_Cont}>
          <CustomButton2
            title={languageData[language].Account_Info}
            image={ProfileIcon}
            onPress={() => navigation.navigate('ProfileScreen')}
          />
          <CustomButton2
            title={languageData[language].Documents}
            image={DocIcon}
            onPress={() => navigation.navigate('StaffDocumentControlScreen')}
          />
          <CustomButton2
            title={languageData[language].Redeem_History}
            image={HistroyIcon}
            onPress={() => navigation.navigate('StaffHistroyScreen')}
          />
          <CustomButton2
            title={languageData[language].Contact_Us}
            image={Contact_us}
            onPress={() => navigation.navigate('StaffContactUs')}
          />
          <CustomButton2
            title={languageData[language].Directory}
            image={Phone}
            onPress={() => navigation.navigate('PhoneDirectory')}
          />
        </View>

        {/* Logout button is now scrollable */}
        <View style={styles.Logout_Cont}>
          <CustomButton
            title={languageData[language].logout}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;
