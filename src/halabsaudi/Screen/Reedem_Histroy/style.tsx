import { Platform, StyleSheet } from "react-native";
import { Colors } from "../../Themes/Colors";

export const styles = StyleSheet.create({
    Container: {
      flex: 1,
      backgroundColor: Colors.White4,
      marginVertical: Platform.OS === 'ios' ? '2%' : '10%',
      marginHorizontal: '3%',
    },
    loadingText: {
      marginTop: 30,
      alignSelf: 'center',
      color: 'gray',
    },
    noDataText: {
      fontSize: 18,
      color: 'black',
      alignSelf: 'center',
      marginTop: 30,
    },
    itemContainer: {
      marginTop:"1%",
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    codeText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.Green,
    },
    percentageText: {
      fontSize: 14,
      color: 'black',
      marginTop: 5,
    },
    dateText: {
      fontSize: 12,
      color: 'gray',
      marginTop: 5,
    },
    emptyStateContainer:{
      marginTop:90,
      alignItems:"center",
     justifyContent:"center",
    },
    emptyStateImage:{
     width:200,
     height:200
    },
    emptyStateText:{
     fontSize:16,
     marginTop:12,
     fontWeight:'bold',
     color:Colors.Black
    }
  });