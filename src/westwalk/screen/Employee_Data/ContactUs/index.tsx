import PageLayout from '../../../components/PageLayout';
import React, {useState} from 'react';
import {View, ActivityIndicator, SafeAreaView, StatusBar} from 'react-native';

import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';

import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {getStyles} from './style';
import {languageData} from '../../../redux/language/languageSlice';
import {Colors} from '../../../theme/Colors';

const WebViewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  return (
    <PageLayout
      title={languageData[language].Contact_Us}
      onBackPress={() => navigation.goBack()}>
      <WebView
        source={{uri: 'https://loyalityprogram.com/contact_us_form_staff'}}
        startInLoadingState={true} // 👈 yeh zaroori hai
        onMessage={event => {
          const message = event.nativeEvent.data;
          if (message === 'navigate-to-some-screen') {
            navigation.goBack();
          }
        }}
        renderLoading={() => (
          <ActivityIndicator
            color={Colors.PrimaryColor}
            size="large"
            style={styles.loading}
          />
        )}
      />
    </PageLayout>
  );
};

export default WebViewScreen;
