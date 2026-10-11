import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { fontW, GUTTER, SECTION_GAP } from '../../Themes/Layout';

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const row = isEn ? 'row' : 'row-reverse';
  const align = isEn ? 'left' : 'right';

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: Colors.surface,
    },

    /* ---------------- header ---------------- */
    header: {
      flexDirection: row,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: GUTTER,
      minHeight: 56,
      backgroundColor: Colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.border,
      zIndex: 10,
      elevation: 10,
    },
    logo: {
      width: 120,
      height: 44,
      resizeMode: 'contain',
    },
    headerActions: {
      flexDirection: row,
      alignItems: 'center',
      gap: 4,
    },
    iconBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      tintColor: Colors.textPrimary,
    },

    /* ---------------- scroll ---------------- */
    scroll: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    scrollContent: {
      // Neeche tab bar ke liye jagah (pehle RecentlyAdded ke container mein thi)
      paddingBottom: Platform.OS === 'ios' ? 90 : 110,
    },

    /* ---------------- sections ---------------- */
    section: {
      marginTop: SECTION_GAP,
    },
    sectionHeader: {
      flexDirection: row,
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: GUTTER,
      marginBottom: 5,
    },
    sectionTitle: {
      ...fontW(isEn, 'bold'),
      fontSize: 19,
      lineHeight: isEn ? 24 : 30,
      color: Colors.textPrimary,
      textAlign: align,
      letterSpacing: isEn ? -0.2 : 0,
    },
    sectionAction: {
      ...fontW(isEn, 'medium'),
      fontSize: 13,
      color: Colors.accent,
    },

    /* ---------------- error ---------------- */
    errorBox: {
      marginHorizontal: GUTTER,
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#FEF3F2',
      borderWidth: 1,
      borderColor: '#FECDCA',
    },
    errorText: {
      color: '#B42318',
      lineHeight: 20,
      textAlign: align,
    },
  });
};
