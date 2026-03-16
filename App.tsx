import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/westwalk/redux/store';
import AppStack from './src/HandlebothApp/handleNavigation';
import { initBackgroundVenueTracker } from './src/halabsaudi/Notifications';

const App = () => {
 
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
// import { PersistGate } from 'redux-persist/integration/react';
// import { persistor, store } from './src/westwalk/redux/store';
// import AppStack from './src/HandlebothApp/handleNavigation';
// import { initBackgroundVenueTracker } from './src/halabsaudi/Notifications';

// const App = () => {
//   useEffect(() => {
//     // ✅ Small delay — iOS ke liye zaroori
//     const timer = setTimeout(() => {
//       initBackgroundVenueTracker();
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <AppStack />
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;