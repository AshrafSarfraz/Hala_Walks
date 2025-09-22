// CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { Fonts } from '../../Themes/Fonts';

type buttonProps={
 title:string,
 onPress:()=>void
}

const CustomButton2:React.FC<buttonProps>= ({ title, onPress, }) => {
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
    alignItems:language==='en'?'flex-start':'flex-end',
    backgroundColor: Colors.White, // Example color
    width:'100%',
    elevation:3,
    shadowColor:'#000',
    alignSelf:"center",
    height:55,
    justifyContent:"center",
    borderRadius: 5,
    marginBottom:"4%",
    paddingHorizontal:"4%"
  },
  buttonText: {
    color: Colors.Green,
    fontSize: language==='en'?16:14,
    fontFamily:Fonts.SF_Bold,
    fontWeight: 'bold',
    lineHeight:language==='en'?22:26,
  },
});

export default CustomButton2;
