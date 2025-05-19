import { Dimensions, StyleSheet } from "react-native";
import { Fonts } from "../../../../theme/Fonts";


const { width } = Dimensions.get('window');
export  const getStyles=(language:string) => StyleSheet.create({
    container: {
      alignItems: 'center',
      marginHorizontal:"3%",
      marginTop:10,
    },
    Flatlist_Cont:{
      marginRight:6,
      alignItems:'center',
      marginBottom:20
    },
    image:{
       width:80,
       height:104,

       
    },
    cate_txt:{
      fontSize:12,
      fontFamily:Fonts.F_Medium,
      marginTop:5,
      lineHeight:16,
      letterSpacing:0.3
    },
    Txt:{
      fontSize:11,
      fontWeight:"bold",
      textAlign:"center",
      lineHeight:14,
      marginTop:64,
      width:language==='en'?'80%':'70%',
      alignSelf:"center"
    }
  });
  
