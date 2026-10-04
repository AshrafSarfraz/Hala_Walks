// style.ts
import { Dimensions,StyleSheet } from 'react-native';
import { Colors } from '../../../Themes/Colors';

const {width} = Dimensions.get('window'); // ✅ window instead of screen

export const getStyles = (_language: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 10,
    },
    imageContainer: {
      width: width - 32,
      height: 200,
      borderRadius: 8,
      overflow: 'hidden', // ✅ fix for Android clipping

    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      

    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.overlaySoft,
      padding: '4%',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    imageText: {
      color: Colors.onMedia,
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
