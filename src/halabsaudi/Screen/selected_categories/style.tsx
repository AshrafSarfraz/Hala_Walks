import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';


export const getStyles=(language:String) => StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: "4%",
    // marginTop:Platform.OS==='ios'?'0%':'11%',
    marginBottom:Platform.OS==='ios'?'0%':'2%',
    backgroundColor: Colors.dargBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '7%',
  },
  backIcon: {
    width: 25,
    height: 25,
    marginRight: 12,
    tintColor: Colors.White,
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.SF_Bold,
    lineHeight: 24,
    color: Colors.White,
  },
  searchContainer: {
    flexDirection:language==='en'?'row':'row-reverse' ,
    alignItems: 'center',
    backgroundColor: Colors.darkgrey,
    height: 55,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    marginLeft:language==='ar'?8:0,
    resizeMode: "contain",
    tintColor: Colors.White,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 50,
    lineHeight:language==='en'?18:20,
    fontFamily: language==='en'?Fonts.SF_Medium:'',
    color: Colors.White,
    textAlign:language==='en'?'left':'right',
    letterSpacing:0.3
  },
  FlatlistContainer: {
    flex: 1,
    marginVertical: 10,
  },
  FoundItem_Txt: {
    color: Colors.White,
    fontSize: language==='en'?16:16,
    fontFamily: language==='en'?Fonts.SF_Medium:"",
    lineHeight: language==='en'?22:30,
    fontWeight:'500',
    marginBottom: 10,
    textAlign:language==='en'?'left':'right'
  },
  itemContainer: {
    flexDirection: language==='en'?'row':"row-reverse",
    alignItems: 'center',
    backgroundColor: Colors.whiteGrey,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth:1,
    borderColor: '#000',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: language==='en'?10:10,
    marginLeft:language==='ar'?10:0, 
    borderWidth:0.2

  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: language==='en'?14:12,
    fontFamily: language==='en'?Fonts.SF_Bold:"",
    lineHeight: language==='en'?18:22,
    fontWeight:'500',
    color: Colors.grey,
    marginBottom:5,
    textAlign:language==='en'?'left':'right',
  },
  itemLocation: {
    fontSize: language==='en'?11:11,
    fontFamily: language==='en'?Fonts.SF_Medium:"",
    lineHeight: language==='en'?13:16,
    fontWeight:'300',
    color: Colors.grey,
    marginHorizontal:language==='ar'?"2%":0,
    textAlign:language==='en'?'left':'right'
  
  },
  itemCity: {
    width:'70%',
    fontSize: language==='en'?10:8,
    fontFamily: language==='en'?Fonts.SF_Bold:"",
    lineHeight: language==='en'?10:14,
    fontWeight:'500',
    color: Colors.White,
    marginLeft:language==='ar'?"2%":0,
     textAlign:language==='en'?'left':'right',
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
  },

  // New Feature

  Loc_Status_Cont: {
    flexDirection: language==='en'?'row':"row-reverse",
    alignItems: 'center',
  
    width: '100%',
    alignSelf:"center",
    marginTop:5  
  },
  Loc_Cont: {
    flexDirection: 'row',
    alignItems: 'center',
  
    
  },
  LocationIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    tintColor: Colors.Red,
  },
  location_txt: {
    fontSize: 10,
    color: Colors.White,
    fontFamily: Fonts.SF_Medium,
    lineHeight: 14,
    marginLeft: 2,
  },
});
