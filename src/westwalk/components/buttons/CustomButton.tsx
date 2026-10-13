import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Text} from '../Text';
import {Colors} from '../../theme/Colors';
import {Fonts} from '../../theme/Fonts';
export default function CustomButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.PrimaryColor,
    width: '100%',
    alignSelf: 'center',
    minHeight: 50,
    padding: 12,
    justifyContent: 'center',
    borderRadius: 14,
  },
  text: {
    color: Colors.White,
    fontSize: 15,
    fontFamily: Fonts.F_Bold,
    textAlign: 'center',
  },
});
