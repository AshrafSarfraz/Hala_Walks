import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { persistor, store } from './src/westwalk/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import AppStack from './src/HandlebothApp/handleNavigation';
import Notifications, { initBackgroundVenueTracker } from './src/halabsaudi/Notifications';

const App = () => {
  useEffect(() => {
    const start = async () => {
      await Notifications();
      await initBackgroundVenueTracker();
    };

    start();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppStack />
      </PersistGate>
    </Provider>
  );
};

export default App;

// import 'react-native-gesture-handler';
// import React, { useEffect } from 'react';
// import { Provider } from 'react-redux';
// import { persistor, store } from './src/westwalk/redux/store';
// import { PersistGate } from 'redux-persist/integration/react';
// import AppStack from './src/HandlebothApp/handleNavigation';
// import Notifications, { initBackgroundVenueTracker } from './src/halabsaudi/Notifications';




//   const App = () => {
//     useEffect(() => {
//       const start = async () => {
//         await Notifications();
//         await initBackgroundVenueTracker();
//       };
  
//       start();
//     }, []);

//   return (
//     <Provider store={store}>
//     <PersistGate loading={null} persistor={persistor}>
//        <AppStack />
       
//     </PersistGate>
//   </Provider>
//   );
// }



// export default App;
