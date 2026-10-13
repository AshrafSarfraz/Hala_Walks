import React, {ComponentProps} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from '../../../components/Text';
import {Colors} from '../../../theme/Colors';
import {Fonts} from '../../../theme/Fonts';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const HOT = {
  main: '#E8452C',
  soft: '#FFF1EC',
  band: '#FFF7F3',
};

export const brandName = (item: any, ar: boolean) =>
  ar ? item?.nameArabic || item?.nameEng : item?.nameEng || item?.nameArabic;

/** Section title row: icon (or emoji), title, subtitle and an optional count pill. */
export function SectionHeader({
  ar,
  title,
  subtitle,
  icon,
  emoji,
  accent = Colors.PrimaryColor,
  accentSoft = Colors.accentSoft,
  count,
}: {
  ar: boolean;
  title: string;
  subtitle?: string;
  icon?: IconName;
  emoji?: string;
  accent?: string;
  accentSoft?: string;
  count?: number;
}) {
  const align = {textAlign: ar ? 'right' : 'left'} as const;
  return (
    <View style={[styles.header, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
      <View style={[styles.iconBubble, {backgroundColor: accentSoft}]}>
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : (
          <Ionicons name={icon || 'star-outline'} size={18} color={accent} />
        )}
      </View>
      <View style={styles.headerText}>
        <Text style={[styles.title, align]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, align]}>{subtitle}</Text>}
      </View>
      {!!count && (
        <View style={[styles.countPill, {backgroundColor: accentSoft}]}>
          <Text style={[styles.countText, {color: accent}]}>{count}</Text>
        </View>
      )}
    </View>
  );
}

/** Loader / error placeholder shown inside a section. */
export function SectionStatus({
  ar,
  loading,
  height = 140,
}: {
  ar: boolean;
  loading: boolean;
  height?: number;
}) {
  if (loading)
    return <ActivityIndicator color={Colors.PrimaryColor} style={{height}} />;
  return (
    <Text style={styles.error}>
      {ar
        ? 'تعذر تحميل العروض. اسحب للتحديث.'
        : 'Could not load offers. Pull to refresh.'}
    </Text>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {fontSize: 18},
  headerText: {flex: 1},
  title: {fontSize: 17, fontFamily: Fonts.F_Bold, color: Colors.Black},
  subtitle: {fontSize: 12, color: Colors.textSecondary, marginTop: 1},
  countPill: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {fontSize: 12, fontFamily: Fonts.F_Bold},
  error: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginVertical: 12,
    textAlign: 'center',
  },
});
