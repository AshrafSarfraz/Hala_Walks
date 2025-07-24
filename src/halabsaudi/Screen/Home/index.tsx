import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { Full_logo_B,languageIcon, Scope } from '../../Themes/Images';
import ImageSlider from './FlatOffer';
import Categories from './Categories';
import BestSeller from './BestSellers';
import RecentlyAdded from './RecentlyAdded';
import LanguageModal from '../../Component/CustomAlert/Lan_Modal';
import { Colors } from '../../Themes/Colors';
import Venues from './Venues';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';

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
    <View style={{ flex: 1, backgroundColor: Colors.Bg }}>
              <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />

      <SafeAreaView style={styles.Container}>
      <View style={styles.header}>
            <Image source={Full_logo_B} style={styles.logo} />
            <View style={styles.language_Cont}>
              <TouchableOpacity style={styles.Btn} onPress={showAlert}>
                <Image source={languageIcon} style={styles.language_Icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('SearchScreen')}>
                <Image source={Scope} style={styles.Scope_Icon} />
              </TouchableOpacity>
            </View>
          </View>
        <ScrollView  showsVerticalScrollIndicator={false} >
         
      
          <ImageSlider navigation={navigation} />

          <View style={[styles.Categories_Cont,{marginTop:7}]}>
            <View style={styles.txt_cont} >
            <Text style={styles.Categories_Txt}>{languageData[language].categories}</Text>
            </View>
  
            <Categories navigation={navigation} />
          </View>
          <View style={[styles.Categories_Cont,{marginTop:'-1%'}]}>
          <View style={styles.txt_cont} >
            <Text style={styles.Categories_Txt}>{languageData[language].venues_collection}</Text>
           </View>
            <Venues navigation={navigation} />
          </View>

          <View style={[styles.BestSeller_Cont,{marginTop:"1%"}]}>
          <View style={styles.txt_cont} >
            <Text style={styles.BestSeller_Txt}>{languageData[language].best_sellers}</Text>
            </View>
            <BestSeller  />
          </View>

          <View style={styles.BestSeller_Cont}>
          <View style={styles.txt_cont} >
            <Text style={styles.BestSeller_Txt}>{languageData[language].recently_added}</Text>
            </View>
            <RecentlyAdded />
          </View>
        </ScrollView>

        <LanguageModal visible={alertVisible} onClose={hideAlert} />
       
      </SafeAreaView>
    </View>
  );
};

export default Home;
