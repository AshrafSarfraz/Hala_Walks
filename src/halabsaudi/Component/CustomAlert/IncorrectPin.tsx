import {Text} from '../../../ui/Text';

import React from 'react';
import {View, Modal, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import CustomButton from '../CustomButton/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { languageData } from '../../redux_toolkit/language/languageSlice';

type LanProps = {
  visible: boolean;
  onClose: () => void;
  message?: string;
};

const IncorrectPin: React.FC<LanProps> = ({ visible, onClose, message }) => {
  const language = useSelector((state: RootState) => state.language.language);


  return (
    <Modal transparent visible={visible} animationType="fade">
      <StatusBar barStyle="dark-content" />
      <View style={styles.overlay}>
        <View style={styles.container}>
        <Text style={styles.messageText}>{message}</Text>
           <CustomButton title={languageData[language].Close} onPress={onClose}/>
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
    backgroundColor: Colors.overlay,
  },
  container: {
    backgroundColor: Colors.surface,
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '85%',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageText: {
    fontSize: 18,
    fontFamily: Fonts.SF_Bold,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default IncorrectPin;
