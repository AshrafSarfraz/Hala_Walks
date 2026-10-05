import { Dimensions,StyleSheet } from "react-native";
import { Fonts } from "../../../Themes/Fonts";

import { Colors } from '../../../Themes/Colors';

export  const getStyles=(_language:string) => StyleSheet.create({
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
       width:110,
       height:130,

       
    },
    cate_txt:{
      fontSize:8,
      fontFamily:Fonts.SF_Medium,
      marginTop:9,
      lineHeight:1,
      letterSpacing:0.3
    },
    caption: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.overlay, padding: 8, borderBottomLeftRadius: 10, borderBottomRightRadius: 10},
    Txt: {fontSize: 12, color: Colors.onMedia, fontWeight: '600', textAlign: 'center', lineHeight: 13},
  });
