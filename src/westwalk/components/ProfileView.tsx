import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import Avatar from './Avatar';
import {Text} from './Text';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
import {RootState} from '../redux/store';

export type ProfileRow = {label: string; value?: string | number | null};
export type ProfileSection = {title: string; icon: string; rows: ProfileRow[]};

const hasValue = (v: ProfileRow['value']) =>
  v !== undefined && v !== null && String(v).trim() !== '';

/**
 * Teeno profile screens (Staff, Tenant, Organization) ka shared layout.
 * Khaali values wali rows khud chhup jati hain, aur jis section mein koi row
 * na bache wo section bhi nahi dikhta.
 */
export default function ProfileView({
  name,
  photo,
  subtitle,
  idLabel,
  idValue,
  status,
  sections,
}: {
  name: string;
  photo?: string;
  subtitle?: string;
  idLabel?: string;
  idValue?: string;
  status?: {label: string; active: boolean};
  sections: ProfileSection[];
}) {
  const insets = useSafeAreaInsets();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const dir = ar ? 'row-reverse' : 'row';
  const align = ar ? 'right' : 'left';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        {paddingBottom: insets.bottom + 32},
      ]}>
      {/* Header */}
      <View style={styles.hero}>
        <Avatar name={name} uri={photo} size={88} />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {(!!idValue || !!status) && (
          <View style={[styles.chips, {flexDirection: dir}]}>
            {!!idValue && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {idLabel ? `${idLabel}: ` : ''}
                  {idValue}
                </Text>
              </View>
            )}
            {!!status && (
              <View
                style={[
                  styles.chip,
                  status.active ? styles.chipActive : styles.chipInactive,
                  {flexDirection: dir},
                ]}>
                <View
                  style={[
                    styles.dot,
                    {backgroundColor: status.active ? '#1E9E5A' : '#C0392B'},
                  ]}
                />
                <Text
                  style={[
                    styles.chipText,
                    {color: status.active ? '#1E7A47' : '#A93226'},
                  ]}>
                  {status.label}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Sections */}
      {sections.map(section => {
        const rows = section.rows.filter(r => hasValue(r.value));
        if (!rows.length) return null;
        return (
          <View key={section.title} style={styles.card}>
            <View style={[styles.cardHeader, {flexDirection: dir}]}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name={section.icon as any}
                  size={16}
                  color={Colors.PrimaryColor}
                />
              </View>
              <Text style={[styles.cardTitle, {textAlign: align}]}>
                {section.title}
              </Text>
            </View>
            {rows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.row,
                  {flexDirection: dir},
                  i < rows.length - 1 && styles.rowDivider,
                ]}>
                <Text style={[styles.label, {textAlign: align}]}>
                  {row.label}
                </Text>
                <Text
                  selectable
                  style={[styles.value, {textAlign: ar ? 'left' : 'right'}]}>
                  {String(row.value)}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 16, paddingTop: 8},

  hero: {alignItems: 'center', paddingTop: 12, paddingBottom: 22},
  name: {
    marginTop: 14,
    fontSize: 21,
    lineHeight: 27,
    fontFamily: Fonts.F_Bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chips: {
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {backgroundColor: '#E6F6EC'},
  chipInactive: {backgroundColor: '#FBEAEA'},
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.F_Medium,
    color: Colors.PrimaryColor,
  },
  dot: {width: 7, height: 7, borderRadius: 4},

  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 14,
    backgroundColor: Colors.White,
  },
  cardHeader: {alignItems: 'center', gap: 10, marginBottom: 6},
  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.F_Bold,
    color: Colors.textPrimary,
  },
  row: {
    paddingVertical: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  rowDivider: {borderBottomWidth: 1, borderBottomColor: '#F0F1F0'},
  label: {flex: 1, fontSize: 13, color: Colors.textSecondary},
  value: {
    flex: 1.3,
    fontSize: 14,
    fontFamily: Fonts.F_Medium,
    color: Colors.textPrimary,
  },
});
