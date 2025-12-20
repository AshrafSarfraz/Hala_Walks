// // SimpleQueryWebView.tsx
// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { WebView } from 'react-native-webview';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function SimpleQueryWebView() {
//   const [userId, setUserId] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUserId = async () => {
//       try {
//         const raw = await AsyncStorage.getItem('staff_data');
//         if (!raw) {
//           console.log('No user data found in AsyncStorage');
//           return;
//         }

//         const data = JSON.parse(raw);
//         console.log('User ID to send:', data.userId);
//         setUserId(data.userId);
//       } catch (error) {
//         console.log('Error fetching userId:', error);
//       }
//     };

//     fetchUserId();
//   }, []);

//   if (!userId) {
//     return (
//       <SafeAreaView  style={styles.center}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </SafeAreaView>
//     );
//   }

//   // const target = `http://localhost:5173/?userId=${encodeURIComponent(userId)}`;
//   const target = `https://al-wessilholding.com/app-redirect/?userId=${encodeURIComponent(userId)}`;

//   return (
//     <SafeAreaView edges={['top']} style={{ flex: 1,backgroundColor:"#31368A" }}>
//       <WebView source={{ uri: target }} style={{ flex: 1 }} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });



import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, BackHandler, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function SimpleQueryWebView() {
  const [userId, setUserId] = useState<string | null>(null);
  const webref = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const raw = await AsyncStorage.getItem('staff_data');
        if (!raw) return;
        const data = JSON.parse(raw);
        setUserId(data.userId);
      } catch (error) {
        console.log('Error fetching userId:', error);
      }
    };
    fetchUserId();
  }, []);

  // Android hardware back: web back if possible, else app back
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current) {
        webref.current?.goBack();
        return true; // handled by webview
      }
      // @ts-ignore
      navigation.goBack?.();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  if (!userId) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  // const target = `http://localhost:5173/app-redirect/?userId=${encodeURIComponent(userId)}&inApp=1`;
   const target = `https://al-wessilholding.com/app-redirect/?userId=${encodeURIComponent(userId)}&inApp=1`;


  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#31368A' }}>
      <WebView
        ref={webref}
        source={{ uri: target }}
        style={{ flex: 1 }}
        onNavigationStateChange={(nav) => {
          // @ts-ignore
          canGoBackRef.current = !!nav.canGoBack;
        }}
        // Intercept tel:/mailto:/whatsapp:/sms: if needed
        // onShouldStartLoadWithRequest={(req) => {
        //   const url = req.url || '';
        //   if (
        //     url.startsWith('tel:') ||
        //     url.startsWith('mailto:') ||
        //     url.startsWith('whatsapp:') ||
        //     url.startsWith('sms:')
        //   ) {
        //     // Linking.openURL(url).catch(() => {}); // enable if you want
        //     return false;
        //   }
        //   return true;
        // }}
        // Listen for "close" from the web and pop this screen
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data?.type === 'close') {
              // @ts-ignore
              navigation.goBack?.();
            }
          } catch {
            if (e.nativeEvent.data === 'close') {
              // @ts-ignore
              navigation.goBack?.();
            }
          }
        }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        mixedContentMode="compatibility"
        bounces={false}
        scalesPageToFit={Platform.OS === 'android' ? undefined : false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
