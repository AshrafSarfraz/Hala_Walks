import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React,{ useEffect,useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from '../../../ui/ActivityIndicator';
import Settings from '../../Screen/Profile';
import { isDemoToken } from '../../demo/session';
import PermissionHost from '../../permissions/PermissionHost';
import UpdateGate from '../../updates/UpdateGate';
import type { HalaStackParamList } from '../types';

import Otp from '../../Screen/Authentication/EnterOtp';
import Login from '../../Screen/Authentication/Login';
import Splash_Screen from '../../Screen/Authentication/Splash/SplashScreen';
import Home from '../../Screen/Home';
import OnBoarding from '../../Screen/OnBoarding';
import Reedem_His from '../../Screen/Reedem_Histroy';
import SearchScreen from '../../Screen/SearchScreen';
import DetailScreen from '../../Screen/detail_Screen';
import SelectedCategories from '../../Screen/selected_categories';
import SelectedVenues from '../../Screen/selected_venues';
import Bottom from '../BottomNav/Bottom_Navigation';

import WelcomeScreen from '../../Screen/Authentication/Splash/welcome_screen';
import HalaInfoScreen from '../../Screen/Merchant_Screen/Hala_Info';
import BrandFormScreen from '../../Screen/Merchant_Screen/PartnerForm';
import PDFViewerScreen from '../../Screen/pdfViewer';

import StackNavigation from '../../../westwalk/navigation/stackNavigation';
import LocationDisclosure from '../../Screen/LocationDisclosureScreen';
import EditAccountScreen from '../../Screen/UserAccount/EditAccount';
import AllMediaScreen from '../../chat/AllMediaScreen';
import BlockedUsers from '../../chat/BlockedUsers';
import SocialConnectionsScreen from '../../chat/SocialConnectionsScreen';
import UserProfileScreen from '../../chat/UserProfileScreen';
import ChatScreen from '../../chat/chatScreen';
import ImagePreviewScreen from '../../chat/components/ImagePreviewScreen';
import StartChatScreen from '../../chat/startChatScreen';
import NotificationTestScreen from './NotificationTestScreen';

import BrandDetailScreen from '../../Map/BrandDetailScreen';
import MapCaptureScreen from '../../Map/capture';
import MapProfile from '../../Map/profileScreen';
import TimelineScreen from '../../Screen/Timeline';
import Wishlist from '../../Screen/Wishlist';



import SignUp from '../../Screen/Authentication/SignUp';
import { Colors } from '../../Themes/Colors';

// Status bars are managed by React Native StatusBar/useStatusBar.
// Do not add native-stack statusBarStyle/statusBarHidden options on iOS:
// those require controller-based appearance, which conflicts with RN StatusBar.
const Stack = createNativeStackNavigator<HalaStackParamList>();
const HalaStack: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);



  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const halaData = await AsyncStorage.getItem('hala_user');
        const token = await AsyncStorage.getItem('hala_token');

        if (!__DEV__ && isDemoToken(token)) {
          await AsyncStorage.multiRemove(['hala_user', 'hala_token', 'hala_user_data', 'hala_user_backend', 'hala_conversations']);
          setInitialRoute('Login');
        } else if (halaData === 'true' && token) {
          const asked = await AsyncStorage.getItem('hala_permissions_v2');
          setInitialRoute(asked ? 'BottomTab' : 'LocationDisclosure');
        } else {
          setInitialRoute('BottomTab');
        }
      } catch (e) {
        console.log('Error reading login state', e);
        setInitialRoute('Splash');
      }
    };
    checkInitialRoute();
  }, []);

  if (!initialRoute) {
    return <View style={{flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center'}}><ActivityIndicator size="large" /></View>;
  }


  
  return (
    <UpdateGate><PermissionHost /><Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{headerShown: false, contentStyle: {backgroundColor: Colors.background}}}>
      {/* ── Auth & Onboarding ── */}
      <Stack.Screen name="Splash" component={Splash_Screen} />
      <Stack.Screen name="LocationDisclosure" component={LocationDisclosure} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="WestwalkStack" component={StackNavigation} />
      <Stack.Screen name="Onboarding" component={OnBoarding} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="OTP" component={Otp} />

      {/* ── Main app (bottom tabs) ── */}
      <Stack.Screen name="BottomTab" component={Bottom} />


      <Stack.Screen
  name="Timeline"
  component={TimelineScreen}
  options={{
    presentation: 'formSheet',
    headerShown: false,
    gestureEnabled: true,
    sheetAllowedDetents: [0.9],
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
      <Stack.Screen name="SocialConnections" component={SocialConnectionsScreen} />
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
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="CaptureScreen" component={MapCaptureScreen} />
      <Stack.Screen name="BrandDetail" component={BrandDetailScreen} />
    </Stack.Navigator></UpdateGate>
  );
};

export default HalaStack;
