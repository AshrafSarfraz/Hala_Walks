import {Dimensions, Platform, StyleSheet} from 'react-native';
import { Colors } from '../../../../theme/Colors';




const {width} = Dimensions.get('window');
// export const getStyles=(language:string) => StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     marginHorizontal: Platform.OS === 'ios' ? '3%' : '1%',
//     marginTop: 10,
//   },
//   imageContainer: {
//     width: width - 40,
//       height: 250,
//       borderRadius: 12,
//       overflow: 'hidden', // ✅ fix for Android clipping
//       marginRight: 8,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//   },
//   overlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     padding:"4%",
//     justifyContent:"flex-end",
//     alignItems:"flex-end",
//     borderRadius: 20,
//   },
//   imageText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   pagination: {
//     flexDirection: 'row',
//     marginTop: 10,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 2,
//   },
//   loader:{
//     position:"absolute",
//     alignSelf:"center",
//     justifyContent:'center',

//   }
// });



export const getStyles = (language: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors.Bg,
      alignItems: 'center',
      marginHorizontal: '4%',
      marginTop: 10,
    },
    imageContainer: {
      width: width - 40,
      height: 250,
      borderRadius: 12,
      overflow: 'hidden', // ✅ fix for Android clipping
      marginRight: 8,
    },
    imageSlider:{
      width: width-40,
      height: 250,
      borderRadius: 10,
      marginRight:10,
      resizeMode:"contain"
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 12,

    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: '4%',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    imageText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    pagination: {
      flexDirection: 'row',
      marginTop: 15,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      marginHorizontal: 3,
    },
    loader: {
      position: 'absolute',
      alignSelf: 'center',
      justifyContent: 'center',
    },
  });