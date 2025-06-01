import { StyleSheet } from "react-native";
import { Fonts } from "../../../theme/Fonts";
import { Colors } from "../../../theme/Colors";

export const getStyles=(language:String) => StyleSheet.create({
    Maincontainer:{
      flex: 1,
      backgroundColor: '#F4F4F4',
    },
    container: {
      flex: 1,
      backgroundColor: '#F4F4F4',
      paddingHorizontal:20
    },
    item: {
      marginVertical: 4,
      fontSize: 16,
    },
    label: {
      fontWeight: 'bold',
    },
    documentCard: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      borderColor:'grey',
      borderWidth:0.2
    },
    
    documentTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
     Menu_Btn:{
        justifyContent:'center',
        alignItems:"center",
        width:'48%',
        borderRadius:4,
        height:24
      },
      menu_txt:{
       color:Colors.White,
       fontSize:12,
       lineHeight:18,
       fontFamily:Fonts.F_Bold,
      },
    
  });