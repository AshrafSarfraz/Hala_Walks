// App.js or MainNavigation.js
import * as React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';


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
import OnBoarding from '../screen/Others/OnBoarding';

import OrgEmp_Login from '../screen/Organization/Authentication/login/Organization_Login';
import StaffForgetPassword from '../screen/Employee_Data/Authentication/forget/StaffForgetScreen';
import PDFViewerScreen from '../screen/Others/pdfViewer';
import RoleSelectionScreen from '../screen/Others/select_role';
import EmployeeLogin from '../screen/Employee_Data/Authentication/login/Westwalk_Staff';
import TenantsLogin from '../screen/Tenants_Data/Authentication/login/Tenants_Login';
import PhoneDirectoryScreen from '../screen/Employee_Data/PhoneDirectory';
import AuthLoadingScreen from '../screen/Others/auth_loading_screen/Auth_Loading';






const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  return (

      <Stack.Navigator initialRouteName="Auth_Loading" screenOptions={{headerShown:false}} >
       <Stack.Screen name="Auth_Loading" component={AuthLoadingScreen}   />
        {/* <Stack.Screen name="SplashScreen" component={Splash_Screen}   /> */}
        <Stack.Screen name="Role" component={RoleSelectionScreen}   />
        <Stack.Screen name="onBoarding" component={OnBoarding}   />
        <Stack.Screen name="SearchScreen" component={SearchScreen}   />
        <Stack.Screen name="DetailScreen" component={DetailScreen}   />
        <Stack.Screen name="CategoriesScreen" component={SelectedCategories}   />
        <Stack.Screen name="SelectedVenue" component={SelectedCategories}   />
        <Stack.Screen name="WishlistScreen" component={WishlistScreen}   />
        <Stack.Screen name="PDFViewerScreen" component={PDFViewerScreen}   />
        <Stack.Screen name="PhoneDirectory" component={PhoneDirectoryScreen}   />
        
      
        {/* Staff Screen */}
        <Stack.Screen name="StaffLogin" component={EmployeeLogin}   />
        <Stack.Screen name="StaffForgetPassword" component={StaffForgetPassword}   />
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
  );
}
