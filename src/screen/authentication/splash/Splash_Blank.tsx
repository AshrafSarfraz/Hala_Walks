import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../theme/Colors';


type SplashBlankProps = {
  navigation: NativeStackNavigationProp<any>;
};

const Splash_Blank: React.FC<SplashBlankProps> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.navigate('SplashScreen');
    }, 1000);
    return () => clearTimeout(timeout);
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
