import {StyleSheet} from 'react-native';
import {Colors} from '../../Themes/Colors';
import {Fonts} from '../../Themes/Fonts';

export const getStyles = (language: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.Bg,
    },
    prevButton: {
      position: 'absolute',
      top: 20,
      marginHorizontal:20,
      alignSelf:language === 'en' ? 'flex-start' : 'flex-end',

     
    },
    backIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
      tintColor: Colors.Green,
      transform:language === 'en' ?  [{scaleX:1}] :  [{scaleX:-1}] 
     
    },
    slide: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: Colors.Bg,
    },
    image: {
      width: '70%',
      height: '45%',
      borderRadius: 20,
      marginTop: '5%',
    },
    title: {
      fontSize: 22,
      textAlign: 'center',
      fontFamily: language === 'en' ? Fonts.SF_Bold : undefined,
      color: Colors.Black,
      lineHeight: language==='en'?28:40,
      marginTop: '3%',
      marginBottom: '2%',
    },
    description: {
      fontSize: 14,
      textAlign: 'center',
      fontFamily: language === 'en' ? Fonts.SF_Medium : undefined,
      color: '#232C33',
      lineHeight: 20,
      letterSpacing: 0.2,
      marginTop: '3%',
    },
    buttonContainer: {
      height: 50,
      width: '90%',
      justifyContent: 'flex-end',
      marginTop: '15%',
    },
  
    prevButtonText: {
      color: Colors.Black2,
      fontSize: 16,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: '4%',
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.Grey4,
      marginHorizontal: 2,
    },
    activePaginationDot: {
      backgroundColor: Colors.Green,
      width: 30,
      height: 8,
      borderRadius: 6,
    },
    buttonText: {
      color: Colors.White,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
