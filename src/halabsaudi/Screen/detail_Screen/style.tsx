import {Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';


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
      tintColor: Colors.Green,
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
      fontFamily: Fonts.SF_Medium,
    },

    Title_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
    },
    title: {
      width: '80%',
      fontSize: 20,
      lineHeight: language === 'en' ? 26 : 32,
      color: Colors.Black,
      letterSpacing: 0.5,
      fontWeight: language === 'en' ? '400' : 'bold',
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
    },
    call_cont: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    Phone_Icon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },

    call_txt: {
      fontSize: 12,
      lineHeight: 15,
      color: Colors.Black,
      fontFamily: Fonts.SF_Bold,
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
      backgroundColor: Colors.Green,
      padding: 8,
      borderRadius: 6,
    },
    menu_txt: {
      color: Colors.White,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.SF_Bold,
    },
    Discount: {
      fontSize: language === 'en' ? 14 : 14,
      color: Colors.Green,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
      letterSpacing: 0.4,
      lineHeight: language === 'en' ? 26 : 36,
      fontWeight: language === 'en' ? '400' : 'bold',
    },
    Total_Discount: {
      fontSize: 18,
      color: Colors.Green,
      fontFamily: Fonts.SF_Bold,
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
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
      marginTop: '2%',
      marginBottom: language === 'en' ? '2%' : '0.5%',
    },

    Detail: {
      fontSize: 14,
      lineHeight: language === 'en' ? 17 : 26,
      color: Colors.Black,
      fontFamily: language === 'en' ? Fonts.SF_Regular : '',
      fontWeight: '400',
      marginBottom: '3%',
      textAlign: language === 'en' ? 'left' : 'right',
    },
    Loc_Cont: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: '2%',
    },
    Loc_Icon: {
      width: 16,
      height: 16,
      resizeMode: 'contain',
      marginRight: '1%',
    },

    Loc_Txt: {
      fontSize: 10,
    },
    timing_dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    working_hour_txt: {
      fontSize: 14,
      color: Colors.Green,
      fontFamily: Fonts.SF_Bold,
      letterSpacing: 0.6,
      paddingVertical: 2,
      lineHeight: 22,
    },
    dropdown_icon: {
      fontSize: 14,
      color: Colors.Green,
    },
    item_cont: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderColor: '#eee',
    },
  });
