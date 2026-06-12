import { StyleSheet } from "react-native";
import { Colors } from "../../../../theme/Colors";

export const getStyles = (language: string) =>
    StyleSheet.create({
      Container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingTop: 60,
      },
      Logo: {
        width: 180,
        height: 100,
        alignSelf: 'center',
        resizeMode: 'contain',
        marginBottom: 40,
      },
      Title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 8,
      },
      Subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
      },
      InputContainer: {
        flexDirection: language==='en'?'row':'row-reverse',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#CCC',
        borderRadius: 10,
        height: 50,
        marginBottom: 16,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
      },
      Icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: language==='en'?10:0,
        marginLeft: language==='en'?0:10,
        tintColor: Colors.Grey,
      },
      input: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        height:45,
        textAlign: language==='en'?'left':'right',
      },
      passwordinput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        height:45,
        textAlign: language==='en'?'left':'right',
      },
      HideIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.Grey,
        resizeMode: 'contain',
      },
      Active_Input_Field: {
        borderColor: Colors.PrimaryColor,
      },
      Active_Image: {
        tintColor: Colors.PrimaryColor,
      },
      forgotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
      },
      checkboxContainer: {
        flex: 1,
      },
    });