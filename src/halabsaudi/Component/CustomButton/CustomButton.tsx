// CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';

type buttonProps={
 title:string,
 onPress:()=>void
}

const CustomButton:React.FC<buttonProps>= ({ title, onPress, }) => {
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);
  
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} >
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
    borderRadius: 5,
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
