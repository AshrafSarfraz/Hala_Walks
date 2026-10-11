import { StyleSheet } from 'react-native';
import { CARD_BG, GUTTER, RADIUS, SCREEN_W } from '../../../Themes/Layout';

const PAGE_WIDTH = SCREEN_W - GUTTER * 2;
const SLIDE_HEIGHT = Math.round(PAGE_WIDTH * 0.56); // 2:1 ratio, har phone pe same shape

export const getStyles = (_language: string) =>
  StyleSheet.create({
    container: {
      marginHorizontal: GUTTER,
      marginTop: 12,
    },
    loaderBox: {
      height: SLIDE_HEIGHT,
      borderRadius: RADIUS,
      backgroundColor: CARD_BG,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      width: PAGE_WIDTH,
      height: SLIDE_HEIGHT,
      borderRadius: RADIUS,
      overflow: 'hidden',
      backgroundColor: CARD_BG,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    dot: {
      height: 6,
      borderRadius: 3,
      marginHorizontal: 3,
    },
  });
