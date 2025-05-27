import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { getStyles } from './style';
import { RootState } from '../../redux/store';
import CustomButton from '../../components/buttons/CustomButton';
import { languageData } from '../../redux/language/languageSlice';



const langData = {
  en: {
    restaurants_discounts: {
      title: "Welcome to West Walk!",
      text: "Welcome to West Walk, an exclusive application designed for the West Walk Family. Whether you're a staff member, tenant, or an employee of a corporate partner organization, you can enjoy special discounts and benefits simply by using the app."
    },
  },
  ar: {
    restaurants_discounts: {
        title: "مرحبًا بكم في ويست ووك!",
        text: "مرحبًا بكم في ويست ووك، وهو تطبيق حصري تم تصميمه خصيصًا لعائلة ويست ووك. سواء كنت موظفًا، مستأجرًا، أو موظفًا في مؤسسة شريكة، يمكنك الاستمتاع بخصومات ومزايا خاصة بكل سهولة من خلال استخدام التطبيق."
         },
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
      image: require('../../../assets/images/slider1.png'),
      backgroundColor: "white",
    },
  
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
      <SafeAreaView style={[styles.slide, { backgroundColor:'#ffffff' }]}>
          <StatusBar hidden={true} translucent={true} animated={true} />
  
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={{ height: 170, justifyContent: 'center', alignItems: 'center', width: '85%' }}>
          <Text style={styles.title}>{item.Title}</Text>
          <Text style={styles.description}>{item.text}</Text>
        </View>
        <View style={styles.paginationContainer}>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton title={languageData[language].next} onPress={isLastSlide ? () => navigation.navigate('Role') : handleNextSlide} />
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
