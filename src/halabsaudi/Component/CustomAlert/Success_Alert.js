import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Device } from '../../Themes/Images';
import { Fonts } from '../../Themes/Fonts';

const SuccessAlert = ({ visible, message, onClose }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
        <Image source={Device} style={styles.Logo}/>
        <Text style={styles.Header_Txt} >Password Reset!</Text>
        <Text style={styles.Txt} >'Please check your email for password reset instructions</Text>
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>Back to Login</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: '5%',
    width: '90%',
    alignItems: 'center',
  },
  Logo:{
       width:150,height:150
    },
    Header_Txt:{
      fontSize:20,
      fontFamily:Fonts.SF_Bold,
      color:Colors.Black,
      lineHeight:26,
    },
    Txt:{
      fontSize:16,
      fontFamily:Fonts.SF_Medium,
      color:Colors.Black,
      lineHeight:20,
      textAlign:"center",
      marginVertical:"5%"
    },
  okButton: {
    backgroundColor:Colors.Green,
    paddingVertical: '6%',
    paddingHorizontal: '12%',
    borderRadius: 10,
  },
  okButtonText: {
    color: Colors.White,
    fontSize: 14,
    lineHeight:18,
    fontFamily:Fonts.SF_Bold
  },
});

export default SuccessAlert;
