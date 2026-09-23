import {Text} from '../../../ui/Text';
import {clearAllChatData} from '../../chat/chatStorage';
import {clearChatSession} from '../../chat/chatScreen';
import {clearPeopleCache} from '../../chat/startChatScreen';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {Alert} from '../../../ui/Alert';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';
import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, ScrollView, Switch, Modal, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../Themes/Colors';
import {RootState} from '../../redux_toolkit/store';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import LanguageModal from '../../Component/CustomAlert/Lan_Modal';
import {disconnectSocket} from '../../chat/socket';
import {unregisterFCMToken} from '../../chat/registerFCMToken';
import {getStyles} from './style';
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';
import {BASE_URL} from '../../../config/api';

const CHEVRON_COLOR = '#5C616B';
const ICON_COLOR = Colors.btnRed;

const Profile: React.FC = () => {
  const navigation = useNavigation<any>();
  useStatusBar('dark-content', Colors.White4, true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [lastSeenLoading, setLastSeenLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [messagePermission, setMessagePermission] = useState('mutual');
  const [privacySaving, setPrivacySaving] = useState(false);
  const [messagePickerOpen, setMessagePickerOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const language = useSelector((state: RootState) => state.language.language);
  const isAr = language === 'ar';
  const t = languageData[language];
  const s = getStyles(language);
  const chevron = isAr ? 'chevron-back' : 'chevron-forward';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const getToken = async () => await AsyncStorage.getItem('hala_token');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const raw = await AsyncStorage.getItem('hala_user_backend');
        if (raw) {
          const user = JSON.parse(raw);
          setUserName(user.name ?? '');
          setUserAvatar(prev =>
            prev === (user.avatar ?? null) ? prev : (user.avatar ?? null),
          );
        }

        try {
          const token = await getToken();
          const res = await fetch(`${BASE_URL}/api/users/privacy`, {
            headers: {Authorization: `Bearer ${token}`},
          });
          if (res.ok) {
            const data = await res.json();
            setShowLastSeen(!data.hideLastSeen);
            setShowOnlineStatus(!data.hideOnlineStatus);
            setIsPrivate(!!data.isPrivate);
            setMessagePermission(data.messagePermission === 'nobody' ? 'nobody' : 'mutual');
          }
        } catch {
          const ls = await AsyncStorage.getItem('hala_show_last_seen');
          const os = await AsyncStorage.getItem('hala_show_online_status');
          if (ls !== null) setShowLastSeen(ls === 'true');
          if (os !== null) setShowOnlineStatus(os === 'true');
        }
      };
      load();
    }, []),
  );

  const updatePrivacy = async (
    key: 'hideLastSeen' | 'hideOnlineStatus',
    newShowValue: boolean,
  ) => {
    if (key === 'hideLastSeen') setShowLastSeen(newShowValue);
    if (key === 'hideOnlineStatus') setShowOnlineStatus(newShowValue);
    await AsyncStorage.setItem(
      key === 'hideLastSeen' ? 'hala_show_last_seen' : 'hala_show_online_status',
      String(newShowValue),
    );
    if (key === 'hideLastSeen') setLastSeenLoading(true);
    else setOnlineLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/users/privacy`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
        body: JSON.stringify({[key]: !newShowValue}),
      });
      if (!res.ok) throw new Error('server error');
    } catch {
      if (key === 'hideLastSeen') setShowLastSeen(!newShowValue);
      if (key === 'hideOnlineStatus') setShowOnlineStatus(!newShowValue);
      Alert.alert('Error', 'Could not save. Try again.');
    } finally {
      if (key === 'hideLastSeen') setLastSeenLoading(false);
      else setOnlineLoading(false);
    }
  };

  const updateAccountPrivacy = async (changes: Record<string, any>) => {
    setPrivacySaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/users/privacy`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || body?.message || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setIsPrivate(!!data.isPrivate);
      setMessagePermission(data.messagePermission === 'nobody' ? 'nobody' : 'mutual');
    } catch (error: any) {
      const message =
        error?.message === 'Network request failed'
          ? 'Unable to connect. Please check your connection and try again.'
          : error?.message || 'Could not save privacy settings.';
      Alert.alert('Privacy not saved', message);
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await unregisterFCMToken();
            disconnectSocket();
            clearChatSession();
            clearPeopleCache();
            clearAllChatData();
            await AsyncStorage.multiRemove([
              'hala_user', 'hala_token', 'hala_user_data',
              'hala_user_backend', 'geofence_cooldown',
              'pending_venue_navigate', 'hala_show_last_seen',
              'hala_show_online_status', 'hala_conversations', 'hala_users_cache',
              'hala_blocked_cache', 'map_profile_checkins_cache_v1',
            ]);
            navigation.reset({index: 0, routes: [{name: 'WelcomeScreen'}]});
          } catch (e) {
            console.error(e);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  // ── Reusable row pieces ───────────────────────────
  const Icon = ({name}: {name: string}) => (
    <View style={s.iconBubble}>
      <Ionicons name={name as any} size={18} color={ICON_COLOR} />
    </View>
  );

  const NavRow = ({
    icon,
    label,
    onPress,
    right,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    right?: React.ReactNode;
  }) => (
    <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={onPress}>
      <Icon name={icon} />
      <Text style={s.menuLabel}>{label}</Text>
      {right ?? <Ionicons name={chevron} size={16} color={CHEVRON_COLOR} />}
    </TouchableOpacity>
  );

  const SwitchRow = ({
    icon,
    label,
    sub,
    value,
    loading,
    onChange,
  }: {
    icon: string;
    label: string;
    sub: string;
    value: boolean;
    loading: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <View style={s.switchRow}>
      <Icon name={icon} />
      <View style={s.rowText}>
        <Text style={s.switchLabel}>{label}</Text>
        <Text style={s.switchSub}>{sub}</Text>
      </View>
      <View style={s.switchSlot}>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.Red} />
        ) : (
          <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{false: '#3A3E47', true: Colors.Red}}
            thumbColor="#fff"
            ios_backgroundColor="#3A3E47"
            style={s.switch}
          />
        )}
      </View>
    </View>
  );

  const Divider = () => <View style={s.divider} />;

  const messageOptions: [string, string][] = [
    ['mutual', tr('Mutual follows', 'المتابَعون المتبادلون')],
    ['nobody', tr('Nobody', 'لا أحد')],
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <CustomHeader title={tr('Settings', 'الإعدادات')} onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 48}}>
        {/* Account */}
        <Text style={s.sectionLabel}>{tr('Account', 'الحساب')}</Text>
        <View style={s.card}>
          <NavRow icon="person-outline" label={t.account} onPress={() => navigation.navigate('EditAccount')} />
          <Divider />
          <NavRow icon="gift-outline" label={t.redeem_history} onPress={() => navigation.navigate('ReedemHistroy')} />
          <Divider />
          <NavRow icon="heart-outline" label={t.Wishlist} onPress={() => navigation.navigate('Wishlist')} />
          <Divider />
          <NavRow icon="language-outline" label={t.language} onPress={() => setAlertVisible(true)} />
        </View>

        {/* Chat & people */}
        <Text style={s.sectionLabel}>{tr('Chat', 'الدردشة')}</Text>
        <View style={s.card}>
          <NavRow
            icon="people-outline"
            label={tr('Followers', 'المتابِعون')}
            onPress={() => navigation.navigate('SocialConnections', {mode: 'followers'})}
          />
          <Divider />
          <NavRow
            icon="person-circle-outline"
            label={tr('Following', 'تتابعهم')}
            onPress={() => navigation.navigate('SocialConnections', {mode: 'following'})}
          />
          <Divider />
          <NavRow
            icon="person-add-outline"
            label={tr('Follow requests', 'طلبات المتابعة')}
            onPress={() => navigation.navigate('SocialConnections', {mode: 'requests'})}
          />
          <Divider />
          <NavRow
            icon="ban-outline"
            label={t.blocked_accounts || tr('Blocked users', 'المستخدمون المحظورون')}
            onPress={() => navigation.navigate('BlockedUsers')}
            right={<Text style={s.rightLabel}>{tr('Manage', 'إدارة')}</Text>}
          />
        </View>

        {/* Privacy */}
        <Text style={s.sectionLabel}>{tr('Privacy', 'الخصوصية')}</Text>
        <View style={s.card}>
          <SwitchRow
            icon="lock-closed-outline"
            label={tr('Private account', 'حساب خاص')}
            sub={tr(
              'Only approved followers can see your posts and follower/following lists. Counts stay visible.',
              'فقط المتابعون المعتمدون يمكنهم رؤية منشوراتك وقوائم المتابعة. تبقى الأعداد ظاهرة.',
            )}
            value={isPrivate}
            loading={privacySaving}
            onChange={value => updateAccountPrivacy({isPrivate: value})}
          />
          <Divider />
          <TouchableOpacity style={s.switchRow} activeOpacity={0.6} onPress={() => setMessagePickerOpen(true)}>
            <Icon name="chatbubble-ellipses-outline" />
            <View style={s.rowText}>
              <Text style={s.switchLabel}>{tr('Who can message you', 'من يمكنه مراسلتك')}</Text>
              <Text style={s.switchSub}>
                {messagePermission === 'nobody' ? messageOptions[1][1] : messageOptions[0][1]}
              </Text>
            </View>
            <Ionicons name={chevron} size={16} color={CHEVRON_COLOR} />
          </TouchableOpacity>
          <Divider />
          <SwitchRow
            icon="time-outline"
            label={t.show_last_seen}
            sub={showLastSeen ? t.last_seen_desc : tr('Last seen hidden from everyone', 'آخر ظهور مخفي')}
            value={showLastSeen}
            loading={lastSeenLoading}
            onChange={val => updatePrivacy('hideLastSeen', val)}
          />
          <Divider />
          <SwitchRow
            icon="radio-button-on-outline"
            label={t.online_status}
            sub={showOnlineStatus ? t.online_status_desc : tr('Online status hidden from everyone', 'حالة الاتصال مخفية')}
            value={showOnlineStatus}
            loading={onlineLoading}
            onChange={val => updatePrivacy('hideOnlineStatus', val)}
          />
        </View>

        {/* Logout */}
        <View style={s.sectionSpacer} />
        <View style={s.card}>
          <TouchableOpacity style={s.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
            <View style={s.iconBubble}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text style={s.logoutTxt}>{t.logout}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>Hala B Khaleeji v1.0</Text>
      </ScrollView>

      {/* Who can message you — bottom sheet */}
      <Modal
        visible={messagePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMessagePickerOpen(false)}>
        <Pressable style={s.sheetBackdrop} onPress={() => setMessagePickerOpen(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{tr('Who can message you?', 'من يمكنه مراسلتك؟')}</Text>
            <Text style={s.sheetSub}>
              {tr(
                'Messaging requires both people to follow each other. You can also turn messaging off.',
                'تتطلب المراسلة أن يتابع كل منكما الآخر. يمكنك أيضاً إيقاف المراسلة.',
              )}
            </Text>
            {messageOptions.map(([value, label], i) => (
              <TouchableOpacity
                key={value}
                style={[s.sheetOption, i === messageOptions.length - 1 && s.sheetOptionLast]}
                onPress={async () => {
                  setMessagePickerOpen(false);
                  await updateAccountPrivacy({messagePermission: value});
                }}>
                <Text style={s.sheetOptionTxt}>{label}</Text>
                {messagePermission === value && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.btnRed} />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full image viewer */}
      <Modal
        visible={showFullImage}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}>
        <View style={s.imageOverlay}>
          <TouchableOpacity style={s.closeBtn} onPress={() => setShowFullImage(false)}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.viewerName}>{userName}</Text>
          {userAvatar && (
            <FastImage
              source={{
                uri: userAvatar,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={s.fullImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
          <TouchableOpacity
            style={s.viewerEditBtn}
            onPress={() => {
              setShowFullImage(false);
              navigation.navigate('EditAccount');
            }}>
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={s.viewerEditTxt}>{tr('Change Photo', 'تغيير الصورة')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Logout overlay */}
      {loggingOut && (
        <View style={s.overlay}>
          <View style={s.overlayBox}>
            <ActivityIndicator size="large" color={Colors.Red} />
            <Text style={s.overlayText}>{tr('Logging out…', 'جارٍ تسجيل الخروج…')}</Text>
          </View>
        </View>
      )}

      <LanguageModal visible={alertVisible} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
};

export default Profile;
