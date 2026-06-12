import {StyleSheet, Platform} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';

export const getStyles =(language:String)=> StyleSheet.create({
  
  Container: {
    flex:1,
    backgroundColor: Colors.dargBg,
    paddingHorizontal: Platform.OS === 'ios' ? '0%' : '0%',
    marginTop: Platform.OS === 'ios' ? 0 : '8%',

  },
  header: {
    paddingHorizontal: '5%',
    flexDirection: language==='en'?'row':'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor:Colors.darkgrey,
    paddingBottom:4,

  },
  logo: {
    width: 140,
    height: 60,
    resizeMode: 'contain',
  },
  language_Cont: {
    width: 100,
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
    tintColor: '#000',
  },

  Scope_Icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FFF',
    marginRight:5
  },
  Categories_Cont: {
    width:'100%',
  },
  Categories_Txt: {
    fontSize: language==='en'?18:16,
    fontFamily: language==='en'?Fonts.SF_Bold:'',
    color: Colors.White,
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
  fontSize: language==='en'?18:16,
    fontFamily: language==='en'?Fonts.SF_Bold:'',
    color: Colors.White,
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
