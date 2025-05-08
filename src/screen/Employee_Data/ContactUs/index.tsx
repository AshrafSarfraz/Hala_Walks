import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import emailjs, { EmailJSResponseStatus, send } from '@emailjs/react-native';

const StaffContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // const sendEmail = () => {
  //   if (!name || !email || !message) {
  //     Alert.alert("All fields required");
  //     return;
  //   }

  //   const templateParams = {
  //     user_name: name,
  //     user_email: email,
  //     message: message,
  //   };

  //   emailjs
  //     .send('service_qjc1fz7', 'template_stwed7l', templateParams, {
  //       publicKey: 'Q1ZiJCsAfalC2jpmw',
  //     })
  //     .then((response) => {
  //       console.log('SUCCESS!', response.status, response.text);
  //       Alert.alert('Success', 'Message sent!');
  //       setName('');
  //       setEmail('');
  //       setMessage('');
  //     })
  //     .catch((err) => {
  //       console.log('FAILED...', err);
  //       Alert.alert('Error', 'Failed to send message.');
  //     });
  // };

  const onSubmit = async () => {
    try {
      const response = await send(
        'service_qjc1fz7',
        'template_stwed7l',
        {
          user_name: 'Test Name',
          user_email: 'test@example.com',
          message: 'This is a test message',
        },
        {
          publicKey: 'MZWB-tqWOpTL9LDfR',
        },
      );
  
      console.log('EmailJS Response:', response);
      Alert.alert('Success', 'Message sent!');
    } catch (err) {
      console.error('EmailJS Error:', err);
      Alert.alert('Error', 'Failed to send message.');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Contact Us</Text>
      <TextInput
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Your Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        style={[styles.input, { height: 100 }]}
      />
      <Button title="Send" onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40 },
  heading: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15,
  },
});

export default StaffContactUs;


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import CustomHeader from '../../../components/header/CustomHeader';
// import { Colors } from '../../../theme/Colors';

// type ContactUsProps={
//     navigation: any;
// }

// const StaffContactUs:React.FC<ContactUsProps> = ({ navigation }: any) => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [subject, setSubject] = useState('');
//   const [message, setMessage] = useState('');

//   const handleSubmit = () => {
//     if (!name || !email || !subject || !message) {
//       Alert.alert('Error', 'Please fill out all fields.');
//       return;
//     }

//     // You can integrate this with backend or send to an email
//     Alert.alert('Success', 'Your message has been sent.');
//     setName('');
//     setEmail('');
//     setSubject('');
//     setMessage('');
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}   >
//       <StatusBar backgroundColor={Colors.Bg} barStyle="dark-content" />
//       <View style={{paddingHorizontal:20}} >
//       <CustomHeader title="Contact Us" onBackPress={() => navigation.goBack()} />
//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           placeholder="Your full name"
//           style={styles.input}
//           value={name}
//           onChangeText={setName}
//         />

//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           placeholder="Your email"
//           style={styles.input}
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <Text style={styles.label}>Subject</Text>
//         <TextInput
//           placeholder="Subject"
//           style={styles.input}
//           value={subject}
//           onChangeText={setSubject}
//         />

//         <Text style={styles.label}>Message</Text>
//         <TextInput
//           placeholder="Your message"
//           style={[styles.input, styles.messageInput]}
//           value={message}
//           onChangeText={setMessage}
//           multiline
//           numberOfLines={4}
//         />

//         <TouchableOpacity style={styles.button} onPress={handleSubmit}>
//           <Text style={styles.buttonText}>Send Message</Text>
//         </TouchableOpacity>
//       </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: Colors.Bg,
//     marginTop:Platform.OS==='ios'?'0%':'11%',
 
  
//   },
//   container: {
//   marginTop:10
//   },
//   label: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: '#fff',
//     fontSize: 15,
//   },
//   messageInput: {
//     height: 120,
//     textAlignVertical: 'top',
//   },
//   button: {
//     backgroundColor: '#2f2f75',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default StaffContactUs;
