import React from 'react';
import { Text, View, Image, ImageSourcePropType } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/Colors';
import Home from '../screen/Others/Home';
import ProfileScreen from '../screen/Employee_Data/Profile_Screen';



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
              iconSource = require('../assets/icons/lock.png');
              break;
            case 'Wishlist':
             iconSource = require('../assets/icons/hide.png');
              break;
            case 'Profile':
              iconSource = require('../assets/icons/man.png');
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
      <Tab.Screen name="Wishlist" component={Home} options={{ tabBarLabel: 'Wishlist' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} /> 
    </Tab.Navigator>
  );
};

const Bottom: React.FC = () => {
  return <MyTabs />;
};

export default Bottom;
