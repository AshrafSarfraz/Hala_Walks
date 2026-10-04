import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { StyleSheet,TouchableOpacity,View } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from '../../../ui/Text';
import { Colors } from '../../Themes/Colors';
import { RootState } from '../../redux_toolkit/store';

export function BackButton({
  onPress,
  color = Colors.textPrimary,
}: {
  onPress: () => void;
  color?: string;
}) {
  const ar = useSelector(
    (state: RootState) => state.language.language === 'ar',
  );
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={ar ? 'رجوع' : 'Back'}
      style={styles.action}>
      <Ionicons
        name={ar ? 'chevron-forward' : 'chevron-back'}
        size={24}
        color={color}
      />
    </TouchableOpacity>
  );
}

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  backgroundColor?: string;
  iconColor?: string;
  textColor?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

// Two layouts: title header, or back button + search/custom content.
export default function CustomHeader({
  title,
  onBackPress,
  backgroundColor = Colors.header,
  iconColor = Colors.textPrimary,
  textColor = Colors.textPrimary,
  right,
  children,
}: HeaderProps) {
  const ar = useSelector(
    (state: RootState) => state.language.language === 'ar',
  );
  return (
    <View
      style={[
        styles.header,
        {backgroundColor, flexDirection: ar ? 'row-reverse' : 'row'},
      ]}>
      {onBackPress && <BackButton onPress={onBackPress} color={iconColor} />}
      <View style={styles.content}>
        {children || (
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            style={[
              styles.title,
              {color: textColor, textAlign: ar ? 'right' : 'left'},
            ]}>
            {title}
          </Text>
        )}
      </View>
      {right && <View style={styles.trailing}>{right}</View>}
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  action: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {flex: 1, minWidth: 0},
  trailing: {alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 18, lineHeight: 28, fontWeight: '700'},
});
