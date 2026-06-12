import {StyleSheet, Platform} from 'react-native';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';


export const getStyles =(language:String)=> StyleSheet.create({
  
  Container: {
    flex:1,
    backgroundColor:Colors.PrimaryColor,
    paddingHorizontal: Platform.OS === 'ios' ? '3%' : '0%',
  },
  Header_container:{
    height:Platform.OS === 'ios' ? 110 : 100,
    backgroundColor:Colors.PrimaryColor,
    justifyContent:'flex-end',
  },
  header: {
    paddingHorizontal: '5%',
    flexDirection: language==='en'?'row':'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 70,
    resizeMode: 'contain',
  },
  language_Cont: {
    width: 82,
    flexDirection:  language==='en'?'row':'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  Btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  language_Icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  Scope_Icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  Categories_Cont: {
    width:'100%',
  },
  Categories_Txt: {
    fontSize: language==='en'?16:16,
    fontFamily: language==='en'?Fonts.F_Bold:'',
    color: Colors.PrimaryColor,
    fontWeight:language==='en'?'400':'bold',
    lineHeight: language==='en'?24:30,
    marginHorizontal:'4%',
    width:"92%",
    textAlign:language==='en'?'left':'right',
  },
  BestSeller_Cont: {
   marginBottom:"4%",
  },
  BestSeller_Txt: {
  fontSize: language==='en'?16:16,
    fontFamily: language==='en'?Fonts.F_Bold:'',
    color: Colors.PrimaryColor,
    fontWeight:language==='en'?'400':'bold',
    lineHeight: language==='en'?24:30,
    marginHorizontal:'4%',
    width:"92%",
    textAlign:language==='en'?'left':'right'
  },
  txt_cont:{
    flexDirection:"row"
  },
  loader:{

  }
});
