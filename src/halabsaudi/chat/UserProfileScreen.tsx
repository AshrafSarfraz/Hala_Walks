// src/halabsaudi/chat/UserProfileScreen.tsx
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert, Animated, StatusBar, Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {BASE_URL} from '../../config/api';
import MuteModal, {MuteDuration} from './components/MuteModal';
import {Colors} from '../Themes/Colors';
import ImageViewerModal from './components/ImageViewerModal';
import BlockUserModal from './components/BlockUserModal';
import {languageData} from '../redux_toolkit/language/languageSlice';
import {RootState} from '../redux_toolkit/store';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';

const {width: W}    = Dimensions.get('window');
const HEADER_HEIGHT = 240;
const PREVIEW_COL   = 3;
const PREVIEW_SIZE  = (W - 57 - (PREVIEW_COL - 1) * 3) / PREVIEW_COL;

type UserProfile = {
  _id: string; name: string; bio?: string;
  birthday?: string; profilePhoto?: string; avatar?: string;
  relationship?: {followingStatus?: 'none' | 'pending' | 'accepted'};
};

export type MediaItem = {
  id: string; uri: string; mediaType: 'image' | 'video'; createdAt: string;
};

type Props = {route: any; navigation: any};

function formatBirthday(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString([], {day: 'numeric', month: 'long', year: 'numeric'});
}
function getAgeNumber(d?: string): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function UserProfileScreen({route, navigation}: Props) {
  // ── Language ──────────────────────────────────────────────────────
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';
  useStatusBar('light-content', Colors.Green, true);
  const {
    participantId, participantName, chatId,
    isBlockedInitial = false, isMutedInitial = null,
  } = route.params || {};

  const insets  = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [profile, setProfile]               = useState<UserProfile | null>(null);
  const [loading, setLoading]               = useState(true);
  const [iBlockedThem, setIBlockedThem]     = useState(isBlockedInitial);
  const [blockLoading, setBlockLoading]     = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [muteDuration, setMuteDuration]     = useState<MuteDuration>(isMutedInitial);
  const [muteModalVisible, setMuteModalVisible]   = useState(false);
  const [imageViewerOpen, setImageViewerOpen]     = useState(false);
  const [allMedia, setAllMedia]             = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading]     = useState(false);
  const [viewerItem, setViewerItem]         = useState<MediaItem | null>(null);
  const [followLoading, setFollowLoading]   = useState(false);

  const isMuted    = muteDuration !== null;
  const tokenRef   = useRef('');
  const avatarUri  = profile?.profilePhoto || profile?.avatar || null;
  const previewMedia = allMedia.slice(0, 6);
  const hasMore      = allMedia.length > 6;
  const imageCount   = allMedia.filter(m => m.mediaType === 'image').length;
  const videoCount   = allMedia.filter(m => m.mediaType === 'video').length;

  // ── Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('hala_token');
        if (!token) return;
        tokenRef.current = token;
        const muteRaw = await AsyncStorage.getItem(`mute_${chatId}`);
        if (muteRaw) setMuteDuration(JSON.parse(muteRaw).duration);
        const [profileRes, blockRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/users/${participantId}`, {headers: {Authorization: `Bearer ${token}`}}),
          axios.get(`${BASE_URL}/api/block/status/${participantId}`, {headers: {Authorization: `Bearer ${token}`}}),
        ]);
        setProfile(profileRes.data?.user || profileRes.data);
        setIBlockedThem(blockRes.data?.iBlockedThem || false);
        loadMedia(token);
      } catch (err) {
        console.error('[UserProfile]', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [participantId, chatId]);

  // ── Mute / Unmute ─────────────────────────────────────────────────
  const handleMuteChange = useCallback(async (newDuration: MuteDuration) => {
    const token      = tokenRef.current;
    const wasUnmuting = newDuration === null;
    setMuteDuration(newDuration);
    try {
      if (wasUnmuting) {
        await axios.delete(`${BASE_URL}/api/chat/${chatId}/mute`, {headers: {Authorization: `Bearer ${token}`}});
        await AsyncStorage.removeItem(`mute_${chatId}`);
      } else {
        await axios.post(`${BASE_URL}/api/chat/${chatId}/mute`, {}, {headers: {Authorization: `Bearer ${token}`}});
        await AsyncStorage.setItem(`mute_${chatId}`, JSON.stringify({duration: newDuration, mutedAt: Date.now()}));
      }
    } catch {
      setMuteDuration(prev => prev);
      Alert.alert('Error', 'Could not save mute setting. Try again.');
    }
  }, [chatId]);

  // ── Media ─────────────────────────────────────────────────────────
  const loadMedia = useCallback(async (token?: string) => {
    const tok = token || tokenRef.current;
    if (!tok || !chatId) return;
    setMediaLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/chat/${chatId}/media`, {headers: {Authorization: `Bearer ${tok}`}});
      const items: MediaItem[] = (res.data || [])
        .filter((m: any) => (m.mediaType === 'image' || m.mediaType === 'video') && m.mediaUrl && !m.deleted)
        .map((m: any) => ({id: String(m._id), uri: m.mediaUrl, mediaType: m.mediaType, createdAt: m.createdAt}));
      setAllMedia(items);
    } catch (e) { console.error('[Media]', e); }
    finally { setMediaLoading(false); }
  }, [chatId]);

  // ── Block ─────────────────────────────────────────────────────────
  const handleBlockConfirm = useCallback(async () => {
    setBlockLoading(true);
    try {
      if (iBlockedThem) {
        await axios.delete(`${BASE_URL}/api/block/${participantId}`, {headers: {Authorization: `Bearer ${tokenRef.current}`}});
        setIBlockedThem(false);
      } else {
        await axios.post(`${BASE_URL}/api/block/${participantId}`, {}, {headers: {Authorization: `Bearer ${tokenRef.current}`}});
        setIBlockedThem(true);
      }
      setBlockModalVisible(false);
    } catch { Alert.alert('Error', 'Could not complete action.'); }
    finally { setBlockLoading(false); }
  }, [iBlockedThem, participantId]);

  const handleFollow = useCallback(async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    const status = profile.relationship?.followingStatus || 'none';
    try {
      if (status === 'accepted' || status === 'pending') {
        await axios.delete(`${BASE_URL}/api/users/follow/${participantId}`, {headers: {Authorization: `Bearer ${tokenRef.current}`}});
        setProfile(prev => prev ? {...prev, relationship: {...prev.relationship, followingStatus: 'none'}} : prev);
      } else {
        const res = await axios.post(`${BASE_URL}/api/users/follow/${participantId}`, {}, {headers: {Authorization: `Bearer ${tokenRef.current}`}});
        const next = res.data?.status === 'pending' ? 'pending' : 'accepted';
        setProfile(prev => prev ? {...prev, relationship: {...prev.relationship, followingStatus: next}} : prev);
      }
    } catch { Alert.alert('Error', 'Could not update follow status.'); }
    finally { setFollowLoading(false); }
  }, [profile, followLoading, participantId]);

  // ── Animations ────────────────────────────────────────────────────
  const navOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 40], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const avatarScale = scrollY.interpolate({
    inputRange: [-60, 0], outputRange: [1.25, 1], extrapolate: 'clamp',
  });
  const avatarTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT], outputRange: [0, -30], extrapolate: 'clamp',
  });

  if (loading) return <View style={s.loader}><ActivityIndicator size="large" color={Colors.Green} /></View>;

  const displayName  = profile?.name || participantName || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // ── Localised media count subtitle ────────────────────────────────
  const mediaCountText = [
    imageCount > 0 && `${imageCount} ${imageCount > 1 ? t.photos_label : t.photo_label}`,
    videoCount > 0 && `${videoCount} ${videoCount > 1 ? t.videos_label : t.video_label}`,
  ].filter(Boolean).join('  ·  ');

  // ── Age string ───────────────────────────────────────────────────
  const ageNum = getAgeNumber(profile?.birthday);
  const ageStr = ageNum !== null
    ? (language === 'ar' ? `${ageNum} ${t.years_old}` : `${ageNum} years old`)
    : '';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Sticky nav ── */}
      <Animated.View style={[s.stickyNav, {paddingTop: insets.top, opacity: navOpacity, flexDirection: rowDir}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.navBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>{displayName}</Text>
        <View style={{width: 40}} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}
        scrollEventThrottle={16} showsVerticalScrollIndicator={false} bounces>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={[s.backBtnWrap, {top: insets.top + 8}, isRTL ? {right: 16, left: undefined} : {left: 16}]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.glassBtn}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <Animated.View style={[s.avatarWrap, {transform: [{scale: avatarScale}, {translateY: avatarTranslate}]}]}>
            <TouchableOpacity activeOpacity={avatarUri ? 0.85 : 1} onPress={() => avatarUri && setImageViewerOpen(true)}>
              {avatarUri ? (
                <Image source={{uri: avatarUri}} style={s.avatarImg} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Text style={s.avatarLetter}>{avatarLetter}</Text>
                </View>
              )}
              {avatarUri && (
                <View style={s.avatarHint}>
                  <Ionicons name="expand-outline" size={13} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
          <Text style={s.name}>{displayName}</Text>
        </View>

        <View style={s.nameSection} />

        {/* ── Info card ── */}
        {(profile?.bio || profile?.birthday) && (
          <View style={s.card}>
            {profile?.bio && (
              <InfoRow
                icon="chatbubble-ellipses-outline"
                label={t.bio}
                value={profile.bio}
                multiline isRTL={isRTL}
              />
            )}
            {profile?.bio && profile?.birthday && <Divider />}
            {profile?.birthday && (
              <InfoRow
                icon="gift-outline"
                label={t.birthday}
                value={formatBirthday(profile.birthday)}
                sublabel={ageStr}
                isRTL={isRTL}
              />
            )}
          </View>
        )}

        {/* ── Actions card ── */}
        <View style={s.card}>
          <SectionTitle label={t.actions} isRTL={isRTL} />
          <ActionRow
            icon="person-add-outline" iconColor={Colors.Red} iconBg="#FEE2E2"
            label={followLoading ? 'Updating…' : profile?.relationship?.followingStatus === 'accepted' ? 'Following' : profile?.relationship?.followingStatus === 'pending' ? 'Requested' : 'Follow'}
            sublabel={profile?.relationship?.followingStatus === 'pending' ? 'Waiting for approval' : undefined}
            onPress={handleFollow} isRTL={isRTL}
          />
          <Divider />
          <ActionRow
            icon="chatbubble-outline" iconColor={Colors.Red} iconBg='#FEE2E2'
            label={t.send_message}
            onPress={() => navigation.goBack()}
            isRTL={isRTL}
          />
          <Divider />
          <ActionRow
            icon={isMuted ? 'notifications-outline' : 'notifications-off-outline'}
            iconColor={isMuted ? '#6B7280' : Colors.Red}
            iconBg={isMuted ? '#F3F4F6' : '#FEE2E2'}
            label={isMuted ? t.unmute_btn : t.mute_notifications}
            sublabel={isMuted ? t.tap_to_unmute : t.silence_chat}
            onPress={() => setMuteModalVisible(true)}
            isRTL={isRTL}
          />
        </View>

        {/* ── Shared media card ── */}
        <View style={s.card}>
          <View style={[s.mediaHeader, {flexDirection: rowDir}]}>
            <Text style={[s.sectionTitleText, {textAlign: isRTL ? 'right' : 'left'}]}>
              {t.shared_media}
            </Text>
            {allMedia.length > 0 && (
              <View style={[s.mediaHeaderRight, {flexDirection: rowDir}]}>
                <Text style={s.mediaCount}>{mediaCountText}</Text>
              </View>
            )}
          </View>

          {mediaLoading ? (
            <View style={s.mediaEmpty}>
              <ActivityIndicator size="small" color={Colors.Green} />
            </View>
          ) : previewMedia.length === 0 ? (
            <View style={s.mediaEmpty}>
              <Ionicons name="images-outline" size={32} color="#D1D5DB" />
              <Text style={s.mediaEmptyText}>{t.no_shared_media}</Text>
            </View>
          ) : (
            <>
              <View style={s.mediaGrid}>
                {previewMedia.map(item => (
                  <TouchableOpacity key={item.id} style={s.mediaCell} onPress={() => setViewerItem(item)} activeOpacity={0.8}>
                    <Image source={{uri: item.uri}} style={s.mediaImg} resizeMode="cover" />
                    {item.mediaType === 'video' && (
                      <View style={s.videoOverlay}>
                        <Ionicons name="play-circle" size={28} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {hasMore && (
                <TouchableOpacity
                  style={[s.viewAllStrip, {flexDirection: rowDir}]}
                  onPress={() => navigation.navigate('AllMediaScreen', {chatId, allMedia, participantName: displayName})}
                  activeOpacity={0.7}>
                  <Text style={s.viewAllStripText}>
                    {t.view_all_items} ({allMedia.length})
                  </Text>
                  <Ionicons
                    name={isRTL ? 'arrow-back' : 'arrow-forward'}
                    size={15} color={Colors.Green}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* ── Privacy card ── */}
        <View style={s.card}>
          <SectionTitle label={t.privacy} isRTL={isRTL} />
          <ActionRow
            icon="ban-outline"
            iconColor={iBlockedThem ? '#6B7280' : '#EF4444'}
            iconBg={iBlockedThem ? '#F3F4F6' : '#FEE2E2'}
            label={iBlockedThem ? t.unblock_title : t.block_user}
            sublabel={iBlockedThem ? t.unblock_b1 : t.block_user_desc}
            onPress={() => setBlockModalVisible(true)}
            danger={!iBlockedThem}
            isRTL={isRTL}
          />
        </View>

        <View style={{height: insets.bottom + 32}} />
      </Animated.ScrollView>

      {/* ── Modals ── */}
      <ImageViewerModal
        visible={imageViewerOpen} uri={avatarUri} senderName={displayName} onClose={() => setImageViewerOpen(false)}
      />
      <ImageViewerModal
        visible={!!viewerItem} uri={viewerItem?.uri || null} senderName={displayName}
        timestamp={viewerItem?.createdAt ? new Date(viewerItem.createdAt).toLocaleDateString([], {day: 'numeric', month: 'short', year: 'numeric'}) : undefined}
        onClose={() => setViewerItem(null)}
      />
      <BlockUserModal
        visible={blockModalVisible} onClose={() => setBlockModalVisible(false)}
        onConfirm={handleBlockConfirm} isBlocked={iBlockedThem}
        participantName={displayName} loading={blockLoading}
      />
      <MuteModal
        visible={muteModalVisible} onClose={() => setMuteModalVisible(false)}
        chatId={chatId} isMuted={isMuted} currentMute={muteDuration} onMuteChange={handleMuteChange}
      />
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionTitle({label, isRTL}: {label: string; isRTL: boolean}) {
  return (
    <Text style={[s.sectionTitleText, {textAlign: isRTL ? 'right' : 'left'}]}>
      {label}
    </Text>
  );
}

function InfoRow({icon, label, value, sublabel, multiline, isRTL}: {
  icon: string; label: string; value: string;
  sublabel?: string; multiline?: boolean; isRTL: boolean;
}) {
  const rowDir = isRTL ? 'row-reverse' : 'row';
  return (
    <View style={[s.infoRow, {flexDirection: rowDir}]}>
      <View style={[s.infoIcon, isRTL ? {marginLeft: 14, marginRight: 0} : {}]}>
        <Ionicons name={icon as any} size={18} color={Colors.Red} />
      </View>
      <View style={{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
        <Text style={[s.infoLabel, {textAlign: isRTL ? 'right' : 'left'}]}>{label}</Text>
        <Text style={[s.infoValue, multiline && {lineHeight: 22}, {textAlign: isRTL ? 'right' : 'left'}]} numberOfLines={multiline ? 4 : 1}>
          {value}
        </Text>
        {sublabel ? <Text style={[s.infoSublabel, {textAlign: isRTL ? 'right' : 'left'}]}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

function ActionRow({icon, iconColor, iconBg, label, sublabel, onPress, danger, isRTL}: {
  icon: string; iconColor: string; iconBg: string; label: string;
  sublabel?: string; onPress: () => void; danger?: boolean; isRTL: boolean;
}) {
  const rowDir = isRTL ? 'row-reverse' : 'row';
  return (
    <TouchableOpacity style={[s.actionRow, {flexDirection: rowDir}]} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.actionIcon, {backgroundColor: iconBg}, isRTL ? {marginLeft: 14, marginRight: 0} : {}]}>
        <Ionicons name={icon as any} size={19} color={iconColor} />
      </View>
      <View style={{flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
        <Text style={[s.actionLabel, danger && {color: '#EF4444'}, {textAlign: isRTL ? 'right' : 'left'}]}>
          {label}
        </Text>
        {sublabel ? <Text style={[s.actionSublabel, {textAlign: isRTL ? 'right' : 'left'}]}>{sublabel}</Text> : null}
      </View>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={{height: 0.5, backgroundColor: '#F3F4F6', marginLeft: 66}} />;
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   {flex: 1, backgroundColor: Colors.dargBg},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7'},

  stickyNav: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 99,
    alignItems: 'center', backgroundColor: Colors.darkgrey,
    paddingHorizontal: 12, paddingBottom: 14,
  },
  navBtn:   {width: 40, height: 40, justifyContent: 'center', alignItems: 'center'},
  navTitle: {flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#fff', marginHorizontal: 8},

  hero: {
    height: HEADER_HEIGHT, backgroundColor: Colors.darkgrey,
    justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 24,
  },
  backBtnWrap: {position: 'absolute', zIndex: 10},
  glassBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarWrap: {zIndex: 5},
  avatarImg: {width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#fff'},
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: {fontSize: 38, fontWeight: '700', color: '#fff'},
  avatarHint: {
    position: 'absolute', bottom: 3, right: 3,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },

  nameSection: {
    alignItems: 'center', paddingVertical: 0, backgroundColor: '#fff',
    marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0', gap: 6,
  },
  name: {fontSize: 16, fontWeight: '400', color: '#fff', marginTop: 10},

  card: {
    backgroundColor: Colors.cardBg, borderRadius: 16,
    marginHorizontal: 14, marginBottom: 12,
    overflow: 'hidden', borderWidth: 0.5, borderColor: '#F0F0F0',
  },
  sectionTitleText: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.7,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },

  infoRow: {alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 13, gap: 14},
  infoIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  infoLabel:    {fontSize: 11, color: '#9CA3AF', marginBottom: 2, fontWeight: '600'},
  infoValue:    {fontSize: 15, color: '#111827'},
  infoSublabel: {fontSize: 12, color: '#6B7280', marginTop: 2},

  actionRow: {alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14},
  actionIcon: {width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  actionLabel:    {fontSize: 15, fontWeight: '500', color: '#111827'},
  actionSublabel: {fontSize: 12, color: '#9CA3AF', marginTop: 1},

  mediaHeader:      {alignItems: 'center', justifyContent: 'space-between', paddingRight: 12},
  mediaHeaderRight: {alignItems: 'center', gap: 10, paddingBottom: 2},
  mediaCount:       {fontSize: 12, color: '#9CA3AF'},

  mediaGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 4, gap: 3},
  mediaCell: {width: PREVIEW_SIZE, height: PREVIEW_SIZE, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F3F4F6'},
  mediaImg:  {width: '100%', height: '100%'},
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  mediaEmpty:     {alignItems: 'center', paddingVertical: 28, gap: 8},
  mediaEmptyText: {fontSize: 13, color: '#9CA3AF'},

  viewAllStrip: {
    alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderTopWidth: 0.5, borderTopColor: '#F3F4F6',
  },
  viewAllStripText: {fontSize: 13, color: Colors.Green, fontWeight: '600'},
});








