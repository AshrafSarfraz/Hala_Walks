import React, { useEffect } from 'react';
import { Text, StyleSheet, Dimensions, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Info, Success, Warning, Error } from '../../../theme/Images'; // ✅ Fix Error icon import

const { width } = Dimensions.get('window');

const AnimatedToast = ({ message, visible, duration = 6000, type }) => {
  const translateY = useSharedValue(-150); // ✅ Start off-screen

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(45, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });

      const hideTimeout = setTimeout(() => {
        translateY.value = withTiming(-150, {
          duration: 500,
          easing: Easing.in(Easing.ease),
        });
      }, duration);

      return () => clearTimeout(hideTimeout); // ✅ Clean up timeout
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const getColor = () => {
    switch (type) {
      case 'SUCCESS':
        return '#bcf7cc';
      case 'ERROR':
        return '#f7bcbc';
      case 'WARNING':
        return '#f7d6bc';
      default:
        return '#bcc9f7';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'SUCCESS':
        return Success;
      case 'ERROR':
        return Error;
      case 'WARNING':
        return Warning;
      default:
        return Info;
    }
  };

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <View style={[styles.sideBar, { backgroundColor: getColor() }]} />
      <View style={[styles.circle, { backgroundColor: getColor() }]}>
        <Image source={getIcon()} style={styles.toastIcon} />
      </View>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: width - 20,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    zIndex: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: 10,
  },
  toastText: {
    color: '#000',
    textAlign: 'left',
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  sideBar: {
    width: 5,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  toastIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
});

export default AnimatedToast;
