import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';

export const getStyles = (language: String) =>
  StyleSheet.create({
    Header_Cont: {
      width: '100%',
      height: Platform.OS === 'ios' ? 250 : 220,
      backgroundColor: Colors.PrimaryColor,
      justifyContent: 'flex-end',
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 60,
      marginBottom: 15,
    },
    name: {
      fontSize: 20,
      color: '#fff',
      lineHeight: 26,
      fontFamily: Fonts.F_Bold,
    },
    staffId: {
      fontSize: 14,
      color: '#fff',
      marginVertical: 4,
      lineHeight: 18,
      fontFamily: Fonts.F_Medium,
      marginBottom: 20,
    },
    Button_Cont: {
      marginVertical: 20,
    },
    Logout_Cont: {
      width: '92%',
      alignSelf: 'center',
      marginTop: 20,
      marginBottom: 40, // for spacing at bottom
    },
  });
