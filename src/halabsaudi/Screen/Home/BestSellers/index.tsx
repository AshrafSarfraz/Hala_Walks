import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { useSelector } from 'react-redux';
import { Text } from '../../../../ui/Text';
import { getDiscountPercent, isActive, sameCountry, useBrandCatalog } from '../../../hooks/useBrandCatalog';
import { RootState } from '../../../redux_toolkit/store';
import { GAP, GUTTER } from '../../../Themes/Layout';
import { CARD_W, getStyles } from './style';

type Props = {onDataLoaded?: (hasData: boolean) => void; onLoadError?: () => void};

const BestSeller: React.FC<Props> = ({onDataLoaded}) => {
  const navigation = useNavigation<any>();
  const country = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const isEn = language === 'en';
  const styles = getStyles(language);

  const {brands, loading} = useBrandCatalog();
  const [loadedCards, setLoadedCards] = useState<{[key: string]: boolean}>({});

  const list = useMemo(
    () =>
      brands.filter(
        b => isActive(b) && b?.isBestSeller === true && sameCountry(b?.selectedCountry, country),
      ),
    [brands, country],
  );

  useEffect(() => {
    if (!loading) onDataLoaded?.(list.length > 0);
  }, [loading, list.length]);

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isLoaded = loadedCards[item.id] ?? false;
    const discount = getDiscountPercent(item);
    const title = isEn ? item.nameEng : item.nameArabic;
    const desc = isEn ? item.descriptionEng : item.descriptionArabic;

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
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>★ {isEn ? 'Best Seller' : 'الأكثر مبيعاً'}</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {!!desc && (
            <Text style={styles.desc} numberOfLines={2}>
              {desc}
            </Text>
          )}

          <View style={styles.metaRow}>
            {!!item.selectedCategory && (
              <Text style={styles.meta} numberOfLines={1}>
                {item.selectedCategory}
              </Text>
            )}
            {discount > 0 && (
              <View style={styles.offPill}>
                <Text style={styles.offText}>{discount}% {isEn ? 'OFF' : 'خصم'}</Text>
              </View>
            )}
          </View>
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
        contentContainerStyle={{paddingHorizontal: GUTTER, paddingVertical: 6}}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        renderItem={() => (
          <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.shimmerCard} />
        )}
      />
    );
  }

  if (!list.length) return null;

  return (
    <FlatList
      data={list}
      horizontal
      inverted={!isEn}
      keyExtractor={item => String(item.id)}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_W + GAP}
      decelerationRate="fast"
      contentContainerStyle={{paddingHorizontal: GUTTER, paddingVertical: 6}}
      ItemSeparatorComponent={() => <View style={{width: GAP}} />}
      renderItem={renderItem}
    />
  );
};

export default BestSeller;
