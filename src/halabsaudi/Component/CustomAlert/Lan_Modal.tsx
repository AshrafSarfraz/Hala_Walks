import {Text} from '../../../ui/Text';

import React from 'react';
import {View, Modal, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { RootState } from '../../redux_toolkit/store';
import { useDispatch, useSelector } from 'react-redux';
import { switchLanguage } from '../../redux_toolkit/language/languageSlice'; // Import the switchLanguage action

type LanProps = {
  visible: boolean;
  onClose: () => void;
};

const LanguageModal: React.FC<LanProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.language.language); // Get current language from the Redux store

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    dispatch(switchLanguage(newLanguage)); // Dispatch the switchLanguage action
    onClose(); // Close the modal
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
        <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.headerText}>
            {language === 'en' ? 'Language' : 'لغة'} 
          </Text>

          <TouchableOpacity 
            style={[styles.languageButton, language === 'en' && styles.selectedButton]} 
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[styles.languageText,language === 'en' && styles.selectedButtonTxt]}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.languageButton, language === 'ar' && styles.selectedButton]} 
            onPress={() => handleLanguageChange('ar')}
          >
            <Text style={[styles.languageText,language === 'ar' && styles.selectedButtonTxt]}>العربية</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    backgroundColor: '#191B20',
    paddingTop: 15,
    width: '85%',
    height: 255,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontFamily: Fonts.SF_Bold,
    color: '#F5F6F8',
    marginBottom: 15,
    lineHeight: 30,
  },
  languageButton: {
    backgroundColor: '#191B20',
    borderWidth:2,
    borderColor:Colors.Red,
    width: '80%',
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: Colors.Red, // Highlight selected language
  },
  selectedButtonTxt:{
   color:"#FFF"
  },
  languageText: {
    color: Colors.Red,
    fontSize: 16,
    fontFamily: Fonts.SF_Bold,
  },
  closeButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#F5F6F8',
    fontFamily: Fonts.SF_Bold,
  },
});

export default LanguageModal;
