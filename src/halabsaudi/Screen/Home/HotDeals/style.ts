import { StyleSheet } from 'react-native';
import { Colors } from '../../../Themes/Colors';
import {
  CARD_BG,
  CARD_BORDER,
  cardShadow,
  fontW,
  GUTTER,
  MUTED,
  RADIUS,
  SCREEN_W,
} from '../../../Themes/Layout';

export const CARD_W = Math.round(SCREEN_W * 0.42);
const IMG_H = CARD_W; // square image
const CARD_H = IMG_H + 56;

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const align = isEn ? 'left' : 'right';

  return StyleSheet.create({
    listContent: {
      paddingHorizontal: GUTTER,
      paddingTop: 4,
      paddingBottom: 10, // shadow ke liye jagah
    },
    card: {
      width: CARD_W,
      height: CARD_H,
      borderRadius: RADIUS,
      backgroundColor: CARD_BG,
      borderWidth: 1,
      borderColor: CARD_BORDER,
      ...cardShadow,
    },
    imageWrap: {
      height: IMG_H,
      borderTopLeftRadius: RADIUS - 1,
      borderTopRightRadius: RADIUS - 1,
      overflow: 'hidden',
      backgroundColor: CARD_BORDER,
    },
    image: {
      width: '100%',
      height: IMG_H,
    },
    ribbon: {
      position: 'absolute',
      top: 8,
      [isEn ? 'left' : 'right']: 8,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: 'center',
    },
    ribbonNum: {
      ...fontW(isEn, 'bold'),
      fontSize: 16,
      lineHeight: 18,
      color: '#FFFFFF',
    },
    ribbonOff: {
      ...fontW(isEn, 'bold'),
      fontSize: 9,
      lineHeight: 11,
      color: '#FFFFFF',
      letterSpacing: isEn ? 1 : 0,
    },
    body: {
      flex: 1,
      paddingHorizontal: 10,
      justifyContent: 'center',
    },
    title: {
      ...fontW(isEn, 'bold'),
      fontSize: 14,
      lineHeight: 19,
      color: Colors.textPrimary,
      textAlign: align,
    },
    meta: {
      ...fontW(isEn, 'regular'),
      fontSize: 11,
      color: MUTED,
      textAlign: align,
      marginTop: 2,
    },
    shimmerCard: {
      width: CARD_W,
      height: CARD_H,
      borderRadius: RADIUS,
    },
  });
};
