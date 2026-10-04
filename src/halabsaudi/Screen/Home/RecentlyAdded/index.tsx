import React, {useEffect, useMemo, useState} from 'react';
import {View, FlatList, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import {Text} from '../../../../ui/Text';
import {RemoteImage} from '../../../../ui/RemoteImage';
import {ActivityIndicator} from '../../../../ui/ActivityIndicator';
import {fetchBrandCatalog} from '../../../api/brandCatalog';
import {recentBrands} from '../../../api/catalogFilters';
import {readLocationAccess} from '../../../utils/locationPermissions';
import {getStyles} from './style';
import DistanceFromDevice from '../../../Component/distanceCalculate/distanceCalculate';
import {Location} from '../../../Themes/Images';
import {Colors} from '../../../Themes/Colors';
export default function RecentlyAdded({
  onDataLoaded,
  onLoadError,
}: {
  onDataLoaded?: (hasData: boolean) => void;
  onLoadError?: () => void;
}) {
  const navigation = useNavigation<any>();
  const country = useSelector((s: any) => s.country.countryName || 'Qatar');
  const language = useSelector((s: any) => s.language.language);
  const styles = getStyles(language);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const items = useMemo(
    () =>
      recentBrands(brands, country)
        .slice(0, 7)
        .map(item => ({...item, id: item._id || item.id})),
    [brands, country],
  );
  useEffect(() => {
    let live = true;
    void fetchBrandCatalog()
      .then(res => res.json())
      .then(data => {
        if (live) setBrands(data.data);
      })
      .catch(() => {
        if (live) onLoadError?.();
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    void readLocationAccess()
      .then(access => {
        if (!live || !access.foreground) return;
        Geolocation.getCurrentPosition(
          position => {
            if (live)
              setUserLocation({
                lat: position.coords.latitude,
                long: position.coords.longitude,
              });
          },
          () => {},
          {enableHighAccuracy: false, timeout: 8000, maximumAge: 300000},
        );
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [onLoadError]);
  useEffect(() => {
    if (!loading) onDataLoaded?.(items.length > 0);
  }, [items.length, loading, onDataLoaded]);
  if (!loading && !items.length) return null;
  return (
    <View style={[styles.container, {minHeight: 140}]}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={items}
          keyExtractor={item => String(item.id)}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.Flatlist_Cont}
              onPress={() => navigation.navigate('DetailScreen', {item})}>
              <RemoteImage uri={item.img} style={styles.image} />
              <Text style={styles.cate_txt}>
                {language === 'ar'
                  ? item.nameArabic || item.nameEng
                  : item.nameEng || item.nameArabic}
              </Text>
              <View style={styles.Type_Cont}>
                <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
              </View>
              <View style={styles.Loc_Status_Cont}>
                <View style={styles.Loc_Cont}>
                  <Image source={Location} style={styles.LocationIcon} />
                  {userLocation ? (
                    <DistanceFromDevice
                      userLat={userLocation.lat}
                      userLong={userLocation.long}
                      targetLat={Number(item.latitude)}
                      targetLong={Number(item.longitude)}
                      kmText="km"
                      mText="m"
                    />
                  ) : (
                    <Text style={{fontSize: 10, color: Colors.accent}}>--</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
