import {Text} from '../../../ui/Text';

import React, { useState, useRef } from 'react';
import {View, Image, TouchableOpacity, StatusBar} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import CustomButton from '../../Component/CustomButton/CustomButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { Colors } from '../../Themes/Colors';
import { getStyles } from './style';



import {onboardingLanguageData} from '../../i18n/translations';

type OnBoardingProps = {
  navigation: NativeStackNavigationProp<any>;
};

const OnBoarding: React.FC<OnBoardingProps> = ({ navigation }) => {
  const [showRealApp, setShowRealApp] = useState(false);
  const sliderRef = useRef<AppIntroSlider<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
 
  const styles = getStyles(language);
 
  const slides = [
    {
      key: 1,
      Title: onboardingLanguageData[language].restaurants_discounts.title, // Fetch title based on language
      text: onboardingLanguageData[language].restaurants_discounts.text,   // Fetch text based on language
      image: require('../../assets/Images/slider1.png'),
      backgroundColor: Colors.surface,
    },
    {
      key: 2,
      Title: onboardingLanguageData[language].shopping_discounts.title, // Fetch title based on language
      text: onboardingLanguageData[language].shopping_discounts.text,   // Fetch text based on language
      image: require('../../assets/Images/slider2.png'),
      backgroundColor: Colors.surface,
    },
    {
      key: 3,
      Title: onboardingLanguageData[language].hotels_discounts.title, // Fetch title based on language
      text: onboardingLanguageData[language].hotels_discounts.text,   // Fetch text based on language
      image: require('../../assets/Images/slider3.png'),
      backgroundColor: Colors.surface,
    }
  ];

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      sliderRef.current?.goToSlide(currentIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      sliderRef.current?.goToSlide(currentIndex - 1);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isLastSlide = index === slides.length - 1;
    const isFirstSlide = index === 0;

    return (
      <SafeAreaView style={[styles.slide]}>
          <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.background} barStyle='light-content' />
        {!isFirstSlide && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevSlide}>
            <Image source={require('../../assets/Icons/Back.png')} style={styles.backIcon} />
          </TouchableOpacity>
        )}
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={{ height: 170, justifyContent: 'center', alignItems: 'center', width: '85%' }}>
          <Text style={styles.title}>{item.Title}</Text>
          <Text style={styles.description}>{item.text}</Text>
        </View>
        <View style={styles.paginationContainer}>
          {slides.map((slide, ind) => (
            <View
              key={slide.key}
              style={[styles.paginationDot, ind === currentIndex ? styles.activePaginationDot : null]}
            />
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton title={languageData[language].next} onPress={isLastSlide ? () => navigation.navigate('Login') : handleNextSlide} />
        </View>
      </SafeAreaView>
    );
  };

  if (showRealApp) {
    return <Text>Your App Content Goes Here</Text>;
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <AppIntroSlider
          ref={sliderRef}
          renderItem={renderItem}
          data={slides} // Use slides array instead of SlidesData
          initialNumToRender={slides.length}
          onSlideChange={(index) => setCurrentIndex(index)}
          renderNextButton={() => null}
          renderDoneButton={() => null}
          renderPagination={() => null}
        />
      </SafeAreaView>
    );
  }
};

export default OnBoarding;
