import { Platform, StyleSheet } from "react-native";
import { Fonts } from "../../../Themes/Fonts";
import { Colors } from "../../../Themes/Colors";

export const getStyles=(language:string) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal:24,
      paddingTop:Platform.OS==='ios'?0:20

    },
    Body:{
      flex:0.8,
      paddingTop:60,
      marginBottom:100
    },
    Img:{
       width:'100%',height:200,resizeMode:'contain',
       marginBottom:50
    },
    heading: {
      fontSize: 24,
      color:Colors.Green,
      fontFamily:Fonts.SF_Bold,
      marginBottom: 20,
      textAlign: 'center',
    },
    paragraph: {
      width:'90%',
      fontSize: 14,
      fontFamily:Fonts.SF_Medium,
      color:Colors.Black,
      lineHeight: 20,
      textAlign: 'center',
      alignSelf:"center"
  
    },
    button: {
      backgroundColor: '#007BFF',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 10,
      alignSelf: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
    },
  });