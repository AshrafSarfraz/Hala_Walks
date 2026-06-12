import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

import { getStyles } from './style';
import { RootState } from '../../../../redux/store';
import { firestore } from '../../../../firebase/firebaseconfig';

const STORAGE_KEY = 'recently_added_brands';

const RecentlyAdded = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchRecentlyAdded = async () => {
      try {
        // 1. Get from cache first
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          setRecentItems(JSON.parse(cached));
        }

        // 2. Fetch fresh from Firebase
        const snapshot = await firestore().collection('Brands').get();
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const filtered = data.filter(item => {
          const createdAt = item.time?.toDate?.();
          return createdAt && createdAt > oneMonthAgo;
        });

        setRecentItems(filtered);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error('❌ Error fetching recently added items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyAdded();
  }, []);

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  const renderItem = ({ item }: { item: any }) => {
    const isLoaded = imageLoaded[item.id] ?? false;

    return (
      <TouchableOpacity
        style={styles.Flatlist_Cont}
        onPress={() => navigation.navigate('DetailScreen', { item })}
      >
        <ShimmerPlaceholder
          visible={isLoaded}
          LinearGradient={LinearGradient}
          style={{ width: '100%', height: 120 }}
        >
          {Platform.OS === 'ios' ? (
            <FastImage
              source={{ uri: item.img }}
              style={{ width: '100%', height: 120 }}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() => handleImageLoad(item.id)}
              onError={() => handleImageLoad(item.id)}
            />
          ) : (
            <Image
              source={{ uri: item.img }}
              style={{ width: '100%', height: 120 }}
              onLoad={() => handleImageLoad(item.id)}
              onError={() => handleImageLoad(item.id)}
            />
          )}
        </ShimmerPlaceholder>

        <Text style={styles.cate_txt}>
          {language === 'en'
            ? item.nameEng?.length > 20
              ? item.nameEng.substring(0, 20) + '...'
              : item.nameEng
            : item.nameArabic}
        </Text>

        <View style={styles.Type_Cont}>
          <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
        </View>

        <View style={styles.Loc_Status_Cont}>
          <Text style={styles.Status_Txt}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ShimmerPlaceholder
          visible={false}
          LinearGradient={LinearGradient}
          style={styles.image}
        />
      ) : (
        <FlatList
          data={recentItems.slice(0,8)}
          keyExtractor={(item) => item.id}
          horizontal={true}

          // numColumns={1}
          // columnWrapperStyle={styles.row}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default RecentlyAdded;


