import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Full_logo_B, Scope } from '../../Themes/Images';
import ImageSlider from './FlatOffer';
import Categories from './Categories';
import BestSeller from './BestSellers';
import RecentlyAdded from './RecentlyAdded';
import { Colors } from '../../Themes/Colors';
import Venues from './Venues';
import { useSelector } from 'react-redux';
import { getStyles } from './style';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import CountryDropdown2 from '../../Component/Dropdown/Data_for_Country';
import { RootState } from '../../redux_toolkit/store';

type HomeProps = {
  navigation: any;
};

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [hasBestSeller, setHasBestSeller] = useState(false);     // ✅
  const [hasRecentlyAdded, setHasRecentlyAdded] = useState(false); // ✅

  return (
    <View style={{ flex: 1, backgroundColor: Colors.Bg }}>
      <StatusBar hidden={false} translucent animated backgroundColor={Colors.Bg} barStyle="dark-content" />
      <SafeAreaView style={styles.Container}>
        <View style={styles.header}>
          <Image source={Full_logo_B} style={styles.logo} />
          <View style={styles.language_Cont}>
            <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('SearchScreen')}>
              <Image source={Scope} style={styles.Scope_Icon} />
            </TouchableOpacity>
            <CountryDropdown2 />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ImageSlider navigation={navigation} />

          <View style={[styles.Categories_Cont, { marginTop: 7 }]}>
            <View style={styles.txt_cont}>
              <Text style={styles.Categories_Txt}>{languageData[language].categories}</Text>
            </View>
            <Categories navigation={navigation} />
          </View>

          <View style={[styles.Categories_Cont, { marginTop: '-1%' }]}>
            <View style={styles.txt_cont}>
              <Text style={styles.Categories_Txt}>{languageData[language].Location}</Text>
            </View>
            <Venues navigation={navigation} />
          </View>

          {/* ✅ Best Seller - sirf tab show karo jab data ho */}
          <View style={[styles.BestSeller_Cont, { marginTop: '1%' }]}>
            {hasBestSeller && (
              <View style={styles.txt_cont}>
                <Text style={styles.BestSeller_Txt}>{languageData[language].best_sellers}</Text>
              </View>
            )}
            <BestSeller onDataLoaded={setHasBestSeller} />
          </View>

          {/* ✅ Recently Added - sirf tab show karo jab data ho */}
          <View style={styles.BestSeller_Cont}>
            {hasRecentlyAdded && (
              <View style={styles.txt_cont}>
                <Text style={styles.BestSeller_Txt}>{languageData[language].recently_added}</Text>
              </View>
            )}
            <RecentlyAdded onDataLoaded={setHasRecentlyAdded} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;