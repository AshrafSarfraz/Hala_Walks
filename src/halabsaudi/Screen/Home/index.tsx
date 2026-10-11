import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {Text} from '../../../ui/Text';
import CountryDropdown2 from '../../Component/Dropdown/Data_for_Country';
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';
import {
  MIN_DEAL_PERCENT,
  useBrandCatalog,
} from '../../hooks/useBrandCatalog';
import {hbsText} from '../../i18n/translations';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import {RootState} from '../../redux_toolkit/store';
import {Colors} from '../../Themes/Colors';
import {Scope} from '../../Themes/Images';
import BestSeller from './BestSellers';
import Categories from './Categories';
import ImageSlider from './FlatOffer';
import HotDeals from './HotDeals';
import RecentlyAdded from './RecentlyAdded';
import {getStyles} from './style';
import Venues from './Venues';

type HomeProps = {
  navigation: any;
};

const Section: React.FC<{
  title: string;
  styles: ReturnType<typeof getStyles>;
  hidden?: boolean;
  children: React.ReactNode;
}> = ({title, styles, hidden, children}) => (
  <View style={hidden ? undefined : styles.section}>
    {!hidden && (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    )}
    {children}
  </View>
);

const Home: React.FC<HomeProps> = ({navigation}) => {
  useStatusBar('dark-content', Colors.surface);

  const language = useSelector(
    (state: RootState) => state.language.language,
  );
  const isEn = language === 'en';
  const styles = getStyles(language);

  const {error, refresh} = useBrandCatalog();

  const [firstName, setFirstName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasHotDeals, setHasHotDeals] = useState(false);
  const [hasBestSeller, setHasBestSeller] = useState(false);
  const [hasRecentlyAdded, setHasRecentlyAdded] = useState(false);

  // Read the latest saved name whenever Home becomes active.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadName = async () => {
        try {
          const saved = await AsyncStorage.getItem('hala_user_backend');
          const user = saved ? JSON.parse(saved) : null;

          const name =
            typeof user?.name === 'string'
              ? user.name.trim().split(/\s+/)[0]
              : '';

          if (active) {
            setFirstName(name);
          }
        } catch {
          if (active) {
            setFirstName('');
          }
        }
      };

      loadName();

      return () => {
        active = false;
      };
    }, []),
  );

  const onPullRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const greeting = isEn
    ? firstName
      ? `Hi, ${firstName} 👋`
      : 'Hi there 👋'
    : firstName
      ? `أهلاً، ${firstName} 👋`
      : 'أهلاً بك 👋';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text
            style={styles.welcomeText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}>
            {isEn
              ? 'Discover more, save more'
              : 'اكتشف المزيد، ووفّر أكثر'}
          </Text>

          <Text style={styles.userName} numberOfLines={1}>
            {greeting}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={isEn ? 'Search' : 'بحث'}
            style={styles.iconBtn}
            onPress={() => navigation.navigate('SearchScreen')}>
            <Image source={Scope} style={styles.searchIcon} />
          </TouchableOpacity>

          <CountryDropdown2 />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }>
        {!!error && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={refresh}
            style={styles.errorBox}>
            <Text style={styles.errorText}>
              {hbsText(
                !isEn,
                'ui_some_items_could_not_refresh_tap_to_retry',
              )}
            </Text>
          </TouchableOpacity>
        )}

        <ImageSlider />

        <Section
          title={languageData[language].categories}
          styles={styles}>
          <Categories navigation={navigation} />
        </Section>

        <Section
          title={
            isEn
              ? `🔥 ${MIN_DEAL_PERCENT}%+ OFF`
              : `🔥 خصم ${MIN_DEAL_PERCENT}%+`
          }
          styles={styles}
          hidden={!hasHotDeals}>
          <HotDeals onDataLoaded={setHasHotDeals} />
        </Section>

        <Section
          title={languageData[language].Location}
          styles={styles}>
          <Venues />
        </Section>

        <Section
          title={languageData[language].best_sellers}
          styles={styles}
          hidden={!hasBestSeller}>
          <BestSeller onDataLoaded={setHasBestSeller} />
        </Section>

        <Section
          title={languageData[language].recently_added}
          styles={styles}
          hidden={!hasRecentlyAdded}>
          <RecentlyAdded onDataLoaded={setHasRecentlyAdded} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;