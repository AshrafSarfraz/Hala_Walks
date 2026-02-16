// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

import HalaStack from '../halabsaudi/Navigation/StackNav.tsx/StackNavigation';
import StackNavigation from '../westwalk/navigation/stackNavigation';
import { navigationRef } from '../halabsaudi/Notifications/RootNavigation';

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
      } else {
        setInitialRoute('HalabStack'); // default view if no one is logged in
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  // ✅ If Westwalk-only user
  if (onlyStack === 'WestwalkOnly') {
    return (
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WestwalkStack" component={StackNavigation} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // ✅ If Hala-only user
  if (onlyStack === 'HalabOnly') {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HalabStack" component={HalaStack} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // ✅ No user logged in → show both stacks like before
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="HalabStack" component={HalaStack} />
        <Stack.Screen name="WestwalkStack" component={StackNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppStack;
