import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors } from "../../../theme/Colors";
import { Fonts } from "../../../theme/Fonts";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:Colors.White,
      marginTop:Platform.OS==='ios'?'0%':'8%'
    },
    pdf: {
      flex: 1,
      width: Dimensions.get('window').width,
      height: Dimensions.get('screen').height,
    
  
    },
    CloseBtn:{
      position:'absolute',
      backgroundColor:Colors.PrimaryColor,
      height:50,
      width:50,
      borderRadius:30,
      alignItems:"center",
      justifyContent:"center",
      right:15,
      top:15
    },
    CloseTxt:{
      color:Colors.White,
      fontSize:22,
      fontFamily:Fonts.F_Medium
    }
    
  });