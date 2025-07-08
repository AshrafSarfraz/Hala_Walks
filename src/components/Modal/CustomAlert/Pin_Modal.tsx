import React, { useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert, StatusBar } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import RBSheet from 'react-native-raw-bottom-sheet';
import FilterRBSheet from '../BottomSheet/bottom_sheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (enteredPin: string) => void;
  correctPin: string;
};

const Pin_Modal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const refRBSheet = useRef<RBSheet>();
  const [pin, setPin] = React.useState('');
  
  


  return (
    <Modal transparent visible={visible} animationType="fade">
        <StatusBar hidden={true} translucent={true} animated={true} />
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.headerText}>Enter Pin</Text>
          <TextInput placeholder="Enter Pin"  style={styles.InputField}  value={pin}  onChangeText={(txt) => setPin(txt)} keyboardType="number-pad" />

        <TouchableOpacity onPress={() => refRBSheet.current.open()}  style={styles.Redeem_btn} >
          <Text style={styles.use_txt} >Where to Get Redeem PIN?</Text>
        </TouchableOpacity>
        
         <TouchableOpacity style={styles.languageButton} onPress={() => {onSubmit(pin),setPin('')}}> 
          <Text style={styles.languageText}>Submit</Text> </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
       
        <FilterRBSheet ref={refRBSheet} />
      </View>
    </Modal>
  );
};

// ... styles remain the same



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    backgroundColor: 'white',
    width: '90%',
    paddingVertical: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontFamily: Fonts.SF_Bold,
    color: Colors.Black,
    marginBottom: 15,
  },
   InputField:{
    borderWidth:2,
    borderColor:Colors.Grey4,
    width:"85%",
    height:55,
    borderRadius: 8,
    marginBottom:4,
    paddingHorizontal:"3%",
    color:Colors.Black,
    fontSize:14,
    fontFamily:Fonts.SF_Medium,
    lineHeight:18
   },
   Redeem_btn:{
    marginLeft:'9%',
    marginVertical:4,
    alignSelf:"flex-start"

   },
   use_txt:{
     fontSize:14,
     fontFamily:Fonts.SF_SemiBold,
     textDecorationLine:"underline",
     marginBottom:20

   },
  languageButton: {
    backgroundColor: Colors.Green,
    width: '85%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent:"center",
    marginVertical: 4,
    height:55,
  },
  languageText: {
    color: Colors.White,
    fontSize: 16,
    fontFamily: Fonts.SF_Bold,
    lineHeight:22,
    letterSpacing:0.3
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderColor:Colors.Green,
 
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.Black,
    fontFamily: Fonts.SF_Bold,
    
  },
});

export default Pin_Modal;
