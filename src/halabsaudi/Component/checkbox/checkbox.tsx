import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Tick } from '../../Themes/Images';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';


 // ✅ Dummy tick icon

type CheckboxProps = {
  label: string;
  onPress: () => void;
  isChecked: boolean;
  linkText: string;
  onLinkPress: () => void;

};

const CustomCheckbox: React.FC<CheckboxProps> = ({ label, onPress, isChecked, linkText, onLinkPress }) => {
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
 
  const styles = getStyles(language);
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity onPress={onPress} style={[styles.checkbox, isChecked && styles.checked]}>
        {isChecked && <Image source={Tick} style={styles.tickIcon} />}
      </TouchableOpacity>

      {/* Label & Privacy Link */}
      <Text style={styles.label}>
        {label}{' '}
        <Text style={styles.linkText} onPress={onLinkPress}>
          {linkText} 
        </Text>
       

     
      
      </Text>
    </View>
  );
};

const getStyles=(language:string) => StyleSheet.create({
  container: {
    flexDirection: language==='en'?'row':'row-reverse',
    alignItems: 'center',
    marginTop: 5,
    marginBottom:20
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.grey1, // ✅ Default grey border
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight:language==='en'? 10:0,
    marginLeft:language==='ar'?10:0,
  },
  checked: {
    borderColor: Colors.Green,
    backgroundColor:Colors.Green // ✅ Green when checked
  },
  tickIcon: {
    width: 15,
    height: 15,
    tintColor: Colors.White, // ✅ Ensuring green tick
  },
  label: {
    fontSize: 14,
    color: Colors.Black2,
  },
  linkText: {
    color: Colors.Black, // ✅ Blue for privacy policy link

  },
});

export default CustomCheckbox;
