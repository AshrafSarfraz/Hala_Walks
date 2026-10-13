import React, {useMemo} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../../components/Text';
import CachedImage from '../../../../components/Media/CachedImage';
import useBrandCatalog from '../../../../hooks/useBrandCatalog';
import {getDiscountPercent} from '../../../../utils/offers';
import {RootState} from '../../../../redux/store';
import {Colors} from '../../../../theme/Colors';
import {Fonts} from '../../../../theme/Fonts';
import {chunk, discountDeals} from '../homeData';
import {SectionHeader, SectionStatus, brandName} from '../homeUi';

const TILE_W = 272;

/** 20% – 39%. Compact tiles, two rows that scroll sideways together. */
export default function Deals() {
  const navigation = useNavigation<any>();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {brands, loading, error} = useBrandCatalog();
  const data = useMemo(
    () => discountDeals(brands, getDiscountPercent, 20, 40, 16),
    [brands],
  );
  const columns = useMemo(() => chunk(data, 2), [data]);
  if (!loading && !data.length && !error) return null;

  const row = {flexDirection: ar ? 'row-reverse' : 'row'} as const;
  const align = {textAlign: ar ? 'right' : 'left'} as const;

  const Tile = ({item}: {item: any}) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.tile, row]}
      onPress={() => navigation.navigate('DetailScreen', {item})}>
      <CachedImage uri={String(item.img || '')} style={styles.thumb} />
      <View style={styles.tileBody}>
        <Text style={[styles.name, align]} numberOfLines={1}>
          {brandName(item, ar)}
        </Text>
        <Text style={[styles.meta, align]} numberOfLines={1}>
          {item.selectedCategory}
        </Text>
        <View style={[styles.chip, {alignSelf: ar ? 'flex-end' : 'flex-start'}]}>
          <Text style={styles.chipText}>
            {ar
              ? `خصم ${getDiscountPercent(item)}٪`
              : `${getDiscountPercent(item)}% OFF`}
          </Text>
        </View>
      </View>
      <Ionicons
        name={ar ? 'chevron-back' : 'chevron-forward'}
        size={16}
        color={Colors.Grey}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <SectionHeader
        ar={ar}
        icon="pricetags-outline"
        title={ar ? 'خصومات ٢٠٪ – ٣٩٪' : '20% – 39% OFF'}
        subtitle={ar ? 'توفير رائع كل يوم' : 'Great everyday savings'}
        count={data.length}
      />
      {!data.length ? (
        <SectionStatus ar={ar} loading={loading} height={180} />
      ) : (
        <FlatList
          data={columns}
          horizontal
          inverted={ar}
          showsHorizontalScrollIndicator={false}
          keyExtractor={col => col.map(b => String(b.id)).join('|')}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{width: 12}} />}
          snapToInterval={TILE_W + 12}
          decelerationRate="fast"
          renderItem={({item: col}) => (
            <View style={styles.column}>
              {col.map(b => (
                <Tile key={String(b.id)} item={b} />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {marginTop: 24},
  list: {paddingHorizontal: 16},
  column: {width: TILE_W, gap: 10},
  tile: {
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.White,
  },
  thumb: {width: 72, height: 72, borderRadius: 12},
  tileBody: {flex: 1},
  name: {fontSize: 14, fontFamily: Fonts.F_Bold},
  meta: {fontSize: 11, color: Colors.textSecondary, marginTop: 2},
  chip: {
    marginTop: 8,
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: {fontSize: 11, fontFamily: Fonts.F_Bold, color: Colors.PrimaryColor},
});
