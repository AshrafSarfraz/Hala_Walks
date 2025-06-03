import { Dimensions, Platform, StyleSheet } from "react-native";


export const getStyles=(language:String)=> StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#ffffff",
    },
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
      paddingHorizontal:'4%',
      paddingTop:Platform.OS==='ios'?5:50,
    
    },
    loading: {
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - 25,
      left: Dimensions.get('window').width / 2 - 25,
    },
  });

