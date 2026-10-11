import { StyleSheet } from 'react-native';
import { Colors } from '../../../Themes/Colors';
import {
  CARD_BG,
  CARD_BORDER,
  cardShadow,
  DEAL_RED,
  fontW,
  GOLD_BG,
  GOLD_TEXT,
  MUTED,
  RADIUS,
  SCREEN_W,
} from '../../../Themes/Layout';

export const CARD_W = Math.round(SCREEN_W * 0.8);
const CARD_H = 112;
const IMG = 84;

export const getStyles = (language: string) => {
  const isEn = language === 'en';
  const align = isEn ? 'left' : 'right';

  return StyleSheet.create({
    card: {
      width: CARD_W,
      height: CARD_H,
      flexDirection: isEn ? 'row' : 'row-reverse',
      alignItems: 'center',
      padding: 12,
      borderRadius: RADIUS,
      backgroundColor: CARD_BG,
      borderWidth: 1,
      borderColor: CARD_BORDER,
      ...cardShadow,
    },
    imageWrap: {
      width: IMG,
      height: IMG,
    },
    image: {
      width: IMG,
      height: IMG,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
    },
    rankBadge: {
      position: 'absolute',
      top: -6,
      [isEn ? 'left' : 'right']: -6,
      minWidth: 26,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      backgroundColor: Colors.textPrimary,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankText: {
      ...fontW(isEn, 'bold'),
      fontSize: 10,
      color: '#FFFFFF',
    },
    body: {
      flex: 1,
      [isEn ? 'marginLeft' : 'marginRight']: 12,
      justifyContent: 'center',
    },
    chip: {
      alignSelf: isEn ? 'flex-start' : 'flex-end',
      backgroundColor: GOLD_BG,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      marginBottom: 4,
    },
    chipText: {
      ...fontW(isEn, 'bold'),
      fontSize: 9.5,
      color: GOLD_TEXT,
      letterSpacing: isEn ? 0.3 : 0,
    },
    title: {
      ...fontW(isEn, 'bold'),
      fontSize: 15,
      lineHeight: 20,
      color: Colors.textPrimary,
      textAlign: align,
    },
    desc: {
      ...fontW(isEn, 'regular'),
      fontSize: 11.5,
      lineHeight: 15,
      color: MUTED,
      marginTop: 2,
      textAlign: align,
    },
    metaRow: {
      flexDirection: isEn ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    meta: {
      ...fontW(isEn, 'medium'),
      flexShrink: 1,
      fontSize: 10.5,
      color: Colors.accent,
    },
    offPill: {
      backgroundColor: DEAL_RED,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    offText: {
      ...fontW(isEn, 'bold'),
      fontSize: 10,
      color: '#FFFFFF',
    },
    shimmerCard: {
      width: CARD_W,
      height: CARD_H,
      borderRadius: RADIUS,
    },
  });
};
