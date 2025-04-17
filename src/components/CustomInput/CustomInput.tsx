import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const CustomInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  leftIconComponent = null,
  rightIconComponent = null,
  rightIconAltComponent = null,
  showToggle = false,
}) => {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  const renderRightIcon = () => {
    if (!showToggle) return null;
    return (
      <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
        {hidePassword ? rightIconComponent : rightIconAltComponent}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.inputContainer}>
      {leftIconComponent && <View style={styles.icon}>{leftIconComponent}</View>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={hidePassword}
        placeholderTextColor="#999"
      />
      {renderRightIcon()}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  icon: {
    marginRight: 8,
  },
});
