import React, { useEffect, useState } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash_Screen from '../../Screen/Authentication/Splash/SplashScreen';
import OnBoarding from '../../Screen/OnBoarding';
import Home from '../../Screen/Home';
import Login from '../../Screen/Authentication/Login';
import Bottom from '../BottomNav/Bottom_Navigation';
import Otp from '../../Screen/Authentication/EnterOtp';
import SearchScreen from '../../Screen/SearchScreen';
import DetailScreen from '../../Screen/detail_Screen';
import Reedem_His from '../../Screen/Reedem_Histroy';
import SelectedCategories from '../../Screen/selected_categories';
import SelectedVenues from '../../Screen/selected_venues';
import auth from '@react-native-firebase/auth';
import AccountScreen from '../../Screen/AccountScreen';
import PDFViewerScreen from '../../Screen/pdfViewer';
import HalaInfoScreen from '../../Screen/Merchant_Screen/Hala_Info';
import BrandFormScreen from '../../Screen/Merchant_Screen/PartnerForm';
import WelcomeScreen from '../../Screen/Authentication/Splash/welcome_screen';
import SignuP from '../../Screen/Authentication/SignUp/signUp';
import StackNavigation from '../../../westwalk/navigation/stackNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HrSystem from '../../../westwalk/screen/Employee_Data/Leave Apply';




type SplashScreenProps = {
  navigation?: any;
}

const Stack = createNativeStackNavigator();

const HalaStack: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      const halaData = await AsyncStorage.getItem('hala_user'); // Hala ke liye alag key
      const unsubscribe = auth().onAuthStateChanged(user => {
        if (user && halaData) {
          setInitialRoute('BottomTab'); // Hala user logged in
        } else {
          setInitialRoute('Splash'); // Hala user nahi hai
        }
      });
  
      return unsubscribe;
    };
  
    checkInitialRoute();
  }, []);
  

  // useEffect(() => {
  //   const unsubscribe = auth().onAuthStateChanged(user => {
  //     console.log("USER:", user); // Debug: check user
  //     if (user) {
  //       setInitialRoute('BottomTab'); // User is logged in
  //     } else {
  //       setInitialRoute('Splash'); // User not logged in
  //     }
  //   });

  //   return unsubscribe; // Cleanup
  // }, []);

  if (!initialRoute) {
    // Auth status still checking – show splash or loader
    return <Splash_Screen  />;
  }

  return (
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Splash' component={Splash_Screen} />
        <Stack.Screen name='WelcomeScreen' component={WelcomeScreen} />
        <Stack.Screen name="WestwalkStack" component={StackNavigation} />
        <Stack.Screen name='Onboarding' component={OnBoarding} />
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='SignUp' component={SignuP} />
        <Stack.Screen name='OTP' component={Otp} />
        <Stack.Screen name='BottomTab' component={Bottom} />
        <Stack.Screen name='Home' component={Home} />
        <Stack.Screen name='SearchScreen' component={SearchScreen} />
        <Stack.Screen name='DetailScreen' component={DetailScreen} />
        <Stack.Screen name='ReedemHistroy' component={Reedem_His} />
        <Stack.Screen name='CategoriesScreen' component={SelectedCategories} />
        <Stack.Screen name='SelectedVenue' component={SelectedVenues} />
        <Stack.Screen name='AccountScreen' component={AccountScreen} />
        <Stack.Screen name='PDFViewerScreen' component={PDFViewerScreen} />

        {/* Merchant Side */}
        <Stack.Screen name='HalaInfo' component={HalaInfoScreen} />
        <Stack.Screen name='PartnerForm' component={BrandFormScreen} />
        {/* <Stack.Screen name='RBSHEET' component={FilterScreen} />
         */}
        
      </Stack.Navigator>
  );
};

export default HalaStack;
