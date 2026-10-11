import React, { useState } from 'react';
import { Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Text } from '../../../ui/Text';
import CountryDropdown2 from '../../Component/Dropdown/Data_for_Country';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';
import { MIN_DEAL_PERCENT, useBrandCatalog } from '../../hooks/useBrandCatalog';
import { hbsText } from '../../i18n/translations';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { RootState } from '../../redux_toolkit/store';
import { Colors } from '../../Themes/Colors';
import { Hala_logo_white, Scope } from '../../Themes/Images';
import BestSeller from './BestSellers';
import Categories from './Categories';
import ImageSlider from './FlatOffer';
import HotDeals from './HotDeals';
import RecentlyAdded from './RecentlyAdded';
import { getStyles } from './style';
import Venues from './Venues';

type HomeProps = { navigation: any };

const Section: React.FC<{
  title: string;
  styles: ReturnType<typeof getStyles>;
  hidden?: boolean;
  children: React.ReactNode;
}> = ({ title, styles, hidden, children }) => (
  // Data na ho to section ka fasla bhi na aaye (khali jagah nahi)
  <View style={hidden ? undefined : styles.section}>
    {!hidden && (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    )}
    {children}
  </View>
);

const Home: React.FC<HomeProps> = ({ navigation }) => {
  useStatusBar('dark-content', Colors.surface);
  const language = useSelector((state: RootState) => state.language.language);
  const isEn = language === 'en';
  const styles = getStyles(language);

  const { error, refresh } = useBrandCatalog();
  const [refreshing, setRefreshing] = useState(false);

  const [hasHotDeals, setHasHotDeals] = useState(false);
  const [hasBestSeller, setHasBestSeller] = useState(false);
  const [hasRecentlyAdded, setHasRecentlyAdded] = useState(false);

  const onPullRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Image source={Hala_logo_white} style={styles.logo} />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SearchScreen')}>
            <Image source={Scope} style={styles.searchIcon} />
          </TouchableOpacity>
          <CountryDropdown2 />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} />}>
        {error && (
          <TouchableOpacity accessibilityRole="button" onPress={refresh} style={styles.errorBox}>
            <Text style={styles.errorText}>
              {hbsText(!isEn, 'ui_some_items_could_not_refresh_tap_to_retry')}
            </Text>
          </TouchableOpacity>
        )}

        <ImageSlider />

        <Section title={languageData[language].categories} styles={styles}>
          <Categories navigation={navigation} />
        </Section>

        <Section
          title={isEn ? `🔥 ${MIN_DEAL_PERCENT}%+ OFF` : `🔥 خصم ${MIN_DEAL_PERCENT}%+`}
          styles={styles}
          hidden={!hasHotDeals}>
          <HotDeals onDataLoaded={setHasHotDeals} />
        </Section>

        <Section title={languageData[language].Location} styles={styles}>
          <Venues />
        </Section>

        <Section title={languageData[language].best_sellers} styles={styles} hidden={!hasBestSeller}>
          <BestSeller onDataLoaded={setHasBestSeller} />
        </Section>

        <Section title={languageData[language].recently_added} styles={styles} hidden={!hasRecentlyAdded}>
          <RecentlyAdded onDataLoaded={setHasRecentlyAdded} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
