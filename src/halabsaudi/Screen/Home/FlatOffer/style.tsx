// style.ts
import {Dimensions, Platform, StyleSheet} from 'react-native';
import {Colors} from '../../../Themes/Colors';

const {width} = Dimensions.get('window'); // ✅ window instead of screen

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
