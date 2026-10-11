// Poori app ke liye ek hi spacing / card system.
// Har section isi se padding leta hai, taake sab kinare ek line mein hon.
import { Dimensions, TextStyle, ViewStyle } from 'react-native';
import { Fonts } from './Fonts';

export const SCREEN_W = Dimensions.get('window').width;

export const GUTTER = 16;       // screen ke dono taraf ka padding
export const GAP = 12;          // cards ke beech ka fasla
export const SECTION_GAP = 12;  // sections ke beech ka fasla
export const RADIUS = 14;

export const CARD_BG = '#F6F7F9';
export const CARD_BORDER = '#E6E8EC';
export const MUTED = '#6B7280';
export const DEAL_RED = '#E5484D';
export const DEAL_GRADIENT = ['#FF7A45', '#E5484D'];
export const GOLD_BG = '#FFF4D6';
export const GOLD_TEXT = '#B7791F';

export const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },

};

type Weight = 'bold' | 'medium' | 'regular';

// English mein SF font, Arabic mein system font + weight
export const fontW = (isEn: boolean, w: Weight): TextStyle => {
  if (isEn) {
    return {
      fontFamily: w === 'bold' ? Fonts.SF_Bold : w === 'medium' ? Fonts.SF_Medium : Fonts.SF_Regular,
      fontWeight: '400',
    };
  }
  return { fontWeight: w === 'bold' ? '700' : w === 'medium' ? '600' : '400' };
};
