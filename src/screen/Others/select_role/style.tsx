import { Platform, StyleSheet } from "react-native";
import { Fonts } from "../../../theme/Fonts";
import { Colors } from "../../../theme/Colors";

export const getStyles=(language:string) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#31386A',
    },
    Header_Cont:{
      flex:0.33,
      alignItems:'center',
      justifyContent:'flex-end',
      paddingBottom:15
    },
    logo:{
      width: 150,
      height:110,
      resizeMode: 'contain',
      alignSelf:"center"
    },
    heading: {
      color: '#ffffff',
      fontSize: 20,
      textAlign: 'center',
      fontFamily: Fonts.F_Bold,
      letterSpacing:0.2,
      lineHeight:26
    },
    Btn_Cont:{
    flex: Platform.OS ==='ios' ? 0.7 : 0.7,
    paddingTop:40,
    marginHorizontal:20,
    },
    Role_Txt:{
     fontSize:14,
      color:Colors.White,
      lineHeight:20,
      fontFamily:Fonts.F_Medium,
      marginBottom:15,
      textAlign:language==='en'?"left":"right",
    },
    button: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      width: '100%',
      alignItems: 'center',
      justifyContent:'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
      height:90
    },
    innerButton: {
      flexDirection:language==='en'?'row':'row-reverse',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 18,
      color: Colors.PrimaryColor,
      fontFamily:Fonts.F_Bold,
      letterSpacing:0.2
    },
    user_icon:{
      width: 22,
      height: 22,
      tintColor: Colors.PrimaryColor,
      marginRight:language==='en'?12:0,
      marginLeft:language==='en'?0:12,
    },
    icon: {
      width: 30,
      height: 30,
      tintColor: Colors.PrimaryColor,
      marginRight:language==='en'?12:0,
      marginLeft:language==='en'?0:12,
    },
  
  
  });