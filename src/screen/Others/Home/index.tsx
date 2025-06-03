import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, ScrollView, StatusBar, Platform, ImageBackground } from 'react-native';

import ImageSlider from './FlatOffer';
import Categories from './Categories';
import BestSeller from './BestSellers';
import RecentlyAdded from './RecentlyAdded';
import { useSelector } from 'react-redux';

import { getStyles } from './style';
import { RootState } from '../../../redux/store';
import { languageData } from '../../../redux/language/languageSlice';
import LanguageModal from '../../../components/Modal/Lan_Modal';
import {  BackgroundImg, Language,  Scope, Westwalk, } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import EventSlider from './Events';

type HomeProps = {
  navigation: any;
};

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);

  const showAlert = () => {
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  return (
    <View style={{flex:1, backgroundColor:Colors.Bg}} >
    {/* <ImageBackground source={BackgroundImg} style={{flex:1,}}  imageStyle={{width:'100%',height:"100%",opacity:0.2}} > */}
       <StatusBar hidden={false} translucent={true} animated={true} barStyle={'light-content'} />
      <View style={styles.Header_container}>
      <View style={styles.header}>
            <Image source={Westwalk} style={styles.logo} />
            <View style={styles.language_Cont}>
              <TouchableOpacity style={styles.Btn} onPress={showAlert}>
                <Image source={Language} style={styles.language_Icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('SearchScreen')}>
                <Image source={Scope} style={styles.Scope_Icon} />
              </TouchableOpacity>
            </View>
           
      </View>
      </View>

        <ScrollView  showsVerticalScrollIndicator={false} >
         
      
          <ImageSlider navigation={navigation} />

          <View style={[styles.Categories_Cont]}>
            <View style={styles.txt_cont} >
            <Text style={styles.Categories_Txt}>{languageData[language].categories}</Text>
            </View>
  
            <Categories navigation={navigation} />
          </View>
         

          <View style={[styles.BestSeller_Cont,{marginTop:"1%"}]}>
          <View style={styles.txt_cont} >
            <Text style={styles.BestSeller_Txt}>{languageData[language].best_sellers}</Text>
            </View>
            <BestSeller  />
          </View>

          <View style={[styles.BestSeller_Cont,{marginTop:"1%"}]}>
          <View style={styles.txt_cont} >
            <Text style={styles.BestSeller_Txt}>{languageData[language].Upcoming_event}</Text>
            </View>
            <EventSlider navigation={navigation} />
          </View>

          <View style={styles.BestSeller_Cont}>
          <View style={styles.txt_cont} >
            <Text style={styles.BestSeller_Txt}>{languageData[language].recently_added}</Text>
            </View>
            <RecentlyAdded />
          </View>
        </ScrollView>

        <LanguageModal visible={alertVisible} onClose={hideAlert} />
       
 
        {/* </ImageBackground> */}
        </View>
  );
};

export default Home;
