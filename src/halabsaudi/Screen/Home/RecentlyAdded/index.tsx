import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import BrandImage from '../../../Component/Media/BrandImage';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { useSelector } from 'react-redux';
import { Text } from '../../../../ui/Text';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';
import DistanceFromDevice from '../../../Component/distanceCalculate/distanceCalculate';
import { getDiscountPercent, isActive, norm, sameCountry, useBrandCatalog } from '../../../hooks/useBrandCatalog';
import { permissionStatus } from '../../../permissions/service';
import { RootState } from '../../../redux_toolkit/store';
import { Location } from '../../../Themes/Images';
import { GAP } from '../../../Themes/Layout';
import { CARD_W, getStyles } from './style';

const RECENT_LIMIT = 10;           // kitne unique brands dikhane hain
const NEW_BADGE_DAYS = 14;         // itne din tak "NEW" badge dikhega
const DAY_MS = 24 * 60 * 60 * 1000;

// Brand ki pehchan: ek brand ki saari branches ka naam same hota hai.
// Agar API mein brandId / parentId ho to usay yahan pehle rakho.
const brandKey = (item: any) => norm(item.nameEng) || norm(item.nameArabic) || String(item.id);

type Props = {onDataLoaded?: (hasData: boolean) => void; onLoadError?: () => void};

const RecentlyAdded: React.FC<Props> = ({onDataLoaded}) => {
  const navigation = useNavigation<any>();

  const reduxCountry = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const isEn = language === 'en';
  const styles = getStyles(language);

  const [deviceCountry, setDeviceCountry] = useState<string | null>(null);
  const [loadedCards, setLoadedCards] = useState<{[k: string]: boolean}>({});
  const [userLocation, setUserLocation] = useState<{lat: number; long: number} | null>(null);
  const selectedCountry = reduxCountry || deviceCountry;

  const {brands, loading} = useBrandCatalog();

  /* ---------------- location ---------------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if ((await permissionStatus('location')) !== 'granted') return;
        Geolocation.getCurrentPosition(
          pos => alive && setUserLocation({lat: pos.coords.latitude, long: pos.coords.longitude}),
          err => console.log('❌ Location error:', err),
          {enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000},
        );
      } catch (e) {
        console.log('Permission error:', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ---------------- last 10 unique brands ---------------- */
  const items = useMemo(() => {
    const sorted = brands
      .filter(b => isActive(b))
      .filter(b => Number.isFinite(b.createdAtMs))
      .filter(b => sameCountry(b.selectedCountry, selectedCountry))
      .sort((a, b) => b.createdAtMs - a.createdAtMs); // latest pehle

    const seen = new Set<string>();
    const unique: any[] = [];
    for (const item of sorted) {
      const key = brandKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
      if (unique.length === RECENT_LIMIT) break;
    }
    return unique;
  }, [brands, selectedCountry]);

  const waitingForCountry = !selectedCountry;
  const isLoading = loading || waitingForCountry;

  useEffect(() => {
    if (!isLoading) onDataLoaded?.(items.length > 0);
  }, [isLoading, items.length]);

  /* ---------------- render ---------------- */
  const renderItem = ({item, index}: {item: any; index: number}) => {
    const isNew = Date.now() - item.createdAtMs < NEW_BADGE_DAYS * DAY_MS;
    const discount = getDiscountPercent(item);
    const isLoaded = loadedCards[item.id] ?? false;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() => navigation.navigate('DetailScreen', {item})}>
        <View style={styles.imageWrap}>
          <ShimmerPlaceholder visible={isLoaded} LinearGradient={LinearGradient} style={styles.image}>
            <BrandImage
              item={item}
              priority={index < 2 ? FastImage.priority.high : FastImage.priority.normal}
              style={styles.image}
              onLoadEnd={() => setLoadedCards(p => ({...p, [item.id]: true}))}
            />
          </ShimmerPlaceholder>

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.35)']} style={styles.imageFade} />

          <View style={styles.badgeRow}>
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>{isEn ? 'NEW' : 'جديد'}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.offBadge}>
                <Text style={styles.offText}>{discount}% {isEn ? 'OFF' : 'خصم'}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {isEn ? item.nameEng : item.nameArabic}
          </Text>

          <View style={styles.footer}>
            {!!item.selectedCategory && (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {item.selectedCategory}
                </Text>
              </View>
            )}

            <View style={styles.locRow}>
              <Image source={Location} style={styles.locIcon} />
              {userLocation && item.latitude && item.longitude ? (
                <DistanceFromDevice
                  userLat={userLocation.lat}
                  userLong={userLocation.long}
                  targetLat={Number(item.latitude)}
                  targetLong={Number(item.longitude)}
                  kmText="km"
                  mText="m"
                />
              ) : (
                <Text style={styles.locText}>--</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // DetectCountry hamesha mounted rahe, warna country kabhi detect nahi hogi
  const detector = <DetectCountry onCountryDetect={setDeviceCountry} />;

  if (isLoading) {
    return (
      <View>
        <FlatList
          data={[0, 1]}
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
        {detector}
      </View>
    );
  }

  if (!items.length) return detector;

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        horizontal
        inverted={!isEn}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        renderItem={renderItem}
      />
      {detector}
    </View>
  );
};

export default RecentlyAdded;
