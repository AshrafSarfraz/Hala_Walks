import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';


// Your original Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDJFLFAox-_QQmD6VIP_HhYGj3KMv6Cwtk",
  authDomain: "west-walk-163cb.firebaseapp.com",
  projectId: "west-walk-163cb",
  storageBucket: "west-walk-163cb.firebasestorage.app",
  messagingSenderId: "561032764465",
  appId: "1:561032764465:web:44686e680128a3296bc910",
  measurementId: "G-04RDQKF8V2"
};



if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Use the default app
}


export { auth, firestore,storage };
