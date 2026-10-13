import React from 'react';
import {Text as NativeText, TextProps, StyleSheet} from 'react-native';
import {Fonts} from '../theme/Fonts';
import {Colors} from '../theme/Colors';
export const Text = React.memo(function Text({style, ...props}: TextProps) {
  const weight = StyleSheet.flatten(style)?.fontWeight;
  const fontFamily =
    weight && (weight === 'bold' || Number(weight) >= 600)
      ? Fonts.F_Bold
      : weight === '500'
      ? Fonts.F_Medium
      : Fonts.F_Regular;
  return (
    <NativeText
      {...props}
      style={[{fontFamily, color: Colors.textPrimary}, style]}
    />
  );
});
