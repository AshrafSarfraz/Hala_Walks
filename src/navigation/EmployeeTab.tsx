import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import Home from '../screen/Others/Home';
import {  HomeIcon, ProfileIcon, Wishlist, } from '../theme/Images';
import WishlistScreen from '../screen/Others/Wishlist';
import Account from '../screen/Employee_Data/Account';

const { width } = Dimensions.get('window');
const tabWidth = width / 3;


type TabProps = {
  navigation: any;
};

type TabButtonProps = {
  icon: any;
  isFocused: boolean;
  onPress: () => void;
  isCenter?: boolean;
};

const EmployeeTab: React.FC<TabProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const indicatorPosition = useSharedValue(tabWidth * 0); 

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    indicatorPosition.value = withTiming(tabWidth * index, { duration: 300 });
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const renderScreen = () => {
    switch (activeTab) {
      case 0:
        return <Home navigation={navigation} />;
      case 1:
        return <WishlistScreen navigation={navigation} />;
      case 2:
        return <Account navigation={navigation}   />;
      default:
        return <Home navigation={navigation} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}

      <View style={styles.tabBar}>
        {/* Moving Blue Circle */}
        <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />

        {/* Tab Buttons */}
        <TabButton
          icon={HomeIcon}
          isFocused={activeTab === 0}
          onPress={() => handleTabPress(0)}
        />
        <TabButton
          icon={Wishlist}
          isFocused={activeTab === 1}
          onPress={() => handleTabPress(1)}
          isCenter
        />
        <TabButton
          icon={ProfileIcon}
          isFocused={activeTab === 2}
          onPress={() => handleTabPress(2)}
        />
      </View>
    </View>
  );
};

const TabButton: React.FC<TabButtonProps> = ({ icon, isFocused, onPress, isCenter }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isFocused ? -15 : 0, { duration: 300 }) }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.tabButton, isCenter && styles.centerTab]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isFocused && styles.focusedIcon,
          animatedStyle,
          isCenter && styles.centerIcon,
        ]}
      >
        <Image source={icon} style={[styles.icon, isFocused && { tintColor: '#fff' }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
 
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    paddingBottom: 15,
   
  },
  indicator: {
    position: 'absolute',
    bottom: 22,
    left: tabWidth / 2.2, // center under icon
    width: 10,
    height: 10,
    backgroundColor: '#2f2f75',
    borderRadius: 15,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 40,
  },
  focusedIcon: {
    backgroundColor: '#2f2f75',
    width: 53,
    height:53,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: '#999',
    resizeMode: 'contain',
  },
  centerTab: {
    position: 'relative',
    zIndex: 2,
  },
  centerIcon: {
    padding: 16,
    borderRadius: 35,
  },
});

export default EmployeeTab;
