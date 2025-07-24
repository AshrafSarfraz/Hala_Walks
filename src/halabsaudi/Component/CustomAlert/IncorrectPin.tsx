import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import CustomButton from '../CustomButton/CustomButton';

type LanProps = {
  visible: boolean;
  onClose: () => void;
};

const IncorrectPin: React.FC<LanProps> = ({ visible, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <StatusBar hidden={true} translucent={true} animated={true} />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.messageText}>Pin is incorrect. Please enter the correct pin</Text>

           <CustomButton title='Close' onPress={onClose}/>
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
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '85%',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageText: {
    fontSize: 18,
    fontFamily: Fonts.SF_Bold,
    color: Colors.Black,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default IncorrectPin;
