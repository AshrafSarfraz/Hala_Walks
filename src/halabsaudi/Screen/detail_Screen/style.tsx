import {Dimensions, Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';
const { width } = Dimensions.get('window');

export const getStyles = (language: string) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: '4%',
      marginTop: Platform.OS === 'ios' ? '0%' : '13%',
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
      textAlign: language === 'en' ? 'left':"right",
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
      paddingVertical: '4%',
      paddingHorizontal:'2%',
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
      fontSize: 10,
      lineHeight: 16,
      fontFamily: Fonts.SF_Bold,
    },

    Total_Discount: {
      fontSize: 14,
      color: Colors.Green,
      fontFamily: Fonts.SF_Bold,
      lineHeight: 24,
      width:'75%',
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
      flexDirection: language==='en'?'row':'row-reverse',
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
      lineHeight:16
    },
    Redeem_btn:{
    },
    use_txt:{
     color:Colors.Green,
     fontSize:12,
     fontFamily:Fonts.SF_Medium,

    },
    timing_dropdown: {
      flexDirection: language==='en'?'row':'row-reverse',
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
      flexDirection: language==='en'?"row":"row-reverse",
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderColor: '#eee',
    },
    
    imageSlider: {
      width: width-40,
      height: 250,
      borderRadius: 10,
      marginRight:10,
      resizeMode:"contain"
   
    },
  });
