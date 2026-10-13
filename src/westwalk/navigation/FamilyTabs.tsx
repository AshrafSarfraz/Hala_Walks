import React from 'react';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
import {RootState} from '../redux/store';
import Home from '../screen/Others/Home';
import Wishlist from '../screen/Others/Wishlist';
import TenantAccount from '../screen/Tenants_Data/Account';
import StaffAccount from '../screen/Employee_Data/Account';
import OrganizationAccount from '../screen/Organization/Account';
import Maintenance from '../screen/Tenants_Data/MaintenanceRequest/MaintenanceTab';
const Tab = createBottomTabNavigator();
export default function FamilyTabs({
  navigation,
  role,
}: {
  navigation: any;
  role: 'tenant' | 'staff' | 'org';
}) {
  const insets = useSafeAreaInsets();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const Account =
    role === 'tenant'
      ? TenantAccount
      : role === 'staff'
      ? StaffAccount
      : OrganizationAccount;
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.PrimaryColor,
        tabBarInactiveTintColor: Colors.Grey,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Fonts.F_Medium,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: '7.5%',
          bottom: Math.max(insets.bottom, 10),
          height: 65,
          paddingTop: 6,
          paddingBottom: 4,
          borderRadius: 100,
          backgroundColor: Colors.White,
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: Colors.border,
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: {width: 0, height: 3},
        },
        tabBarIcon: ({color, size}) => (
          <Ionicons
            name={
              route.name === 'FamilyHome'
                ? 'home-outline'
                : route.name === 'FamilyMaintenance'
                ? 'construct-outline'
                : route.name === 'FamilyWishlist'
                ? 'heart-outline'
                : 'person-outline'
            }
            color={color}
            size={Math.min(size, 21)}
          />
        ),
      })}>
      <Tab.Screen
        name="FamilyHome"
        options={{tabBarLabel: ar ? 'الرئيسية' : 'Home'}}>
        {() => <Home navigation={navigation} role={role} />}
      </Tab.Screen>
      {role === 'tenant' && (
        <Tab.Screen
          name="FamilyMaintenance"
          options={{tabBarLabel: ar ? 'الصيانة' : 'Maintenance'}}>
          {() => <Maintenance navigation={navigation} />}
        </Tab.Screen>
      )}
      <Tab.Screen
        name="FamilyWishlist"
        options={{tabBarLabel: ar ? 'المفضلة' : 'Wishlist'}}>
        {() => <Wishlist />}
      </Tab.Screen>
      <Tab.Screen
        name="FamilyAccount"
        options={{tabBarLabel: ar ? 'الحساب' : 'Account'}}>
        {() => <Account navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
