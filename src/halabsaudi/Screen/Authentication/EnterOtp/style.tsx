import { StyleSheet } from "react-native";
import { Colors } from "../../../Themes/Colors";
import { Fonts } from "../../../Themes/Fonts";


export const getStyles=(language:string)=> StyleSheet.create({
    MainCont: {
      backgroundColor: Colors.dargBg,
      flexGrow: 1,
      padding: '4%',
    },
    Header:{
     width:'100%',
     height:50,
     marginBottom:"1%",
     paddingHorizontal:"1%",
     alignItems:language==='en'?'flex-start':'flex-end'
    },
    BackIcon:{
     width:30,height:30,
     tintColor:Colors.White,
     transform:language==='en'?[{scaleX:1}]:[{scaleX:-1}]
    },
    Logo: {
      width: 120,
      height: 120,
      alignSelf: 'center',
    },
    Number: {
      fontFamily: Fonts.SF_Medium,
      fontSize: 20,
      color: Colors.White,
      alignSelf: 'center',
      lineHeight: 26,
      marginBottom: '7%',
    },
    digit_Txt: {
      fontFamily: Fonts.SF_Medium,
      fontSize: 16,
      color: Colors.whiteGrey,
      alignSelf: 'center',
      lineHeight: 20,
      marginTop: '5%',

    },
    PhoneNumber:{
      fontFamily: Fonts.SF_Medium,
      fontSize: 20,
      color: Colors.White,
      alignSelf: 'center',
      lineHeight: 26,
      marginTop: '1%',
      marginBottom: '6%'
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    Otp: {
      width: 50,
      height: 50,
      backgroundColor: Colors.Bg,
      marginLeft: '2%',
      marginBottom: '3%',
      justifyContent: 'center',
      textAlign: 'center',
      borderRadius: 10,
      borderWidth: 2,
      fontSize: 16,
      color: Colors.Black2,
    },
    Error: {
      fontFamily: Fonts.SF_Medium,
      fontSize: 14,
      color: Colors.Red,
      lineHeight: 20,
      marginTop: '4%',
      marginBottom: '1%',
    },
    Resend_Cont: {
      flexDirection: 'row',
      alignSelf: 'center',
      marginTop: '45%',
      marginBottom: '15%',
    },
    Already: {
      fontFamily: Fonts.SF_Regular,
      fontSize: 14,
      color: Colors.White,
      lineHeight: 20,
    },
    Resend_Txt: {
      fontFamily: Fonts.SF_Bold,
      fontSize: 14,
      color: Colors.White,
      lineHeight: 20,
    },
  });
  