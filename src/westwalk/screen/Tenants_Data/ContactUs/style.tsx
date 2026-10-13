import {Dimensions, Platform, StyleSheet} from 'react-native';

const createStyles = (language: String) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal: '4%',
      paddingTop: Platform.OS === 'ios' ? 0 : 45,
    },
    loading: {
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - 25,
      left: Dimensions.get('window').width / 2 - 25,
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
