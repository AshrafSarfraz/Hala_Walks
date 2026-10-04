import React, {useEffect, useState} from 'react';
import {
  AppState,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Text} from '../../ui/Text';
import {Colors} from '../Themes/Colors';
import {RootState} from '../redux_toolkit/store';
import {
  AccessStatus,
  PermissionKind,
  openPermissionSettings,
  permissionStatus,
  requestNativePermission,
} from './service';
import {registerFCMToken} from '../chat/registerFCMToken';

const copy = {
  backgroundLocation: {
    icon: 'navigate-outline',
    en: [
      'Nearby offers, even when you’re away',
      'Optional: Hala uses your location while the app is closed to notify you about nearby venues. This may use more battery. Choose Allow all the time in Settings if your device requires it.',
    ],
    ar: [
      'عروض قريبة حتى عند إغلاق التطبيق',
      'اختياري: يستخدم هلا موقعك أثناء إغلاق التطبيق لإشعارك بالأماكن القريبة. قد يزيد استهلاك البطارية. اختر السماح طوال الوقت من الإعدادات إذا تطلب جهازك ذلك.',
    ],
  },
  location: {
    icon: 'location-outline',
    en: [
      'Find your nearby favourites',
      'Allow location while using Hala to discover places around you and add a location to your check-ins.',
    ],
    ar: [
      'اكتشف الأماكن القريبة منك',
      'اسمح بالموقع أثناء استخدام هلا لاكتشاف الأماكن القريبة وإضافة الموقع إلى زياراتك.',
    ],
  },
  notifications: {
    icon: 'notifications-outline',
    en: [
      'Stay in the loop',
      'Get notified about new messages, friend requests and offers. You can choose what to allow.',
    ],
    ar: [
      'ابقَ على اطلاع',
      'تلقَّ إشعارات الرسائل الجديدة وطلبات الصداقة والعروض. أنت تختار ما تسمح به.',
    ],
  },
  camera: {
    icon: 'camera-outline',
    en: [
      'Capture a little moment',
      'Allow camera access to take a photo for your check-in or conversation.',
    ],
    ar: [
      'التقط لحظتك',
      'اسمح باستخدام الكاميرا لالتقاط صورة لزيارتك أو محادثتك.',
    ],
  },
} as const;
export default function PermissionCard({
  kind,
  onDone,
  onSkip,
}: {
  kind: PermissionKind;
  onDone: () => void;
  onSkip: () => void;
}) {
  const ar = useSelector(
    (state: RootState) => state.language.language === 'ar',
  );
  const [status, setStatus] = useState<AccessStatus>('denied');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const text = copy[kind][ar ? 'ar' : 'en'];
  useEffect(() => {
    let active = true;
    const refresh = () =>
      permissionStatus(kind)
        .then(value => {
          if (active) {
            setStatus(value);
          }
        })
        .catch(() => {
          if (active) {
            setError(true);
          }
        });
    void refresh();
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refresh();
      }
    });
    return () => {
      active = false;
      listener.remove();
    };
  }, [kind]);
  const allow = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(false);
    try {
      if (status === 'blocked') {
        await openPermissionSettings();
        return;
      }
      const result = await requestNativePermission(kind);
      setStatus(result);
      if (result === 'granted') {
        if (kind === 'notifications') {
          void registerFCMToken();
        }
        onDone();
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.illustration}>
        <View style={styles.bubbleA} />
        <View style={styles.bubbleB} />
        <View style={styles.iconCircle}>
          <Ionicons name={copy[kind].icon} size={64} color={Colors.accent} />
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {text[0]}
      </Text>
      <Text style={styles.description}>{text[1]}</Text>
      {(error || status === 'blocked' || status === 'unavailable') && (
        <Text style={styles.note}>
          {error
            ? ar
              ? 'تعذر التحقق. حاول مرة أخرى.'
              : 'Could not check permission. Please try again.'
            : status === 'blocked'
            ? ar
              ? 'تم إيقاف هذا الإذن في الجهاز. يمكنك تفعيله من الإعدادات.'
              : 'Your device has blocked this permission. You can enable it in Settings.'
            : ar
            ? 'هذا الإذن غير متاح على جهازك.'
            : 'This permission is unavailable on your device.'}
        </Text>
      )}
      <TouchableOpacity
        accessibilityRole="button"
        disabled={busy || status === 'unavailable'}
        onPress={allow}
        style={[
          styles.primary,
          (busy || status === 'unavailable') && styles.disabled,
        ]}>
        <Text style={styles.primaryText}>
          {busy
            ? ar
              ? 'لحظة...'
              : 'One moment…'
            : status === 'blocked'
            ? ar
              ? 'فتح الإعدادات'
              : 'Open Settings'
            : status === 'granted'
            ? ar
              ? 'متابعة'
              : 'Continue'
            : ar
            ? 'نعم، أود ذلك'
            : 'Sure, I’d like that'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={busy}
        onPress={onSkip}
        style={styles.skip}>
        <Text style={styles.skipText}>{ar ? 'ليس الآن' : 'Not now'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: Colors.surface,
  },
  illustration: {
    width: 190,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleA: {
    position: 'absolute',
    left: 0,
    top: 15,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.warningSoft,
  },
  bubbleB: {
    position: 'absolute',
    right: 0,
    bottom: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
  },
  title: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  note: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  primary: {
    minHeight: 48,
    width: '100%',
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  primaryText: {fontSize: 16, fontWeight: '600', color: Colors.onAccent},
  disabled: {opacity: 0.55},
  skip: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  skipText: {fontSize: 14, color: Colors.accent},
});
