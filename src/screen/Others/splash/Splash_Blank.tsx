import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../theme/Colors';
import { fetch_OrgEmp_Data, fetch_Tenant_Data, fetchBrandsFromFirebase, fetchEventsFromFirebase, fetchFlatOfferFromFirebase } from '../../../firebase/firebaseutils';

type SplashBlankProps = {
  navigation: NativeStackNavigationProp<any>;
};


export const preloadAllData = async () => {
  await Promise.all([
    fetchBrandsFromFirebase(),
    fetchEventsFromFirebase(),
    fetchFlatOfferFromFirebase(),
  ]);
};
const Splash_Blank: React.FC<SplashBlankProps> = ({ navigation }) => {
  useEffect(() => {
    const init = async () => {
      await preloadAllData();
      navigation.navigate('SplashScreen'); // ⏩ go to next screen
    };

    init();
  }, [navigation]);

  return (
    <View style={styles.Main_Container}>
      <StatusBar hidden={true} translucent={true} animated={true} />
    </View>
  );
};

export default Splash_Blank;

const styles = StyleSheet.create({
  Main_Container: {
    flex: 1,
    backgroundColor: Colors.PrimaryColor,
  },
});
