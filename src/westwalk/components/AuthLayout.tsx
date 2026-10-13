import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenHeader from './header/ScreenHeader';
import {Colors} from '../theme/Colors';
export default function AuthLayout({
  title,
  onBackPress,
  children,
  overlay,
}: {
  title: string;
  onBackPress: () => void;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <ScreenHeader title={title} onBackPress={onBackPress} />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: Math.max(insets.bottom, 20) + 20},
          ]}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      {overlay}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.White},
  body: {flex: 1},
  content: {flexGrow: 1, paddingHorizontal: 16, paddingTop: 32},
});
