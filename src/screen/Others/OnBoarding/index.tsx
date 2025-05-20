import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import CustomButton from '../../Component/CustomButton/CustomButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { Colors } from '../../Themes/Colors';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';

const langData = {
  en: {
    restaurants_discounts: {
      title: "Restaurants Discounts",
      text: "Hala B Saudi offers exclusive discounts at top restaurants, cafés, and food chains within Doha, Morocco, Egypt, and many other countries, letting you enjoy diverse cuisines and unforgettable dining experiences on your travels."
    },
    shopping_discounts: {
      title: "Shopping & Discounts",
      text: "Shop and Save Anywhere You Go! Hala B Saudi gives you exclusive discounts at top retail stores, boutiques, and global brands. Enjoy incredible deals while shopping for fashion, electronics, gifts, and more at your travel destinations."
    },
    hotels_discounts: {
      title: "Hotels Discounts",
      text: "Stay in Comfort and Save! Exclusive discounts on top hotels and luxury accommodations worldwide. Enjoy exceptional hospitality and premium stays at unbeatable rates during your travels."
    }
  },
  ar: {
    restaurants_discounts: {
      title: "خصومات المطاعم",
      text: "تقدم هلا بي السعودية خصومات حصرية في أفضل المطاعم والمقاهي وسلاسل الطعام في الدوحة والمغرب ومصر والعديد من الدول الأخرى، مما يتيح لك الاستمتاع بمأكولات متنوعة وتجارب طعام لا تُنسى خلال رحلاتك."
    },
    shopping_discounts: {
      title: "التسوق والخصومات",
      text: "تسوق وادخر في أي مكان تذهب إليه! تقدم لك هلا بي السعودية خصومات حصرية في أفضل المتاجر والبوتيكات والعلامات التجارية العالمية. استمتع بعروض مذهلة أثناء التسوق لشراء الأزياء والإلكترونيات والهدايا والمزيد في وجهات سفرك."
    },
    hotels_discounts: {
      title: "خصومات الفنادق",
      text: "أقم براحة وادخر! خصومات حصرية على أفضل الفنادق وأماكن الإقامة الفاخرة حول العالم. استمتع بضيافة استثنائية وإقامة فاخرة بأسعار لا تُقارن خلال رحلاتك."
    }
  }
};

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
      Title: langData[language].restaurants_discounts.title, // Fetch title based on language
      text: langData[language].restaurants_discounts.text,   // Fetch text based on language
      image: require('../../Assests/Images/slider1.png'),
      backgroundColor: Colors.Bg,
    },
    {
      key: 2,
      Title: langData[language].shopping_discounts.title, // Fetch title based on language
      text: langData[language].shopping_discounts.text,   // Fetch text based on language
      image: require('../../Assests/Images/slider2.png'),
      backgroundColor: Colors.Bg,
    },
    {
      key: 3,
      Title: langData[language].hotels_discounts.title, // Fetch title based on language
      text: langData[language].hotels_discounts.text,   // Fetch text based on language
      image: require('../../Assests/Images/slider3.png'),
      backgroundColor: Colors.Bg,
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
      <SafeAreaView style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
          <StatusBar hidden={true} translucent={true} animated={true} />
        {!isFirstSlide && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevSlide}>
            <Image source={require('../../Assests/Icons/Back.png')} style={styles.backIcon} />
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
