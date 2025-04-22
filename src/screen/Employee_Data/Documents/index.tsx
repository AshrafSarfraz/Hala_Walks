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
  Platform,
  StatusBar,
} from 'react-native';
import CustomHeader from '../../../components/header/CustomHeader';
import { Colors } from '../../../theme/Colors';

const dummyDocs = [
  { id: '1', name: 'QID Front.pdf' },
  { id: '2', name: 'Visa Copy.jpg' },
  { id: '3', name: 'Passport.pdf' },
];

const DocumentControlScreen = ({ navigation }) => {
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
          <Text style={styles.actionText}>👁 View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownload(item.name)}>
          <Text style={styles.actionText}>⬇ Download</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden={false} barStyle={'dark-content'} backgroundColor={Colors.Bg} />
        <CustomHeader title="Documents" onBackPress={() => navigation.goBack()} />
        <FlatList
          data={documents}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 15 }}
        />

        <TouchableOpacity style={styles.uploadBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.uploadText}>➕ Upload Document</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>📄 Upload Document</Text>

              <TextInput
                placeholder="Enter file name..."
                style={styles.input}
                value={fileName}
                onChangeText={setFileName}
              />

              <TouchableOpacity
                style={styles.chooseBtn}
                onPress={() => setSelectedFile('dummy-file.pdf')}
              >
                <Text style={styles.chooseBtnText}>
                  {selectedFile ? '✅ File Selected' : '📁 Choose File'}
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
  container: { flex: 1,
    marginTop:Platform.OS==='ios'?0:'12%',
    paddingHorizontal: 20, 
     backgroundColor: '#f4f4f4' },

  uploadBtn: {
    backgroundColor: '#2f2f75',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  docItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,

  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1e2f',
    marginBottom: 15,
  },
  actionGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#edf1fa',
    borderRadius: 6,
  },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffe5e5',
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2f2f75',

  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    width: '90%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f2f75',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  chooseBtn: {
    backgroundColor: '#e9eefb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  chooseBtnText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#2f2f75',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  saveBtn: {
    padding: 12,
    backgroundColor: '#2f2f75',
    borderRadius: 10,
    flex: 1,
  },
  cancelText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  saveText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default DocumentControlScreen;
