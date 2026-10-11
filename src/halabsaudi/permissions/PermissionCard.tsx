

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
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
  location: {
    icon: 'location-outline',
    en: {
      label: 'EXPLORE NEARBY',
      title: 'Great places.\nCloser to you.',
      description:
        'Discover places around you and add a location to your check-ins.',
      detail: 'Your location is used while you use Hala.',
    },
    ar: {
      label: 'اكتشف ما حولك',
      title: 'أماكن رائعة.\nأقرب إليك.',
      description:
        'اكتشف الأماكن القريبة منك وأضف موقعًا إلى زياراتك.',
      detail: 'يُستخدم موقعك أثناء استخدام هلا.',
    },
  },
  backgroundLocation: {
    icon: 'navigate-outline',
    en: {
      label: 'NEARBY OFFERS',
      title: 'Something good.\nJust around you.',
      description:
        'Receive nearby venue alerts even when Hala is closed.',
      detail:
        'Optional. May use more battery. Your device may require choosing “Allow all the time” in Settings.',
    },
    ar: {
      label: 'عروض قريبة',
      title: 'اكتشف الجديد.\nبالقرب منك.',
      description:
        'تلقَّ إشعارات بالأماكن القريبة حتى عند إغلاق هلا.',
      detail:
        'اختياري. قد يزيد استهلاك البطارية. قد يتطلب جهازك اختيار «السماح طوال الوقت» من الإعدادات.',
    },
  },
  notifications: {
    icon: 'notifications-outline',
    en: {
      label: 'STAY CONNECTED',
      title: 'Don’t miss\na little hello.',
      description:
        'Stay updated on messages, friend requests and nearby offers.',
      detail: 'You can change notification permissions in Settings.',
    },
    ar: {
      label: 'ابقَ على اتصال',
      title: 'كل رسالة.\nتستحق أن تصل.',
      description:
        'ابقَ على اطلاع بالرسائل وطلبات الصداقة والعروض القريبة.',
      detail: 'يمكنك تغيير أذونات الإشعارات من الإعدادات.',
    },
  },
  camera: {
    icon: 'camera-outline',
    en: {
      label: 'SHARE A MOMENT',
      title: 'Little moments.\nWorth sharing.',
      description:
        'Take a photo for your check-in or share one in a conversation.',
      detail: 'Camera access lets you take photos inside Hala.',
    },
    ar: {
      label: 'شارك لحظتك',
      title: 'لحظات جميلة.\nتستحق المشاركة.',
      description:
        'التقط صورة لزيارتك أو شاركها في محادثة.',
      detail: 'يتيح إذن الكاميرا التقاط الصور داخل هلا.',
    },
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

    const refresh = async () => {
      try {
        const value = await permissionStatus(kind);
        if (active) {
          setStatus(value);
          setError(false);
        }
      } catch {
        if (active) {
          setError(true);
        }
      }
    };

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

      const result =
        status === 'granted'
          ? 'granted'
          : await requestNativePermission(kind);

      setStatus(result);

      if (result === 'granted') {
        if (kind === 'notifications') {
          void registerFCMToken().catch(() => {
            // Token registration can retry through the app's normal flow.
          });
        }
        onDone();
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const buttonLabel = busy
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
    ? 'السماح'
    : 'Allow';

  const note = error
    ? ar
      ? 'تعذر التحقق من الإذن. حاول مرة أخرى.'
      : 'Could not check permission. Please try again.'
    : status === 'blocked'
    ? ar
      ? 'يمكنك تفعيل هذا الإذن من إعدادات الجهاز، ثم العودة والمتابعة.'
      : 'Enable this permission in your device settings, then return and continue.'
    : status === 'unavailable'
    ? ar
      ? 'هذا الإذن غير متاح على جهازك.'
      : 'This permission is unavailable on your device.'
    : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Ionicons
                name={copy[kind].icon}
                size={58}
                color={Colors.accent}
              />
            </View>
          </View>

          <View style={styles.smallBadge}>
            <Ionicons
              name="sparkles-outline"
              size={20}
              color={Colors.accent}
            />
          </View>
        </View>

        <Text style={styles.label}>{text.label}</Text>

        <Text accessibilityRole="header" style={styles.title}>
          {text.title}
        </Text>

        <Text style={styles.description}>{text.description}</Text>

        <View style={styles.detail}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={Colors.textSecondary}
          />
          <Text style={styles.detailText}>{text.detail}</Text>
        </View>

        {note && (
          <View
            accessibilityLiveRegion="polite"
            style={styles.noteBox}>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{
            disabled: busy || status === 'unavailable',
            busy,
          }}
          activeOpacity={0.85}
          disabled={busy || status === 'unavailable'}
          onPress={allow}
          style={[
            styles.primary,
            (busy || status === 'unavailable') && styles.disabled,
          ]}>
          {busy && (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
              style={styles.loader}
            />
          )}
          <Text style={styles.primaryText}>{buttonLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{disabled: busy}}
          activeOpacity={0.65}
          disabled={busy}
          onPress={onSkip}
          style={styles.skip}>
          <Text style={styles.skipText}>
            {ar ? 'ليس الآن' : 'Not now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 36,
    paddingBottom: 28,
  },
  hero: {
    width: 208,
    height: 208,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBadge: {
    position: 'absolute',
    right: 7,
    bottom: 21,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    lineHeight: 39,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  description: {
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detail: {
    maxWidth: 330,
    alignItems: 'center',
    marginTop: 24,
    gap: 7,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 19,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  noteBox: {
    width: '100%',
    maxWidth: 360,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.accentSoft,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 19,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  primary: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loader: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.55,
  },
  skip: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});