import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { persistor, store } from './src/westwalk/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import AppStack from './src/HandlebothApp/handleNavigation';

const App = () => {
  return (
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
       <AppStack />
    </PersistGate>
  </Provider>
  );
}

const styles = StyleSheet.create({})

export default App;
