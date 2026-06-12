// src/screens/Redeem/Redeem_His.tsx
import React, {useEffect, useState} from 'react';
import {
  Text, View, FlatList, StatusBar, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Colors} from '../../Themes/Colors';
import {RootState} from '../../redux_toolkit/store';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import Discount_Redeem2 from '../../Component/CustomAlert/DiscountRedeem2';
import { Fonts } from '../../Themes/Fonts';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

type RedeemItem = {
  id: string;
  code?: string;
  percentage?: string;
  createdAt?: any;
  phoneNumber?: string;
  brand?: string;
};

const BASE_URL = 'https://hala-b-saudi.onrender.com/api/hbs/redeem';

const BRAND_COLORS = [
  '#005029', '#3B9E6D', '#7C5CFC', '#E8734A',
  '#D44A7A', '#1A7DBF', '#C8891A', '#2E9B8F',
];
function getBrandColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

function formatDate(createdAt: any): string {
  if (!createdAt) return '—';
  try {
    const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
  } catch { return '—'; }
}

function formatTime(createdAt: any): string {
  if (!createdAt) return '';
  try {
    const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
  } catch { return ''; }
}

const Redeem_His: React.FC = () => {
  const navigation = useNavigation<any>();
   useStatusBar('light-content', Colors.Green, true);
  // ── Language / RTL ─────────────────────────────────────────────────
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  const rowDir   = isRTL ? 'row-reverse' : 'row';

  const [history, setHistory]           = useState<RedeemItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedItem, setSelectedItem] = useState<RedeemItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userDataString = await AsyncStorage.getItem('hala_user_data');
        if (!userDataString) {setHistory([]); return;}
        const userData   = JSON.parse(userDataString);
        const phoneNumber = String(userData?.phoneNumber || '').trim();
        if (!phoneNumber) {setHistory([]); return;}

        const res  = await fetch(BASE_URL);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {setHistory([]); return;}

        const raw = json?.data ?? json;
        const arr = Array.isArray(raw) ? raw : [];
        const filtered: RedeemItem[] = arr
          .map((r: any) => ({id: String(r._id || r.id), ...r}))
          .filter((r: any) => String(r?.phoneNumber || '').trim() === phoneNumber);

        filtered.sort((a: any, b: any) =>
          new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime(),
        );
        setHistory(filtered);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Redemption count label ─────────────────────────────────────────
  const countLabel = history.length === 1
    ? `1 ${t.redemption_label}`
    : `${history.length} ${t.redemptions_label_pl}`;

  // ── Render card ────────────────────────────────────────────────────
  const renderItem = ({item}: {item: RedeemItem}) => {
    const label      = item.brand || item.code || '—';
    const brandColor = getBrandColor(label);
    const letter     = label.charAt(0).toUpperCase();
    const date       = formatDate(item.createdAt);
    const time       = formatTime(item.createdAt);
    const discount   = item.percentage ? `${item.percentage}` : null;

    return (
      <TouchableOpacity
        style={[styles.card, {flexDirection: rowDir}]}
        onPress={() => {setSelectedItem(item); setModalVisible(true);}}
        activeOpacity={0.75}>

        {/* Brand avatar */}
        <View style={[styles.brandAvatar, {backgroundColor: brandColor}]}>
          <Text style={styles.brandLetter}>{letter}</Text>
        </View>

        {/* Info */}
        <View style={[styles.cardInfo, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
          <Text
            style={[styles.cardBrand, {textAlign: isRTL ? 'right' : 'left'}]}
            numberOfLines={1}>
            {label}
          </Text>
          <View style={[styles.cardMeta, {flexDirection: rowDir}]}>
            <Ionicons name="calendar-outline" size={11} color={Colors.Grey9} />
            <Text style={styles.cardDate}>{date}</Text>
            {time ? (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.cardDate}>{time}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Discount badge + chevron */}
        <View style={[styles.cardRight, {alignItems: isRTL ? 'flex-start' : 'flex-end'}]}>
          {discount && (
            <View style={[styles.discountBadge, {backgroundColor: brandColor + '18'}]}>
              <Text style={[styles.discountText, {color: brandColor}]}>{discount}</Text>
            </View>
          )}
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={14} color={Colors.Grey4} style={{marginTop: 4}}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
  
      {/* ── Header (always green) ── */}
      <View style={styles.header}>
        <View style={[styles.headerRow, {flexDirection: rowDir}]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}>
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={20} color={Colors.White}
            />
          </TouchableOpacity>

          <View style={[styles.headerText, {alignItems: isRTL ? 'flex-end' : 'flex-start'}]}>
            <Text style={[styles.eyebrow, {textAlign: isRTL ? 'right' : 'left'}]}>
              {t.account}
            </Text>
            <Text style={[styles.headerTitle, {textAlign: isRTL ? 'right' : 'left'}]}>
              {t.redeem_history}
            </Text>
          </View>

          {!loading && history.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{history.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Body — always Colors.Bg ── */}
      <View style={styles.body}>
        {loading ? (
          /* Loading state */
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.Green} />
            <Text style={styles.loaderText}>{t.loading_history}</Text>
          </View>

        ) : history.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyWrap}>
            <View style={styles.emptyRing}>
              <Ionicons name="receipt-outline" size={42} color={Colors.Green} />
            </View>
            <Text style={styles.emptyTitle}>{t.no_redeem_history}</Text>
            <Text style={[styles.emptySub, {textAlign: 'center'}]}>{t.no_redeem_desc}</Text>
          </View>

        ) : (
          /* List state */
          <FlatList
            data={history}
            keyExtractor={it => String(it.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{height: 8}} />}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderText, {textAlign: isRTL ? 'right' : 'left'}]}>
                  {countLabel}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <Discount_Redeem2
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Redeem_His;

const styles = StyleSheet.create({
  // ── Root — green for safe-area top edge to match header ──
  safe: {flex: 1, backgroundColor: Colors.Green},

  // ── Body — always Colors.Bg regardless of content state ──
  body: {flex: 1, backgroundColor: Colors.Bg},

  // ── Header ──
  header: {
    backgroundColor: Colors.Green,
    paddingTop: Platform.OS === 'ios' ? 4 : 10,
    paddingBottom: 20,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  headerRow: {alignItems: 'center', gap: 12},
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0,
  },
  headerText: {flex: 1},
  eyebrow: {
    fontSize: 10, color: Colors.LightGreen,   fontFamily: Fonts.SF_Bold,
    letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 3,
  },
  headerTitle: {fontSize: 18,
        fontFamily: Fonts.SF_Bold,
    fontWeight: '800', color: Colors.White, letterSpacing: -0.3},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  countBadgeText: {color: Colors.White, fontSize: 13, fontWeight: '700'},

  // ── List ──
  listContent: {paddingHorizontal: 14, paddingTop: 12, paddingBottom: 36},
  listHeader:  {paddingHorizontal: 4, paddingBottom: 8},
  listHeaderText: {
    fontSize: 11, fontWeight: '700', color: Colors.Green,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },

  // ── Card ──
  card: {
    alignItems: 'center',
    backgroundColor: Colors.White,
    borderRadius: 16,
    paddingVertical: 13, paddingHorizontal: 14,
    shadowColor: '#1A202C',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05, shadowRadius: 8,
    gap: 12,
  },
  brandAvatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  brandLetter: {color: Colors.White, fontSize: 20, fontWeight: '800'},

  cardInfo: {flex: 1, minWidth: 0},
  cardBrand: {fontSize: 13, fontWeight: '700', color: Colors.Black2, marginBottom: 5},
  cardMeta:  {alignItems: 'center', gap: 3},
  cardDate:  {fontSize: 10, color: Colors.Grey9, fontWeight: '500'},
  metaDot:   {width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.Grey4},

  cardRight: {gap: 4, flexShrink: 0},
  discountBadge: {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  discountText:  {fontSize: 8, fontWeight: '800', letterSpacing: 0.2},

  // ── Empty ──
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 10,
  },
  emptyRing: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#E6F2EC',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, borderWidth: 3, borderColor: Colors.LightGreen,
  },
  emptyTitle: {fontSize: 18, fontWeight: '700', color: Colors.Black2},
  emptySub:   {fontSize: 13, color: Colors.Grey9, lineHeight: 20},

  // ── Loader ──
  loaderWrap: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12},
  loaderText: {fontSize: 14, color: Colors.Grey9, marginTop: 4},
});



