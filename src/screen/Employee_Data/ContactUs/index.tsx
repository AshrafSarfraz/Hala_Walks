import React from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';

import { WebView } from 'react-native-webview';
import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { styles } from './style';

const WebViewScreen = () => {
  const navigation=useNavigation()
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader title='Contact us' onBackPress={()=>{navigation.goBack()}} />
        <WebView
          source={{ uri: 'http://localhost:5173/staff-contact-us' }} // ← replace with your IP
          startInLoadingState={true}
          
          onMessage={(event) => {
            const message = event.nativeEvent.data;
            if (message === 'navigate-to-some-screen') {
              navigation.goBack(); // or any screen you want
            }
          }}

          renderLoading={() => (
            <ActivityIndicator
              color="#009688"
              size="large"
              style={styles.loading}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default WebViewScreen;

