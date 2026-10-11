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

export const CARD_W = Math.round(SCREEN_W * 0.7);
const IMG_H = Math.round(CARD_W * 0.56); // 16:9 jaisa
const CARD_H = IMG_H + 78;

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const align = isEn ? 'left' : 'right';
  const row = isEn ? 'row' : 'row-reverse';

  return StyleSheet.create({
    listContent: {
      paddingHorizontal: GUTTER,
      paddingTop: 4,
   
      paddingBottom: 10, // shadow ke liye jagah
    },

    /* ---------------- card ---------------- */
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
    imageFade: {
      ...StyleSheet.absoluteFillObject,
    },
    badgeRow: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      flexDirection: row,
      justifyContent: 'space-between',
    },
    newBadge: {
      backgroundColor: Colors.brandGreen,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    newText: {
      ...fontW(isEn, 'bold'),
      fontSize: 10,
      color: '#FFFFFF',
      letterSpacing: isEn ? 0.8 : 0,
    },
    offBadge: {
      backgroundColor: Colors.accent,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: isEn ? 'auto' : 0,
      marginRight: isEn ? 0 : 'auto',
    },
    offText: {
      ...fontW(isEn, 'bold'),
      fontSize: 10,
      color: Colors.onAccent,
    },

    /* ---------------- text ---------------- */
    body: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
      justifyContent: 'space-between',
    },
    title: {
      ...fontW(isEn, 'bold'),
      fontSize: 15,
      lineHeight: 20,
      color: Colors.textPrimary,
      textAlign: align,
      writingDirection: isEn ? 'ltr' : 'rtl',
    },
    footer: {
      flexDirection: row,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tag: {
      flexShrink: 1,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: CARD_BORDER,
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 3,
      [isEn ? 'marginRight' : 'marginLeft']: 8,
    },
    tagText: {
      ...fontW(isEn, 'medium'),
      fontSize: 10.5,
      color: MUTED,
    },
    locRow: {
      flexDirection: row,
      alignItems: 'center',
      gap: 4,
    },
    locIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      tintColor: Colors.accent,
    },
    locText: {
      fontSize: 10.5,
      color: Colors.accent,
    },

    shimmerCard: {
      width: CARD_W,
      height: CARD_H,
      borderRadius: RADIUS,
    },
  });
};
