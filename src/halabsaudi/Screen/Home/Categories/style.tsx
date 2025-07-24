import { Dimensions, StyleSheet } from "react-native";
import { Fonts } from "../../../Themes/Fonts";

const { width } = Dimensions.get('window');
export  const getStyles=(language:string) => StyleSheet.create({
    container: {
      alignItems: 'center',
      marginHorizontal:"3%",
      marginTop:10,
    },
    Flatlist_Cont:{
      marginRight:8,
      alignItems:'center',
      marginBottom:20
    },
    image:{
       width:95,
       height:120,

       
    },
    cate_txt:{
      fontSize:12,
      fontFamily:Fonts.SF_Medium,
      marginTop:10,
      lineHeight:16,
      letterSpacing:0.3
    },
    Txt:{
      fontSize:12,
      color:'#ffffff',
      fontWeight:"bold",
      textAlign:"center",
      lineHeight:14,
      marginTop:86,
      width:language==='en'?'80%':'70%',
      alignSelf:"center"
    }
  });
  
