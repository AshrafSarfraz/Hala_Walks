import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AppState,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {openSettings} from 'react-native-permissions';
import {useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from '../../../ui/Text';
import {initVenueTracker} from '../../Notifications';
import {Colors} from '../../Themes/Colors';
import {experienceCopy} from '../../i18n/translations';
import {
  readLocationAccess,
  requestForegroundLocation,
  requestBackgroundLocation,
  LocationAccess,
} from '../../utils/locationPermissions';
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';
export default function LocationDisclosure({navigation}: any) {
  useStatusBar('light-content', Colors.background);
  const language: 'en' | 'ar' = useSelector((s: any) => s.language.language);
  const t = experienceCopy[language];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [access, setAccess] = useState<LocationAccess>({
    foreground: false,
    background: false,
    blocked: false,
  });
  useEffect(() => {
    let live = true;
    const refresh = async () => {
      try {
        const next = await readLocationAccess();
        if (live) setAccess(next);
      } catch {}
    };
    void refresh();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') void refresh();
    });
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  const finish = async (next: LocationAccess) => {
    await AsyncStorage.multiSet([
      ['hala_permissions_asked', 'true'],
      ['hala_location_permission_granted', String(next.foreground)],
      ['hala_background_location_granted', String(next.background)],
    ]);
    navigation.reset({index: 0, routes: [{name: 'BottomTab'}]});
    // Tracker setup/GPS must never delay entering the app.
    if (next.background) void initVenueTracker();
  };
  const allow = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const next = access.foreground
        ? await requestBackgroundLocation()
        : await requestForegroundLocation();
      setAccess(next);
      if (next.background) await finish(next);
      // Separate, explained background request after the foreground prompt.
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.hero}>
          <View style={s.orbit}>
            <Ionicons name="location-outline" size={46} color={Colors.accent} />
          </View>
          <Text style={s.title}>{t.location}</Text>
          <Text style={s.hint}>{t.locationHint}</Text>
        </View>
        {[
          {icon: 'compass-outline', title: t.nearby, hint: t.nearbyHint},
          {icon: 'notifications-outline', title: t.alerts, hint: t.alertsHint},
        ].map(item => (
          <View
            key={item.title}
            style={[
              s.card,
              {flexDirection: language === 'ar' ? 'row-reverse' : 'row'},
            ]}>
            <Ionicons name={item.icon as any} size={26} color={Colors.accent} />
            <View style={{flex: 1}}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardHint}>{item.hint}</Text>
            </View>
          </View>
        ))}
        <Text style={s.privacy}>{t.privacy}</Text>
        {access.foreground && !access.background && (
          <Text style={s.message}>{t.settingsHint}</Text>
        )}
        {access.blocked && <Text style={s.message}>{t.blocked}</Text>}
        {error && <Text style={s.message}>{t.locationError}</Text>}
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busy}
          style={s.button}
          onPress={
            access.blocked
              ? () => {
                  void openSettings('application').catch(() => setError(true));
                }
              : allow
          }>
          <Text style={s.buttonText}>
            {busy
              ? t.waiting
              : access.blocked
              ? t.settings
              : access.foreground
              ? t.background
              : t.allow}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={busy}
          style={s.skip}
          onPress={() => {
            void finish(access).catch(() => setError(true));
          }}>
          <Text style={s.skipText}>
            {access.foreground ? t.foreground : t.later}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: {flex: 1, backgroundColor: Colors.background},
  content: {flexGrow: 1, padding: 24, justifyContent: 'center'},
  hero: {alignItems: 'center', marginBottom: 28},
  orbit: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 29,
    lineHeight: 39,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  hint: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  card: {
    gap: 16,
    padding: 19,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  cardTitle: {fontSize: 16, fontWeight: '700', color: Colors.white},
  cardHint: {
    fontSize: 13,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginTop: 7,
  },
  privacy: {
    fontSize: 12,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  message: {
    fontSize: 13,
    lineHeight: 22,
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  buttonText: {fontSize: 15, fontWeight: '700', color: Colors.white},
  skip: {padding: 18, alignItems: 'center'},
  skipText: {color: Colors.textSecondary, fontSize: 14},
});
