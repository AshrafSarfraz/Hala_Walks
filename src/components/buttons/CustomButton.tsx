// CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, } from 'react-native';
import { Colors } from '../../theme/Colors';


type buttonProps={
 title:string,
 onPress:()=>void
}

const CustomButton:React.FC<buttonProps>= ({ title, onPress, }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.PrimaryColor, // Example color
    width:'100%',
    alignSelf:"center",
    height:50,
    justifyContent:"center",
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight:22
  },
});

export default CustomButton;
