import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Image, Linking, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';
import CustomHeader from '../../../components/header/CustomHeader';

const StaffDocumentControlScreen = ({navigation}) => {
  const [userData, setUserData] = useState(null);

  const getDataFromStorage = async () => {
    try {
      const value = await AsyncStorage.getItem('@user_data');
      if (value !== null) {
        const parsed = JSON.parse(value);
        console.log('Parsed Data:', parsed);
        setUserData(parsed);
      } else {
        console.log('No data found');
      }
    } catch (e) {
      console.error('Error retrieving data:', e);
    }
  };

  useEffect(() => {
    getDataFromStorage();
  }, []);

  return (
    <ScrollView style={styles.container}>
      
      {userData?.documents && (
  <View style={{ marginTop: 30 }}>
   <CustomHeader title='Documents' onBackPress={()=>{navigation.goBack()}} />


    {Object.entries(userData.documents).map(([key, value]) => (
      <View key={key} style={styles.documentCard}>
        <Text style={styles.documentTitle}>{key}</Text>
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.Menu_Btn} onPress={() => {
                   if (value) {
                     navigation.navigate('PDFViewerScreen', { pdfUrl: value});
                   } else { }}}  >
                        
                         <Text style={styles.menu_txt} >View </Text>
                       </TouchableOpacity>
          <Button
            title="Download"
            onPress={() => {
              // This is a placeholder; for real download functionality you’ll need a file downloader like react-native-fs or rn-fetch-blob
              Alert.alert(`Download ${key} from:\n${value}`);
            }}
            color="green"
          />
        </View>
      </View>
    ))}
  </View>
)}



    
    </ScrollView>
  );
};

export default StaffDocumentControlScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  item: {
    marginVertical: 4,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
  },
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
   Menu_Btn:{
      backgroundColor:Colors.PrimaryColor,
      padding:8,
      borderRadius:6
    },
    menu_txt:{
     color:Colors.White,
     fontSize:12,
     lineHeight:16,
     fontFamily:Fonts.F_Bold,
     
    
    },
  
});



