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
export const IMAGE_H = Math.round(IMAGE_W * 0.78);
const BODY_H = 56;
const CARD_H = IMAGE_H + BODY_H + 2;

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const align = isEn ? 'left' : 'right';

  return StyleSheet.create({
    list: {
      height: CARD_H + 14,
      flexGrow: 0,
      flexShrink: 0,
    },

    listContent: {
      paddingHorizontal: GUTTER,
      paddingTop: 4,
      paddingBottom: 10,
      alignItems: 'flex-start',
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
      width: IMAGE_W,
      borderTopLeftRadius: RADIUS - 1,
      borderTopRightRadius: RADIUS - 1,
      overflow: 'hidden',
      backgroundColor: Colors.surface,
    },

    image: {
      width: IMAGE_W,
      height: IMAGE_H,
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
    },

    fallback: {
      width: IMAGE_W,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      backgroundColor: CARD_BG,
    },

    fallbackText: {
      ...fontW(isEn, 'regular'),
      fontSize: 11,
      color: MUTED,
      textAlign: 'center',
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
      height: BODY_H,
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
      lineHeight: 15,
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
