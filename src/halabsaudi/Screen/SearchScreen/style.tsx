
import {Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';

export const getStyles = (language: String) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.darkgrey,

    },
    header: {
      flexDirection: language === 'ar' ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingHorizontal: '4%',
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: Colors.darkgrey,
    },
    backButton: {
      width: 44,
      height: 45,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: language === 'en' ? 8 : 0,
      marginLeft: language === 'ar' ? 8 : 0,
    },
    backChevron: {
      width: 12,
      height: 12,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      borderColor: Colors.White,
      transform: [
      { rotate: language === 'ar' ? '225deg' : '45deg' },
      ],
    },
    searchContainer: {
      flex: 1,
      minWidth: 0,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      height: 45,
      paddingHorizontal: 12,
      borderRadius: 9,
      borderColor: Colors.White,
      borderWidth: 1,
    },
    searchIcon: {
      width: 16,
      height: 18,
      marginRight: 8,
      marginLeft: language === 'ar' ? 8 : 0,
      tintColor: Colors.White,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      height: 40,
      lineHeight: language === 'en' ? 18 : 20,
      fontFamily: language === 'en' ? Fonts.SF_Medium : '',
      color: Colors.White,
      textAlign: language === 'en' ? 'left' : 'right',
      letterSpacing: 0.3,
    },
    FlatlistContainer: {
      flex: 1,
      marginVertical: 8,
    },
    FoundItem_Txt: {
      color: Colors.White,
      fontSize: 14,
      fontFamily: language === 'en' ? Fonts.SF_Medium : '',
      lineHeight: language === 'en' ? 22 : 30,
      fontWeight: '500',
      marginBottom: 10,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    itemContainer: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',

      marginBottom: 8,
      borderRadius: 6,
    },
    itemImage: {
      width: 130,
      height:130,
      borderRadius: 8,
      marginRight: language === 'en' ? 10 : 10,
      marginLeft: language === 'ar' ? 10 : 0,
      borderWidth: 0.2,
    },
    itemInfo: {
      flex: 1,
    },
    itemTitle: {
      fontSize: language === 'en' ? 16 : 14,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
      lineHeight: language === 'en' ? 22 : 24,
      fontWeight: '500',
      color: Colors.White,
      marginBottom: 5,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    itemLocation: {
      fontSize: 13,
      fontFamily: language === 'en' ? Fonts.SF_Medium : '',
      lineHeight: language === 'en' ? 19 : 21,
      fontWeight: '300',
      color: Colors.White,
      marginHorizontal: language === 'ar' ? '2%' : 0,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    itemCity: {
      width: '70%',
      fontSize: language === 'en' ? 10 : 8,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
      lineHeight: language === 'en' ? 10 : 14,
      fontWeight: '500',
      color: Colors.btnRed,
      marginLeft: language === 'ar' ? '2%' : 0,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    emptyStateContainer: {
      marginTop: 90,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateImage: {
      width: 200,
      height: 200,
    },
    emptyStateText: {
      fontSize: 16,
      marginTop: 12,
      fontWeight: 'bold',
      color: Colors.White,
    },
    Loc_Status_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      width: '100%',
      alignSelf: 'center',
      marginTop: 5,
    },
    Loc_Cont: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    LocationIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      tintColor: Colors.btnRed,
    },
    location_txt: {
      fontSize: 10,
      color: Colors.btnRed,
      fontFamily: Fonts.SF_Medium,
      lineHeight: 14,
      marginLeft: 2,
    },
  });