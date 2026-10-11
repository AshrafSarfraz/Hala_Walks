import { StyleSheet } from 'react-native';
import { Colors } from '../../../Themes/Colors';
import { Fonts } from '../../../Themes/Fonts';
import { CARD_BG, CARD_BORDER, GUTTER, SCREEN_W } from '../../../Themes/Layout';

const COLUMNS = 4;
export const COL_GAP = 10;

// Exact 4 columns: screen - dono gutters - 3 gaps
const itemSize = (SCREEN_W - GUTTER * 2 - COL_GAP * (COLUMNS - 1)) / COLUMNS;

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: GUTTER,
    marginTop: 4,
  },
  item: {
    width: itemSize,
    alignItems: 'center',
    marginBottom: 14,
  },
  imageWrap: {
    width: itemSize,
    height: itemSize,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cate_txt: {
    fontSize: 11.5,
    lineHeight: 15,
    color: Colors.textPrimary,
    fontFamily: Fonts.SF_Medium,
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },
  cate_txt_ar: {
    fontFamily: undefined,
    fontWeight: '600',
    fontSize: 11,
  },
  showMoreButton: {
    alignSelf: 'center',
    marginTop: 2,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brandGreen,
  },
  showMoreText: {
    color: Colors.brandGreen,
    fontSize: 12,
    fontFamily: Fonts.SF_Bold,
  },
  loaderRow: {
    flexDirection: 'row',
    gap: COL_GAP,
  },
  shimmerItem: {
    width: itemSize,
    height: itemSize,
    borderRadius: 16,
  },
});
