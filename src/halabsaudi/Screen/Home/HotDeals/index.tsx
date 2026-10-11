import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useSelector} from 'react-redux';
import {Text} from '../../../../ui/Text';
import {
  getDiscountPercent,
  isActive,
  MIN_DEAL_PERCENT,
  norm,
  sameCountry,
  useBrandCatalog,
} from '../../../hooks/useBrandCatalog';
import {RootState} from '../../../redux_toolkit/store';
import {GAP} from '../../../Themes/Layout';
import {Colors} from '../../../Themes/Colors';
import {CARD_W, IMAGE_W, getStyles} from './style';

const DEALS_LIMIT = 15;

const brandKey = (item: any) =>
  norm(item.nameEng) || norm(item.nameArabic) || String(item.id);

type Props = {
  onDataLoaded?: (hasData: boolean) => void;
};

const HotDeals: React.FC<Props> = ({onDataLoaded}) => {
  const navigation = useNavigation<any>();

  const country = useSelector(
    (state: RootState) => state.country?.countryName ?? null,
  );
  const language = useSelector(
    (state: RootState) => state.language.language,
  );

  const isEn = language === 'en';
  const styles = getStyles(language);
  const {brands, loading} = useBrandCatalog();

  // URI se track karne par image change ho to purana ratio use nahi hoga.
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

  const deals = useMemo(() => {
    const sorted = brands
      .filter(
        brand =>
          isActive(brand) &&
          sameCountry(brand.selectedCountry, country),
      )
      .map(brand => ({
        ...brand,
        discount: getDiscountPercent(brand),
      }))
      .filter(brand => brand.discount >= MIN_DEAL_PERCENT)
      .sort(
        (a, b) =>
          b.discount - a.discount ||
          (b.createdAtMs || 0) - (a.createdAtMs || 0),
      );

    const seen = new Set<string>();
    const unique: any[] = [];

    for (const item of sorted) {
      const key = brandKey(item);

      if (seen.has(key)) continue;

      seen.add(key);
      unique.push(item);

      if (unique.length === DEALS_LIMIT) break;
    }

    return unique;
  }, [brands, country]);

  useEffect(() => {
    if (!loading) {
      onDataLoaded?.(deals.length > 0);
    }
  }, [loading, deals.length, onDataLoaded]);

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const uri = String(item.img || '');
    const isLoaded = loadedImages[uri] ?? false;
    const ratio = imageRatios[uri] || 1;
    const imageHeight = IMAGE_W / ratio;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() => navigation.navigate('DetailScreen', {item})}>
        <View style={[styles.imageWrap, {height: imageHeight}]}>
          <ShimmerPlaceholder
            visible={isLoaded}
            LinearGradient={LinearGradient}
            style={{width: IMAGE_W, height: imageHeight}}>
            <FastImage
              source={{
                uri,
                priority:
                  index < 3
                    ? FastImage.priority.high
                    : FastImage.priority.normal,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain}
              onLoad={event => {
                const {width, height} = event.nativeEvent;

                if (width > 0 && height > 0) {
                  const nextRatio = width / height;

                  setImageRatios(previous =>
                    previous[uri] === nextRatio
                      ? previous
                      : {...previous, [uri]: nextRatio},
                  );
                }
              }}
              onLoadEnd={() =>
                setLoadedImages(previous =>
                  previous[uri]
                    ? previous
                    : {...previous, [uri]: true},
                )
              }
            />
          </ShimmerPlaceholder>

          <View pointerEvents="none" style={styles.ribbon}>
            <Text style={styles.ribbonNum}>{item.discount}%</Text>
            <Text style={styles.ribbonOff}>
              {isEn ? 'OFF' : 'خصم'}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {isEn ? item.nameEng : item.nameArabic}
          </Text>

          {!!item.selectedCategory && (
            <Text style={styles.meta} numberOfLines={1}>
              {item.selectedCategory}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <FlatList
        data={[0, 1, 2]}
        horizontal
        inverted={!isEn}
        keyExtractor={item => String(item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        renderItem={() => (
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.shimmerCard}
          />
        )}
      />
    );
  }

  if (!deals.length) return null;

  return (
    <FlatList
      data={deals}
      extraData={{loadedImages, imageRatios}}
      horizontal
      inverted={!isEn}
      keyExtractor={item => String(item.id)}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_W + GAP}
      decelerationRate="fast"
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{width: GAP}} />}
      renderItem={renderItem}
    />
  );
};

export default HotDeals;