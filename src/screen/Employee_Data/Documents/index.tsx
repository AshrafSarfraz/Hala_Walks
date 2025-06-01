import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Image, Linking, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../../components/header/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './style';

const StaffDocumentControlScreen = ({navigation}) => {
  const [userData, setUserData] = useState(null);

  const getDataFromStorage = async () => {
    try {
      const value = await AsyncStorage.getItem('staff_data');
      if (value !== null) {
        const parsed = JSON.parse(value);
        // console.log('Parsed Data:', parsed);
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
    <SafeAreaView style={styles.Maincontainer} >
    <ScrollView style={styles.container}>
      
      {userData?.documents && (
  <View style={{}}>
   <CustomHeader title='Documents' onBackPress={()=>{navigation.goBack()}} />
   
   <View style={{marginTop:15}} >
    {Object.entries(userData.documents).map(([key, value]) => (
      <View key={key} style={styles.documentCard}>
        <Text style={styles.documentTitle}>{key}</Text>
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.Menu_Btn,{backgroundColor:'#E5EDEA'}]} 
         onPress={() => {  if (value) { navigation.navigate('PDFViewerScreen', { pdfUrl: value});} else { }}}  >
        <Text style={[styles.menu_txt,{color:"#005029"}]} >View </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.Menu_Btn,{backgroundColor:'#EAEBF0'}]} 
          onPress={() => {
            Alert.alert(`Download ${key} from:\n${value}`);
           }}  >
        <Text style={[styles.menu_txt,{color:"#31386A"}]} >Download </Text>
        </TouchableOpacity>
         
        </View>
      </View>
    ))}
    </View>
  </View>
)}
    </ScrollView>
    </SafeAreaView>
  );
};

export default StaffDocumentControlScreen;





