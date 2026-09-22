import {Text} from '../../../ui/Text';
import {clearAllChatData} from '../../chat/chatStorage';
import {clearChatSession} from '../../chat/chatScreen';
import {clearPeopleCache} from '../../chat/startChatScreen';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {Alert} from '../../../ui/Alert';
import {ActivityIndicator} from '../../../ui/ActivityIndicator';
import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, ScrollView, Switch, Modal} from 'react-native';
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
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';
import {BASE_URL} from '../../../config/api';

const Profile: React.FC = () => {
  const navigation = useNavigation<any>();
  useStatusBar('dark-content', Colors.White4, true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [lastSeenLoading, setLastSeenLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [messagePermission, setMessagePermission] = useState('followers');
  const [privacySaving, setPrivacySaving] = useState(false);
  const [messagePickerOpen, setMessagePickerOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const language = useSelector((state: RootState) => state.language.language);
  const t = languageData[language];
  const s = getStyles(language);

  const getToken = async () => await AsyncStorage.getItem('hala_token');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const raw = await AsyncStorage.getItem('hala_user_backend');
        if (raw) {
          const user = JSON.parse(raw);
          setUserName(user.name ?? '');
          setUserPhone(user.phone ?? '');
          // ✅ Sirf tab re-render karo jab URL actually change hua ho
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
            setMessagePermission(data.messagePermission || 'followers');
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

  const initials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() ?? '')
        .join('')
    : 'U';

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
        method: 'PUT', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || body?.message || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setIsPrivate(!!data.isPrivate);
      setMessagePermission(data.messagePermission || 'followers');
    } catch (error: any) {
      const message = error?.message === 'Network request failed'
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
            clearChatSession(); clearPeopleCache(); clearAllChatData();
            await AsyncStorage.multiRemove([
              'hala_user', 'hala_token', 'hala_user_data',
              'hala_user_backend', 'geofence_cooldown',
              'pending_venue_navigate', 'hala_show_last_seen',
              'hala_show_online_status', 'hala_conversations', 'hala_users_cache', 'hala_blocked_cache', 'map_profile_checkins_cache_v1',
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

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <CustomHeader title={language === 'ar' ? 'الإعدادات' : 'Settings'} onBackPress={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 48}}>

        {/* Profile card */}
        <View style={s.profileCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => userAvatar && setShowFullImage(true)}>

            {/*
             * avatarWrap: width:100, height:100, borderRadius:50, overflow:'hidden'  ← style.ts se
             *
             * Layer 1 — Initials (peeche):
             *   position:absolute + top/left/right/bottom:0 → poora wrap cover karta hai
             *   flex:1 absolute ke saath kaam nahi karta, isliye explicit 0 lagaye
             *
             * Layer 2 — FastImage (upar):
             *   style={s.avatarImg} → width:'100%', height:'100%'
             *   avatarWrap ka overflow:'hidden' + borderRadius:50 circle banata hai
             *   koi cutting nahi
             */}
            <View style={s.avatarWrap}>
              <View
                style={[
                  s.avatarFallback,
                  {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
                ]}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>

              {userAvatar && (
                <FastImage
                  source={{
                    uri: userAvatar,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={s.avatarImg}
                  onError={() => setUserAvatar(null)}
                />
              )}
            </View>
          </TouchableOpacity>

          <Text style={s.profileName}>{userName || '—'}</Text>
          {!!userPhone && (
            <View style={s.phonePill}>
              <Ionicons name="call-outline" size={13} color='#ABB2BF' />
              <Text style={s.phoneText}>{userPhone}</Text>
            </View>
          )}
        </View>

        {/* Account */}
        <Text style={s.sectionLabel}>
          {language === 'ar' ? 'الحساب' : 'Account'}
        </Text>
        <View style={s.card}>
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('EditAccount')}>
            <View style={s.iconBubble}>
              <Ionicons name="person-outline" size={18} color={Colors.btnRed} />
            </View>
            <Text style={s.menuLabel}>{t.account}</Text>
            <Ionicons name={language === 'ar' ? 'chevron-back' : 'chevron-forward'} size={15} color="#C7C7CC" />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('ReedemHistroy')}>
            <View style={s.iconBubble}>
              <Ionicons name="gift-outline" size={18} color={Colors.btnRed} />
            </View>
            <Text style={s.menuLabel}>{t.redeem_history}</Text>
            <Ionicons name={language === 'ar' ? 'chevron-back' : 'chevron-forward'} size={15} color="#C7C7CC" />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => setAlertVisible(true)}>
            <View style={s.iconBubble}>
              <Ionicons name="language-outline" size={18} color={Colors.btnRed} />
            </View>
            <Text style={s.menuLabel}>{t.language}</Text>
            <Ionicons name={language === 'ar' ? 'chevron-back' : 'chevron-forward'} size={15} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Chat */}
        <Text style={s.sectionLabel}>
          {language === 'ar' ? 'الدردشة' : 'Chat'}
        </Text>
        <View style={s.card}>
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('BlockedUsers')}>
            <View style={s.iconBubble}>
              <Ionicons name="ban-outline" size={18} color={Colors.btnRed} />
            </View>
            <Text style={s.menuLabel}>{t.blocked_accounts || 'Blocked Users'}</Text>
            <Text style={s.rightLabel}>{language === 'ar' ? 'إدارة' : 'Manage'}</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('SocialConnections', {mode: 'followers'})}>
            <View style={s.iconBubble}><Ionicons name="people-outline" size={18} color={Colors.btnRed} /></View>
            <Text style={s.menuLabel}>Followers</Text>
            <Ionicons name="chevron-forward" size={15} color="#C7C7CC" />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('SocialConnections', {mode: 'following'})}>
            <View style={s.iconBubble}><Ionicons name="person-add-outline" size={18} color={Colors.btnRed} /></View>
            <Text style={s.menuLabel}>Following</Text>
            <Ionicons name="chevron-forward" size={15} color="#C7C7CC" />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('SocialConnections', {mode: 'requests'})}>
            <View style={s.iconBubble}><Ionicons name="person-add-outline" size={18} color={Colors.btnRed} /></View>
            <Text style={s.menuLabel}>Follow requests</Text>
            <Ionicons name="chevron-forward" size={15} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Privacy */}
        <Text style={s.sectionLabel}>
          {language === 'ar' ? 'الخصوصية' : 'Privacy'}
        </Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={s.iconBubble}>
              <Ionicons name="time-outline" size={18} color={Colors.btnRed} />
            </View>
            <View style={{flex: 1}}>
              <Text style={s.switchLabel}>{t.show_last_seen}</Text>
              <Text style={s.switchSub}>
                {showLastSeen ? t.last_seen_desc : (language === 'ar' ? 'آخر ظهور مخفي' : 'Last seen hidden from everyone')}
              </Text>
            </View>
            {lastSeenLoading ? (
              <ActivityIndicator size="small" color={Colors.Red} style={{marginRight: 4}} />
            ) : (
              <Switch
                value={showLastSeen}
                onValueChange={val => updatePrivacy('hideLastSeen', val)}
                trackColor={{false: '#DDD', true: Colors.Red}}
                thumbColor="#fff"
              />
            )}
          </View>
          <View style={s.divider} />
          <View style={s.switchRow}>
            <View style={s.iconBubble}><Ionicons name="lock-closed-outline" size={18} color={Colors.btnRed} /></View>
            <View style={{flex: 1}}>
              <Text style={s.switchLabel}>Private account</Text>
              <Text style={s.switchSub}>Approve follow requests before people can follow you</Text>
            </View>
            {privacySaving ? <ActivityIndicator size="small" color={Colors.Red} /> : (
              <Switch value={isPrivate} onValueChange={value => updateAccountPrivacy({isPrivate: value})}
                trackColor={{false: '#DDD', true: Colors.Red}} thumbColor="#fff" />
            )}
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => setMessagePickerOpen(true)}>
            <View style={s.iconBubble}><Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.btnRed} /></View>
            <View style={{flex: 1}}>
              <Text style={s.menuLabel}>Who can message you</Text>
              <Text style={s.switchSub}>{messagePermission === 'everyone' ? 'Everyone' : messagePermission === 'followers' ? 'Followers' : messagePermission === 'following' ? 'People you follow' : messagePermission === 'mutual' ? 'Mutual follows' : 'Nobody'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color="#C7C7CC" />
          </TouchableOpacity>
          <View style={s.divider} />
          <View style={s.switchRow}>
            <View style={s.iconBubble}>
              <Ionicons name="radio-button-on-outline" size={18} color={Colors.Red} />
            </View>
            <View style={{flex: 1}}>
              <Text style={s.switchLabel}>{t.online_status}</Text>
              <Text style={s.switchSub}>
                {showOnlineStatus ? t.online_status_desc : (language === 'ar' ? 'حالة الاتصال مخفية' : 'Online status hidden from everyone')}
              </Text>
            </View>
            {onlineLoading ? (
              <ActivityIndicator size="small" color={Colors.Red} style={{marginRight: 4}} />
            ) : (
              <Switch
                value={showOnlineStatus}
                onValueChange={val => updatePrivacy('hideOnlineStatus', val)}
                trackColor={{false: '#DDD', true: Colors.Red}}
                thumbColor="#fff"
              />
            )}
          </View>
        </View>

        {/* wishlist */}
        <Text style={s.sectionLabel}>
          {t.Wishlist}
        </Text>
<View style={s.card}>
  
           <TouchableOpacity style={s.menuRow} activeOpacity={0.6} onPress={() => navigation.navigate('Wishlist')}>
            <View style={s.iconBubble}>
              <Ionicons name="heart-outline" size={18} color={Colors.btnRed} />
            </View>
            <Text style={s.menuLabel}>{t.Wishlist}</Text>
            <Ionicons name={language === 'ar' ? 'chevron-back' : 'chevron-forward'} size={15} color={Colors.Red} />
          </TouchableOpacity>
        </View>
     

        

        {/* Logout */}
        <Text style={s.sectionLabel}> </Text>
        <View style={s.card}>
          <TouchableOpacity style={s.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[s.iconBubble, {backgroundColor: '#191B20'}]}>
              <Ionicons name="log-out-outline" size={18} color={Colors.Red} />
            </View>
            <Text style={s.logoutTxt}>{t.logout}</Text>
            <Ionicons name={language === 'ar' ? 'chevron-back' : 'chevron-forward'} size={15} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <Text style={s.version}>Hala B Khaleeji v1.0</Text>
      </ScrollView>

      <Modal visible={messagePickerOpen} transparent animationType="fade" onRequestClose={() => setMessagePickerOpen(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'}}>
          <View style={{backgroundColor: '#191B20', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 36}}>
            <Text style={{fontSize: 18, fontWeight: '800', color: '#F5F6F8', marginBottom: 6}}>Who can message you?</Text>
            <Text style={{fontSize: 13, color: '#ABB2BF', marginBottom: 14}}>This rule is applied whenever someone starts or sends a chat.</Text>
            {[
              ['everyone', 'Everyone'], ['followers', 'Followers'], ['following', 'People you follow'], ['mutual', 'Mutual follows'], ['nobody', 'Nobody'],
            ].map(([value, label]) => (
              <TouchableOpacity key={value} onPress={async () => { setMessagePickerOpen(false); await updateAccountPrivacy({messagePermission: value}); }}
                style={{minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#343841'}}>
                <Text style={{fontSize: 16, color: '#F5F6F8'}}>{label}</Text>
                {messagePermission === value && <Ionicons name="checkmark-circle" size={21} color={Colors.btnRed} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
            onPress={() => {setShowFullImage(false); navigation.navigate('EditAccount');}}>
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={s.viewerEditTxt}>
              {language === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Logout overlay */}
      {loggingOut && (
        <View style={s.overlay}>
          <View style={s.overlayBox}>
            <ActivityIndicator size="large" color={Colors.Red} />
            <Text style={s.overlayText}>
              {language === 'ar' ? 'جارٍ تسجيل الخروج…' : 'Logging out…'}
            </Text>
          </View>
        </View>
      )}

      <LanguageModal visible={alertVisible} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
};

export default Profile;
