import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../../theme/Colors";
import { Fonts } from "../../../theme/Fonts";

export const getStyles=(language:string) => StyleSheet.create({
    Header_Cont:{
        width:'100%',
        height:Platform.OS==='ios'?300:270,
        backgroundColor:Colors.PrimaryColor,
        justifyContent:"flex-end",
        alignItems:"center",
        borderBottomLeftRadius:30,
        borderBottomRightRadius:30,

    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom:20,
        resizeMode:'contain'
      },
      name: {
        fontSize: 20,
        color: '#fff',
        lineHeight:26,
        fontFamily:Fonts.F_Bold
      },
      staffId: {
        fontSize: 14,
        color: '#fff',
        marginVertical: 4,
        lineHeight:18,
        fontFamily:Fonts.F_Medium,
        marginBottom: 40,
      },
      Button_Cont:{
        marginVertical:20
      },
      Logout_Cont:{
        width:'92%',
        alignSelf:"center",
        position:"absolute",
        bottom:40
      }
})