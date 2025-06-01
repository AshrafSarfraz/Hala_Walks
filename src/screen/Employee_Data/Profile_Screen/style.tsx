import { Platform, StyleSheet } from "react-native";


export const styles= StyleSheet.create({
    container: {
      marginTop:Platform.OS==='ios'?40:30,
      paddingVertical: 20,
      backgroundColor: '#f4f4f4',
      width:"90%",
      alignSelf:"center"
    },
    Profile_container:{
      alignItems: 'center',
      paddingVertical: 20,
      backgroundColor: '#f4f4f4',
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 15,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    staffId: {
      fontSize: 16,
      color: '#666',
      marginTop: 4,
    },
    company: {
      fontSize: 16,
      color: '#666',
      marginBottom: 20,
    },
    section: {
      width: '100%',
      backgroundColor: '#ffffff',
      padding: 15,
      marginVertical: 10,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    infoBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 6,
    },
    label: {
      fontSize: 16,
      color: '#333',
    },
    value: {
      fontSize: 16,
      fontWeight: '500',
    },
  });
  