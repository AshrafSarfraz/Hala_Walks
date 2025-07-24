import { Platform, StyleSheet } from "react-native";
import { Fonts } from "../../Themes/Fonts";
import { Colors } from "../../Themes/Colors";

export const styles = StyleSheet.create({
    Container:{
        flex:1,
        marginVertical:Platform.OS==='ios'?'3%':'8%',
        backgroundColor:Colors.Bg,
        paddingHorizontal:'4%'

    },
    Header_Txt:{
            marginHorizontal: '5%',
            marginBottom: Platform.OS==='ios'?'10%':'8%',
            fontSize: 22,
            fontFamily: Fonts.SF_Bold,
            color: Colors.Green,
            textAlign: 'center',
    },
    Button_Cont:{
      flex:0.9,
    },
    Logout_cont:{
        flex:0.1,
     justifyContent:"center",

    }

})