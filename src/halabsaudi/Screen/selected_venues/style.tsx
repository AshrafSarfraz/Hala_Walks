import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';


export const getStyles=(language:string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,

    marginBottom:Platform.OS==='ios'?'0%':'2%'
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
    tintColor: Colors.textPrimary,
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.SF_Bold,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  searchContainer: {
    flexDirection:language==='en'?'row':'row-reverse' ,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: language === 'en' ? 8 : 0,
    marginLeft:language==='ar'?8:0,
    resizeMode: "contain",
    tintColor: Colors.textPrimary,
  },
  searchInput: {
    flex: 1,
      paddingVertical: 0,
      includeFontPadding: false,
    fontSize: 14,
    height:45,
    lineHeight:language==='en'?18:20,
    fontFamily: language==='en'?Fonts.SF_Medium:'',
    color: Colors.textPrimary,
    textAlign:language==='en'?'left':'right',
    letterSpacing: 0
  },
  FlatlistContainer: {
    flex: 1,
    marginVertical: 10,
  },
  FoundItem_Txt: {
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surface,
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
      borderColor: Colors.border,
    shadowColor: Colors.black, // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 130,
      height: 130,
      borderRadius: 8,
      marginRight: language === 'en' ? 10 : 10,
      marginLeft: language === 'ar' ? 10 : 0,
      borderWidth: 0.2,
  },
  itemInfo: {
    flex: 1,
      minWidth: 0,
  },
  itemTitle: {
    fontSize: language==='en'?14:16,
    fontFamily: language==='en'?Fonts.SF_Bold:"",
    lineHeight: language==='en'?22:30,
    fontWeight:'500',
    color: Colors.textPrimary,
    marginLeft:language==='ar'?"2%":0,
    textAlign:language==='en'?'left':'right'
  },
  itemLocation: {
    fontSize: language==='en'?11:13,
    fontFamily: language==='en'?Fonts.SF_Medium:"",
    lineHeight: language==='en'?14:24,
    fontWeight:'300',
    color: Colors.textPrimary,
    marginLeft:language==='ar'?"2%":0,
     textAlign:language==='en'?'left':'right'
  
  },
  itemCity: {
    fontSize: language==='en'?12:12,
    fontFamily: language==='en'?Fonts.SF_Bold:"",
    lineHeight: language==='en'?14:24,
    fontWeight:'500',
    color: Colors.textPrimary,
    marginLeft:language==='ar'?"2%":0,
     textAlign:language==='en'?'left':'right'
  },
  emptyStateContainer:{
    marginTop:90,
    alignItems:"center",
   justifyContent:"center",
  },
  emptyStateImage:{
   width: 140,
   height: 140
  },
  emptyStateText:{
   fontSize:16,
   marginTop:12,
   fontWeight:'bold',
   color:Colors.textPrimary
  },

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
    tintColor: Colors.textPrimary,
  },
  location_txt: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontFamily: Fonts.SF_Medium,
    lineHeight: 14,
    marginLeft: 2,
  },
});
