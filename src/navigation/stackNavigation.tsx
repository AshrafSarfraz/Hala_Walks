// App.js or MainNavigation.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash_Blank from '../screen/authentication/splash/Splash_Blank';
import Splash_Screen from '../screen/authentication/splash/SplashScreen';
import LoginScreen from '../screen/authentication/login';
import Bottom from './BottomNavigation';
import Home from '../screen/Home/index';





const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown:false}} >
        <Stack.Screen name="SplashBlank" component={Splash_Blank}   />
        <Stack.Screen name="SplashScreen" component={Splash_Screen}   />
        <Stack.Screen name="Login" component={LoginScreen}   />
        <Stack.Screen name="BottomNavigation" component={Bottom}   />
        <Stack.Screen name="Home" component={Home}   />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
