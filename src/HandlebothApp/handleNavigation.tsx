import {ActivityIndicator} from '../ui/ActivityIndicator';
import React, { useEffect, useState, useCallback } from 'react'; // ✅ useCallback add
import {View} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

import HalaStack from '../halabsaudi/Navigation/StackNav.tsx/StackNavigation';
import StackNavigation from '../westwalk/navigation/stackNavigation';
import { navigationRef } from '../halabsaudi/Notifications/RootNavigation';
import { checkPendingNavigation, initVenueTracker } from '../halabsaudi/Notifications';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const [initialRoute, setInitialRoute] = useState<'HalabStack' | 'WestwalkStack' | null>(null);
  const [onlyStack, setOnlyStack] = useState<'HalabOnly' | 'WestwalkOnly' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const firebaseUser = auth().currentUser;

      const [staffData, tenantData, orgEmpData] = await Promise.all([
        AsyncStorage.getItem('staff_data'),
        AsyncStorage.getItem('tenant_data'),
        AsyncStorage.getItem('org_emp_data'),
      ]);

      const isWestwalkUser = staffData || tenantData || orgEmpData;

      if (isWestwalkUser) {
        setOnlyStack('WestwalkOnly');
      } else if (firebaseUser) {
        setOnlyStack('HalabOnly');
        initVenueTracker();
      } else {
        setInitialRoute('HalabStack');
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // ✅ SIRF EK BAAR — useCallback ke saath
  const handleNavigationReady = useCallback(() => {
    setTimeout(() => checkPendingNavigation(), 500);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101114' }}>
        <ActivityIndicator size="large" color="#E75049" />
      </View>
    );
  }

  if (onlyStack === 'WestwalkOnly') {
    return (
      <NavigationContainer theme={{...DarkTheme, colors: {...DarkTheme.colors, background: '#101114', card: '#191B20', text: '#F5F6F8', primary: '#E75049', border: '#343841'}}} ref={navigationRef} onReady={handleNavigationReady}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WestwalkStack" component={StackNavigation} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (onlyStack === 'HalabOnly') {
    return (
      <NavigationContainer theme={{...DarkTheme, colors: {...DarkTheme.colors, background: '#101114', card: '#191B20', text: '#F5F6F8', primary: '#E75049', border: '#343841'}}} ref={navigationRef} onReady={handleNavigationReady}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HalabStack" component={HalaStack} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={{...DarkTheme, colors: {...DarkTheme.colors, background: '#101114', card: '#191B20', text: '#F5F6F8', primary: '#E75049', border: '#343841'}}} ref={navigationRef} onReady={handleNavigationReady}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute ?? 'HalabStack'}>
        <Stack.Screen name="HalabStack" component={HalaStack} />
        <Stack.Screen name="WestwalkStack" component={StackNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppStack;



