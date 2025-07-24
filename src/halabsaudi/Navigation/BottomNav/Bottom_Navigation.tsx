import React from 'react';
import { Text, View, Image, ImageSourcePropType } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import Home from '../../Screen/Home';
import Wishlist from '../../Screen/Wishlist';
import Profile from '../../Screen/Profile';
import { Colors } from '../../Themes/Colors';

const Tab = createBottomTabNavigator();

const MyTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }): BottomTabNavigationOptions => ({
        tabBarIcon: ({ focused }) => {
          let iconSource: ImageSourcePropType;
          let tintColor = focused ? '#005029' : '#A2A2A2';

          switch (route.name) {
            case 'Home':
              iconSource = require('../../assets/Icons/home.png');
              break;
            case 'Wishlist':
              iconSource = require('../../assets/Icons/wishlist.png');
              break;
            case 'Profile':
              iconSource = require('../../assets/Icons/profile.png');
              break;
            default:
              return null;
          }

          return <Image source={iconSource} style={{ width: 20, height: 20, resizeMode:"contain", tintColor: tintColor }} />;
        },
        tabBarLabelStyle: { paddingBottom: 10 },
        tabBarActiveTintColor: '#005029',
        tabBarInactiveTintColor: '#A2A2A2',
        tabBarStyle: {
          height: 75,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingTop:7,
          borderWidth:1,
          backgroundColor:Colors.White
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Wishlist" component={Wishlist} options={{ tabBarLabel: 'Wishlist' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const Bottom: React.FC = () => {
  return <MyTabs />;
};

export default Bottom;
