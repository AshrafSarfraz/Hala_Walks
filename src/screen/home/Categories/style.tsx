import { Dimensions, StyleSheet } from "react-native";
import { Fonts } from "../../../theme/Fonts";
import { Colors } from "../../../theme/Colors";


const { width } = Dimensions.get('window');
export  const getStyles=(language:string) => StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop:5,
      height:140,
      backgroundColor:Colors.White,
      paddingLeft:10
       
  
    },
    Flatlist_Cont:{
      alignItems:'center',
      marginBottom:20,
      justifyContent:"center",
      backgroundColor:Colors.White,
      height:140,
    },
    image:{
       width:80,
       height:80,
       resizeMode:"contain",
    },
    Txt:{
      fontSize:11,
      fontWeight:"bold",
      textAlign:"center",
      lineHeight:14,
      width:language==='en'?'80%':'70%',
      marginTop:5
    }
  });
  
