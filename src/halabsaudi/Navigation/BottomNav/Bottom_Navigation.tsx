import React from 'react';
import { Image, ImageSourcePropType, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import Home from '../../Screen/Home';
import Wishlist from '../../Screen/Wishlist';
import Profile from '../../Screen/Profile';
import { Colors } from '../../Themes/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { languageData } from '../../redux_toolkit/language/languageSlice';

const Tab = createBottomTabNavigator();

const MyTabs: React.FC = () => {
  const insets = useSafeAreaInsets(); // <-- important
  const language = useSelector((state: RootState) => state.language.language);

  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        tabBarIcon: ({ focused }) => {
          let iconSource: ImageSourcePropType | undefined;
          const tintColor = focused ? '#005029' : '#A2A2A2';

          switch (route.name) {
            case 'Home':
              iconSource = require('../../assets/Icons/home.png');
              break;
            case 'Chat':
              iconSource = require('../../assets/Icons/send.png');
              break;
            case 'Profile':
              iconSource = require('../../assets/Icons/profile.png');
              break;
          }

          if (!iconSource) return null;

          return (
            <Image
              source={iconSource}
              style={{ width: 18, height: 18, resizeMode: 'contain', tintColor }}
            />
          );
        },
        tabBarLabelStyle: {
          paddingBottom: 6, // zyada padding se overlap lag sakta hai
          fontSize: 10,
        },
        tabBarActiveTintColor: '#005029',
        tabBarInactiveTintColor: '#A2A2A2',
        tabBarStyle: {
          // base height + bottom safe area
          height: 60 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(6, insets.bottom), // yahan magic hai
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderWidth: 1,
          backgroundColor: Colors.White,
          position: 'absolute', // rounded corners ko acchi tarah dikhane ke liye
        },
        headerShown: false,
        tabBarHideOnKeyboard: true, // keyboard khulte hue overlap na ho
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: languageData[language].Home}} />
      <Tab.Screen name="Chat" component={ConversationsScreen} options={{ tabBarLabel: languageData[language].Chat}} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: languageData[language].Profile}} />
    </Tab.Navigator>
  );
};

// Root par SafeAreaProvider zaroor rakho
const Bottom: React.FC = () => {
  return (
    <SafeAreaProvider>
      <MyTabs />
    </SafeAreaProvider>
  );
};

export default Bottom;
