import useMember from '../../../hooks/useMember';
import {memberName} from '../../../utils/member';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../components/Text';
import ImageSlider from './FlatOffer';
import Categories from './Categories';
import EventSlider from './Events';
import HotDeals from './HotDeals';
import Deals from './Deals';
import BestSellers from './BestSellers';
import RecentlyAdded from './RecentlyAdded';
import {SectionHeader} from './homeUi';
import LanguageModal from '../../../components/Modal/Lan_Modal';
import {refreshBrandCatalog} from '../../../hooks/useBrandCatalog';
import {RootState} from '../../../redux/store';
import {Colors} from '../../../theme/Colors';
import {Fonts} from '../../../theme/Fonts';
export default function Home({
  navigation,
  role,
}: {
  navigation: any;
  role?: 'staff' | 'tenant' | 'org';
}) {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const insets = useSafeAreaInsets();
  const member = useMember(
    role === 'staff'
      ? 'staff_data'
      : role === 'tenant'
      ? 'tenant_data'
      : role === 'org'
      ? 'org_emp_data'
      : undefined,
  );
  const firstName = memberName(member).split(/\s+/)[0];
  const [languageVisible, setLanguageVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      void refreshBrandCatalog();
    }, []),
  );
  const refresh = async () => {
    setRefreshing(true);
    setRefreshKey(value => value + 1);
    try {
      await refreshBrandCatalog(true);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <View style={styles.root}>
      <StatusBar barStyle='light-content' backgroundColor={Colors.brandGreen} />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            flexDirection: ar ? 'row-reverse' : 'row',
          },
        ]}>
        <View style={{flex: 1}}>
          <Text style={styles.tagline}>
            {ar ? 'اكتشف أكثر، ووفر أكثر' : 'Discover more, save more'}
          </Text>
          <Text style={styles.brand}>
            {ar ? 'مرحبًا' : 'Hi'}
            {firstName ? `, ${firstName}` : ''} 👋
          </Text>
        </View>
        <View style={{flexDirection: 'row', gap: 4}}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={ar ? 'اللغة' : 'Language'}
            onPress={() => setLanguageVisible(true)}
            style={styles.headerButton}>
            <Ionicons
              name="language-outline"
              size={21}
              color={Colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={ar ? 'بحث' : 'Search'}
            onPress={() => navigation.navigate('SearchScreen')}
            style={styles.headerButton}>
            <Ionicons
              name="search-outline"
              size={21}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 90}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.PrimaryColor}
            colors={[Colors.PrimaryColor]}
          />
        }>
        <View style={styles.categories}>
          <SectionHeader
            ar={ar}
            icon="grid-outline"
            title={ar ? 'الفئات' : 'Categories'}
          />
          <Categories navigation={navigation} />
        </View>
        <ImageSlider navigation={navigation} />
        <HotDeals />
        <BestSellers />
        <EventSlider navigation={navigation} refreshKey={refreshKey} />
        <Deals />
        <RecentlyAdded />
      </ScrollView>
      <LanguageModal
        visible={languageVisible}
        onClose={() => setLanguageVisible(false)}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.White},
  header: {
    backgroundColor: Colors.brandGreen,
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagline: {fontSize: 12, color: Colors.white, marginBottom: 5},
  brand: {
    fontSize: 21,
    fontFamily: Fonts.F_Bold,
    color: Colors.white,
    flexShrink: 1,
  },
  headerButton: {
    width: 38,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categories: {marginTop: 16},
});
