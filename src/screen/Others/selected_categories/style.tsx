import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';



export const getStyles=(language:String) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
    paddingHorizontal: "4%",
    marginTop:Platform.OS==='ios'?'0%':'12%',
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
    tintColor: Colors.PrimaryColor,
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.F_Bold,
    lineHeight: 24,
    color: Colors.PrimaryColor,
  },
  searchContainer: {
    flexDirection:language==='en'?'row':'row-reverse' ,
    alignItems: 'center',
    backgroundColor: Colors.White,
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
    tintColor: Colors.PrimaryColor,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 50,
    lineHeight:language==='en'?18:20,
    fontFamily: language==='en'?Fonts.F_Medium:'',
    color: Colors.Black,
    textAlign:language==='en'?'left':'right'
  },
  FlatlistContainer: {
    flex: 1,
    marginVertical: 10,
  },
  FoundItem_Txt: {
    color: Colors.PrimaryColor,
    fontSize: language==='en'?16:16,
    fontFamily: language==='en'?Fonts.F_Medium:"",
    lineHeight: language==='en'?22:30,
    fontWeight:'500',
    marginBottom: 10,
    textAlign:language==='en'?'left':'right'
  },
  itemContainer: {
    flexDirection: language==='en'?'row':"row-reverse",
    alignItems: 'center',
    backgroundColor: Colors.White,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth:1,
    borderColor: '#E0E0E0',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
   marginRight: language==='en'?10:10,
    marginLeft:language==='ar'?10:0, 

  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: language==='en'?16:16,
    fontFamily: language==='en'?Fonts.F_Bold:"",
    lineHeight: language==='en'?22:24,
    fontWeight:'500',
    color: Colors.Black,
    textAlign:language==='en'?'left':'right',
  },
  itemLocation: {
    fontSize: language==='en'?11:13,
    fontFamily: language==='en'?Fonts.F_Medium:"",
    lineHeight: language==='en'?14:20,
    fontWeight:'300',
    color: Colors.Black,
    marginLeft:language==='ar'?"2%":0,
    textAlign:language==='en'?'left':'right'
  
  },
  itemCity: {
    fontSize: language==='en'?12:12,
    fontFamily: language==='en'?Fonts.F_Bold:"",
    lineHeight: language==='en'?14:20,
    fontWeight:'500',
    color: Colors.Black,
    marginLeft:language==='ar'?"2%":0,
     textAlign:language==='en'?'left':'right'
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
