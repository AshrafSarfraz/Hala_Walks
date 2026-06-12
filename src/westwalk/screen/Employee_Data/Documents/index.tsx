import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../../../components/header/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStyles } from './style';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useNavigation } from '@react-navigation/native';
import { languageData } from '../../../redux/language/languageSlice';
import { Colors } from '../../../theme/Colors';
import EmptyStateScreen from '../../../components/NoDataFound/No_data_found';

const StaffDocumentControlScreen: React.FC = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const getDataFromStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('staff_data');
        if (value !== null) {
          const parsed = JSON.parse(value);
          setUserData(parsed);
        } else {
          console.log('No data found');
        }
      } catch (e) {
        console.error('Error retrieving data:', e);
      }
    };

    getDataFromStorage();
  }, []);

  const hasDocuments = userData?.documents && Object.keys(userData.documents).length > 0;

  return (
    <SafeAreaView style={styles.Maincontainer}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.Bg}
        barStyle={'dark-content'}
      />
      <ScrollView style={styles.container}>
        <CustomHeader
          title={languageData[language].Documents}
          onBackPress={() => navigation.goBack()}
        />

        {hasDocuments ? (
          <View style={{ marginTop: 15 }}>
            {Object.entries(userData.documents).map(([key, value]) => (
              <View key={key} style={styles.documentCard}>
                <Text style={styles.documentTitle}>{key}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.Menu_Btn, { backgroundColor: '#E5EDEA' }]}
                    onPress={() => {
                      if (value) {
                        navigation.navigate('PDFViewerScreen', { pdfUrl: value });
                      }
                    }}
                  >
                    <Text style={[styles.menu_txt, { color: '#005029' }]}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyStateScreen />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffDocumentControlScreen;
