// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HalaStack from '../halabsaudi/Navigation/StackNav.tsx/StackNavigation';
import StackNavigation from '../westwalk/navigation/stackNavigation';

const Stack = createNativeStackNavigator();

const AppStack = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
     
      <Stack.Screen name="HalabStack" component={HalaStack} />
      <Stack.Screen name="WestwalkStack" component={StackNavigation} />

    </Stack.Navigator>
  </NavigationContainer>
);

export default AppStack;
