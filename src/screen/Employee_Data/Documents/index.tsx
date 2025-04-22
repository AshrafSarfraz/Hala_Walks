// screens/DocumentControlScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';

const dummyDocs = [
  { id: '1', name: 'QID Front.pdf' },
  { id: '2', name: 'Visa Copy.jpg' },
  { id: '3', name: 'Passport.pdf' },
];

const DocumentControlScreen = ({navigation}) => {
  const [documents, setDocuments] = useState(dummyDocs);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleView = (name: string) => {
    Alert.alert('View Document', `Opening "${name}"... (dummy view)`);
  };

  const handleDownload = (name: string) => {
    Alert.alert('Download', `Downloading "${name}"... (dummy download)`);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSave = () => {
    if (!fileName || !selectedFile) {
      Alert.alert('Missing Info', 'Please enter a name and choose a file.');
      return;
    }

    const newDoc = {
      id: Date.now().toString(),
      name: fileName,
    };

    setDocuments(prev => [...prev, newDoc]);
    setFileName('');
    setSelectedFile(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.docItem}>
      <Text style={styles.docName}>{item.name}</Text>
      <View style={styles.actionGroup}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleView(item.name)}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownload(item.name)}>
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionText, { color: '#dc3545' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{flex:1}} >
      <View  style={styles.container} >
        
       <CustomHeader title='Documents' onBackPress={()=>{navigation.goBack()}} />

      <TouchableOpacity style={styles.uploadBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.uploadText}>➕ Upload Document</Text>
      </TouchableOpacity>

      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Upload Document</Text>

            <TextInput
              placeholder="Enter File Name"
              style={styles.input}
              value={fileName}
              onChangeText={setFileName}
            />

            <TouchableOpacity
              style={styles.chooseBtn}
              onPress={() => {
                // Fake picker
                setSelectedFile('dummy-file.pdf');
              }}
            >
              <Text style={styles.chooseBtnText}>
                {selectedFile ? 'File Selected' : 'Choose File'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#f4f4f4' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#2f2f75' },
  uploadBtn: {
    backgroundColor: '#2f2f75',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: { color: '#fff', fontWeight: 'bold' },
  docItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  actionGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2f2f75',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 14,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f2f75',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  chooseBtn: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  chooseBtnText: {
    fontWeight: '600',
    color: '#2f2f75',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  saveBtn: {
    padding: 10,
    backgroundColor: '#2f2f75',
    borderRadius: 8,
    flex: 1,
  },
  cancelText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  saveText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});

export default DocumentControlScreen;
