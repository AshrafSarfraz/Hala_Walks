import React, {forwardRef} from 'react';
import {TextInput as NativeTextInput, TextInputProps, StyleSheet} from 'react-native';
import {theme} from './theme';
export type TextInput = NativeTextInput;
export const TextInput = forwardRef<NativeTextInput, TextInputProps>((props, ref) => (
  <NativeTextInput
    {...props}
    ref={ref}
    keyboardAppearance="light"
    placeholderTextColor={props.placeholderTextColor ?? theme.muted}
    selectionColor={props.selectionColor ?? theme.accent}
    style={[styles.input, props.style]}
  />
));
TextInput.displayName = 'AppTextInput';
const styles = StyleSheet.create({input: {color: theme.text, backgroundColor: theme.surface, fontSize: 15, letterSpacing: 0, paddingVertical: 12, minHeight: 44}});
