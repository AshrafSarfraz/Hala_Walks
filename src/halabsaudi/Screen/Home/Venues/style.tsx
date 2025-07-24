import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../../Themes/Colors";
import { Fonts } from "../../../Themes/Fonts";

const {width} = Dimensions.get('window');
const imageSize = (width - 40) / 4; // Adjusting image size dynamically

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: '3%',
    marginTop: 10,
  },
  Flatlist_Cont: {
    marginRight: 6,
    alignItems: 'center',
    width: imageSize, // Making container responsive
    marginBottom:10,
   
  },
  image: {
    width: imageSize * 0.85,
    height: imageSize * 0.85,
    borderRadius: 10,
    resizeMode:"cover",
  },
  cate_txt: {
    fontSize: 10,
    color:Colors.Black,
    fontFamily:Fonts.SF_Bold,
    marginTop: 5,
    lineHeight: 14,
    letterSpacing: 0.3,
    textAlign: 'center',
    width:"100%"
  },
  showMoreButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.Green,
    borderRadius: 8,
  },
  showMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // or your theme background
  },
  loader:{
    position:"absolute",
    alignSelf:"center",
    justifyContent:'center',
  }
});
