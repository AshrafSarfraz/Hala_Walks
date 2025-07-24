import React, { useEffect, useState } from 'react';
import { Text, View,SafeAreaView,FlatList,StatusBar,Image,} from 'react-native';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../Themes/Colors';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { RootState } from '../../redux_toolkit/store';
import { useSelector } from 'react-redux';
import { styles } from './style';

type RedeemItem = {
  code: string;
  percentage: string;
  createdAt: any;
  id: string;
};

const Reedem_His: React.FC = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState<RedeemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const language = useSelector((state: RootState) => state.language.language);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const snapshot = await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('redeemed_discounts')
            .orderBy('createdAt', 'desc')
            .get();

          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as RedeemItem[];

          setHistory(data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: RedeemItem }) => {
    const date = item.createdAt?.toDate?.().toLocaleString() ?? 'Unknown';
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.codeText}>Code: {item.code}</Text>
        <Text style={styles.percentageText}>{item.percentage}</Text>
        <Text style={styles.dateText}>Used on: {date}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
     <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />
        
      <View style={styles.Container}>
        <CustomHeader
          title="Redeem History"
          onBackPress={() => navigation.goBack()}
        />
          <View style={{marginBottom:"7%"}} />
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : history.length === 0 ? (
          <View style={styles.emptyStateContainer}>
          <Image source={require('../../assets/Images/no_data.png')} style={styles.emptyStateImage} />
          <Text style={styles.emptyStateText}>{languageData[language].No_Items_Found}</Text>
       </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};



export default Reedem_His;
