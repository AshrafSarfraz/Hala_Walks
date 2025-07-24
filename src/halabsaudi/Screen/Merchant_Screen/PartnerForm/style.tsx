import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors } from "../../../Themes/Colors";
const screenHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Colors.White
  },
  Body:{
    flex:1,
    paddingHorizontal:20,
    paddingTop:Platform.OS==='ios'?0:40,
  },
  webview: {
    height: screenHeight,
    flex: 1,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20, // half of spinner width
    marginTop: -20,  // half of spinner height
    zIndex: 10,
  },
});