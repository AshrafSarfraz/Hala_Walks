import React, {useMemo, useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import useBrandCatalog from '../hooks/useBrandCatalog';
import {RootState} from '../redux/store';
import {Text} from './Text';
import OfferListCard from './OfferListCard';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
const normalize = (value: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();
export default function CatalogListScreen({category}: {category?: any}) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {brands, loading, error} = useBrandCatalog();
  const [query, setQuery] = useState('');
  const data = useMemo(
    () =>
      brands.filter(
        item =>
          (!category ||
            normalize(item.selectedCategory) === normalize(category.text)) &&
          (!query.trim() ||
            normalize(item.nameEng).includes(normalize(query)) ||
            normalize(item.nameArabic).includes(normalize(query))),
      ),
    [brands, category, query],
  );
  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor={Colors.White}
        barStyle="dark-content"
      />
      <View style={[styles.top, {paddingTop: insets.top + 8}]}>
     
        <View
          style={[
            styles.searchRow,
            {flexDirection: ar ? 'row-reverse' : 'row'},
          ]}>
          <TouchableOpacity
            accessibilityLabel={ar ? 'رجوع' : 'Back'}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.back}>
            <Ionicons
              name={ar ? 'chevron-forward' : 'chevron-back'}
              size={27}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.search,
              {flexDirection: ar ? 'row-reverse' : 'row'},
            ]}>
            <Ionicons
              name="search-outline"
              size={22}
              color={Colors.textSecondary}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={
                ar ? 'ابحث عن كل ما تحتاجه' : 'Search for anything you need'
              }
              placeholderTextColor={Colors.Grey}
              style={[styles.input, {textAlign: ar ? 'right' : 'left'}]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!query && (
              <TouchableOpacity
                accessibilityLabel={ar ? 'مسح البحث' : 'Clear search'}
                onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.Grey} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Text style={[styles.count, {textAlign: ar ? 'right' : 'left'}]}>
        {ar ? 'النتائج' : 'Items Found'}
        {data.length ? ` · ${data.length}` : ''}
      </Text>
      {loading && !data.length ? (
        <ActivityIndicator
          color={Colors.PrimaryColor}
          style={{marginTop: 40}}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => String(item.id)}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 20,
          }}
          renderItem={({item}) => (
            <OfferListCard
              item={item}
              ar={ar}
              onPress={() => navigation.navigate('DetailScreen', {item})}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error
                ? ar
                  ? 'تعذر تحميل العناصر. يرجى المحاولة مرة أخرى.'
                  : 'Could not load items. Please try again.'
                : ar
                ? 'لا توجد عناصر'
                : 'No items found'}
            </Text>
          }
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.White},
  top: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  heading: {
    fontSize: 20,
    fontFamily: Fonts.F_Bold,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchRow: {alignItems: 'center', gap: 8, paddingHorizontal: 10},
  back: {width: 40, height: 48, alignItems: 'center', justifyContent: 'center'},
  search: {
    flex: 1,
    height: 48,
    alignItems: 'center',          // icon aur text ek line mein
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: Colors.White,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Fonts.F_Regular,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,            // Android ki extra padding khatam
    paddingHorizontal: 0,
    includeFontPadding: false,     // Android: text kat-ne se bachata hai
    textAlignVertical: 'center',
  },
  count: {
    fontSize: 15,
    fontFamily: Fonts.F_Medium,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.Grey,
    paddingVertical: 50,
  },
});
