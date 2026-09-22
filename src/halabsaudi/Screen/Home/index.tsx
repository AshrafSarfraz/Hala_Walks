import {Text} from '../../../ui/Text';
import React, { useEffect, useState } from 'react';
// ✅ FIX: 'react-native' wala SafeAreaView ANDROID PAR KUCH NAHI KARTA.
// Isi wajah se style me `marginTop: '8%'` ka jugaar lagana para tha —
// jo har phone par alag pixel banta hai. Ye wala asli insets deta hai.
import { SafeAreaView } from 'react-native-safe-area-context';
import {View, Image, TouchableOpacity, ScrollView} from 'react-native';
import { Full_logo_B, Full_logo_w, Hala_logo_white, Logo_W, Scope } from '../../Themes/Images';
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
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

type HomeProps = {
  navigation: any;
};

const Home: React.FC<HomeProps> = ({ navigation }) => {
  useStatusBar('light-content', Colors.darkgrey);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [catalogError, setCatalogError] = useState(false);
  const [revision, setRevision] = useState(0);
  const retryCatalog = () => {setCatalogError(false); setRevision(v => v + 1);};

  const [hasBestSeller, setHasBestSeller] = useState(false);     // ✅
  const [hasRecentlyAdded, setHasRecentlyAdded] = useState(false); // ✅

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkgrey }} edges={['top']}>
      <View style={styles.Container}>
        <View style={styles.header}>
          <Image source={Hala_logo_white} style={styles.logo} />
          <View style={styles.language_Cont}>
            <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('SearchScreen')}>
              <Image source={Scope} style={styles.Scope_Icon} />
            </TouchableOpacity>
            <CountryDropdown2 />
          </View>
        </View>

        <ScrollView key={revision} showsVerticalScrollIndicator={false}>
          {catalogError && <TouchableOpacity accessibilityRole="button" onPress={retryCatalog} style={{margin: 16, padding: 14, borderRadius: 12, backgroundColor: Colors.cardBg}}>
            <Text style={{color: Colors.White, lineHeight: 21}}>{language === 'ar' ? 'تعذر تحديث بعض العناصر. اضغط لإعادة المحاولة.' : 'Some items could not refresh. Tap to retry.'}</Text>
          </TouchableOpacity>}
          <ImageSlider onLoadError={() => setCatalogError(true)} />

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
            <Venues />
          </View>

          {/* ✅ Best Seller - sirf tab show karo jab data ho */}
          <View style={[styles.BestSeller_Cont, { marginTop: '1%' }]}>
            {hasBestSeller && (
              <View style={styles.txt_cont}>
                <Text style={styles.BestSeller_Txt}>{languageData[language].best_sellers}</Text>
              </View>
            )}
            <BestSeller onDataLoaded={setHasBestSeller} onLoadError={() => setCatalogError(true)} />
          </View>

          {/* ✅ Recently Added - sirf tab show karo jab data ho */}
          <View style={styles.BestSeller_Cont}>
            {hasRecentlyAdded && (
              <View style={styles.txt_cont}>
                <Text style={styles.BestSeller_Txt}>{languageData[language].recently_added}</Text>
              </View>
            )}
            <RecentlyAdded onDataLoaded={setHasRecentlyAdded} onLoadError={() => setCatalogError(true)} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;