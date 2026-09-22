import {ActivityIndicator} from '../../../../ui/ActivityIndicator';
import React, { useState } from 'react';
import {SafeAreaView, View} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import { styles } from './style';
import { Colors } from '../../../Themes/Colors';



const WebViewScreen:React.FC<{navigation: import('@react-navigation/native').NavigationProp<import('@react-navigation/native').ParamListBase>}>= ({navigation}) => {
  const [showHeader, setShowHeader] = useState(true); // Header visibility state
  const [loading, setLoading] = useState(true);

  const handleWebViewMessage = (event: import('react-native-webview').WebViewMessageEvent) => {
    const message = event.nativeEvent.data;

    if (message === 'HIDE_HEADER') {
      setShowHeader(false);
    } else if (message === 'SHOW_HEADER') {
      setShowHeader(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.Body} >

    {showHeader && (
          <CustomHeader title="Register Your Brand" onBackPress={() => navigation.goBack()}
            textColor={Colors.White} iconColor={Colors.White} backgroundColor={Colors.darkgrey} />
        )}
      <WebView 
        source={{ uri: 'https://halab-saudi.vercel.app/AddBrand/12652154214641264521465124xxp1' }} 
        style={styles.webview}
        startInLoadingState
        // onLoadStart={() => setLoading(true)}
        // onLoadEnd={() => setLoading(false)}
        onMessage={handleWebViewMessage}
        showsVerticalScrollIndicator={false}
      />
      </View>
    </SafeAreaView>
  );
};



export default WebViewScreen; 

// https://halab-saudi.vercel.app/AddBrand/12652154214641264521465124xxp1
// http://localhost:5174/AddBrand/12652154214641264521465124xxp1