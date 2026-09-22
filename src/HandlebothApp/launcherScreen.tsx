import {Text} from '../ui/Text';

import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

const LauncherScreen = ({ navigation }: {navigation: import('@react-navigation/native').NavigationProp<import('@react-navigation/native').ParamListBase>}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select App</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HalabStack')}>
        <Text style={styles.buttonText}>Go to Hala B Saudi</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('WestwalkStack')}>
        <Text style={styles.buttonText}>Go to Westwalk</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LauncherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#191B20'
  },
  title: {
    fontSize: 22, marginBottom: 30
  },
  button: {
    backgroundColor: '#333', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, marginVertical: 10
  },
  buttonText: {
    color: '#fff', fontSize: 16
  }
});
