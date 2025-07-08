import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../../theme/Colors";


export const getStyles=(language:String) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.Bg,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios'? '0%':20,
    },
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
    item: {
      backgroundColor: '#f0f0f0',
      padding: 15,
      marginTop: 20,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: Colors.Grey,
    },
    itemCode: {
      fontWeight: '600',
      fontSize: 16,
    },
    No_Data_Found_Cont:{
      justifyContent:'center',
      alignItems:"center",
      flex:1
    },
    No_Data_Found_Txt:{
      color:'black',
      fontSize:14
    }
  });