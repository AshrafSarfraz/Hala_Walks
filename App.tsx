import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import StackNavigation from './src/navigation/stackNavigation';
import { Provider } from 'react-redux';

import { persistor, store } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react';

const App = () => {
  return (
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
       <StackNavigation />
    </PersistGate>
  </Provider>
  );
}

const styles = StyleSheet.create({})

export default App;
