import {Text} from '../../../ui/Text';

// CustomButton.tsx
import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { Fonts } from '../../Themes/Fonts';

type buttonProps={
 title:string,
 onPress:()=>void,
 disabled?: boolean
}

const CustomButton2:React.FC<buttonProps>= ({ title, onPress, disabled = false }) => {
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
    alignItems:language==='en'?'flex-start':'flex-end',
    backgroundColor: '#191B20', // Example color
    width:'100%',
    elevation:3,
    shadowColor:'#000',
    alignSelf:"center",
    height:55,
    justifyContent:"center",
    borderRadius: 14,
    marginBottom:"4%",
    paddingHorizontal:"4%"
  },
  buttonText: {
    color: '#F5F6F8',
    fontSize: language==='en'?16:14,
    fontFamily:Fonts.SF_Bold,
    lineHeight:language==='en'?22:26,
  },
});

export default CustomButton2;
