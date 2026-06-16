import React from 'react';
import {Image, ImageSourcePropType, View, StyleSheet} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets, SafeAreaProvider} from 'react-native-safe-area-context';
import Home from '../../Screen/Home';
import Profile from '../../Screen/Profile';
import {Colors} from '../../Themes/Colors';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import ConversationsScreen from '../../chat/conversationScreen';
import MapScreen from '../../Map/mapScreen';
import Ionicons from '@react-native-vector-icons/ionicons';

const Tab = createBottomTabNavigator();

// ─── Centre tab icon ──────────────────────────────────────────────────────────
const PlusTabIcon = ({focused}: {focused: boolean}) => (
  <View style={plusStyles.wrapper}>
    <Ionicons
      name="time"
      size={25}
      color={focused ? '#E75049' : Colors.White}
    />
  </View>
);

const plusStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── MyTabs ───────────────────────────────────────────────────────────────────
const MyTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const language = useSelector((state: RootState) => state.language.language);

  return (
    <Tab.Navigator
      screenOptions={({route}): BottomTabNavigationOptions => ({
        tabBarIcon: ({focused}) => {
          if (route.name === 'TimelineTab') {
            return <PlusTabIcon focused={focused} />;
          }

          let iconSource: ImageSourcePropType | undefined;
          const tintColor = focused ? Colors.btnRed : Colors.White;

          switch (route.name) {
            case 'Home':
              iconSource = require('../../assets/Icons/home.png');
              break;
            case 'Chat':
              iconSource = require('../../assets/Icons/send.png');
              break;
            case 'Explore':
              iconSource = require('../../assets/Icons/explore.png');
              break;
            case 'Profile':
              iconSource = require('../../assets/Icons/profile.png');
              break;
          }

          if (!iconSource) return null;

          return (
            <Image
              source={iconSource}
              style={{width: 18, height: 18, resizeMode: 'contain', tintColor}}
            />
          );
        },
        tabBarLabelStyle: {paddingBottom: 6, fontSize: 10},
        tabBarActiveTintColor: Colors.btnRed,
        tabBarInactiveTintColor: Colors.White,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(6, insets.bottom),
          backgroundColor: Colors.darkgrey,
          position: 'absolute',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}>

      <Tab.Screen
        name="Home"
        component={Home}
        options={{tabBarLabel: languageData[language].Home}}
      />

      <Tab.Screen
        name="Chat"
        component={ConversationsScreen}
        options={{tabBarLabel: languageData[language].chat}}
      />

      {/*
       * KEY FIX:
       * Tab name is "TimelineTab" (different from root stack's "Timeline")
       * so navigation.navigate('Timeline') goes to the ROOT STACK, not here.
       *
       * navigation.getParent() explicitly targets the parent (HalaStack)
       * navigator — this is the reliable way to navigate up from a tab.
       */}
      <Tab.Screen
        name="TimelineTab"
        component={View}
        options={{tabBarLabel: 'Timeline'}}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            // getParent() = HalaStack navigator
            // navigate('Timeline') = the modal screen registered there
            navigation.getParent()?.navigate('Timeline');
          },
        })}
      />

      <Tab.Screen
        name="Explore"
        component={MapScreen}
        options={{tabBarLabel: languageData[language].Map}}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{tabBarLabel: languageData[language].Profile}}
      />
    </Tab.Navigator>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const Bottom: React.FC = () => (
  <SafeAreaProvider>
    <MyTabs />
  </SafeAreaProvider>
);

export default Bottom;