import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../theme/Colors';
import { WhiteLogo } from '../../../theme/Images';



type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const Splash_Screen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.Main_Container}>
        <StatusBar hidden={true} translucent={true} animated={true} />
      <View style={styles.Body}>
        <Image source={require('../../../assets/images/Splash2.png')} style={styles.Logo_Img} />
      </View>

    </View>
  );
};

export default Splash_Screen;

const styles = StyleSheet.create({
  Main_Container: {
    flex: 1,
    backgroundColor: Colors.PrimaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  Logo_Img: {
     height:'100%',
     width:'100%',
  },

  
});