import {StyleSheet, Platform} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';

export const getStyles =(language:String)=> StyleSheet.create({
  
  Container: {
  
    flex:1,
    backgroundColor: Colors.Bg,
    paddingHorizontal: Platform.OS === 'ios' ? '3%' : '0%',
    marginTop: Platform.OS === 'ios' ? 0 : '8%',
    marginBottom: Platform.OS === 'ios' ? 0 : '2%',
  },
  header: {
    paddingHorizontal: '4%',
    flexDirection: language==='en'?'row':'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',


  },
  logo: {
    width: 130,
    height: 60,
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
    tintColor: '#000',
  },

  Scope_Icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#000',
  },
  Categories_Cont: {
    width:'100%',
  },
  Categories_Txt: {
    fontSize: language==='en'?18:16,
    fontFamily: language==='en'?Fonts.SF_Bold:'',
    color: Colors.Green,
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
    color: Colors.Green,
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
