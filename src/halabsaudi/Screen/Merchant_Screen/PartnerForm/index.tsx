import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, View, } from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import { styles } from './style';



const WebViewScreen:React.FC= ({navigation}) => {
  const [showHeader, setShowHeader] = useState(true); // Header visibility state
  const [loading, setLoading] = useState(true);

  const handleWebViewMessage = (event) => {
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
    {/* {loading && (
        <ActivityIndicator
          size="large"
          color="#005029"  // Your custom color here
          style={styles.loader}
        />
      )} */}
    {showHeader && (
          <CustomHeader title="Register Your Brand" onBackPress={() => navigation.goBack()} />
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