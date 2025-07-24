import {Platform, StyleSheet} from 'react-native';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';


export const getStyles = (language: string) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 24,
      marginTop: Platform.OS === 'ios' ? '0%' : '10%',
      marginBottom: Platform.OS === 'ios' ? '1%' : '6%',
      paddingBottom: Platform.OS === 'ios' ? '0%' : '4%',
    },
    HeaderCont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: '3%',
    },
    HeartStyle: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
      tintColor: Colors.PrimaryColor,
    },
    Body_Cont: {
      justifyContent: 'center',
      marginVertical: '2.5%',
    },
    image: {
      width: '100%',
      height: 250,
      borderRadius: 10,
      marginBottom: Platform.OS === 'ios' ? 20 : 16,
    },
    Type_Cont: {
      backgroundColor: '#D0A700',
      alignItems: 'center',
      alignSelf: language === 'en' ? 'flex-start' : 'flex-end',
      padding: '2%',
      marginBottom: '3%',
      borderRadius: 5,
    },
    Type_Text: {
      fontSize: 14,
      lineHeight: 18,
      color: Colors.White,
      fontFamily: Fonts.F_Medium,
    },

    Title_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
    },
    title: {
      width: '80%',
      fontSize: 18,
      lineHeight: language === 'en' ? 26 : 32,
      color: Colors.Black,
      letterSpacing: 0.5,
      fontWeight: language === 'en' ? '400' : 'bold',
      fontFamily: language === 'en' ? Fonts.F_Bold : '',
      textAlign:language === 'en' ? 'left' : 'right',
    },
    title1:{
      width: '100%',
      fontSize: 18,
      lineHeight: language === 'en' ? 26 : 32,
      color: Colors.Black,
      letterSpacing: 0.5,
      fontWeight: language === 'en' ? '400' : 'bold',
      fontFamily: language === 'en' ? Fonts.F_Bold : '',
      textAlign:language === 'en' ? 'left' : 'right',
    },
    call_cont: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    Phone_Icon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },

    call_txt: {
      fontSize: 12,
      lineHeight: 15,
      color: Colors.Black,
      fontFamily: Fonts.F_Bold,
      marginHorizontal:5
    },

    Dis_Cont: {
      marginVertical: '3%',
      backgroundColor: Colors.White,
      padding: '3%',
      paddingVertical: '4%',
      borderRadius: 10,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    Dis_txt_cont: {
      flexDirection: 'row',
    },
    Menu_Btn: {
      backgroundColor: Colors.PrimaryColor,
      padding: 8,
      borderRadius: 6,
    },
    menu_txt: {
      color: Colors.White,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.F_Bold,
    },
    Discount: {
      fontSize: language === 'en' ? 14 : 14,
      color: Colors.PrimaryColor,
      fontFamily: language === 'en' ? Fonts.F_Bold : '',
      letterSpacing: 0.4,
      lineHeight: language === 'en' ? 26 : 26,
      fontWeight: language === 'en' ? '400' : 'bold',
    },
    Total_Discount: {
      fontSize: 18,
      color: Colors.PrimaryColor,
      fontFamily: Fonts.F_Bold,
      letterSpacing: 0.2,
      lineHeight: 26,
    },
    Desc_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
    },
    Desc: {
      fontSize: 18,
      lineHeight: language === 'en' ? 26 : 32,
      letterSpacing: 0.6,
      color: Colors.Black,
      fontWeight: '500',
      fontFamily: language === 'en' ? Fonts.F_Bold : '',
      marginBottom: language === 'en' ? '2%' : '0.5%',
    },

    Detail: {
      fontSize: 14,
      lineHeight: language === 'en' ? 18 : 26,
      color: Colors.Black,
      fontFamily: language === 'en' ? Fonts.F_Regular : '',
      fontWeight: '400',
      marginBottom: '3%',
      textAlign: language === 'en' ? 'left' : 'right',
    },
    Date_Cont:{
     flexDirection: 'row',
     height:60,
     width:'100%',
     backgroundColor:Colors.White,
     borderRadius:10,
     marginBottom:10,
     alignItems:"center",
    },
    Start_date:{
    width:'50%',
    alignItems:'center',
    justifyContent:'center',
    borderColor:Colors.PrimaryColor,
    borderRightWidth:2,
    height:40
    },
    End_date:{
   width:'50%',
    alignItems:'center',
    justifyContent:'center',
    },
    Date_txt:{
      fontFamily:Fonts.F_Bold,
      fontSize:14,
      marginBottom:5,
      color:Colors.PrimaryColor
    },
    date:{
      fontFamily:Fonts.F_Medium,
      fontSize:12,
      color:Colors.Black,
      lineHeight:16
    },
    Loc_Cont: {
      flexDirection: language=='en'?'row':'row-reverse',
      alignItems: 'center',
      marginTop: '2%',
    },
    Loc_Cont1:{
    flexDirection:language=='en'?'row':'row-reverse',
    },
    Loc_Icon: {
      width: 16,
      height: 16,
      resizeMode: 'contain',
      marginRight: '1%',
    },

    Loc_Txt: {
      fontSize: 10,
      color: Colors.Black,
      lineHeight:14
    },
    timing_dropdown: {
      flexDirection: language=='en'?'row':'row-reverse',
      alignItems: 'center',
    },
    working_hour_txt: {
      fontSize: 14,
      color: Colors.PrimaryColor,
      fontFamily: Fonts.F_Bold,
      letterSpacing: 0.6,
      paddingVertical: 2,
      lineHeight: 22,
    },
    dropdown_icon: {
      fontSize: 14,
      color: Colors.PrimaryColor,
    },
    item_cont: {
      flexDirection: language=='en'?'row':'row-reverse',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderColor: '#eee',
    },
  });
