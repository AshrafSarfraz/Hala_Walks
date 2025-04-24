import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import RedeemReceiptModal from '../../../components/Modal/RedeemModal';
import CustomHeader from '../../../components/header/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/Colors';
import {SafeAreaView} from 'react-native-safe-area-context';

const dummyData = [
  {
    id: '1',
    code: 'AQQVA6',
    createdAt: 'April 13, 2025 - 2:04 PM',
    percentage: '-20%',
    qid: '284750123456',
    staffId: 'EMP-1001',
    eligibility: 'Staff and their family',
    BrandName: 'Brown Coffee Shop',
  },
  {
    id: '2',
    code: 'ZX89LM',
    createdAt: 'April 14, 2025 - 11:22 AM',
    percentage: '-15%',
    qid: '284750987654',
    staffId: 'EMP-1002',
    eligibility: 'Only staff',
    BrandName: 'Kana Restaurant',
  },
];

const CorporationHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={false} backgroundColor={Colors.Bg} barStyle="dark-content" />
      <CustomHeader
        title="Redeem History"
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <FlatList
        data={dummyData}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text style={styles.itemCode}>Code: {item.code}</Text>
            <Text>{item.createdAt}</Text>
            <Text>{item.percentage}</Text>
          </TouchableOpacity>
        )}
      />

      <RedeemReceiptModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Bg,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios'? '0%':20,
  },
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
  item: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.Grey,
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CorporationHistoryScreen;
