import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';

type ContactUsProps={
    navigation: any;
}

const TenantsContactUsScreen:React.FC<ContactUsProps> = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    // You can integrate this with backend or send to an email
    Alert.alert('Success', 'Your message has been sent.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea}   >
      <StatusBar backgroundColor={Colors.Bg} barStyle="dark-content" />
      <View style={{paddingHorizontal:20}} >
      <CustomHeader title="Contact Us" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Your full name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Subject</Text>
        <TextInput
          placeholder="Subject"
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          placeholder="Your message"
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.Bg,
    marginTop:Platform.OS==='ios'?'0%':'11%',
 
  
  },
  container: {
  marginTop:10
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2f2f75',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TenantsContactUsScreen;
