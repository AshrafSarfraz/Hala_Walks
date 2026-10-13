import {Platform, StyleSheet} from 'react-native';
import {Fonts} from '../../../theme/Fonts';
import {Colors} from '../../../theme/Colors';

const createStyles = (language: String) =>
  StyleSheet.create({
    Maincontainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingTop: 0,
    },
    item: {
      marginVertical: 4,
      fontSize: 16,
    },
    label: {
      fontWeight: 'bold',
    },
    documentCard: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      borderColor: 'grey',
      borderWidth: 0.2,
    },

    documentTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },

    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    Menu_Btn: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      borderRadius: 4,
      height: 24,
    },
    menu_txt: {
      color: Colors.White,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: Fonts.F_Bold,
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
