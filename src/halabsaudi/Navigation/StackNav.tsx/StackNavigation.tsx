import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import AccountScreen from '../../Screen/AccountScreen';
import PDFViewerScreen from '../../Screen/pdfViewer';
import HalaInfoScreen from '../../Screen/Merchant_Screen/Hala_Info';
import BrandFormScreen from '../../Screen/Merchant_Screen/PartnerForm';
import WelcomeScreen from '../../Screen/Authentication/Splash/welcome_screen';
import SignuP from '../../Screen/Authentication/SignUp/signUp';

import StackNavigation from '../../../westwalk/navigation/stackNavigation'; // agar Westwalk ka stack chahiye
import NotificationTestScreen from './NotificationTestScreen';


const Stack = createNativeStackNavigator();

const HalaStack: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // AsyncStorage se login status check
        const halaData = await AsyncStorage.getItem('hala_user');
        const token = await AsyncStorage.getItem('hala_token');

        if (halaData === 'true' && token) {
          // user pehle se login hai → direct BottomTab
          setInitialRoute('BottomTab');
        } else {
          // koi login nahi → Splash / onboarding etc
          setInitialRoute('Splash');
        }
      } catch (e) {
        console.log('Error reading login state', e);
        setInitialRoute('Splash');
      }
    };

    checkInitialRoute();
  }, []);


  // jab tak initialRoute decide nahi hua, Splash dikha do
  if (!initialRoute) {
    return <Splash_Screen />;
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
        <Stack.Screen name="NotificationTest" component={NotificationTestScreen} />
        {/* <Stack.Screen name='RBSHEET' component={FilterScreen} />
         */}
        
      </Stack.Navigator>
  );
};

export default HalaStack;
