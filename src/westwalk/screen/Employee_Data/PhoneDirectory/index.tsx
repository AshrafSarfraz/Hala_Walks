import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {Text} from '../../../components/Text';
import PageLayout from '../../../components/PageLayout';
import Avatar from '../../../components/Avatar';
import {Colors} from '../../../theme/Colors';
import {fetchDirectory} from '../../../utils/directory';

export default function PhoneDirectoryScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const running = useRef(false);
  useEffect(() => {
    let active = true;
    running.current = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('phone_directory');
        const cached = raw ? JSON.parse(raw) : [];
        if (active && Array.isArray(cached) && cached.length) setRows(cached);
      } catch {}
      try {
        const fresh = await fetchDirectory();
        if (active) setRows(fresh);
        await AsyncStorage.setItem('phone_directory', JSON.stringify(fresh));
      } catch {
        if (active) setError(true);
      } finally {
        if (active) {
          setLoading(false);
          running.current = false;
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [retry]);
  const query = search.trim().toLowerCase();
  const filtered = rows.filter(item =>
    `${item.name || ''} ${item.position || ''} ${item.phone || ''}`
      .toLowerCase()
      .includes(query),
  );
  return (
    <PageLayout title="Directory" onBackPress={() => navigation.goBack()}>
      <View style={styles.body}>
        <TextInput
          style={styles.search}
          placeholder="Search by name or position"
          placeholderTextColor={Colors.Grey}
          value={search}
          onChangeText={setSearch}
        />
        {error && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setRetry(n => n + 1)}
            style={styles.notice}>
            <Text>
              {rows.length
                ? 'Could not refresh directory.'
                : 'Directory could not load.'}{' '}
              Tap to retry.
            </Text>
          </TouchableOpacity>
        )}
        {loading && (
          <ActivityIndicator
            style={{marginBottom: 12}}
            color={Colors.PrimaryColor}
          />
        )}
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.id || index)}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
            if (!running.current) setRetry(n => n + 1);
          }}
          renderItem={({item}) => (
            <TouchableOpacity
              disabled={!item.phone}
              style={styles.card}
              onPress={() =>
                Linking.openURL(`tel:${item.phone}`).catch(() => {})
              }>
              <Avatar name={item.name} size={48} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name || 'Member'}</Text>
                {!!item.position && (
                  <Text style={styles.position}>{item.position}</Text>
                )}
                {!!item.phone && <Text style={styles.phone}>{item.phone}</Text>}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={styles.empty}>
                {query
                  ? 'No matches found.'
                  : 'No directory entries available.'}
              </Text>
            ) : null
          }
        />
      </View>
    </PageLayout>
  );
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.White,
  },
  search: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  notice: {
    padding: 12,
    backgroundColor: Colors.accentSoft,
    borderRadius: 10,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
  },
  info: {flex: 1},
  name: {fontSize: 16, fontWeight: '600'},
  position: {color: Colors.Grey, marginTop: 4},
  phone: {color: Colors.PrimaryColor, marginTop: 4},
  empty: {textAlign: 'center', marginTop: 24},
});
