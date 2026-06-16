import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
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

import PDFViewerScreen from '../../Screen/pdfViewer';
import HalaInfoScreen from '../../Screen/Merchant_Screen/Hala_Info';
import BrandFormScreen from '../../Screen/Merchant_Screen/PartnerForm';
import WelcomeScreen from '../../Screen/Authentication/Splash/welcome_screen';
import SignuP from '../../Screen/Authentication/SignUp/signUp';

import StackNavigation from '../../../westwalk/navigation/stackNavigation';
import NotificationTestScreen from './NotificationTestScreen';
import LocationDisclosure from '../../Screen/LocationDisclosureScreen';
import StartChatScreen from '../../chat/startChatScreen';
import ChatScreen from '../../chat/chatScreen';
import BlockedUsers from '../../chat/BlockedUsers';
import UserProfileScreen from '../../chat/UserProfileScreen';
import EditAccountScreen from '../../Screen/UserAccount/EditAccount';
import AllMediaScreen from '../../chat/AllMediaScreen';
import ImagePreviewScreen from '../../chat/components/ImagePreviewScreen';

import MapProfile from '../../Map/profileScreen';
import MapCaptureScreen from '../../Map/capture';
import Wishlist from '../../Screen/Wishlist';

// ── Timeline screen import ────────────────────────────────────────────────────
// Ye wo screen hai jo tab bar ke centre + button se open hogi.
// Agar tumhari Timeline screen kisi aur path pe hai toh path adjust karo.
import TimelineScreen from '../../Screen/Timeline';

const Stack = createNativeStackNavigator();

const HalaStack: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const halaData = await AsyncStorage.getItem('hala_user');
        const token = await AsyncStorage.getItem('hala_token');

        if (halaData === 'true' && token) {
          setInitialRoute('BottomTab');
        } else {
          setInitialRoute('Onboarding');
        }
      } catch (e) {
        console.log('Error reading login state', e);
        setInitialRoute('Splash');
      }
    };

    checkInitialRoute();
  }, []);

  if (!initialRoute) {
    return <Splash_Screen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{headerShown: false}}>
      {/* ── Auth & Onboarding ── */}
      <Stack.Screen name="Splash" component={Splash_Screen} />
      <Stack.Screen name="LocationDisclosure" component={LocationDisclosure} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="WestwalkStack" component={StackNavigation} />
      <Stack.Screen name="Onboarding" component={OnBoarding} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignuP} />
      <Stack.Screen name="OTP" component={Otp} />

      {/* ── Main app (bottom tabs) ── */}
      <Stack.Screen name="BottomTab" component={Bottom} />

      {/*
       * ── Timeline Modal ────────────────────────────────────────────────────
       *
       * presentation: 'modal'  → iOS pe neeche se slide up hoga
       * gestureEnabled: true   → swipe down se band ho jaayega
       *
       * Tab bar ke centre button se kisi bhi tab pe ye screen khulti hai:
       *   navigation.navigate('Timeline')
       *
       * Band karne ke liye Timeline screen ke andar:
       *   navigation.goBack()
       */}
      <Stack.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          headerShown: false,
        }}
      />

      {/* ── App screens ── */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
      <Stack.Screen name="ReedemHistroy" component={Reedem_His} />
      <Stack.Screen name="CategoriesScreen" component={SelectedCategories} />
      <Stack.Screen name="SelectedVenue" component={SelectedVenues} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="PDFViewerScreen" component={PDFViewerScreen} />
      <Stack.Screen name="Wishlist" component={Wishlist} />

      {/* ── Chat ── */}
      <Stack.Screen name="StartChatScreen" component={StartChatScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="AllMediaScreen" component={AllMediaScreen} />
      <Stack.Screen
        name="ImagePreview"
        component={ImagePreviewScreen}
        options={{headerShown: false, presentation: 'fullScreenModal'}}
      />

      {/* ── Merchant ── */}
      <Stack.Screen name="HalaInfo" component={HalaInfoScreen} />
      <Stack.Screen name="PartnerForm" component={BrandFormScreen} />
      <Stack.Screen
        name="NotificationTest"
        component={NotificationTestScreen}
      />

      {/* ── Map ── */}
      <Stack.Screen name="MapProfile" component={MapProfile} />
      <Stack.Screen name="CaptureScreen" component={MapCaptureScreen} />
    </Stack.Navigator>
  );
};

export default HalaStack;