import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../../theme/Colors";
import { Fonts } from "../../../theme/Fonts";


const {width} = Dimensions.get('window');
const imageSize = (width - 40) / 4; // Adjusting image size dynamically

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal:"3%",
    backgroundColor:Colors.White,
    elevation:10,
    paddingTop:'5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  Flatlist_Cont: {
    marginRight: 6,
    alignItems: 'center',
    width: imageSize, // Making container responsive
    marginBottom:6
 
   
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
    fontFamily:Fonts.F_Bold,
    marginTop: 5,
    lineHeight: 14,
    letterSpacing: 0.3,
    textAlign: 'center',
    width:"100%",
  },
  showMoreButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.PrimaryColor,
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
