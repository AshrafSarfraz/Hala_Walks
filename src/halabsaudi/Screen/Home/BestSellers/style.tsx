import { Dimensions, Platform, StyleSheet } from "react-native";
import { Fonts } from "../../../Themes/Fonts";
import { Colors } from "../../../Themes/Colors";

const { width } = Dimensions.get('window');
export const getStyles=(language:String) => StyleSheet.create({
    container: {
      alignItems: 'center',
      marginHorizontal:Platform.OS==='ios'?"3%":'1%'   ,
      marginTop:10,
      marginLeft:'4%'
    },
    Flatlist_Cont:{
      width:240,
      height:language==='en'?100:110,
      backgroundColor:'#f5f5f5',
      marginRight:10,
      paddingLeft:10,
      borderRadius:10,
      flexDirection:language==='en'?'row':'row-reverse',
      alignItems:'center',
      paddingHorizontal:'2%',
      paddingVertical:"1%"
     
    },
    image:{
       width:60,
       height:60,
       borderRadius:40,
   
       resizeMode:"contain",
    },
    bestSeller_Detail:{
     width:140,
     marginLeft:language==='en'?6:0,
     marginRight:language==='en'?0:6,
     textAlign:'justify',
    },
    title_txt:{
      fontSize:language==='en'?14:12,
      fontFamily:language==='en'?Fonts.SF_Bold:'',
      fontWeight :language==='en'?'400':'bold',
      color:Colors.Green,
      lineHeight:language==='en'?20:20,
      letterSpacing:language==='en'?0.2:0,
      textAlign:language==='en'?'left':'right',
    },
    desc_txt:{
      fontSize:language==='en'?11:9,
      fontFamily:language==='en'?Fonts.SF_Regular:'',
      fontWeight :'400',
      lineHeight:language==='en'?13:13,
      letterSpacing:0.2,
      marginTop:2,
      color:Colors.Black,
      textAlign:language==='en'?'left':'right',
    }
  });
  

  