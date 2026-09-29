import React, {forwardRef} from 'react';
import {Text as NativeText, TextProps} from 'react-native';
import {theme} from './theme';
export type Text = NativeText;
export const Text = forwardRef<NativeText, TextProps>(({style, ...props}, ref) => (
  <NativeText {...props} ref={ref} style={[{color: theme.text}, style]} />
));
Text.displayName = 'AppText';
