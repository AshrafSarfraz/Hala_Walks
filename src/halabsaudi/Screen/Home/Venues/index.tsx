import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useSelector} from 'react-redux';
import {Text} from '../../../../ui/Text';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {RootState} from '../../../redux_toolkit/store';
import {COL_GAP, VENUE_IMAGE_SIZE, styles} from './style';

const VENUES_API = 'https://hala-b-saudi.onrender.com/api/hbs/venues';
const VENUES_CACHE_KEY = 'H-venues_cache_v3';
const VENUES_TTL_MS = 3 * 60 * 60 * 1000;

type CacheShape = {
  ts: number;
  data: any[];
};

const norm = (value: any) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/＆/g, '&');

const softMatch = (a: any, b: any) => {
  const first = norm(a);
  const second = norm(b);

  if (!first || !second) return false;

  return (
    first === second ||
    first.includes(second) ||
    second.includes(first)
  );
};

const withId = (items: any[]) =>
  items.map(item => ({
    ...item,
    id: String(item._id || item.id),
  }));

const Venues: React.FC = () => {
  const navigation = useNavigation<any>();

  const [showAll, setShowAll] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});

  const countryName = useSelector(
    (state: RootState) => state.country?.countryName ?? null,
  );
  const language = useSelector(
    (state: RootState) => state.language.language,
  );
  const isEn = language === 'en';

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    const loadVenues = async () => {
      let cached: CacheShape | null = null;

      try {
        const stored = await AsyncStorage.getItem(VENUES_CACHE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;

        if (Array.isArray(parsed?.data)) {
          cached = {
            ts: parsed.ts ?? 0,
            data: parsed.data,
          };
        }
      } catch {
        // Invalid cache: fetch fresh data.
      }

      if (!alive) return;

      if (cached) {
        setVenues(withId(cached.data));
        setLoading(false);
      }

      if (cached?.ts && Date.now() - cached.ts < VENUES_TTL_MS) {
        return;
      }

      try {
        const response = await fetch(VENUES_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Venues API failed');
        }

        const json = await response.json();
        const raw = json?.data ?? json;

        if (!Array.isArray(raw)) {
          throw new Error('Invalid venues response');
        }

        if (!alive) return;

        setVenues(withId(raw));

        await AsyncStorage.setItem(
          VENUES_CACHE_KEY,
          JSON.stringify({
            ts: Date.now(),
            data: raw,
          }),
        ).catch(() => {});
      } catch {
        // Keep cached data if the request fails.
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadVenues();

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [countryName]);

  const filteredVenues = useMemo(() => {
    if (!countryName) return venues;

    return venues.filter(venue =>
      softMatch(venue?.country, countryName),
    );
  }, [venues, countryName]);

  const visibleItems = showAll
    ? filteredVenues
    : filteredVenues.slice(0, 8);

  const renderVenueItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const uri = String(item.img || '').trim();
    const isLoaded = imageLoaded[uri] ?? false;
    const hasFailed = imageFailed[uri] ?? false;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.item}
        onPress={() => navigation.navigate('SelectedVenue', {item})}>
        <View style={styles.imageWrap}>
          {!!uri && !hasFailed && (
            <FastImage
              source={{
                uri,
                priority:
                  index <= 7
                    ? FastImage.priority.high
                    : FastImage.priority.normal,
              }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() =>
                setImageLoaded(previous =>
                  previous[uri]
                    ? previous
                    : {...previous, [uri]: true},
                )
              }
              onError={() => {
                setImageFailed(previous => ({
                  ...previous,
                  [uri]: true,
                }));

                if (__DEV__) {
                  console.warn('Venue image failed:', uri);
                }
              }}
            />
          )}

          {!!uri && !isLoaded && !hasFailed && (
            <View pointerEvents="none" style={styles.loadingOverlay}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  width: VENUE_IMAGE_SIZE,
                  height: VENUE_IMAGE_SIZE,
                }}
              />
            </View>
          )}

          {(!uri || hasFailed) && (
            <View style={styles.fallback}>
              <Text style={styles.fallbackText}>
                {isEn ? 'No image' : 'لا توجد صورة'}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.cate_txt, !isEn && styles.cate_txt_ar]}
          numberOfLines={2}>
          {isEn ? item.venueName : item.venueNameAr}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && venues.length === 0) {
    return (
      <View style={[styles.container, styles.loaderRow]}>
        {[0, 1, 2, 3].map(item => (
          <ShimmerPlaceholder
            key={item}
            LinearGradient={LinearGradient}
            style={styles.shimmerItem}
          />
        ))}
      </View>
    );
  }

  if (!filteredVenues.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        key={isEn ? 'ltr' : 'rtl'}
        data={visibleItems}
        extraData={{imageLoaded, imageFailed}}
        keyExtractor={item => item.id}
        numColumns={4}
        renderItem={renderVenueItem}
        scrollEnabled={false}
        columnWrapperStyle={{
          gap: COL_GAP,
          flexDirection: isEn ? 'row' : 'row-reverse',
        }}
      />

      {filteredVenues.length > 8 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAll(previous => !previous)}>
          <Text style={styles.showMoreText}>
            {showAll
              ? languageData[language].Hide
              : languageData[language].Show_More}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Venues;