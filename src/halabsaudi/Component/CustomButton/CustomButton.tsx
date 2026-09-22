import {Text} from '../../../ui/Text';
// CustomButton.tsx
import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';

type buttonProps={
 title:string,
 onPress:()=>void,
 disabled?: boolean
}

const CustomButton:React.FC<buttonProps>= ({ title, onPress, disabled = false }) => {
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);
  
  return (
    <TouchableOpacity style={[styles.button, disabled && {opacity: 0.45}]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{disabled}} >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const getStyles=(language:string) => StyleSheet.create({
  button: {
    backgroundColor: Colors.btnRed, // Example color
    width:'100%',
    alignSelf:"center",
    height:55,
    justifyContent:"center",
    borderRadius: 14,
  },
  buttonText: {
    color: 'white',
    fontSize: language==='en'?16:14,
     fontFamily:Fonts.SF_Bold,
    textAlign: 'center',
    lineHeight:language==='en'?22:26,
  },
});

export default CustomButton;
