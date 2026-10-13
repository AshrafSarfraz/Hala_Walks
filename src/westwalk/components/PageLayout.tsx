import React from 'react';
import {View} from 'react-native';
import ScreenHeader from './header/ScreenHeader';
import {Colors} from '../theme/Colors';
export default function PageLayout({
  title,
  onBackPress,
  children,
}: {
  title: string;
  onBackPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{flex: 1, backgroundColor: Colors.White}}>
      <ScreenHeader title={title} onBackPress={onBackPress} />
      <View style={{flex: 1}}>{children}</View>
    </View>
  );
}
