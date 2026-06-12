// src/westwalk/screens/Maintenance/MyRequests.tsx
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/Colors';

const API_URL =
  'https://hala-b-saudi.onrender.com/api/westwalk/maintainceRequest';
const REQUEST_TIMEOUT_MS = 30000;

interface RequestRecord {
  _id:         string;
  name:        string;
  qid:         string;
  subject:     string;
  description: string;
  status:      'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  createdAt:   string;
}

const STATUS_CONFIG: Record<
  string,
  {bg: string; text: string; dot: string; accent: string; icon: string; label: string}
> = {
  Pending: {
    bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B',
    accent: '#F59E0B', icon: '🕐', label: 'Pending',
  },
  'In Progress': {
    bg: '#EEF2FF', text: '#3730A3', dot: '#6366F1',
    accent: '#6366F1', icon: '⚙️', label: 'In Progress',
  },
  Resolved: {
    bg: '#F0FDF4', text: '#14532D', dot: '#22C55E',
    accent: '#22C55E', icon: '✅', label: 'Resolved',
  },
  Rejected: {
    bg: '#FFF1F2', text: '#881337', dot: '#F43F5E',
    accent: '#F43F5E', icon: '✕', label: 'Rejected',
  },
};

// Status step order for the progress track
const STATUS_STEPS = ['Pending', 'In Progress', 'Resolved'];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  ms = REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, {...options, signal: controller.signal}).finally(() =>
    clearTimeout(id),
  );
};

// ── Status Progress Bar ──────────────────────────────────────────────────────
const StatusTrack = ({status}: {status: string}) => {
  if (status === 'Rejected') {
    return (
      <View style={track.wrap}>
        <View style={[track.pill, {backgroundColor: '#FFF1F2'}]}>
          <View style={[track.dot, {backgroundColor: '#F43F5E'}]} />
          <Text style={[track.label, {color: '#881337'}]}>Request Rejected</Text>
        </View>
      </View>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <View style={track.wrap}>
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const active  = i === currentIdx;
        const cfg     = STATUS_CONFIG[step];
        return (
          <React.Fragment key={step}>
            <View style={track.stepWrap}>
              <View
                style={[
                  track.circle,
                  done
                    ? {backgroundColor: cfg.accent, borderColor: cfg.accent}
                    : {backgroundColor: '#F3F4F6', borderColor: '#E5E7EB'},
                ]}>
                {done && (
                  <Text style={track.check}>{active ? '●' : '✓'}</Text>
                )}
              </View>
              <Text
                style={[
                  track.stepLabel,
                  {color: done ? cfg.accent : '#9CA3AF'},
                  active && {fontWeight: '700'},
                ]}>
                {step}
              </Text>
            </View>
            {i < STATUS_STEPS.length - 1 && (
              <View
                style={[
                  track.line,
                  {backgroundColor: i < currentIdx ? cfg.accent : '#E5E7EB'},
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const track = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginTop: 14, marginBottom: 2,
  },
  stepWrap: {alignItems: 'center', gap: 4},
  circle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  check:      {fontSize: 10, color: '#fff', fontWeight: '700'},
  stepLabel:  {fontSize: 9, fontWeight: '500', textAlign: 'center', maxWidth: 56},
  line:       {flex: 1, height: 2, marginTop: 10, marginHorizontal: 2},
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  dot:   {width: 7, height: 7, borderRadius: 4},
  label: {fontSize: 12, fontWeight: '700'},
});

// ── Single Card ──────────────────────────────────────────────────────────────
const RequestCard = ({item, index}: {item: RequestRecord; index: number}) => {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;

  return (
    <View style={[card.wrap, {borderLeftColor: cfg.accent}]}>
      {/* Header */}
      <View style={card.header}>
        <View style={card.headerLeft}>
          <View style={[card.indexBadge, {backgroundColor: cfg.accent + '18'}]}>
            <Text style={[card.indexText, {color: cfg.accent}]}>
              #{String(index + 1).padStart(2, '0')}
            </Text>
          </View>
          <Text style={card.subject} numberOfLines={1}>
            {item.subject}
          </Text>
        </View>

        {/* Status chip */}
        <View style={[card.chip, {backgroundColor: cfg.bg}]}>
          <Text style={card.chipIcon}>{cfg.icon}</Text>
          <Text style={[card.chipText, {color: cfg.text}]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={card.divider} />

      {/* Description */}
      <Text style={card.desc} numberOfLines={3}>
        {item.description}
      </Text>

      {/* Progress track */}
      <StatusTrack status={item.status} />

      {/* Footer */}
      <View style={card.footer}>
        <View style={card.footerItem}>
          <Text style={card.footerIcon}>📅</Text>
          <Text style={card.footerText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={card.footerItem}>
          <Text style={card.footerIcon}>🕐</Text>
          <Text style={card.footerText}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
};

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
  
  },
  header:     {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8},
  indexBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, flexShrink: 0,
  },
  indexText:  {fontSize: 10, fontWeight: '800', letterSpacing: 0.5},
  subject:    {fontSize: 12, fontWeight: '700', color: '#111827', flex: 1},
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0,
  },
  chipIcon: {fontSize: 10},
  chipText: {fontSize: 10, fontWeight: '700'},
  divider:  {height: 1, backgroundColor: '#F3F4F6', marginVertical: 8},
  desc: {fontSize: 10, color: '#6B7280',fontWeight: '600', lineHeight: 20},
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  footerItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  footerIcon: {fontSize: 11},
  footerText: {fontSize: 11, color: '#9CA3AF', fontWeight: '500'},
});

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function MyRequests() {
  const [requests, setRequests]     = useState<RequestRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchRequests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const raw        = await AsyncStorage.getItem('tenant_data');
      const tenantData = raw ? JSON.parse(raw) : null;
      const qid        = tenantData?.qid?.toString().trim();

      if (!qid) {
        setError('QID not found. Please log in again.');
        return;
      }

      const res = await fetchWithTimeout(API_URL, {
        headers: {Accept: 'application/json'},
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          `Unexpected server response (status ${res.status}). Try again.`,
        );
      }

      const data = await res.json();

      if (res.ok && data.success) {
        const myRequests: RequestRecord[] = (data.data || []).filter(
          (item: RequestRecord) => item.qid?.toString().trim() === qid,
        );
        setRequests(myRequests);
      } else if (res.status === 404) {
        setRequests([]);
      } else {
        setError(data.message || 'Failed to load requests.');
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError(
          'Request timed out. Server may be starting up — pull down to retry.',
        );
      } else if (e.message?.includes('Network request failed')) {
        setError('No internet connection. Please check your network.');
      } else {
        setError(e.message || 'Something went wrong. Pull down to retry.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, []),
  );

  // ── Stats summary bar ──
  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === 'Pending').length,
    resolved: requests.filter(r => r.status === 'Resolved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator size="large" color={Colors.PrimaryColor} />
        <Text style={styles.loaderText}>Loading your requests…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerWrap}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Could not load requests</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchRequests()}
            activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={item => item._id}
        renderItem={({item, index}) => <RequestCard item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          requests.length === 0 && styles.listContentEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}

        // ── Stats header ──
        ListHeaderComponent={
          requests.length > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNum, {color: '#F59E0B'}]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNum, {color: '#22C55E'}]}>{stats.resolved}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNum, {color: '#F43F5E'}]}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          ) : null
        }

        // ── Empty state ──
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>🔧</Text>
            </View>
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptySub}>
              Once you submit a maintenance request, you'll be able to track its
              progress here in real time.
            </Text>
          </View>
        }

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRequests(true)}
            colors={[Colors.PrimaryColor]}
            tintColor={Colors.PrimaryColor}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FB'},

  centerWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8F9FB', padding: 24,
  },
  loaderText: {fontSize: 14, color: '#9CA3AF', marginTop: 12},

  // Error
  errorCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.07, shadowRadius: 12,
    width: '100%',
  },
  errorIcon:  {fontSize: 40},
  errorTitle: {fontSize: 17, fontWeight: '700', color: '#111827'},
  errorText:  {fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20},
  retryBtn: {
    marginTop: 8, backgroundColor: Colors.PrimaryColor,
    borderRadius: 10, paddingHorizontal: 28, paddingVertical: 11,
  },
  retryBtnText: {color: '#fff', fontWeight: '700', fontSize: 14},

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05, shadowRadius: 6,borderWidth:0.6
  },
  statBox:     {flex: 1, alignItems: 'center', gap: 2},
  statNum:     {fontSize: 22, fontWeight: '800', color: Colors.PrimaryColor},
  statLabel:   {fontSize: 10, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4},
  statDivider: {width: 1, height: 32, backgroundColor: '#F3F4F6'},

  // List
  listContent:      {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32},
  listContentEmpty: {flex: 1},

  // Empty
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 12,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyIcon:  {fontSize: 36},
  emptyTitle: {fontSize: 20, fontWeight: '800', color: '#111827'},
  emptySub:   {fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 21},
});
