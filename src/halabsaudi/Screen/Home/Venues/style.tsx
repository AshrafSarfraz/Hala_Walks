import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../../Themes/Colors";
import { Fonts } from "../../../Themes/Fonts";

const {width} = Dimensions.get('window');
const COLUMNS = 4;
const HORIZONTAL_MARGIN = width * 0.03 * 2; // 3% dono taraf
const ITEM_GAP = 6 * (COLUMNS - 1); // marginRight gap
const itemSize = (width - HORIZONTAL_MARGIN - ITEM_GAP) / COLUMNS;

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: '3%',
    marginTop: 10,
  },
  Flatlist_Cont: {
    width: itemSize,        // ✅ exact 4 column width
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 6,
  },
  image: {
    width: itemSize * 0.85,
    height: itemSize * 0.85,
    borderRadius: 10,
  },
  cate_txt: {
    fontSize: 10,
    color: Colors.White,
    fontFamily: Fonts.SF_Bold,
    marginTop: 5,
    lineHeight: 14,
    letterSpacing: 0.3,
    textAlign: 'center',
    width: '100%',
  },
  showMoreButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.Green,
    borderRadius: 6,
    alignSelf: 'center',
  },
  showMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});