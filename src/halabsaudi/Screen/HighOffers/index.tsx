import React, {useEffect, useMemo, useState} from 'react';
import {View, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../ui/Text';
import {RemoteImage} from '../../../ui/RemoteImage';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';
import {Colors} from '../../Themes/Colors';
import {experienceCopy} from '../../i18n/translations';
import {fetchBrandCatalog} from '../../api/brandCatalog';
import {highOfferBrands, maxPercentageOffer} from '../../api/catalogFilters';
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';

function useOffers() {
  const country = useSelector((s: any) => s.country.countryName || 'Qatar');
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(false);
    void fetchBrandCatalog()
      .then(res => res.json())
      .then(data => {
        if (live)
          setBrands(
            data.data.map(item => ({...item, id: item._id || item.id})),
          );
      })
      .catch(() => {
        if (live) setError(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [revision]);
  return {
    country,
    brands,
    loading,
    error,
    retry: () => setRevision(value => value + 1),
  };
}
function OfferCard({item, compact = false}: {item: any; compact?: boolean}) {
  const navigation = useNavigation<any>();
  const ar = useSelector((s: any) => s.language.language === 'ar');
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[s.card, compact && {width: 210, marginRight: 12}]}
      onPress={() => navigation.navigate('DetailScreen', {item})}>
      <RemoteImage
        uri={item.heroImage || item.img}
        style={{width: '100%', height: compact ? 130 : 175, borderRadius: 16}}
      />
      <View style={s.badge}>
        <Text style={s.badgeText}>
          {ar ? 'حتى' : 'Up to'} {maxPercentageOffer(item)}%
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={[s.name, {textAlign: ar ? 'right' : 'left'}]}>
        {ar ? item.nameArabic || item.nameEng : item.nameEng || item.nameArabic}
      </Text>
      <Text
        numberOfLines={1}
        style={[s.category, {textAlign: ar ? 'right' : 'left'}]}>
        {item.selectedCategory}
      </Text>
    </TouchableOpacity>
  );
}
export function OffersSection({onLoadError}: {onLoadError?: () => void}) {
  const navigation = useNavigation<any>();
  const language: 'en' | 'ar' = useSelector((s: any) => s.language.language);
  const t = experienceCopy[language];
  const {country, brands, loading, error, retry} = useOffers();
  const offers = useMemo(
    () => highOfferBrands(brands, country),
    [brands, country],
  );
  useEffect(() => {
    if (error) onLoadError?.();
  }, [error, onLoadError]);
  if (!loading && !offers.length && !error) return null;
  return (
    <View style={s.section}>
      <View
        style={[
          s.heading,
          {flexDirection: language === 'ar' ? 'row-reverse' : 'row'},
        ]}>
        <Text style={s.title}>{t.offers}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HighOffers')}>
          <Text style={s.link}>{t.all}</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : error ? (
        <TouchableOpacity onPress={retry}>
          <Text style={s.link}>{t.retry}</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          horizontal
          data={offers.slice(0, 8)}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => <OfferCard item={item} compact />}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={2}
          windowSize={3}
        />
      )}
    </View>
  );
}
export default function HighOffers({navigation}: any) {
  useStatusBar('light-content', Colors.background);
  const language: 'en' | 'ar' = useSelector((s: any) => s.language.language);
  const t = experienceCopy[language];
  const {country, brands, loading, error, retry} = useOffers();
  const [minimum, setMinimum] = useState(20);
  const offers = useMemo(
    () => highOfferBrands(brands, country, minimum),
    [brands, country, minimum],
  );
  return (
    <SafeAreaView style={s.page}>
      <View
        style={[
          s.heading,
          {flexDirection: language === 'ar' ? 'row-reverse' : 'row'},
        ]}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}>
          <Ionicons
            name={language === 'ar' ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
        <Text style={s.title}>{t.offers}</Text>
      </View>
      <Text style={s.subtitle}>
        {t.offerHint} · {country}
      </Text>
      <View style={s.filters}>
        {[20, 30].map(value => (
          <TouchableOpacity
            key={value}
            accessibilityRole="button"
            accessibilityState={{selected: minimum === value}}
            onPress={() => setMinimum(value)}
            style={[
              s.filter,
              minimum === value && {backgroundColor: Colors.accent},
            ]}>
            <Text style={s.filterText}>{value}%+</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <TouchableOpacity style={s.empty} onPress={retry}>
          <Text style={s.link}>{t.retry}</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => <OfferCard item={item} />}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          contentContainerStyle={{padding: 16, paddingBottom: 32}}
          ListEmptyComponent={<Text style={s.emptyText}>{t.noOffers}</Text>}
        />
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: {flex: 1, backgroundColor: Colors.background},
  section: {paddingHorizontal: 16, marginVertical: 16},
  heading: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {fontSize: 19, fontWeight: '700', color: Colors.white},
  link: {fontSize: 14, color: Colors.accent, paddingVertical: 8},
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 20,
    marginBottom: 14,
  },
  badge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {color: Colors.white, fontSize: 13, fontWeight: '700'},
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  category: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  filter: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.surface,
  },
  filterText: {color: Colors.white, fontWeight: '600'},
  empty: {padding: 24},
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
