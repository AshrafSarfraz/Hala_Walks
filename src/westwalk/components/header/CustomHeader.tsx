import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Text} from '../Text';
import {Colors} from '../../theme/Colors';
import {Fonts} from '../../theme/Fonts';
import {RootState} from '../../redux/store';
export default function CustomHeader({
  onBackPress,
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
  onBackPress?: () => void;
}) {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  return (
    <View
      testID="westwalk-header"
      style={[styles.header, {flexDirection: ar ? 'row-reverse' : 'row'}]}>
      {onBackPress && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={ar ? 'رجوع' : 'Back'}
          onPress={onBackPress}
          style={styles.back}>
          <Ionicons
            name={ar ? 'arrow-forward' : 'arrow-back'}
            size={23}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      )}
      <Text
        accessibilityRole="header"
        style={[styles.title, {textAlign: ar ? 'right' : 'left'}]}>
        {title}
      </Text>
      {right}
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 56,
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    gap: 10,
    borderRadius: 0,

  },
  back: {width: 40, height: 40, justifyContent: 'center', alignItems: 'center'},
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.F_Bold,
    color: Colors.textPrimary,
  },
});
