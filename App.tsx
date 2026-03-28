import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { persistor, store } from './src/westwalk/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import AppStack from './src/HandlebothApp/handleNavigation';
import Notifications from './src/halabsaudi/Notifications';





const App = () => {

  useEffect(() => {
    
    Notifications();
    
  }, []);
  return (
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
       <AppStack />
       
    </PersistGate>
  </Provider>
  );
}



export default App;
