/* ---------- Styles (flat details, no card) ---------- */
import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';

export const getStyles = (language: 'en' | 'ar') => {
  const isRTL = language === 'ar';

  return StyleSheet.create({
    /* Loading */
    loadingWrap: {
      flex: 1,
      backgroundColor: Colors.Green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingTxt: {
      marginTop: 10,
      color: '#fff',
      fontFamily: Fonts.SF_Regular,
      textAlign: 'center',
    },

    /* Hero */
    hero: {
      backgroundColor: Colors.Green,
      paddingTop: Platform.OS === 'android' ? 48 : 64,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
    },
    heroTopRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    // back button wrapper + icon spacing (no inline styles needed)
    backRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    backIcon: {
      width: 25,
      height: 25,
      resizeMode: 'contain',
      tintColor: '#fff',
      // swap margins based on RTL
      marginRight: isRTL ? 0 : 4,
      marginLeft: isRTL ? 4 : 0,
    },
    heroTitle: {
      color: '#fff',
      fontSize: 18,
      fontFamily: Fonts.SF_Bold,
      textAlign: isRTL ? 'right' : 'left',
    },
    heroBtnOutline: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBtnOutlineTxt: {
      color: '#fff',
      fontFamily: Fonts.SF_Bold,
      fontSize: 13,
    },
    heroBtnGhost: {
      height: 36,
      paddingHorizontal: 12,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: '#ffffffcc',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBtnGhostTxt: {
      color: '#fff',
      fontFamily: Fonts.SF_Bold,
      fontSize: 13,
    },
    heroBtnSolid: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 9,
      backgroundColor: '#ffffff22',
      borderWidth: 2,
      borderColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBtnSolidTxt: {
      color: '#fff',
      fontFamily: Fonts.SF_Bold,
      fontSize: 13,
    },
    heroBottom: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginTop: 18,
    },
    avatar: {
      height: 72,
      width: 72,
      borderRadius: 36,
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      marginRight: isRTL ? 0 : 4,
      marginLeft: isRTL ? 4 : 0,
      borderColor: '#ffffff55',
    },
    avatarTxt: {
      color: Colors.Green,
      fontSize: 26,
      fontFamily: Fonts.SF_Bold,
    },
    nameTxt: {
      color: '#fff',
      fontSize: 18,
      fontFamily: Fonts.SF_Bold,
      textAlign: isRTL ? 'right' : 'left',
    },
    subTxt: {
      color: '#E6F2EF',
      fontSize: 13,
      marginTop: -7,
      fontFamily: Fonts.SF_Regular,
      textAlign: isRTL ? 'right' : 'left',
    },

    /* Content */
    content: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 28,
    },
    sectionHeader: {
      fontSize: 12,
      color: Colors.Black,
      fontFamily: Fonts.SF_Bold,
      letterSpacing: 0.3,
      marginBottom: 6,
      // start margin depends on dir
      marginLeft: isRTL ? 0 : 4,
      marginRight: isRTL ? 4 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },

    /* View list (no cards) */
    list: {
      backgroundColor: 'transparent',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: '#E5E7EB',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E7EB',
      borderRadius: 0,
    },
    listRow: {
      minHeight: 52,
      paddingHorizontal: 12,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E7EB',
    },
    listRowLast: {
      borderBottomWidth: 0,
    },
    listKey: {
      flexBasis: 40,
      minWidth: 120,
      color: Colors.Black,
      fontSize: 14,
      fontFamily: Fonts.SF_Bold,
      textAlign: isRTL ? 'right' : 'left',
    },
    listVal: {
      flex: 1,
      color: Colors.Black,
      fontSize: 14,
      fontFamily: Fonts.SF_Medium,
      // values ko trailing side par rakho
      textAlign: isRTL ? 'left' : 'right',
    },

    /* Edit form (flat underline inputs) */
    form: {
      marginTop: 4,
    },
    fieldWrap: {
      marginBottom: 16,
    },
    fieldLabel: {
      color: Colors.Black,
      fontSize: 13,
      marginBottom: 8,
      fontFamily: Fonts.SF_Bold,
      letterSpacing: 0.2,
      // start margin depends on dir
      marginLeft: isRTL ? 0 : 4,
      marginRight: isRTL ? 4 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    inputFlat: {
      height: 44,
      paddingHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      backgroundColor: 'transparent',
      color: Colors.Black,
      fontFamily: Fonts.SF_Regular,
      fontSize: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    inputDisabledFlat: {
      color: '#6b7280',
    },
    dropdownTap: {
      justifyContent: 'center',
    },
    inputText: {
      color: Colors.Black,
      fontFamily: Fonts.SF_Regular,
      fontSize: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    placeholderText: {
      color: Colors.Black,
      fontFamily: Fonts.SF_Regular,
      fontSize: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    helper: {
      marginTop: 6,
      color: Colors.Black,
      fontSize: 12,
      fontFamily: Fonts.SF_Regular,
      // start margin depends on dir
      marginLeft: isRTL ? 0 : 4,
      marginRight: isRTL ? 4 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
    formError: {
      marginTop: 2,
      color: Colors.Red,
      fontFamily: Fonts.SF_Bold,
      fontSize: 13,
      // start margin depends on dir
      marginLeft: isRTL ? 0 : 4,
      marginRight: isRTL ? 4 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },

    /* Modal */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(17,24,39,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalSheet: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: '#fff',
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    modalTitle: {
      fontSize: 16,
      textAlign: 'center',
      paddingVertical: 10,
      color: Colors.Black,
      fontFamily: Fonts.SF_Bold,
    },
    modalRow: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: '#E5E7EB',
    },
    modalRowTxt: {
      fontSize: 15,
      color: Colors.Black,
      fontFamily: Fonts.SF_Regular,
      textAlign: 'center',
    },
  });
};
