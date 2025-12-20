import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import DistanceFromDevice from '../../../Component/distanceCalculate/distanceCalculate';
import { Location } from '../../../Themes/Images';
import DetectCountry from '../../../Component/distanceCalculate/DetectCountry';
import FastImage from 'react-native-fast-image';

const RecentlyAdded = () => {
  const navigation = useNavigation();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  const countryName = useSelector((s: RootState) => s.country?.countryName ?? null);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const fetchRecentlyAdded = async () => {
      setLoading(true);

      try {
        const res = await fetch('https://hala-b-saudi.onrender.com/api/hbs/brands');
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('Brands API failed:', json);
          setRecentItems([]);
          return;
        }

        const raw = json && json.data ? json.data : json;
        const arr = Array.isArray(raw) ? raw : [];

        // normalize + Active only
        const active = arr
          .map((item: any) => ({ id: item._id || item.id, ...item }))
          .filter((item: any) => String(item.status).toLowerCase() === 'active');

        // build createdAtMs from time/createdAt fields
        const withTime = active
          .map((item: any) => {
            const t = item.time || item.createdAt || item.created_at;
            const ms = t ? new Date(t).getTime() : NaN;
            return { ...item, createdAtMs: ms };
          })
          .filter((item: any) => Number.isFinite(item.createdAtMs));

        // sort newest first
        withTime.sort((a: any, b: any) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));

        // last 30 days (less strict than “one month same time”)
        const now = Date.now();
        const last30DaysMs = 30 * 24 * 60 * 60 * 1000;
        const recent = withTime.filter((item: any) => now - item.createdAtMs <= last30DaysMs);

        // ✅ if no recent found, fallback to latest Active
        const finalList = (recent.length ? recent : withTime).slice(0, 7);

        setRecentItems(finalList);
      } catch (error) {
        console.error('❌ Error fetching recently added items:', error);
        setRecentItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyAdded();
  }, []);

  const handleImageLoad = () => setImageLoading(false);

  return (
    <View style={styles.container}>
      {loading ? (
        <ShimmerPlaceholder visible={false} LinearGradient={LinearGradient} style={styles.image} />
      ) : (
        <FlatList
          data={recentItems
            .filter(item => {
              if (countryName) {
                return item.selectedCountry?.toLowerCase() === countryName.toLowerCase();
              }
              return true;
            })}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.Flatlist_Cont}
              onPress={() => navigation.navigate('DetailScreen', { item })}
            >
              <ShimmerPlaceholder
                visible={!imageLoading}
                LinearGradient={LinearGradient}
                style={styles.image}
              >
                {Platform.OS === 'ios' ? (
                  <FastImage
                    source={{
                      uri: item.img,
                      priority:
                        index === 0
                          ? FastImage.priority.high
                          : index <= 2
                          ? FastImage.priority.normal
                          : FastImage.priority.low,
                    }}
                    style={styles.image}
                    onLoad={handleImageLoad}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={{ uri: item.img }}
                    style={styles.image}
                    onLoad={handleImageLoad}
                    resizeMode="cover"
                  />
                )}
              </ShimmerPlaceholder>

              <Text style={styles.cate_txt}>
                {language === 'en'
                  ? item.nameEng?.length > 20
                    ? item.nameEng.substring(0, 20) + '...'
                    : item.nameEng
                  : item.nameArabic}
              </Text>

              <View style={styles.Type_Cont}>
                <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
              </View>

              <View style={styles.Loc_Status_Cont}>
                <View style={styles.Loc_Cont}>
                  <Image source={Location} style={styles.LocationIcon} />
                  <DistanceFromDevice
                    targetLat={Number(item.latitude)}
                    targetLong={Number(item.longitude)}
                    kmText="km away"
                    mText="m away"
                    loadingText="Calculating..."
                  />
                </View>

                <DetectCountry onCountryDetect={(value) => setCountry(value)} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default RecentlyAdded;
