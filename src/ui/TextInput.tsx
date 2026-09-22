import React, {forwardRef} from 'react';
import {TextInput as NativeTextInput, TextInputProps, StyleSheet} from 'react-native';
import {theme} from './theme';
export type TextInput = NativeTextInput;
export const TextInput = forwardRef<NativeTextInput, TextInputProps>((props, ref) => (
  <NativeTextInput
    {...props}
    ref={ref}
    keyboardAppearance="dark"
    placeholderTextColor={theme.muted}
    selectionColor={theme.accent}
    style={[styles.input, props.style, {color: theme.text, backgroundColor: theme.surface}]}
  />
));
TextInput.displayName = 'DarkTextInput';
const styles = StyleSheet.create({input: {
  color: theme.text, backgroundColor: 'transparent', fontSize: 15,
  letterSpacing: 0, paddingVertical: 12, minHeight: 44,
}});
