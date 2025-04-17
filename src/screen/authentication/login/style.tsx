import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../../theme/Colors";



export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.White,
  
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop:Platform.OS==='ios'?110:60
    },
    logo: {
      width: 120,
      height: 120,
      alignSelf: 'center',
      marginBottom:"7%"
  
    },
    card: {
      backgroundColor: '#fefefe',
      padding: 24,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 5,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      color: '#666',
    },
    label: {
      fontSize: 16,
      marginBottom: 10,
      fontWeight: '500',
    },
    button: {
      backgroundColor: Colors.PrimaryColor, // Example color
      width:'100%',
      alignSelf:"center",
      height:55,
      justifyContent:"center",
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight:22
    },
  });
  