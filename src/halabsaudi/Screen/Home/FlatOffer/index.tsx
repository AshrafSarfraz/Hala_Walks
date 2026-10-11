import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { ActivityIndicator } from '../../../../ui/ActivityIndicator';
import CachedImage from '../../../Component/Media/CachedImage';
import { isActive, norm, useBrandCatalog } from '../../../hooks/useBrandCatalog';
import { RootState } from '../../../redux_toolkit/store';
import { Colors } from '../../../Themes/Colors';
import { GUTTER, SCREEN_W } from '../../../Themes/Layout';
import { getStyles } from './style';

const PAGE_WIDTH = SCREEN_W - GUTTER * 2;

const softMatch = (a: any, b: any) => {
  const A = norm(a);
  const B = norm(b);
  if (!A || !B) return false;
  return A === B || A.includes(B) || B.includes(A);
};

// heroImage pehle, warna logo
const getHeroImage = (item: any) =>
  String(item?.heroImage || '').trim() || String(item?.img || '').trim();

const ImageSlider: React.FC<{onLoadError?: () => void}> = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const { brands, loading } = useBrandCatalog();

  const visibleOffers = useMemo(() => {
    const flat = brands.filter(b => b?.isFlatOffer === true && (b?.status ? isActive(b) : true));
    if (!countryName) return flat;
    return flat.filter(b => softMatch(b?.selectedCountry, countryName));
  }, [brands, countryName]);

  useEffect(() => {
    if (currentIndex >= visibleOffers.length) setCurrentIndex(0);
  }, [visibleOffers.length]);

  const handleScroll = (event: any) => {
    setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / PAGE_WIDTH));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loaderBox]}>
        <ActivityIndicator size="small" color="gray" />
      </View>
    );
  }

  if (!visibleOffers.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleOffers}
        keyExtractor={item => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(_, index) => ({length: PAGE_WIDTH, offset: PAGE_WIDTH * index, index})}
        renderItem={({item}) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.imageContainer}
            onPress={() => navigation.navigate('DetailScreen', {item})}>
            <CachedImage
              uri={getHeroImage(item)}
              priority="high"
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        )}
      />

      {visibleOffers.length > 1 && (
        <View style={styles.pagination}>
          {visibleOffers.map((_: any, index: number) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? Colors.accent : Colors.border,
                  width: index === currentIndex ? 22 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ImageSlider;
