import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
       marginTop:40,
      paddingVertical: 20,
      backgroundColor: '#f2f2f2',
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
      width: '90%',
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
  