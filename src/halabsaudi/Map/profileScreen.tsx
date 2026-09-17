import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config/api';
import CustomHeader from '../Component/CustomHeader/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../Themes/Colors';
import ActivityIndicatorModal from  '../Component/Loader/ActivityIndicator';

// ── Theme tokens (mirrors Profile screen) ──────────────────────────────────
const C = {
  bg: '#0F0F0F', // dargBg equivalent
  card: '#1C1C1E', // cardBg equivalent
  red: Colors.btnRed, // btnRed equivalent
  lightRed: Colors.btnRed, // lightRed equivalent
  white: '#FFFFFF',
  muted: '#8E8E93',
  divider: '#2C2C2E',
  overlay: 'rgba(0,0,0,0.55)',
};

const WIDTH = Dimensions.get('window').width;
const GAP = 2;
const COLS = 3;
const TILE = (WIDTH - GAP * (COLS + 1)) / COLS;

// Local cache key — lets the grid render instantly on repeat visits
// while a fresh network copy loads silently in the background.
const CACHE_KEY = 'map_profile_checkins_cache_v1';

// ─────────────────────────────────────────────────────────────────────────────

const MapProfile = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    // 1) Paint cached data immediately (if we have it) — no spinner, no wait.
    try {
      const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        setPosts(JSON.parse(cachedRaw));
        setLoading(false);
      }
    } catch (e) {
      // cache read failed — not fatal, fall through to network
    }

    // 2) Always refresh from network in the background, then update cache.
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const res = await axios.get(`${BASE_URL}/api/hbs/map/my-checkins`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const fresh = res.data?.data || [];
      setPosts(fresh);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Derived stats from real data ─────────────────────────────────────────
  const totalCheckins = posts.length;
  const uniquePlaces = useMemo(
    () => new Set(posts.map(p => p.location?.name).filter(Boolean)).size,
    [posts],
  );
  const user = posts?.[0]?.user;

  // ── Initials fallback ────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase() ?? '')
        .join('')
    : '';

  // ── Grid item (memoized so FlatList doesn't re-render every tile on
  //    unrelated state changes like opening the modal) ─────────────────────
  const renderItem = useCallback(
    ({item}: any) => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.tile}
        onPress={() => setSelected(item)}>
        <FastImage
          source={{
            uri: item.image,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.tileImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        {/* gradient-style scrim at bottom */}
        <View style={styles.tileScrim} />
        <View style={styles.tileInfo}>
          <Text style={styles.tileLocation} numberOfLines={1}>
            📍 {item.location?.name || 'Unknown'}
          </Text>
          {!!item.caption && (
            <Text style={styles.tileCaption} numberOfLines={1}>
              {item.caption}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  // ── Empty / loading state ────────────────────────────────────────────────
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyWrap}>
          {/* <ActivityIndicator size="large" color={C.red} /> */}
          <ActivityIndicatorModal visible={loading} />
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>No check-ins yet</Text>
        <Text style={styles.emptyBody}>
          Places you check in to will appear here.
        </Text>
      </View>
    );
  };

  // ── Header ────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <CustomHeader title="" onBackPress={() => navigation.goBack()} />
      {/* Avatar + name */}
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrap}>
          {/* Initials fallback */}
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          {user?.profilePhoto && (
            <FastImage
              source={{uri: user.profilePhoto}}
              style={styles.avatarImg}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.profileName}>{user?.name}</Text>
          {/* <Text style={styles.profileSub}>📍 Exploring places</Text> */}
        </View>
      </View>

      {/* Stats row — real data only */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCheckins}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{uniquePlaces}</Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>
      </View>

      {/* Section label */}
      {posts.length > 0 && (
        <Text style={styles.sectionLabel}>MY CHECK-INS</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <FlatList
        data={posts}
        numColumns={COLS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        // ── Performance tuning for an image-heavy grid ──────────────────────
        removeClippedSubviews={true}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        updateCellsBatchingPeriod={50}
      />

      {/* ── Full-screen modal ─────────────────────────────────────────────── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBg}>
          {/* Close */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelected(null)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>

          {selected && (
            <>
              <FastImage
                source={{uri: selected.image}}
                style={styles.fullImage}
                resizeMode={FastImage.resizeMode.contain}
              />

              {/* Info overlay */}
              <View style={styles.modalOverlay}>
                {/* Location pill */}
                <View style={styles.locationPill}>
                  <Text style={styles.locationPillTxt}>
                    📍 {selected.location?.name || 'Unknown location'}
                  </Text>
                </View>

                {!!selected.caption && (
                  <Text style={styles.modalCaption}>{selected.caption}</Text>
                )}

                {!!selected.createdAt && (
                  <Text style={styles.modalDate}>
                    {new Date(selected.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default MapProfile;

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkgrey,
  },

  listContent: {
    paddingBottom: 32,
  },

  // ── Header ────────────────────────────────────────────────────────────────

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },

  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: C.red,
    backgroundColor: C.card,
  },

  avatarFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.Red,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: C.white,
  },

  avatarImg: {
    width: '100%',
    height: '100%',
  },

  nameBlock: {
    flex: 1,
  },

  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
    marginBottom: 4,
  },

  profileSub: {
    fontSize: 13,
    color: C.muted,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────

  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 14,
    marginBottom: 24,
    overflow: 'hidden',
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },

  statDivider: {
    width: 0.5,
    backgroundColor: C.divider,
    marginVertical: 12,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: C.white,
    marginBottom: 3,
  },

  statLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // ── Grid ──────────────────────────────────────────────────────────────────

  row: {
    gap: GAP,
    paddingHorizontal: GAP,
    marginBottom: GAP,
  },

  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: C.card,
  },

  tileImage: {
    width: '100%',
    height: '100%',
  },

  tileScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    // manual gradient via layered views
    backgroundColor: 'rgba(0,0,0,0)',
  },

  tileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingBottom: 6,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  tileLocation: {
    color: C.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  tileCaption: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 8,
    marginTop: 1,
  },

  // ── Empty ─────────────────────────────────────────────────────────────────

  emptyWrap: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
    marginBottom: 8,
  },

  emptyBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────

  modalBg: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    right: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeTxt: {
    color: C.white,
    fontSize: 16,
    fontWeight: '600',
  },

  fullImage: {
    width: WIDTH,
    height: WIDTH,
  },

  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  locationPill: {
    alignSelf: 'flex-start',
    backgroundColor: C.red,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },

  locationPillTxt: {
    color: C.white,
    fontSize: 13,
    fontWeight: '700',
  },

  modalCaption: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },

  modalDate: {
    color: C.muted,
    fontSize: 12,
  },
});