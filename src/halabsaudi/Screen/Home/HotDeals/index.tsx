// Home pe 20% ya zyada discount wale brands ki list.
// Card pe click → DetailScreen (Best Seller / Recently Added jaisa).
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { useSelector } from 'react-redux';
import { Text } from '../../../../ui/Text';
import {
  getDiscountPercent,
  isActive,
  MIN_DEAL_PERCENT,
  norm,
  sameCountry,
  useBrandCatalog,
} from '../../../hooks/useBrandCatalog';
import { RootState } from '../../../redux_toolkit/store';
import { DEAL_GRADIENT, GAP } from '../../../Themes/Layout';
import { CARD_W, getStyles } from './style';

const DEALS_LIMIT = 15;

// Ek brand ki kai branches hon to sirf ek dikhe
const brandKey = (item: any) => norm(item.nameEng) || norm(item.nameArabic) || String(item.id);

type Props = {onDataLoaded?: (hasData: boolean) => void};

const HotDeals: React.FC<Props> = ({onDataLoaded}) => {
  const navigation = useNavigation<any>();
  const country = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((s: RootState) => s.language.language);
  const isEn = language === 'en';
  const styles = getStyles(language);

  const {brands, loading} = useBrandCatalog();
  const [loadedCards, setLoadedCards] = useState<{[k: string]: boolean}>({});

  const deals = useMemo(() => {
    const sorted = brands
      .filter(b => isActive(b) && sameCountry(b.selectedCountry, country))
      .map(b => ({...b, discount: getDiscountPercent(b)}))
      .filter(b => b.discount >= MIN_DEAL_PERCENT)
      // sabse bada discount pehle, barabar ho to naya pehle
      .sort((a, b) => b.discount - a.discount || (b.createdAtMs || 0) - (a.createdAtMs || 0));

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
    if (!loading) onDataLoaded?.(deals.length > 0);
  }, [loading, deals.length]);

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isLoaded = loadedCards[item.id] ?? false;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() => navigation.navigate('DetailScreen', {item})}>
        <View style={styles.imageWrap}>
          <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={styles.image}>
            <FastImage
              source={{
                uri: item.img,
                priority: index < 3 ? FastImage.priority.high : FastImage.priority.normal,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              onLoadEnd={() => setLoadedCards(p => ({...p, [item.id]: true}))}
            />
          </ShimmerPlaceholder>

          <LinearGradient colors={DEAL_GRADIENT} style={styles.ribbon}>
            <Text style={styles.ribbonNum}>{item.discount}%</Text>
            <Text style={styles.ribbonOff}>{isEn ? 'OFF' : 'خصم'}</Text>
          </LinearGradient>
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
        keyExtractor={i => String(i)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        renderItem={() => (
          <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.shimmerCard} />
        )}
      />
    );
  }

  if (!deals.length) return null;

  return (
    <FlatList
      data={deals}
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
