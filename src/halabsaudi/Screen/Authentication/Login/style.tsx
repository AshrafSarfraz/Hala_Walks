import {StyleSheet} from 'react-native';
import {Colors} from '../../../Themes/Colors';
import {Fonts} from '../../../Themes/Fonts';

export const getStyles = (language: string) =>
  StyleSheet.create({
    Root: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    Flex: {
      flex: 1,
    },
    MainContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 24,
    },

    // ── Hero ──────────────────────────────
    HeroBlock: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 20,
      // backgroundColor:'yellow'
    },
    H_Logo: {
      width: 96,
      height: 96,
    },
    Welcome_Txt: {
      fontSize: 26,
      fontFamily: Fonts.SF_Bold,
      color: Colors.white,
      lineHeight: 32,
      textAlign: 'center',
    },
    SignUp_Txt: {
      fontSize: 15,
      color: Colors.textMuted,
      fontFamily: Fonts.SF_Medium,
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 8,
      maxWidth: 300,
    },

    // ── Form ──────────────────────────────
    InputContainer: {
      width: '100%',
      // backgroundColor:Colors.accent
    },
    PhoneInput_Field: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      height: 58,
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: Colors.textSecondary,
      borderRadius: 14,
      paddingHorizontal: 6,
      zIndex: 10,
    },
    Active_Input_Field: {
      borderColor: Colors.brandGreen,
    },
    PhoneNumber_Input: {
      flex: 1,
      minWidth: 0,
      height: 44,
      fontSize: 15,
      color: Colors.white,
      paddingVertical: 0,
      paddingHorizontal: 12,
      textAlign: language === 'en' ? 'left' : 'right',
      borderLeftWidth: language === 'en' ? 1 : 0,
      borderRightWidth: language === 'en' ? 0 : 1,
      borderColor: Colors.textMuted,
      backgroundColor: Colors.transparent,
      letterSpacing: 0.3,
    },
    ErrorSlot: {
      minHeight: 26,
      justifyContent: 'center',
    },
    Error: {
      fontSize: 12,
      fontWeight: '600',
      color: Colors.accent,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    Link_Btn: {
      alignSelf: 'center',
      marginTop: 22,
      paddingVertical: 6,
    },
    Link_Txt: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },

    // ── Footer ────────────────────────────
    Footer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingTop: 32,
    },
    DividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },
    DividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.lightOverlaySubtle,
    },
    DividerTxt: {
      color: Colors.textMuted,
      fontSize: 12,
      marginHorizontal: 12,
    },
    Partner_Btn: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: Colors.lightOverlaySubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    Partner_Txt: {
      fontSize: 14,
      color: Colors.white,
      fontWeight: '600',
    },
  });