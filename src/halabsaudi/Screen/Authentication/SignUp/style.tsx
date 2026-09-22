import {StyleSheet} from 'react-native';
import {Colors} from '../../../Themes/Colors';
import {Fonts} from '../../../Themes/Fonts';

export const getStyles = (language: string) =>
  StyleSheet.create({
    Root: {
      flex: 1,
      backgroundColor: Colors.dargBg,
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
      color: Colors.White,
      lineHeight: 30,
      textAlign: 'center',
    },
    SignUp_Txt: {
      fontSize: 15,
      color: Colors.Grey9,
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
      backgroundColor: '#191B20',
      borderWidth: 1.5,
      borderColor: Colors.grey1,
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
      backgroundColor: '#191B20',
      borderWidth: 1.5,
      borderColor: Colors.grey1,
      borderRadius: 14,
      paddingHorizontal: 6,
      marginBottom: 12,
      zIndex: 10,
    },
    // Colour only — border width stays 1.5 so nothing shifts while typing.
    Active_Input_Field: {
      borderColor: Colors.Green,
    },
    User_Input: {
      flex: 1,
      minWidth: 0,
      height: 44,
      fontSize: 15,
      color: Colors.White,
      paddingVertical: 0,
      backgroundColor: 'transparent',
      textAlign: language === 'en' ? 'left' : 'right',
    },
    PhoneNumber_Input: {
      flex: 1,
      minWidth: 0,
      height: 44,
      fontSize: 15,
      color: Colors.White,
      paddingVertical: 0,
      paddingHorizontal: 12,
      textAlign: language === 'en' ? 'left' : 'right',
      borderLeftWidth: language === 'en' ? 1 : 0,
      borderRightWidth: language === 'en' ? 0 : 1,
      borderColor: Colors.Grey9,
      backgroundColor: 'transparent',
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
      color: '#FF5A5A',
      textAlign: language === 'en' ? 'left' : 'right',
    },
    Link_Btn: {
      alignSelf: 'center',
      marginTop: 22,
      paddingVertical: 6,
    },
    Link_Txt: {
      color: Colors.White,
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });