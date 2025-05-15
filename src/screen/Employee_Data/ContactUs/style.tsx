import { Dimensions, Platform, StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'white',
    },
    container: {
      flex: 1,
      backgroundColor:'white',
      paddingHorizontal:'4%',
      paddingTop:Platform.OS==='ios'?0:25,
    
    },
    loading: {
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - 25,
      left: Dimensions.get('window').width / 2 - 25,
    },
  });

