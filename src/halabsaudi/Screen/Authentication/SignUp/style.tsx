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
      paddingBottom: 32,
    },

    // ── Hero ──────────────────────────────
    // Shorter than Login's: this screen has 3 fields + checkbox to fit.
    HeroBlock: {
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 28,
    },
    H_Logo: {
      width: 76,
      height: 76,
      marginBottom: 16,
    },
    Welcome_Txt: {
      fontSize: 24,
      fontFamily: Fonts.SF_Bold,
      color: Colors.white,
      lineHeight: 30,
      textAlign: 'center',
    },
    SignUp_Txt: {
      fontSize: 15,
      color: Colors.textMuted,
      fontFamily: Fonts.SF_Medium,
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 6,
      maxWidth: 300,
    },

    // ── Form ──────────────────────────────
    InputContainer: {
      width: '100%',
    },
    Input_Field: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      height: 58,
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: Colors.textSecondary,
      borderRadius: 14,
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    Field_Icon: {
      width: 16,
      height: 16,
      resizeMode: 'contain',
      marginRight: language === 'en' ? 10 : 0,
      marginLeft: language === 'en' ? 0 : 10,
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
      marginBottom: 12,
      zIndex: 10,
    },
    // Colour only — border width stays 1.5 so nothing shifts while typing.
    Active_Input_Field: {
      borderColor: Colors.brandGreen,
    },
    User_Input: {
      flex: 1,
      minWidth: 0,
      height: 44,
      fontSize: 15,
      color: Colors.white,
      paddingVertical: 0,
      backgroundColor: Colors.transparent,
      textAlign: language === 'en' ? 'left' : 'right',
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
    CheckboxRow: {
      marginTop: 6,
      marginBottom: 2,
    },
    ErrorSlot: {
      minHeight: 30,
      justifyContent: 'center',
      marginBottom: 6,
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
  });