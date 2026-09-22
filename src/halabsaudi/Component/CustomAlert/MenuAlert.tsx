import {Text} from '../../../ui/Text';

import React from 'react';
import {View, Modal, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';

type LanProps = {
  visible: boolean;
  onClose: () => void;
};

const MenuUnavailableModal: React.FC<LanProps> = ({ visible, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.messageText}>Menu is not available</Text>

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
    color: '#F5F6F8',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 30,
    backgroundColor: Colors.Green,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Fonts.SF_Bold,
  },
});

export default MenuUnavailableModal;
