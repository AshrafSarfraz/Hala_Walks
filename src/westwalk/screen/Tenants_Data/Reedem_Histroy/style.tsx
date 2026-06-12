import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../../theme/Colors";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.Bg,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? '0%' : 20,
    },
    item: {
      backgroundColor: '#f0f0f0',
      padding: 15,
      marginTop: 20,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: Colors.Grey,
    },
    itemCode: {
      fontWeight: '600',
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 200,
    },
    loadingText: {
      fontSize: 16,
      color: '#555',
    },
    loader: {
      marginTop: 20,
    },
    noDataImage: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    noDataText: {
      fontSize: 16,
      color: '#888',
    },
    
  });