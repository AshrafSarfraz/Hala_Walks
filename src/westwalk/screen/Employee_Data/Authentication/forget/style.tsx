import {Fonts} from '../../../../theme/Fonts';
import {StyleSheet} from 'react-native';
import {Colors} from '../../../../theme/Colors';

// ===================== STYLES =====================
const createStyles = (language: string) =>
  StyleSheet.create({
    Container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    Logo: {
      width: 180,
      height: 100,
      alignSelf: 'center',
      resizeMode: 'contain',
      marginBottom: 40,
    },
    Title: {
      fontSize: 21,
      fontFamily: Fonts.F_Bold,
      color: '#222',
      textAlign: language === 'ar' ? 'right' : 'left',
      marginBottom: 8,
    },
    Subtitle: {
      fontSize: 14,
      color: '#5B5B5B',
      textAlign: language === 'ar' ? 'right' : 'left',
      marginBottom: 24,
    },
    InputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 14,
      height: 50,
      marginBottom: 16,
      backgroundColor: Colors.surfaceRaised,
      paddingHorizontal: 10,
    },
    Icon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      marginRight: 10,
      tintColor: Colors.Grey,
    },
    input: {
      fontFamily: Fonts.F_Regular,
      flex: 1,
      fontSize: 14,
      color: '#000',
      height: 40,
    },
    Active_Input_Field: {
      borderColor: Colors.PrimaryColor,
    },
    Active_Image: {
      tintColor: Colors.PrimaryColor,
    },
  });
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
