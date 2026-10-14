import React from 'react';
import {View, StatusBar, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomHeader from './CustomHeader';
import {Colors} from '../../theme/Colors';
export default function ScreenHeader({
  title,
  onBackPress,
  right,
}: {
  title: string;
  right?: React.ReactNode;
  onBackPress?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="westwalk-header-safe-area"
      style={[styles.top, {paddingTop: insets.top}]}>
      <StatusBar
        hidden={false}
        translucent
        backgroundColor={Colors.White}
        barStyle="dark-content"
      />
      <CustomHeader title={title} onBackPress={onBackPress} right={right} />
    </View>
  );
}
const styles = StyleSheet.create({
  top: {backgroundColor: Colors.White, width: '90%', marginHorizontal:12, borderBottomWidth:0.6, borderColor:'#EEE' },
});
