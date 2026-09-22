

import {Dimensions, Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';

const {width} = Dimensions.get('window');

export const getStyles = (language: string) =>
  StyleSheet.create({
  imageContainer: {width: '100%', height: 220, overflow: 'hidden', borderRadius: 16},
    container: {
      paddingHorizontal: '4%',
      paddingBottom: 10,
    },

    HeaderCont: {
      paddingTop: Platform.OS === 'ios' ? '2%' : '13%',
      marginBottom:10,
      paddingHorizontal: '4%',
      paddingBottom: 10,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      backgroundColor: Colors.darkgrey,
     
    },

    HeartStyle: {
      width: 38,
      height: 38,
      resizeMode: 'contain',
      tintColor: Colors.White,
      
    },

    Body_Cont: {
            justifyContent: 'center',
            marginVertical: '2.5%',
          },
          image: {
            width: '100%',
            height: 250,
            borderRadius: 6,
            marginBottom: Platform.OS === 'ios' ? 20 : 16,
            resizeMode:"contain"
          },
      imageSlider: {
      width: width-40,
      height: 250,
      borderRadius: 6,
      marginRight:10,
      resizeMode:"contain"
   
    },

    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
      gap: 6,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 99,
      marginTop:4,
      backgroundColor: '#191B20',
    },
    dotActive: {
      width: 18,
      backgroundColor: '#191B20',
    },

    Type_Cont: {
      backgroundColor: '#D0A700',
      alignItems: 'center',
      alignSelf: language === 'en' ? 'flex-start' : 'flex-end',
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginBottom: 10,
      borderRadius: 6,
    },
    Type_Text: {
      fontSize: 13,
      lineHeight: 18,
      color: Colors.White,
      fontFamily: Fonts.SF_Medium,
    },

    Title_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    title: {
      width: '72%',
      fontSize: 17,
      lineHeight: language === 'en' ? 22 : 28,
      color: Colors.White,
      letterSpacing: 0.3,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
      textAlign: language === 'en' ? 'left' : 'right',
    },

    call_cont: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: '#191B20',
    },
    Phone_Icon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
      marginRight: language === 'en' ? 6 : 0,
      marginLeft: language === 'ar' ? 6 : 0,
    },
    call_txt: {
      fontSize: 12,
      lineHeight: 15,
      color: '#F5F6F8',
      fontFamily: Fonts.SF_Bold,
    },

    Loc_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      marginTop: 6,
      padding: 10,
      borderRadius: 6,
      backgroundColor: '#191B20',
    },
    Loc_Icon: {
      width: 16,
      height: 16,
      resizeMode: 'contain',
      marginRight: language === 'en' ? 8 : 0,
      marginLeft: language === 'ar' ? 8 : 0,
      tintColor: Colors.btnRed,
    },
    Loc_Txt: {
      flex: 1,
      fontSize: 12,
      lineHeight: 16,
      color: '#F5F6F8',
      textAlign: language === 'en' ? 'left' : 'right',
      opacity: 0.9,
    },

    rowBetween: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },

    timing_dropdown: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
    },
    working_hour_txt: {
      fontSize: 14,
      color: Colors.White,
      fontFamily: Fonts.SF_Bold,
      letterSpacing: 0.2,
      paddingVertical: 2,
      lineHeight: 22,
    },
    dropdown_icon: {
      fontSize: 14,
      color: Colors.White,
      marginLeft: language === 'en' ? 6 : 0,
      marginRight: language === 'ar' ? 6 : 0,
    },

    branchBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: '#191B20',
    },
    branchBtnText: {
      color: '#F5F6F8',
      fontSize: 12,
      fontFamily: Fonts.SF_Medium,
    },

    timingsCard: {
      padding: 10,
      backgroundColor: Colors.darkgrey,
      borderRadius: 6,
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#343841',
    },
    item_cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderColor: '#343841',
    },
    timingDay: {
      fontSize: 13,
      color: Colors.White,
      fontFamily: Fonts.SF_Medium,
    },
    timingTime: {
      fontSize: 13,
      color: '#F5F6F8',
      fontFamily: Fonts.SF_Bold,
    },

    Dis_Cont: {
      marginTop: 10,
      backgroundColor: '#191B20',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 6,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#343841',
    },
    Total_Discount: {
      flex: 1,
      fontSize: 14,
      color: '#F5F6F8',
      fontFamily: Fonts.SF_Bold,
      lineHeight: 20,
      textAlign: language === 'en' ? 'left' : 'right',
    },
    disArrow: {
      fontSize: 22,
      color: Colors.btnRed,
      marginLeft: language === 'en' ? 10 : 0,
      marginRight: language === 'ar' ? 10 : 0,
    },

    // ✅ New modern offer button
    offerBtn: {
      width: '100%',
      borderRadius: 6,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: Colors.btnRed,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    offerBtnDisabled: {
      backgroundColor: '#191B20',
    },
    offerBtnLeft: {
      flex: 1,
      paddingRight: language === 'en' ? 10 : 0,
      paddingLeft: language === 'ar' ? 10 : 0,
    },
    offerBtnTitle: {
      color: '#fff',
      fontSize: 14,
      fontFamily: Fonts.SF_Bold,
    },
    offerBtnSub: {
      color: 'rgba(255,255,255,0.88)',
      fontSize: 12,
      marginTop: 4,
      fontFamily: Fonts.SF_Regular,
    },
    offerBtnArrow: {
      color: '#fff',
      fontSize: 28,
      fontFamily: Fonts.SF_Bold,
      marginLeft: language === 'en' ? 10 : 0,
      marginRight: language === 'ar' ? 10 : 0,
    },

    Desc_Cont: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      marginTop: 14,
      marginBottom: 6,
    },
    Desc: {
      fontSize: 18,
      lineHeight: language === 'en' ? 26 : 32,
      letterSpacing: 0.2,
      color: Colors.White,
      fontFamily: language === 'en' ? Fonts.SF_Bold : '',
    },
    Detail: {
      fontSize: 14,
      lineHeight: language === 'en' ? 18 : 26,
      color: Colors.White,
      fontFamily: language === 'en' ? Fonts.SF_Regular : '',
      marginBottom: 10,
      textAlign: language === 'en' ? 'left' : 'right',
      opacity: 0.9,
    },
  });
