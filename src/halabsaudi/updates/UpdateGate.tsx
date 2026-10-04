import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Text} from '../../ui/Text';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {Colors} from '../Themes/Colors';
import {RootState} from '../redux_toolkit/store';
import {needsUpdate, parseUpdatePolicy, UpdatePolicy} from './policy';

const CACHE_KEY = 'hala_update_policy_v1';
export default function UpdateGate({children}: {children: React.ReactNode}) {
  const ar = useSelector(
    (state: RootState) => state.language.language === 'ar',
  );
  const [ready, setReady] = useState(__DEV__);
  const [policy, setPolicy] = useState<UpdatePolicy | null>(null);
  const [error, setError] = useState(false);
  const apply = useCallback((data: unknown) => {
    setPolicy(parseUpdatePolicy(data, Platform.OS));
    setReady(true);
  }, []);
  useEffect(() => {
    if (__DEV__) {
      return;
    }
    let active = true;
    let received = false;
    const deadline = setTimeout(() => {
      if (active) {
        setReady(true);
      }
    }, 8000);
    AsyncStorage.getItem(CACHE_KEY)
      .then(raw => {
        if (active && !received && raw) {
          try {
            apply(JSON.parse(raw));
          } catch {}
        }
      })
      .catch(() => {});
    const ref = firestore().collection('appConfig').doc('hala');
    const unsubscribe = ref.onSnapshot(
      snapshot => {
        if (!active) {
          return;
        }
        // Ignore an empty offline cache; a confirmed deletion disables the policy.
        if (!snapshot.exists() && snapshot.metadata.fromCache) {
          return;
        }
        received = true;
        const data = snapshot.exists() ? snapshot.data() : null;
        apply(data);
        void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(
          () => {},
        );
      },
      () => {
        if (active) {
          setReady(true);
        }
      },
    );
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void ref
          .get({source: 'server'})
          .then(snapshot => {
            if (!active) {
              return;
            }
            received = true;
            const data = snapshot.exists() ? snapshot.data() : null;
            apply(data);
            void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(
              () => {},
            );
          })
          .catch(() => {});
      }
    });
    return () => {
      active = false;
      clearTimeout(deadline);
      unsubscribe();
      listener.remove();
    };
  }, [apply]);
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }
  if (!needsUpdate(DeviceInfo.getBuildNumber(), policy)) {
    return <>{children}</>;
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.icon}>
          <Ionicons
            name="cloud-download-outline"
            size={56}
            color={Colors.accent}
          />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {ar ? 'نسخة جديدة من هلا بانتظارك' : 'A fresh Hala is waiting'}
        </Text>
        <Text style={styles.description}>
          {ar
            ? 'حدّث التطبيق للمتابعة والاستمتاع بأحدث التحسينات.'
            : 'Update the app to continue and enjoy the latest improvements.'}
        </Text>
        <Text style={styles.version}>{policy?.latestVersion}</Text>
        {error && (
          <Text style={styles.description}>
            {ar
              ? 'تعذر فتح المتجر. حاول مرة أخرى.'
              : 'Could not open the store. Please try again.'}
          </Text>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.button}
          onPress={async () => {
            setError(false);
            try {
              await Linking.openURL(policy!.storeUrl);
            } catch {
              setError(true);
            }
          }}>
          <Text style={styles.buttonText}>
            {ar ? 'تحديث الآن' : 'Update now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.surface},
  loading: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28},
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 34,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  version: {fontSize: 14, color: Colors.accent, marginBottom: 24},
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {fontSize: 16, fontWeight: '600', color: Colors.onAccent},
});
