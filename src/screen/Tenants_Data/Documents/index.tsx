import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Image, Linking, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';
import CustomHeader from '../../../components/header/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { languageData } from '../../../redux/language/languageSlice';

const StaffDocumentControlScreen = ({navigation}) => {
  const language = useSelector((state: RootState) => state.language.language);

  const [userData, setUserData] = useState(null);

  const getDataFromStorage = async () => {
    try {
      const value = await AsyncStorage.getItem('tenant_data');
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
    <SafeAreaView style={styles.Maincontainer} >
    <ScrollView style={styles.container}>
      
      {userData?.documents && (
  <View style={{}}>
   <CustomHeader title={languageData[language].Documents} onBackPress={()=>{navigation.goBack()}} />
   
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

const styles = StyleSheet.create({
  Maincontainer:{
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingHorizontal:20
  },
  item: {
    marginVertical: 4,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderColor:'grey',
    borderWidth:0.2
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
      justifyContent:'center',
      alignItems:"center",
      width:'48%',
      borderRadius:4,
      height:24
    },
    menu_txt:{
     color:Colors.White,
     fontSize:12,
     lineHeight:18,
     fontFamily:Fonts.F_Bold,
    },
  
});



