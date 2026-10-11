import { StyleSheet } from 'react-native';
import { cardShadow, fontW, RADIUS } from '../../../Themes/Layout';

export const getStyles = (language: string) => {
  const isEn = language === 'en';

  return StyleSheet.create({
    container: {
      // padding FlatList ke contentContainerStyle mein hai (GUTTER),
      // taake scroll karte waqt card screen ke kinare tak ja sake
    },
    card: {
      borderRadius: RADIUS,
      marginVertical: 6, // shadow ke liye jagah
      ...cardShadow,
    },
    image: {
      width: 112,
      height: 136,
      justifyContent: 'flex-end',
    },
    imageRadius: {
      borderRadius: RADIUS,
    },
    caption: {
      paddingHorizontal: 8,
      paddingTop: 24,
      paddingBottom: 10,
      borderBottomLeftRadius: RADIUS,
      borderBottomRightRadius: RADIUS,
    },
    Txt: {
      ...fontW(isEn, 'bold'),
      fontSize: 13,
      lineHeight: 16,
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });
};
