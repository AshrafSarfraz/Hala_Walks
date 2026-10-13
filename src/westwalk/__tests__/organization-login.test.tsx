jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, bottom: 20, left: 0, right: 0}),
}));
jest.mock('../redux/language/languageSlice', () => ({
  languageData: {
    en: {
      Organization_Login: 'Organization Login',
      Enter_credentials: 'Enter credentials',
      Enter_your_ID: 'ID',
      Enter_your_Password: 'Password',
      login: 'Login',
    },
  },
}));
import React from 'react';
import {TextInput} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../screen/Organization/Authentication/login/Organization_Login';
import CustomButton from '../components/buttons/CustomButton';
import {fetch_OrgEmp_Data} from '../firebase/firebaseutils';
jest.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({language: {language: 'en'}}),
}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {reset: (payload: any) => ({type: 'RESET', payload})},
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../firebase/firebaseutils', () => ({fetch_OrgEmp_Data: jest.fn()}));
jest.mock('../components/header/CustomHeader', () => () => null);
jest.mock('../components/Modal/CustomAlert/CustomAlert', () => () => null);
jest.mock('../components/Loader/ActivityIndicator', () => () => null);
test('organization credentials retain their data and open organization tabs', async () => {
  jest.useFakeTimers();
  const profile = {
    id: 'org-doc',
    empId: 'O1',
    password: 'secret',
    name: 'Member',
  };
  (fetch_OrgEmp_Data as jest.Mock).mockResolvedValue([profile]);
  const navigation = {dispatch: jest.fn(), goBack: jest.fn()};
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<Login navigation={navigation} />);
  });
  const inputs = tree.root.findAllByType(TextInput);
  await act(async () => {
    inputs[0].props.onChangeText('O1');
    inputs[1].props.onChangeText('secret');
  });
  await act(async () => {
    await tree.root.findByType(CustomButton).props.onPress();
  });
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    'org_emp_data',
    JSON.stringify({...profile, docId: 'org-doc'}),
  );
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(navigation.dispatch).toHaveBeenCalledWith({
    type: 'RESET',
    payload: {index: 0, routes: [{name: 'CorporationTab'}]},
  });
  await act(async () => {
    tree.unmount();
  });
  jest.clearAllTimers();
  jest.useRealTimers();
});
