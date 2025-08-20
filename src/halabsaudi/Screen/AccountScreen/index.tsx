import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AccountScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchCurrentUserData = async () => {
      try {
        // 1️⃣ Get current user phone number
        const currentUser = auth().currentUser;
        const phone = currentUser?.phoneNumber;

        if (!phone) return;

        // 2️⃣ Fetch user data from Firestore using phone as filter
        const userSnap = await firestore()
          .collection('hala_users')
          .where('phoneNumber', '==', phone)
          .limit(1)
          .get();

        if (!userSnap.empty) {
          const data = userSnap.docs[0].data();
          setUserData(data);
        } else {
          console.log('User not found in hala_users');
        }
      } catch (error) {
        console.log('Error fetching current user data:', error);
      }
    };

    fetchCurrentUserData();
  }, []);

  if (!userData) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text>Full Name: {userData.name}</Text>
      <Text>Email: {userData.email}</Text>
      <Text>Phone: {userData.phoneNumber}</Text>
      {/* Add more fields as needed */}
    </View>
  );
};

export default AccountScreen;


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   Platform,
//   ActivityIndicator,
//   StatusBar,
//   ScrollView,
// } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Colors } from '../../Themes/Colors';
// import CustomHeader from '../../Component/CustomHeader/CustomHeader';

// type AccountProps = {
//   navigation: any;
// };

// const AccountScreen: React.FC<AccountProps> = ({ navigation }) => {
//   const [userData, setUserData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchUserData = async () => {
//       try {
//         const currentUser = auth().currentUser;
//         if (!currentUser) {
//           console.log('No logged in user found');
//           setLoading(false);
//           return;
//         }

//         const phone = currentUser.phoneNumber;
//         if (!phone) {
//           console.log('No phone number on current user');
//           setLoading(false);
//           return;
//         }

//         // 🔹 Try AsyncStorage first
//         const cached = await AsyncStorage.getItem('hala_user');
//         if (cached) {
//           const parsed = JSON.parse(cached);
//           if (parsed.phoneNumber === phone) {
//             if (isMounted) {
//               setUserData(parsed);
//               setLoading(false);
//             }
//             return;
//           }
//         }

//         // 🔹 Fetch from Firestore
//         let snap = await firestore().collection('hala_users').doc(phone).get();
//         let data = snap.exists ? snap.data() : null;

//         // 🔹 Fallback: search by phoneNumber field if docId different
//         if (!data) {
//           const q = await firestore()
//             .collection('hala_users')
//             .where('phoneNumber', '==', phone)
//             .limit(1)
//             .get();
//           if (!q.empty) data = q.docs[0].data();
//         }

//         if (data && isMounted) {
//           const fullData = { ...data, email: currentUser.email ?? '', phoneNumber: phone };
//           setUserData(fullData);
//           // Cache it
//           await AsyncStorage.setItem('hala_user', JSON.stringify(fullData));
//         }
//       } catch (err) {
//         console.error('Error fetching user data:', err);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchUserData();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={Colors.Green} />
//       </View>
//     );
//   }

//   if (!userData) {
//     return (
//       <View style={styles.centered}>
//         <Text>No user data found.</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.White4 }}>
//       <StatusBar
//         hidden={false}
//         translucent={true}
//         animated={true}
//         backgroundColor={Colors.White4}
//         barStyle="dark-content"
//       />
//       <CustomHeader title="Profile" onBackPress={() => navigation.goBack()} />

//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.label}>Name</Text>
//           <Text style={styles.value}>{userData.name || 'Not Available'}</Text>

//           <Text style={styles.label}>Email</Text>
//           <Text style={styles.value}>{userData.email || 'Not Available'}</Text>

//           <Text style={styles.label}>Phone Number</Text>
//           <Text style={styles.value}>{userData.phoneNumber || 'Not Available'}</Text>

//           {userData.countryCode && (
//             <>
//               <Text style={styles.label}>Country Code</Text>
//               <Text style={styles.value}>{userData.countryCode}</Text>
//             </>
//           )}

//           {userData.createdAt && (
//             <>
//               <Text style={styles.label}>Created At</Text>
//               <Text style={styles.value}>
//                 {userData.createdAt.toDate
//                   ? userData.createdAt.toDate().toLocaleString()
//                   : userData.createdAt}
//               </Text>
//             </>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 15,
//   },
//   card: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 12,
//     elevation: 4,
//     marginVertical: 10,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: Colors.Green,
//     marginTop: 15,
//   },
//   value: {
//     fontSize: 16,
//     color: 'black',
//     marginTop: 5,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default AccountScreen;

