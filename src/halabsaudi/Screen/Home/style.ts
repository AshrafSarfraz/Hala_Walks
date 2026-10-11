import {Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {fontW, GUTTER, SECTION_GAP} from '../../Themes/Layout';

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const row = isEn ? 'row' : 'row-reverse';
  const align = isEn ? 'left' : 'right';

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: Colors.surface,
      
    },

    header: {
      flexDirection: row,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: GUTTER,
      minHeight: 64,
      paddingVertical: 8,
      backgroundColor: Colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.border,
      zIndex: 10,
      elevation: 0,
      shadowOpacity: 0,
    },

    greeting: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      [isEn ? 'marginRight' : 'marginLeft']: 12,
    },

    welcomeText: {
      ...fontW(isEn, 'regular'),
      fontSize: 13,
      lineHeight: 16,
      color: Colors.textSecondary,
      textAlign: align,
      writingDirection: isEn ? 'ltr' : 'rtl',
      includeFontPadding: false,
    },

    userName: {
      ...fontW(isEn, 'bold'),
      fontSize: 19,
      lineHeight: 26,
      marginTop: 2,
      color: Colors.brandGreen,
      textAlign: align,
      writingDirection: isEn ? 'ltr' : 'rtl',
      includeFontPadding: false,
    },

    headerActions: {
      flexDirection: row,
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
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

    scroll: {
      flex: 1,
      backgroundColor: Colors.background,
    },

    scrollContent: {
      paddingBottom: Platform.OS === 'ios' ? 90 : 110,
    },

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
      fontSize: Platform.OS==='ios'?18:16,
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