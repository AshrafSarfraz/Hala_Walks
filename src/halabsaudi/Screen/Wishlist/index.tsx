import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  PermissionsAndroid,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Dark_Heart, Light_Heart, Location } from '../../Themes/Images';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { RootState } from '../../redux_toolkit/store';
import { toggleItemInCart } from '../../redux_toolkit/cartSlice';
import DistanceFromDevice from '../../Component/distanceCalculate/distanceCalculate';
import Geolocation from '@react-native-community/geolocation';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

const { width } = Dimensions.get('screen');

type WishlistProps = { navigation: any };

const Wishlist: React.FC<WishlistProps> = () => {
 useStatusBar('light-content', Colors.Green, true);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const language  = useSelector((state: RootState) => state.language.language);
  const t         = languageData[language];
  const isRTL     = language === 'ar';

  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);

  useEffect(() => {
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat:  position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        error => console.log('❌ Location error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const already = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (already) { getCurrentLocation(); return; }
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'We need access to your location to provide better services.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentLocation();
        } else {
          Geolocation.requestAuthorization();
          getCurrentLocation();
        }
      } catch (e) { console.log('Permission error:', e); }
    };

    requestLocationPermission();
  }, []);

  const isInCart      = (itemId: string) => cartItems.some(c => c.id === itemId);
  const handleToggleCart = (item: { id: string }) => dispatch(toggleItemInCart(item));

  // ── RTL helpers ──────────────────────────────────────────────────────
  const rowDir   = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.arcDecor} />
        <View style={[s.headerRow, { flexDirection: rowDir }]}>

          <View style={[s.headerText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={[s.eyebrow, { textAlign }]}>{t.hala_community}</Text>
            <Text style={[s.headerTitle, { textAlign }]}>{t.Wishlist}</Text>
          </View>

          {cartItems.length > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Body ── */}
      <View style={s.body}>
        <FlatList
          data={cartItems}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={[
            s.row,
            { flexDirection: rowDir },   // flip column order in Arabic
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 30,
            paddingHorizontal: 12,
          }}

          ListEmptyComponent={() => (
            <View style={s.emptyWrap}>
              <View style={s.emptyRing}>
                <Ionicons name="heart-outline" size={42} color={Colors.Green} />
              </View>
              <Text style={[s.emptyTitle, { textAlign: 'center' }]}>
                {t.No_Items_Found}
              </Text>
              <Text style={[s.emptySub, { textAlign: 'center' }]}>
                {t.saved_items_desc}
              </Text>
            </View>
          )}

          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('DetailScreen', { item })}
              activeOpacity={0.85}>

              {/* Image */}
              <ImageBackground source={{ uri: item.img }} style={s.cardImage}>
                <View style={s.imageOverlay} />

                {/* Heart — flips to left in Arabic */}
                <TouchableOpacity
                  onPress={() => handleToggleCart(item)}
                  style={[
                    s.heartBtn,
                    isRTL ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' },
                  ]}
                  activeOpacity={0.8}>
                  <Image
                    source={isInCart(item.id) ? Dark_Heart : Light_Heart}
                    style={s.heartIcon}
                  />
                </TouchableOpacity>
              </ImageBackground>

              {/* Card content */}
              <View style={[s.cardBody, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>

                <Text
                  style={[s.cardName, { textAlign }]}
                  numberOfLines={1}>
                  {item.nameEng.length > 20
                    ? item.nameEng.substring(0, 20) + '…'
                    : item.nameEng}
                </Text>

                <View style={s.categoryPill}>
                  <Text style={s.categoryPillText}>{item.selectedCategory}</Text>
                </View>

                <View style={[s.cardFooter, { flexDirection: rowDir }]}>
                  <View style={[s.locRow, { flexDirection: rowDir }]}>
                    <Image source={Location} style={s.locIcon} />
                    {userLocation ? (
                      <DistanceFromDevice
                        userLat={userLocation.lat}
                        userLong={userLocation.long}
                        targetLat={Number(item.latitude)}
                        targetLong={Number(item.longitude)}
                        kmText={t.km}
                        mText={t.m}
                      />
                    ) : (
                      <Text style={s.locText}>--</Text>
                    )}
                  </View>
                  <Text style={s.venueTxt} numberOfLines={1}>
                    {item.selectedVenue}
                  </Text>
                </View>

              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Wishlist;

const CARD_WIDTH = (width - 12 * 2 - 10) / 2;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.Green,
  },

  // ── Header ──
  header: {
    backgroundColor: Colors.darkgrey,
    paddingTop: Platform.OS === 'ios' ? 4 : 10,
    paddingBottom: 20,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  arcDecor: {
    position: 'absolute',
    top: -55, right: -55,
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(124,196,166,0.11)',
  },
  headerRow: {
    alignItems: 'center',
    gap: 12,
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    color: Colors.White,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.White,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  countBadgeText: {
    color: Colors.White,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Body ──
  body: {
    flex: 1,
    backgroundColor: Colors.dargBg,
    paddingTop: 10,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  // ── Card ──
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  cardImage: {
    width: '100%',
    height: 118,
    justifyContent: 'space-between',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heartBtn: {
    margin: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: 'red',
  },

  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  cardName: {
    fontSize: 13,
    fontFamily: Fonts.SF_Bold,
    color: Colors.Black,
    marginBottom: 6,
  },
  categoryPill: {
    backgroundColor: '#D0A700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryPillText: {
    fontSize: 10,
    color: Colors.White,
    fontFamily: Fonts.SF_Medium,
    lineHeight: 13,
  },

  cardFooter: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locRow: {
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  locIcon: {
    width: 11,
    height: 11,
    resizeMode: 'contain',
    tintColor: Colors.btnRed,
  },
  locText: {
    fontSize: 10,
    color: Colors.btnRed,
    fontFamily: Fonts.SF_Medium,
  },
  venueTxt: {
    fontSize: 10,
    color: Colors.btnRed,
    fontFamily: Fonts.SF_Medium,
    maxWidth: '45%',
  },

  // ── Empty ──
  emptyWrap: {
    alignItems: 'center',
    marginTop: 120,
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyRing: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#E6F2EC',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3, borderColor: Colors.btnRed,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.Black2,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.Grey9,
  },
});



