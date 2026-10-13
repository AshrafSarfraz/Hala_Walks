// import {Fonts} from '../../../../theme/Fonts';
// import {Platform, StyleSheet} from 'react-native';
// import {Colors} from '../../../../theme/Colors';

// const createStyles = (language: string) =>
//   StyleSheet.create({
//     SafeViewCont: {
//       flex: 1,
//       backgroundColor: '#ffffff',
//     },
//     Container: {
//       flex: 1,
//       backgroundColor: '#ffffff',
//       paddingHorizontal: 24,
//       paddingTop: Platform.OS === 'ios' ? 10 : 45,
//     },
//     Logo: {
//       width: 180,
//       height: 100,
//       alignSelf: 'center',
//       resizeMode: 'contain',
//       marginBottom: 40,
//     },
//     Title: {
//       fontSize: 21,
//       fontFamily: Fonts.F_Bold,
//       color: '#222',
//       textAlign: language === 'ar' ? 'right' : 'left',
//       marginBottom: 8,
//     },
//     Subtitle: {
//       fontSize: 14,
//       color: '#5B5B5B',
//       textAlign: language === 'ar' ? 'right' : 'left',
//       marginBottom: 24,
//     },
//     InputContainer: {
//       flexDirection: language === 'en' ? 'row' : 'row-reverse',
//       alignItems: 'center',
//       borderWidth: 1,
//       borderColor: Colors.border,
//       borderRadius: 14,
//       height: 50,
//       marginBottom: 16,
//       backgroundColor: Colors.surfaceRaised,
//       paddingHorizontal: 10,
//     },
//     Icon: {
//       width: 20,
//       height: 20,
//       resizeMode: 'contain',
//       marginRight: language === 'en' ? 10 : 0,
//       marginLeft: language === 'en' ? 0 : 10,
//       tintColor: Colors.Grey,
//     },
//     input: {
//       fontFamily: Fonts.F_Regular,
//       flex: 1,
//       fontSize: 14,
//       color: '#000',
//       height: 45,
//       textAlign: language === 'en' ? 'left' : 'right',
//     },
//     passwordinput: {
//       fontFamily: Fonts.F_Regular,

//       flex: 1,
//       fontSize: 14,
//       color: '#000',
//       height: 45,
//       textAlign: language === 'en' ? 'left' : 'right',
//     },
//     HideIcon: {
//       width: 24,
//       height: 24,
//       tintColor: Colors.Grey,
//       resizeMode: 'contain',
//     },
//     Active_Input_Field: {
//       borderColor: Colors.PrimaryColor,
//     },
//     Active_Image: {
//       tintColor: Colors.PrimaryColor,
//     },
//     ForgotText: {
//       color: Colors.Black,
//       fontSize: 13,
//       fontWeight: '500',
//       marginBottom: 6,
//     },
//     forgotContainer: {
//       flexDirection: language === 'en' ? 'row' : 'row-reverse',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginBottom: 24,
//     },
//     checkboxContainer: {
//       flex: 1,
//     },
//   });
// const languageStyles = new Map<string, ReturnType<typeof createStyles>>();
// export const getStyles = (language: string | String) => {
//   const key = String(language);
//   let cached = languageStyles.get(key);
//   if (!cached) {
//     cached = createStyles(key);
//     languageStyles.set(key, cached);
//   }
//   return cached;
// };


import {Fonts} from '../../../../theme/Fonts';
import {StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/Colors';

const createStyles = (language: string) => {
  const ar = language === 'ar';
  const align = ar ? 'right' : 'left';

  return StyleSheet.create({
    Hero: {alignItems: 'center', marginTop: 8, marginBottom: 28},
    LogoWrap: {
      width: 104,
      height: 104,
      borderRadius: 30,
      backgroundColor: Colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    Logo: {width: 76, height: 76, resizeMode: 'contain'},
    RoleBadge: {
      flexDirection: ar ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: Colors.accentSoft,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 14,
    },
    RoleBadgeText: {
      fontSize: 12,
      fontFamily: Fonts.F_Medium,
      color: Colors.PrimaryColor,
    },
    Title: {
      fontSize: 24,
      lineHeight: 30,
      fontFamily: Fonts.F_Bold,
      color: Colors.PrimaryColor,
      textAlign: 'center',
    },
    Subtitle: {
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
    },
    Label: {
      fontSize: 13,
      fontFamily: Fonts.F_Medium,
      color: '#333',
      textAlign: align,
      marginBottom: 8,
    },
    InputContainer: {
      flexDirection: ar ? 'row-reverse' : 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 14,
      height: 54,
      marginBottom: 18,
      backgroundColor: Colors.surfaceRaised,
      paddingHorizontal: 14,
    },
    Icon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      marginRight: ar ? 0 : 10,
      marginLeft: ar ? 10 : 0,
      tintColor: Colors.Grey,
    },
    input: {
      fontFamily: Fonts.F_Regular,
      flex: 1,
      fontSize: 15,
      color: '#000',
      height: 50,
      textAlign: align,
    },
    HideIcon: {
      width: 22,
      height: 22,
      tintColor: Colors.Grey,
      resizeMode: 'contain',
    },
    Active_Input_Field: {
      borderColor: Colors.PrimaryColor,
      backgroundColor: Colors.White,
    },
    Active_Image: {tintColor: Colors.PrimaryColor},
    ButtonWrap: {marginTop: 8},
    Footer: {
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 24,
    },
  });
};

const languageStyles = new Map<string, ReturnType<typeof createStyles>>();
export const getStyles = (language: string | String) => {
  const key = String(language);
  let cached = languageStyles.get(key);
  if (!cached) {
    cached = createStyles(key);
    languageStyles.set(key, cached);
  }
  return cached;
};