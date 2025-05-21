// App.js or MainNavigation.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash_Blank from '../screen/authentication/splash/Splash_Blank';
import Splash_Screen from '../screen/authentication/splash/SplashScreen';

import ProfileScreen from '../screen/Employee_Data/Profile_Screen';
import EmployeeTab from './EmployeeTab';
import DetailScreen from '../screen/Others/detail_Screen';
import SearchScreen from '../screen/Others/SearchScreen';
import SelectedCategories from '../screen/Others/selected_categories';
import WishlistScreen from '../screen/Others/Wishlist';
import TenantsTab from './TenantTab';
import CorporationTab from './CorporationTab';
import TenantsProfile from '../screen/Tenants_Data/Profile_Screen';
import TenantDocumentControlScreen from '../screen/Tenants_Data/Documents';
import TenantsContactUsScreen from '../screen/Tenants_Data/ContactUs';
import CorporationProfile from '../screen/Organization/Profile_Screen';
import StaffHistoryScreen from '../screen/Employee_Data/Reedem_Histroy';
import TenantHistoryScreen from '../screen/Tenants_Data/Reedem_Histroy';
import CorporationHistoryScreen from '../screen/Organization/Reedem_Histroy';
import StaffDocumentControlScreen from '../screen/Employee_Data/Documents';
import StaffContactUs from '../screen/Employee_Data/ContactUs';
import RoleSelectionScreen from '../screen/authentication/select_role';
import OnBoarding from '../screen/Others/OnBoarding';
import EmployeeLogin from '../screen/authentication/logins/Westwalk_Staff';
import TenantsLogin from '../screen/authentication/logins/Tenants_Login';
import OrgEmp_Login from '../screen/authentication/logins/Organization_Login';








const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashBlank" screenOptions={{headerShown:false}} >
        <Stack.Screen name="SplashBlank" component={Splash_Blank}   />
        <Stack.Screen name="SplashScreen" component={Splash_Screen}   />
        <Stack.Screen name="Role" component={RoleSelectionScreen}   />
        <Stack.Screen name="onBoarding" component={OnBoarding}   />
        <Stack.Screen name="SearchScreen" component={SearchScreen}   />
        <Stack.Screen name="DetailScreen" component={DetailScreen}   />
        <Stack.Screen name="CategoriesScreen" component={SelectedCategories}   />
        <Stack.Screen name="SelectedVenue" component={SelectedCategories}   />
        <Stack.Screen name="WishlistScreen" component={WishlistScreen}   />
      
        {/* Staff Screen */}
        <Stack.Screen name="StaffLogin" component={EmployeeLogin}   />
        <Stack.Screen name="EmployeeTab" component={EmployeeTab}   />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen}   />
        <Stack.Screen name="StaffHistroyScreen" component={StaffHistoryScreen}   />
        <Stack.Screen name="StaffDocumentControlScreen" component={StaffDocumentControlScreen}   />
        <Stack.Screen name="StaffContactUs" component={StaffContactUs}   />

        {/* Tenants Screen */}
        <Stack.Screen name="TenantsLogin" component={TenantsLogin}   />
        <Stack.Screen name="TenantsTab" component={TenantsTab}   />
        <Stack.Screen name="TenantsProfile" component={TenantsProfile}   />
        <Stack.Screen name="TenantDocumentControlScreen" component={TenantDocumentControlScreen}   />
        <Stack.Screen name="TenantsContactUs" component={TenantsContactUsScreen}   />
        <Stack.Screen name="TenantsHistroyScreen" component={TenantHistoryScreen}   />

        {/* Organization Screen */}
        <Stack.Screen name="CorEmp_Login" component={OrgEmp_Login}   />
        <Stack.Screen name="CorporationTab" component={CorporationTab}   />
        <Stack.Screen name="CorporationProfile" component={CorporationProfile}   />
        <Stack.Screen name="CorporationHistroyScreen" component={CorporationHistoryScreen}   />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
