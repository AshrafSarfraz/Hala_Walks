import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Fonts } from '../../../theme/Fonts';
import { Colors } from '../../../theme/Colors';

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.Bg,
    marginTop: Platform.OS === 'ios' ? 50 : '8%',
  },

  Header_Txt: {
    marginHorizontal: '5%',
    marginBottom: 20,
    fontSize: 22,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
    textAlign: 'center',
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  Flatlist_Cont: {
    flex: 1,
    width: width * 0.45,
    margin: 8,
    borderRadius: 10,
    backgroundColor: Colors.White,
    height: 240,
    alignItems: 'flex-start',
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },

  cate_txt: {
    fontSize: 15,
    marginVertical: Platform.OS === 'ios' ? 7 : 2,
    fontFamily: Fonts.F_Bold,
    color: Colors.PrimaryColor,
    marginHorizontal: '4%',
  },

  Type_Cont: {
    backgroundColor: '#D0A700',
    paddingHorizontal: '4%',
    paddingVertical: 4,
    borderRadius: 3,
    marginHorizontal: '6%',
  },

  Type_Text: {
    fontSize: 11,
    lineHeight: 13,
    color: Colors.White,
    fontFamily: Fonts.F_Medium,
  },

  Loc_Status_Cont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: '6%',
  },

  Loc_Cont: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  LocationIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: Colors.PrimaryColor,
  },

  location_txt: {
    fontSize: 10,
    color: 'green',
    fontFamily: Fonts.F_Medium,
    lineHeight: 14,
    marginLeft: 2,
  },

  Status_Txt: {
    fontSize: 11,
    color: 'green',
    fontFamily: Fonts.F_Medium,
    lineHeight: 16,
    marginLeft: 5,
  },

  HeaderCont: {
    alignItems: 'flex-end',
    marginBottom: '3%',
    margin: 10,
  },

  HeartStyle: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: 'red',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 200,
  },

  loadingText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },

  noDataImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default styles;
