import React, {useMemo} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../../components/Text';
import CachedImage from '../../../../components/Media/CachedImage';
import {brandImageProps} from '../../../../utils/brandCover';
import useBrandCatalog from '../../../../hooks/useBrandCatalog';
import {getDiscountPercent} from '../../../../utils/offers';
import {RootState} from '../../../../redux/store';
import {Colors} from '../../../../theme/Colors';
import {Fonts} from '../../../../theme/Fonts';
import {discountDeals} from '../homeData';
import {HOT, SectionHeader, SectionStatus, brandName} from '../homeUi';

const CARD_W = 220;
const IMG_H = 150;

/** 40% and above. Keeps the ribbon card design, larger, on a warm band. */
export default function HotDeals() {
  const navigation = useNavigation<any>();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {brands, loading, error} = useBrandCatalog();
  const data = useMemo(
    () => discountDeals(brands, getDiscountPercent, 40),
    [brands],
  );
  if (!loading && !data.length && !error) return null;

  return (
    <View style={styles.band}>
      <SectionHeader
        ar={ar}
        emoji="🔥"
        title={ar ? 'عروض نارية · ٤٠٪ وأكثر' : 'Hot Deals · 40%+ OFF'}
        subtitle={ar ? 'أكبر الخصومات في ويست ووك' : 'The biggest discounts at West Walk'}
        accent={HOT.main}
        accentSoft={HOT.soft}
        count={data.length}
      />
      {!data.length ? (
        <SectionStatus ar={ar} loading={loading} height={IMG_H + 60} />
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
                    {...brandImageProps(item, 'cover')}
                    style={styles.image}
                    priority={index < 2 ? 'high' : 'normal'}
                  />
                  <View style={[styles.ribbon, ar ? {left: 12} : {right: 12}]}>
                    <Text style={styles.ribbonNumber}>{pct}%</Text>
                    <Text style={styles.ribbonOff}>{ar ? 'خصم' : 'OFF'}</Text>
                  </View>
                  <View style={[styles.hotTag, ar ? {right: 10} : {left: 10}]}>
                    <Text style={styles.hotTagText}>
                      🔥 {ar ? 'عرض ساخن' : 'HOT'}
                    </Text>
                  </View>
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
                    <Ionicons
                      name="pricetag-outline"
                      size={12}
                      color={Colors.textSecondary}
                    />
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
  band: {
    backgroundColor: HOT.band,
    paddingTop: 18,
    paddingBottom: 20,
    marginTop: 24,
  },
  list: {paddingHorizontal: 16},
  card: {
    width: CARD_W,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: '#F6D9CF',
  },
  image: {width: CARD_W, height: IMG_H},
  ribbon: {
    position: 'absolute',
    top: 0,
    backgroundColor: HOT.main,
    paddingHorizontal: 9,
    paddingTop: 10,
    paddingBottom: 9,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  ribbonNumber: {fontSize: 19, fontFamily: Fonts.F_Bold, color: Colors.White},
  ribbonOff: {fontSize: 10, color: Colors.White, marginTop: -2},
  hotTag: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hotTagText: {fontSize: 10, fontFamily: Fonts.F_Bold, color: Colors.White},
  body: {padding: 12},
  name: {fontSize: 15, fontFamily: Fonts.F_Bold},
  metaRow: {alignItems: 'center', gap: 4, marginTop: 4},
  meta: {fontSize: 11, color: Colors.textSecondary, flexShrink: 1},
});
