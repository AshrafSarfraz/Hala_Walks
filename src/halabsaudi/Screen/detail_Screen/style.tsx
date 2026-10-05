

import { StyleSheet } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';


export const getStyles = (language: string) =>
  StyleSheet.create({
    addressRow: {flexDirection: language === 'en' ? 'row' : 'row-reverse', alignItems: 'center', gap: 12, marginTop: 6},
    redeemBadge: {backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, maxWidth: '42%'},
    redeemText: {color: Colors.onAccent, fontSize: 13, fontFamily: Fonts.SF_Bold, textAlign: 'center'},
    mapButton: {flexDirection: language === 'en' ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12},
    mapText: {color: Colors.onAccent, fontSize: 14, fontFamily: Fonts.SF_Bold},
    container: {
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    Body_Cont: {
      paddingTop: 16,
      paddingBottom: 10,
    },

    Type_Cont: {
      backgroundColor: Colors.accentSoft,
      alignItems: 'center',
      flexShrink: 1,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginBottom: 0,
      borderRadius: 12,
    },
    Type_Text: {
      fontSize: 13,
      lineHeight: 18,
      color: Colors.textPrimary,
      fontFamily: Fonts.SF_Medium,
    },

    Title_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    title: {
      flex: 1,
      paddingEnd: 12,
      fontSize: 18,
      lineHeight: 22,
      color: Colors.textPrimary,
      letterSpacing: 0.3,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
      textAlign: language === 'en' ? 'left' : 'right',
    },

    call_cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      gap: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.accent,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 24,
      backgroundColor: Colors.surface,
    },
    Phone_Icon: {
      width: 10,
      height: 10,
      resizeMode: 'contain',
      marginRight: language === 'en' ? 6 : 0,
      marginLeft: language === 'ar' ? 6 : 0,
    },
    call_txt: {
      fontSize: 12,
      lineHeight: 20,
      color: Colors.textPrimary,
      fontFamily: Fonts.SF_Bold,
    },

    Loc_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      flex: 1,
      gap: 6,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: Colors.surface,
    },
    Loc_Icon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      marginRight: language === 'en' ? 8 : 0,
      marginLeft: language === 'ar' ? 8 : 0,
      tintColor: Colors.accent,
    },
    Loc_Txt: {
      flex: 1,
      fontSize: 13,
      lineHeight: 22,
      color: Colors.textPrimary,
      textAlign: language === 'en' ? 'left' : 'right',
      opacity: 0.9,
    },

    rowBetween: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      marginTop: 14,
    },

    timing_dropdown: {
      flex: 1,
      minHeight: 50,
      padding: 10,
      gap: 7,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
    },
    working_hour_txt: {
      flex: 1,
      fontSize: 13,
      color: Colors.textPrimary,
      fontFamily: Fonts.SF_Bold,
      letterSpacing: 0.2,
      paddingVertical: 2,
      lineHeight: 22,
    },
    dropdown_icon: {
      fontSize: 13,
      color: Colors.textPrimary,
      marginLeft: language === 'en' ? 6 : 0,
      marginRight: language === 'ar' ? 6 : 0,
    },

    branchBtn: {
      flex: 1,
      minHeight: 50,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      gap: 7,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: Colors.surface,
    },
    branchBtnText: {
      flex: 1,
      color: Colors.textPrimary,
      fontSize: 13,
      fontFamily: Fonts.SF_Medium,
    },

    timingsCard: {
      padding: 10,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      marginTop: 10,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    item_cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderColor: Colors.border,
    },
    timingDay: {
      fontSize: 13,
      color: Colors.textPrimary,
      fontFamily: Fonts.SF_Medium,
    },
    timingTime: {
      fontSize: 13,
      color: Colors.textPrimary,
      fontFamily: Fonts.SF_Bold,
    },

    Dis_Cont: {
      gap: 10,
      marginTop: 12,
      backgroundColor: Colors.accentSoft,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 12,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    Total_Discount: {
      flex: 1,
      fontSize: 13,
      color: Colors.textPrimary,
      fontFamily: Fonts.SF_Bold,
      lineHeight: 20,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    disArrow: {
      fontSize: 22,
      color: Colors.accent,
      marginLeft: language === 'en' ? 10 : 0,
      marginRight: language === 'ar' ? 10 : 0,
    },

    // ✅ New modern offer button
    offerBtn: {
      gap: 10,
      borderWidth: 1,
      borderColor: Colors.accent,
      width: '100%',
      borderRadius: 12,
      paddingVertical: 11,
      paddingHorizontal: 14,
      backgroundColor: Colors.surface,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 14,
    },
    offerBtnDisabled: {
      backgroundColor: Colors.surface,
    },
    offerBtnLeft: {
      flex: 1,
      paddingRight: language === 'en' ? 10 : 0,
      paddingLeft: language === 'ar' ? 10 : 0,
    },
    offerBtnTitle: {
      color: Colors.accent,
      fontSize: 13,
      fontFamily: Fonts.SF_Bold,
    },
    offerBtnSub: {
      color: Colors.accent,
      fontSize: 13,
      marginTop: 4,
      fontFamily: Fonts.SF_Regular,
    },
    offerBtnArrow: {
      color: Colors.accent,
      fontSize: 22,
      fontFamily: Fonts.SF_Bold,
      marginLeft: language === 'en' ? 10 : 0,
      marginRight: language === 'ar' ? 10 : 0,
    },

    Desc_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      marginTop: 18,
      marginBottom: 8,
    },
    Desc: {
      fontSize: 16,
      lineHeight: language === 'en' ? 22 : 26,
      letterSpacing: 0.2,
      color: Colors.textPrimary,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
    },
    Detail: {
      fontSize: 13,
      lineHeight: 21,
      color: Colors.textPrimary,
      fontFamily: language === 'en' ? Fonts.SF_Regular : '',
      marginBottom: 10,
      textAlign: language === 'en' ? 'left' : 'right',
      opacity: 0.9,
    },
  });

export const heroStyles = StyleSheet.create({
  counter: {position: 'absolute', bottom: 12, right: 16, color: Colors.onMedia, backgroundColor: Colors.overlaySoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, fontSize: 12},
  overlayButton: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.onMedia, opacity: 0.5},
  dotActive: {opacity: 1},
});
