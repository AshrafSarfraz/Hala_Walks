import React from 'react';
import {Image, ImageSourcePropType, View, StyleSheet, Platform} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Home from '../../Screen/Home';
import Profile from '../../Map/profileScreen';
import {Colors} from '../../Themes/Colors';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import ConversationsScreen from '../../chat/conversationScreen';
import MapScreen from '../../Map/mapScreen';
import Ionicons from '@react-native-vector-icons/ionicons';

import {hbsText} from '../../i18n/translations';

const Tab = createBottomTabNavigator();

// ─── Centre tab icon ──────────────────────────────────────────────────────────
const PlusTabIcon = ({focused}: {focused: boolean}) => (
  <View style={plusStyles.wrapper}>
    <Ionicons
      name="time"
      size={25}
      color={focused ? Colors.accent : Colors.textMuted}
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
          const tintColor = focused ? Colors.accent : Colors.textMuted;

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
              style={{width: 16, height: 16, resizeMode: 'contain', tintColor}}
            />
          );
        },
        tabBarLabelStyle: {paddingBottom: 4, fontSize: 10, fontWeight: '500'},
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 30 + insets.bottom : 40 + insets.bottom,
          width: '85%',
          alignSelf: 'center',
          marginBottom: Platform.OS === 'ios'? insets.bottom -10 : insets.bottom + 5,
          borderRadius: 100,
          paddingHorizontal: 14,
          paddingTop: Platform.OS === 'ios' ? 5 : 3.5,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderTopWidth: 1,          // navigator ki default top border override
          borderColor: Colors.border,
          position: 'absolute',
          marginRight: '7.5%',
          marginLeft: '7.5%',
        
          // iOS shadow
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: {width: 0, height: 4},
        
          // Android shadow
          elevation: 12,
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
        options={{tabBarLabel: hbsText(language === 'ar', 'ui_explore')}}
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
  <>
    <MyTabs />
  </>
);

export default Bottom;