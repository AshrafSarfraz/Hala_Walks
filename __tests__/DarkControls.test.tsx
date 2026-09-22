import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {Pressable, StyleSheet, TextInput as NativeInput} from 'react-native';
import {TextInput} from '../src/ui/TextInput';
import {Alert, AlertHost} from '../src/ui/Alert';
test('dark input guarantees readable text and keyboard while preserving onChange', async () => {
  const onChangeText = jest.fn(); let view!: ReactTestRenderer;
  await act(async () => {view = create(<TextInput value="Ashraf" style={{color: '#fff', backgroundColor: '#FFFFFF'}} onChangeText={onChangeText} />);});
  const input = view.root.findByType(NativeInput);
  expect(StyleSheet.flatten(input.props.style).color).toBe('#F5F6F8');
  expect(StyleSheet.flatten(input.props.style).backgroundColor).toBe('#191B20');
  expect(input.props.keyboardAppearance).toBe('dark');
  input.props.onChangeText('Hello'); expect(onChangeText).toHaveBeenCalledWith('Hello');
  await act(async () => view.unmount());
});
test('dialog queue preserves cancel and destructive callbacks', async () => {
  let view!: ReactTestRenderer; const cancel = jest.fn(), remove = jest.fn();
  await act(async () => {view = create(<AlertHost />);});
  await act(async () => {Alert.alert('Delete?', 'Confirm', [{text: 'Cancel', style: 'cancel', onPress: cancel}, {text: 'Delete', style: 'destructive', onPress: remove}]); Alert.alert('Next');});
  await act(async () => {view.root.findAllByType(Pressable).find(p => p.props.accessibilityRole === 'button')!.props.onPress();});
  expect(cancel).toHaveBeenCalledTimes(1); expect(remove).not.toHaveBeenCalled();
  expect(JSON.stringify(view.toJSON())).toContain('Next');
  await act(async () => {view.root.findAllByType(Pressable).find(p => p.props.accessibilityRole === 'button')!.props.onPress();});
  expect(view.toJSON()).toBeNull();
  await act(async () => view.unmount());
});
