import React from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';

import { WebView } from 'react-native-webview';
import CustomHeader from '../../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';

import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';
import { languageData } from '../../../redux/language/languageSlice';

const WebViewScreen = () => {
  const navigation=useNavigation()
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader title={languageData[language].Contact_Us} onBackPress={()=>{navigation.goBack()}} />
        <WebView
          source={{ uri: 'https://loyalityprogram.com/contact_us_form_staff' }} // ← replace with your IP
          startInLoadingState={true}
          
          onMessage={(event) => {
            const message = event.nativeEvent.data;
            if (message === 'navigate-to-some-screen') {
              navigation.goBack(); // or any screen you want
            }
          }}

          // renderLoading={() => (
          //   <ActivityIndicator
          //     color="#009688"
          //     size="large"
          //     style={styles.loading}
          //   />
          // )}
        />
      </View>
    </SafeAreaView>
  );
};

export default WebViewScreen;

