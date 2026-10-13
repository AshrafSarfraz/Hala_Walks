import Avatar from './Avatar';
import {memberName, memberPhoto} from '../utils/member';
import ScreenHeader from './header/ScreenHeader';
import React, {useCallback, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Text} from './Text';
import {Colors} from '../theme/Colors';
import {Fonts} from '../theme/Fonts';
import {RootState} from '../redux/store';
import {auth} from '../firebase/firebaseconfig';
export default function AccountScreen({
  navigation,
  role,
}: {
  navigation: any;
  role: 'tenant' | 'staff' | 'org';
}) {
  const insets = useSafeAreaInsets();
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const key =
    role === 'staff'
      ? 'staff_data'
      : role === 'tenant'
      ? 'tenant_data'
      : 'org_emp_data';
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.getItem(key)
        .then(raw => {
          if (active) {
            try {
              setUser(raw ? JSON.parse(raw) : null);
            } catch {
              setUser(null);
            }
          }
        })
        .catch(() => {
          if (active) setUser(null);
        });
      return () => {
        active = false;
      };
    }, [key]),
  );
  const name = memberName(user) || (ar ? 'عضو' : 'Member');
  const id = user?.staffId || user?.tenantId || user?.empId || '—';
  const menus =
    role === 'tenant'
      ? [
          {
            en: 'Account Info',
            ar: 'معلومات الحساب',
            icon: 'person-outline',
            route: 'TenantsProfile',
          },
          {
            en: 'Documents',
            ar: 'المستندات',
            icon: 'document-text-outline',
            route: 'TenantDocumentControlScreen',
          },
          {
            en: 'Redeem History',
            ar: 'سجل الاستبدال',
            icon: 'receipt-outline',
            route: 'TenantsHistroyScreen',
          },
        ]
      : role === 'staff'
      ? [
          {
            en: 'Account Info',
            ar: 'معلومات الحساب',
            icon: 'person-outline',
            route: 'ProfileScreen',
          },
          {
            en: 'Redeem History',
            ar: 'سجل الاستبدال',
            icon: 'receipt-outline',
            route: 'StaffHistroyScreen',
          },
          {
            en: 'Self HR Service',
            ar: 'الخدمة الذاتية للموظفين',
            icon: 'briefcase-outline',
            route: 'HrSystem',
          },
          {
            en: 'Directory',
            ar: 'دليل الهاتف',
            icon: 'call-outline',
            route: 'PhoneDirectory',
          },
        ]
      : [
          {
            en: 'Redeem History',
            ar: 'سجل الاستبدال',
            icon: 'receipt-outline',
            route: 'CorporationHistroyScreen',
          },
        ];
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      if (role === 'staff') await auth().signOut();
      await AsyncStorage.removeItem(key);
      navigation.replace(role === 'org' ? 'WelcomeScreen' : 'Role');
    } catch {
      setLoggingOut(false);
    }
  };
  return (
    <View style={{flex: 1, backgroundColor: Colors.White}}>
      <ScreenHeader title={ar ? 'الحساب' : 'Account'} />
      <ScrollView contentContainerStyle={{paddingBottom: insets.bottom + 100}}>
        <View style={styles.header}>
          <Avatar name={name} uri={memberPhoto(user)} size={72} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.id}>{id}</Text>
        </View>
        <View style={styles.body}>
          {menus.map(m => (
            <TouchableOpacity
              accessibilityRole="button"
              key={m.route}
              onPress={() => navigation.navigate(m.route)}
              style={[
                styles.menu,
                {flexDirection: ar ? 'row-reverse' : 'row'},
              ]}>
              <View style={styles.icon}>
                <Ionicons
                  name={m.icon as any}
                  size={21}
                  color={Colors.PrimaryColor}
                />
              </View>
              <Text style={styles.menuText}>{ar ? m.ar : m.en}</Text>
              <Ionicons
                name={ar ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={Colors.Grey}
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            accessibilityRole="button"
            disabled={loggingOut}
            onPress={logout}
            style={styles.logout}>
            <Text
              style={{color: Colors.PrimaryColor, fontFamily: Fonts.F_Bold}}>
              {loggingOut
                ? ar
                  ? 'جارٍ تسجيل الخروج…'
                  : 'Logging out…'
                : ar
                ? 'تسجيل الخروج'
                : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.White,
    paddingTop: 20,
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatar: {width: 76, height: 76, borderRadius: 38, marginBottom: 12},
  initials: {
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: Fonts.F_Bold,
    fontSize: 26,
    color: Colors.PrimaryColor,
  },
  name: {
    marginTop: 12,
    fontSize: 21,
    fontFamily: Fonts.F_Bold,
    color: Colors.textPrimary,
  },
  id: {fontSize: 13, color: Colors.textPrimary, marginTop: 6},
  body: {padding: 16},
  menu: {
    minHeight: 66,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
  },
  menuText: {flex: 1, fontSize: 15, fontFamily: Fonts.F_Medium},
  logout: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    minHeight: 48,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
