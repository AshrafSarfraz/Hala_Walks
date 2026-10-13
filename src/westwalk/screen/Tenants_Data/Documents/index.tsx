import PageLayout from '../../../components/PageLayout';
import {Text} from '../../../components/Text';
import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Button,
  Image,
  Linking,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../../theme/Colors';
import {Fonts} from '../../../theme/Fonts';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {languageData} from '../../../redux/language/languageSlice';

const StaffDocumentControlScreen: React.FC<{navigation: any}> = ({
  navigation,
}) => {
  const language = useSelector((state: RootState) => state.language.language);

  const [userData, setUserData] = useState<any>(null);

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
    <PageLayout
      title={languageData[language].Documents}
      onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.container}>
        {!userData?.documents && (
          <Text style={{textAlign: 'center', padding: 24}}>
            No documents available.
          </Text>
        )}
        {userData?.documents && (
          <View style={{}}>
            <View style={{marginTop: 15}}>
              {Object.entries(userData.documents).map(([key, value]) => (
                <View key={key} style={styles.documentCard}>
                  <Text style={styles.documentTitle}>{key}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.Menu_Btn, {backgroundColor: '#E5EDEA'}]}
                      onPress={() => {
                        if (value) {
                          navigation.navigate('PDFViewerScreen', {
                            pdfUrl: value,
                          });
                        } else {
                        }
                      }}>
                      <Text style={[styles.menu_txt, {color: '#005029'}]}>
                        View{' '}
                      </Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={[styles.Menu_Btn,{backgroundColor:'#EAEBF0'}]}
          onPress={() => {
            Alert.alert(`Download ${key} from:\n${value}`);
           }}  >
        <Text style={[styles.menu_txt,{color:"#005029"}]} >Download </Text>
        </TouchableOpacity> */}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default StaffDocumentControlScreen;

const styles = StyleSheet.create({
  Maincontainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
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
    borderColor: 'grey',
    borderWidth: 0.2,
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
  Menu_Btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 4,
    height: 24,
  },
  menu_txt: {
    color: Colors.White,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.F_Bold,
  },
});
