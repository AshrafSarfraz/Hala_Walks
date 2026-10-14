import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from './Text';
import CachedImage from './Media/CachedImage';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
import {getDiscountPercent} from '../utils/offers';
export default React.memo(function OfferListCard({
  item,
  ar,
  onPress,
  onRemove,
}: {
  item: any;
  ar: boolean;
  onPress: () => void;
  onRemove?: () => void;
}) {
  const {width} = useWindowDimensions();
  const size = Math.max(102, Math.min(138, Math.round(width * 0.32)));
  const percent = getDiscountPercent(item);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
      <CachedImage
        uri={String(item.img || '')}
        resizeMode="contain"
        style={[styles.image, {width: size, height: size}]}
      />
      <View style={styles.info}>
        <Text
          numberOfLines={2}
          style={[styles.title, {textAlign: ar ? 'right' : 'left'}]}>
          {ar
            ? item.nameArabic || item.nameEng
            : item.nameEng || item.nameArabic}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.description, {textAlign: ar ? 'right' : 'left'}]}>
          {ar
            ? item.descriptionArabic || item.descriptionEng
            : item.descriptionEng || item.descriptionArabic}
        </Text>
        {!!item.address && (
          <View
            style={[styles.meta, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
            <Ionicons name="location" size={14} color={Colors.PrimaryColor} />
            <Text numberOfLines={1} style={styles.address}>
              {item.address}
            </Text>
          </View>
        )}
        <View
          style={[styles.meta, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
          {percent > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {percent}% {ar ? 'خصم' : 'OFF'}
              </Text>
            </View>
          )}
          {!!onRemove && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                ar ? 'إزالة من المفضلة' : 'Remove from wishlist'
              }
              onPress={event => {
                event.stopPropagation();
                onRemove();
              }}
              style={styles.remove}>
              <Ionicons name="heart" size={21} color={Colors.PrimaryColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});
const styles = StyleSheet.create({
  row: {gap: 12, marginBottom: 18, alignItems: 'center'},
  image: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.White,
  },
  info: {flex: 1, paddingVertical: 4},
  title: {
    fontFamily: Fonts.F_Bold,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 6,
  },
  description: {fontSize: 12, lineHeight: 18, color: Colors.textSecondary},
  meta: {alignItems: 'center', gap: 5, marginTop:3},
  address: {fontSize: 11, color: Colors.textSecondary, flex: 1},
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: Colors.accentSoft,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.F_Medium,
    color: Colors.PrimaryColor,
  },
  remove: {padding: 7, marginStart: 'auto'},
});
