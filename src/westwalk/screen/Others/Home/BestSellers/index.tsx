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
import {isActiveBrand, isBestSeller} from '../homeData';
import {SectionHeader, SectionStatus, brandName} from '../homeUi';

const CARD_W = 150;
const MEDAL = ['#E3A92B', '#9BA4AE', '#C27C4A']; // gold, silver, bronze

/** Ranked portrait cards with a #1 / #2 / #3 medal badge. */
export default function BestSellers() {
  const navigation = useNavigation<any>();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {brands, loading, error} = useBrandCatalog();
  const data = useMemo(
    () => brands.filter(b => isBestSeller(b) && isActiveBrand(b)).slice(0, 10),
    [brands],
  );
  if (!loading && !data.length && !error) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        ar={ar}
        icon="trophy-outline"
        title={ar ? 'الأكثر مبيعًا' : 'Best Sellers'}
        subtitle={ar ? 'المفضلة لدى زوار ويست ووك' : 'West Walk favourites'}
        accent="#B7861C"
        accentSoft="#FFF6E0"
      />
      {!data.length ? (
        <SectionStatus ar={ar} loading={loading} height={220} />
      ) : (
        <FlatList
          data={data}
          horizontal
          inverted={ar}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          keyExtractor={b => String(b.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{width: 12}} />}
          renderItem={({item, index}) => {
            const pct = getDiscountPercent(item);
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.card}
                onPress={() => navigation.navigate('DetailScreen', {item})}>
                <View>
                  <CachedImage
                    uri={String(item.img || '')}
                    style={styles.image}
                    priority={index < 2 ? 'high' : 'normal'}
                  />
                  {/* <View
                    style={[
                      styles.rank,
                      ar ? {right: 8} : {left: 8},
                      {backgroundColor: MEDAL[index] || Colors.PrimaryColor},
                    ]}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View> */}
                  {pct > 0 && (
                    <View style={[styles.off, ar ? {left: 8} : {right: 8}]}>
                      <Text style={styles.offText}>
                        {ar ? `خصم ${pct}٪` : `${pct}% OFF`}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.body}>
                  <Text
                    style={[styles.name, {textAlign: ar ? 'right' : 'left'}]}
                    numberOfLines={1}>
                    {brandName(item, ar)}
                  </Text>
                  <View
                    style={[
                      styles.metaRow,
                      {flexDirection: ar ? 'row-reverse' : 'row'},
                    ]}>
                    <Ionicons name="star" size={11} color="#E3A92B" />
                    <Text style={styles.meta} numberOfLines={1}>
                      {item.selectedCategory}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {marginTop: 24},
  list: {paddingHorizontal: 16},
  card: {
    width: CARD_W,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {width: CARD_W, height: 170},
  rank: {
    position: 'absolute',
    top: 8,
    minWidth: 34,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.White,
  },
  rankText: {fontSize: 12, fontFamily: Fonts.F_Bold, color: Colors.White},
  off: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: Colors.PrimaryColor,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offText: {fontSize: 10, fontFamily: Fonts.F_Bold, color: Colors.White},
  body: {padding: 10},
  name: {fontSize: 14, fontFamily: Fonts.F_Bold},
  metaRow: {alignItems: 'center', gap: 4, marginTop: 3},
  meta: {fontSize: 11, color: Colors.textSecondary, flexShrink: 1},
});
