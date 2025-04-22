import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';

const SendEmailScreen = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const sendViaGmailApp = () => {
    if (!email || !subject || !message) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err => {
      console.error('Error:', err);
      Alert.alert('Error', 'Unable to open email app.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Send Email via Gmail</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipient Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.sendButton} onPress={sendViaGmailApp}>
        <Text style={styles.sendButtonText}>📧 Send Email</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2f2f75',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2f2f75',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SendEmailScreen;
