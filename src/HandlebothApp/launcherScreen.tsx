// src/screens/LauncherScreen.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const LauncherScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button title="Open Halab Saudi" onPress={() => navigation.navigate('HalabStack')} />
      <Button title="Open Westwalk" onPress={() => navigation.navigate('WestwalkStack')} />
    </View>
  );
};

export default LauncherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
});
