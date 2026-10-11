import {StyleSheet} from 'react-native';
import {Colors} from '../../../Themes/Colors';
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

// Card ke dono taraf 1px border.
export const IMAGE_W = CARD_W - 2;

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const align = isEn ? 'left' : 'right';

  return StyleSheet.create({
    listContent: {
      paddingHorizontal: GUTTER,
      paddingTop: 4,
      paddingBottom: 10,
      alignItems: 'flex-start',
    },

    card: {
      width: CARD_W,
      borderRadius: RADIUS,
      backgroundColor: CARD_BG,
      borderWidth: 1,
      borderColor: CARD_BORDER,
      ...cardShadow,
    },

    imageWrap: {
      width: IMAGE_W,
      borderTopLeftRadius: RADIUS - 1,
      borderTopRightRadius: RADIUS - 1,
      overflow: 'hidden',
      backgroundColor: Colors.surface,
    },

    image: {
      width: '100%',
      height: '100%',
    },

    ribbon: {
      position: 'absolute',
      top: 6,
      [isEn ? 'left' : 'right']: 6,
      backgroundColor: Colors.accent,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 4,
      alignItems: 'center',
    },

    ribbonNum: {
      ...fontW(isEn, 'bold'),
      fontSize: 14,
      lineHeight: 17,
      color: Colors.onAccent,
    },

    ribbonOff: {
      ...fontW(isEn, 'bold'),
      fontSize: 9,
      lineHeight: 12,
      color: Colors.onAccent,
      letterSpacing: isEn ? 0.5 : 0,
    },

    body: {
      paddingHorizontal: 10,
      paddingVertical: 10,
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
      lineHeight: 15,
      color: MUTED,
      textAlign: align,
      marginTop: 2,
    },

    shimmerCard: {
      width: CARD_W,
      height: IMAGE_W + 56,
      borderRadius: RADIUS,
    },
  });
};