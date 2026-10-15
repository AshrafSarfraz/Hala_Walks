import React, {useMemo} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../../components/Text';
import CachedImage from '../../../../components/Media/CachedImage';
import {brandImageProps} from '../../../../utils/brandCover';
import useBrandCatalog from '../../../../hooks/useBrandCatalog';
import {RootState} from '../../../../redux/store';
import {Colors} from '../../../../theme/Colors';
import {Fonts} from '../../../../theme/Fonts';
import {homeTimestamp, recentlyAdded, timeAgo} from '../homeData';
import {SectionHeader, SectionStatus, brandName} from '../homeUi';

/** Two-column grid with a NEW badge and "added X days ago". */
export default function RecentlyAdded() {
  const navigation = useNavigation<any>();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {width} = useWindowDimensions();
  const {brands, loading, error} = useBrandCatalog();
  const data = useMemo(() => recentlyAdded(brands), [brands]);
  if (!loading && !data.length && !error) return null;

  const tileW = (width - 32 - 12) / 2;
  const align = {textAlign: ar ? 'right' : 'left'} as const;

  return (
    <View style={styles.section}>
      <SectionHeader
        ar={ar}
        icon="sparkles-outline"
        title={ar ? 'أضيف حديثًا' : 'Recently Added'}
        subtitle={ar ? 'جديد في ويست ووك' : 'New at West Walk'}
      />
      {!data.length ? (
        <SectionStatus ar={ar} loading={loading} height={200} />
      ) : (
        <View style={[styles.grid, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
          {data.map((item, index) => {
            const added = timeAgo(homeTimestamp(item), ar);
            return (
              <TouchableOpacity
                key={String(item.id)}
                activeOpacity={0.85}
                style={[styles.tile, {width: tileW}]}
                onPress={() => navigation.navigate('DetailScreen', {item})}>
                <View>
                  <CachedImage
                    {...brandImageProps(item, 'cover')}
                    style={{width: tileW, height: tileW * 0.72}}
                    priority={index < 2 ? 'high' : 'normal'}
                  />
                  <View style={[styles.newBadge, ar ? {right: 8} : {left: 8}]}>
                    <Text style={styles.newText}>{ar ? 'جديد' : 'NEW'}</Text>
                  </View>
                </View>
                <View style={styles.body}>
                  <Text style={[styles.name, align]} numberOfLines={1}>
                    {brandName(item, ar)}
                  </Text>
                  <Text style={[styles.meta, align]} numberOfLines={1}>
                    {item.selectedCategory}
                  </Text>
                  {!!added && (
                    <View
                      style={[
                        styles.timeRow,
                        {flexDirection: ar ? 'row-reverse' : 'row'},
                      ]}>
                      <Ionicons
                        name="time-outline"
                        size={11}
                        color={Colors.PrimaryColor}
                      />
                      <Text style={styles.time}>{added}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {marginTop: 24},
  grid: {flexWrap: 'wrap', gap: 12, paddingHorizontal: 16},
  tile: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    backgroundColor: Colors.PrimaryColor,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newText: {fontSize: 10, fontFamily: Fonts.F_Bold, color: Colors.White},
  body: {padding: 10},
  name: {fontSize: 14, fontFamily: Fonts.F_Bold},
  meta: {fontSize: 11, color: Colors.textSecondary, marginTop: 2},
  timeRow: {alignItems: 'center', gap: 4, marginTop: 6},
  time: {fontSize: 10, fontFamily: Fonts.F_Medium, color: Colors.PrimaryColor},
});
