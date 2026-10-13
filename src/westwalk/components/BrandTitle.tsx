import React from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {Text} from './Text';
import {Fonts} from '../theme/Fonts';
import {Colors} from '../theme/Colors';
export default function BrandTitle({
  style,
  light = false,
}: {
  style?: StyleProp<TextStyle>;
  light?: boolean;
}) {
  return (
    <Text
      accessibilityRole="header"
      style={[
        {
          fontFamily: Fonts.F_Bold,
          fontSize: 23,
          color: light ? Colors.White : Colors.PrimaryColor,
          textAlign: 'center',
        },
        style,
      ]}>
      Westwalk Family
    </Text>
  );
}
