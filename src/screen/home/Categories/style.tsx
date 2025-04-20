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
      paddingLeft:10,
      elevation:1,
       
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
  
    },
    Flatlist_Cont:{
      alignItems:'center',
      justifyContent:"center",
      height:140,
      marginRight:5,
    },
    image:{
       width:80,
       height:80,
       resizeMode:"cover",
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
  
