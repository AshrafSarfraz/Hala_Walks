import {StyleSheet, Dimensions, Platform} from 'react-native';
import {Fonts} from '../../Themes/Fonts';
import {Colors} from '../../Themes/Colors';

const {width} = Dimensions.get('screen');

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.Bg,
    marginTop: Platform.OS === 'ios' ? 0 : '8%',
  },
  Header_Txt: {
    marginHorizontal: '5%',
    marginBottom: 20,
    fontSize: 22,
    fontFamily: Fonts.SF_Bold,
    color: Colors.Green,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between', // Ensures even spacing
    marginBottom: 10, // Adds spacing between rows
  },
  Flatlist_Cont: {
    flex: 1,
    width: width * 0.45, // Reduced width for better spacing
    margin: 8,
    borderRadius: 10,
    backgroundColor: Colors.White,
    height: Platform.OS === 'ios' ? 240 : 240,
    alignItems:'flex-start',
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000', // Adding shadow effect for iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  image: {
    width: '100%', // Adjust image size according to screen width
    height: 150,
    resizeMode: 'cover',
    borderRadius:10,
  },
  cate_txt: {
    fontSize: 15,
    marginVertical: Platform.OS==='ios'?7:2,
    fontFamily: Fonts.SF_Bold,
    color: Colors.Green,
    marginHorizontal:"4%",
  },
  Type_Cont: {
    backgroundColor: '#D0A700',
    paddingHorizontal: '4%',
    paddingVertical: 4,
    borderRadius: 3,
    marginHorizontal:"6%",
  },
  Type_Text: {
    fontSize: 11,
    lineHeight: 13,
    color: Colors.White,
    fontFamily: Fonts.SF_Medium,
  },
  Loc_Status_Cont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    alignSelf:"center",
    paddingHorizontal:"6%"
    
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
  HeaderCont: {
    alignItems:'flex-end',
    marginBottom: '3%',
    margin:10
  },
  HeartStyle: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: 'red',
  },
  emptyStateContainer:{
    marginTop:90,
    alignItems:"center",
   justifyContent:"center",
  },
  emptyStateImage:{
   width:200,
   height:200
  },
  emptyStateText:{
   fontSize:16,
   marginTop:12,
   fontWeight:'bold',
   color:Colors.Black
  }
});
