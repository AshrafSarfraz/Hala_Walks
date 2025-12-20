import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../Themes/Colors';
import { Back_Icon } from '../../Themes/Images';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { RootState } from '../../redux_toolkit/store';
import { useSelector } from 'react-redux';
import { getStyles } from './style';

type LocalUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

const AccountScreen: React.FC = ({ navigation }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [userData, setUserData] = useState<LocalUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setInitialLoading(true);

        // 🔹 yahan se backend user ka data aa raha hai
        const raw = await AsyncStorage.getItem('hala_user_backend');

        if (!raw) {
          setError('User data local storage me nahi mila.');
          setUserData(null);
          return;
        }

        const parsed: LocalUser = JSON.parse(raw);
        setUserData(parsed);
      } catch (e: any) {
        console.log('Error reading user from storage: ', e);
        setError('User data read karte waqt error aaya.');
        setUserData(null);
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const initials = useMemo(() => {
    const src = userData?.name || '';
    const parts = src.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || 'U';
  }, [userData?.name]);

  if (initialLoading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingTxt}>Loading your profile…</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: Colors.White4 }]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <Text style={[styles.loadingTxt, { color: Colors.Red }]}>
          {error ?? 'No user data found.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.White }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              flexDirection: language === 'en' ? 'row' : 'row-reverse',
              alignItems: 'center',
            }}
          >
            <Image
              source={Back_Icon}
              style={{
                marginRight: 4,
                width: 25,
                height: 25,
                resizeMode: 'contain',
                tintColor: 'white',
                transform: language === 'en' ? [{ scaleX: 1 }] : [{ scaleX: -1 }],
              }}
            />
            <Text style={styles.heroTitle}>{languageData[language].account}</Text>
          </TouchableOpacity>

          {/* 🔴 Edit ka option hata diya */}
        </View>

        <View style={styles.heroBottom}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.nameTxt}>{userData?.name || '—'}</Text>
            <Text style={styles.subTxt}>{userData?.email || 'No email'}</Text>
          </View>
        </View>
      </View>

      {/* Details (read-only) */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={styles.sectionHeader}>{languageData[language].personal_details}</Text>

        <View style={styles.list}>
          <View style={styles.listRow}>
            <Text style={styles.listKey}>{languageData[language].full_name}</Text>
            <Text style={styles.listVal}>{userData.name ?? '—'}</Text>
          </View>

          <View style={styles.listRow}>
            <Text style={styles.listKey}>{languageData[language].email}</Text>
            <Text style={styles.listVal}>{userData.email ?? '—'}</Text>
          </View>

          <View style={styles.listRow}>
            <Text style={styles.listKey}>{languageData[language].phone_number}</Text>
            <Text style={styles.listVal}>{userData.phone ?? '—'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountScreen;
