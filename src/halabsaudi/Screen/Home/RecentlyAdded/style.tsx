import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Fonts } from '../../../Themes/Fonts';
import { Colors } from '../../../Themes/Colors';


const { width } = Dimensions.get('window');

export const getStyles=(language:String)=>  StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  row: {
    justifyContent: 'space-between', // Ensures even spacing
    marginBottom: 10, // Adds spacing between rows
  },
Flatlist_Cont: {
    flex: 1,
    width: width * 0.45, // Reduced width for better spacing
    margin:6,
    borderRadius: 10,
    backgroundColor: Colors.White,
    height: Platform.OS === 'ios' ? 200 : 200,
    alignItems:'flex-start',
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000', // Adding shadow effect for iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,},
    image: {
      width: '100%', // Adjust image size according to screen width
      height: 120,
      resizeMode: 'cover',
      borderRadius:10,
      
    },
    cate_txt: {
      width:"90%",
      fontSize: 14,
      marginVertical: Platform.OS==='ios'?3:2,
      fontFamily: Fonts.SF_Bold,
      color: Colors.Green,
      marginHorizontal:"4%",
      textAlign:language==='en'?'left':"right",
    },
    Type_Cont: {
      backgroundColor: '#D0A700',
      paddingHorizontal: '4%',
      paddingVertical: 3,
      borderRadius: 3,
      marginHorizontal:"5%",
      alignSelf:language==='en'?'flex-start':'flex-end'
    },
    Type_Text: {
      fontSize: 9,
      lineHeight: 12,
      color: Colors.White,
      fontFamily: Fonts.SF_Medium,
    },
    Loc_Status_Cont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 6,
      alignSelf:"center",
      paddingHorizontal:"5%"
      
    },
    Loc_Cont: {
      flexDirection: 'row',
      alignItems: 'center',
      
    },
    LocationIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
      tintColor: Colors.Green,
    },
    location_txt: {
      fontSize: 10,
      color: 'green',
      fontFamily: Fonts.SF_Medium,
      lineHeight: 14,
      marginLeft: 2,
    },
    Status_Txt: {
      fontSize: 11,
      color: 'green',
      fontFamily: Fonts.SF_Medium,
      lineHeight: 16,
      marginLeft: 5,
    },

});
