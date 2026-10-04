import type { NavigationProp,ParamListBase } from '@react-navigation/native';
import { ActivityIndicator } from '../../../ui/ActivityIndicator';
import { Alert } from '../../../ui/Alert';
import { Text } from '../../../ui/Text';
import { TextInput } from '../../../ui/TextInput';
import { ensurePermission } from '../../permissions/service';

import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React,{ useCallback,useEffect,useRef,useState } from 'react';
import { Animated,FlatList,Image,Keyboard,KeyboardAvoidingView,Platform,SafeAreaView,ScrollView,StatusBar,StyleSheet,TouchableOpacity,View } from 'react-native';
import { launchCamera,launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../config/api';
import { Colors } from '../../Themes/Colors';
import { hbsText } from '../../i18n/translations';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 2;

const PURPLE = Colors.accent;
const BG = Colors.background;
const CARD_BG = Colors.surface;
const SURFACE = Colors.surfaceRaised;
const WHITE = Colors.textPrimary;
const WHITE_60 = Colors.textSecondary;
const WHITE_30 = Colors.textMuted;
const WHITE_10 = Colors.border;

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoEntry = {
  id: string;
  uri: string;
  progress: number | null;
  downloadUrl: string | null;
  error: boolean;
};

type CommunityBrand = {
  _id: string;
  nameEng?: string;
  nameArabic?: string;
  address?: string;
  selectedCity?: string;
  selectedCountry?: string;
};

// ─── Firebase upload ──────────────────────────────────────────────────────────

const uploadToFirebase = (
  uri: string,
  onProgress: (pct: number) => void,
): Promise<string> =>
  new Promise((resolve, reject) => {
    const filename = `mapGallery/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.jpg`;
    const ref = storage().ref(filename);
    const task = ref.putFile(uri);
    task.on(
      'state_changed',
      snapshot => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        onProgress(pct);
      },
      err => reject(err),
      async () => {
        try {
          resolve(await ref.getDownloadURL());
        } catch (err) {
          reject(err);
        }
      },
    );
  });

// ─── PhotoCard ────────────────────────────────────────────────────────────────

const PhotoCard = ({
  entry,
  onRemove,
}: {
  entry: PhotoEntry;
  onRemove: () => void;
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (entry.progress !== null) {
      Animated.timing(progressAnim, {
        toValue: entry.progress / 100,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [entry.progress, progressAnim]);

  const isUploading =
    entry.progress !== null && entry.progress < 100 && !entry.error;
  const isDone = entry.downloadUrl !== null;

  return (
    <View style={cardStyles.wrapper}>
      <Image source={{uri: entry.uri}} style={cardStyles.image} />

      {isUploading && (
        <View style={cardStyles.overlay}>
          <Text style={cardStyles.pct}>{entry.progress}%</Text>
          <View style={cardStyles.trackBg}>
            <Animated.View
              style={[
                cardStyles.trackFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      {isDone && (
        <View style={cardStyles.doneBadge}>
          <Text style={cardStyles.badgeText}>✓</Text>
        </View>
      )}

      {entry.error && (
        <View style={[cardStyles.doneBadge, cardStyles.errorBadge]}>
          <Text style={cardStyles.badgeText}>!</Text>
        </View>
      )}

      {!isUploading && (
        <TouchableOpacity style={cardStyles.remove} onPress={onRemove}>
          <Text style={cardStyles.removeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const cardStyles = StyleSheet.create({
  wrapper: {
    width: 100,
    height: 100,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: WHITE_10,
  },
  image: {width: '100%', height: '100%'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  pct: {color: Colors.onAccent, fontSize: 13, fontWeight: '700', marginBottom: 6},
  trackBg: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {height: '100%', backgroundColor: Colors.background, borderRadius: 2},
  doneBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBadge: {backgroundColor: Colors.accent},
  badgeText: {color: Colors.onAccent, fontSize: 11, fontWeight: '800'},
  remove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {color: Colors.onAccent, fontSize: 10, fontWeight: '700'},
});

// ─── TimelineScreen ───────────────────────────────────────────────────────────

const TimelineScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const isAr = useSelector((state: any) => state.language.language === 'ar');
  const [brands, setBrands] = useState<CommunityBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<CommunityBrand | null>(null);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadBrands = useCallback(async () => {
    setBrandsLoading(true);
    setBrandsError(false);
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const response = await axios.get(`${BASE_URL}/api/hbs/map/community-brands`, {
        headers: {Authorization: `Bearer ${token}`}, timeout: 15000,
      });
      setBrands(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch {
      setBrandsError(true);
    } finally {
      setBrandsLoading(false);
    }
  }, []);
  useEffect(() => {loadBrands();}, [loadBrands]);
  const brandName = (brand: CommunityBrand) =>
    (isAr ? brand.nameArabic || brand.nameEng : brand.nameEng || brand.nameArabic) || '';
  const brandAddress = (brand: CommunityBrand) =>
    brand.address || [brand.selectedCity, brand.selectedCountry].filter(Boolean).join(', ');
  const query = searchText.trim().toLocaleLowerCase();
  const filteredBrands = brands.filter(brand =>
    [brand.nameEng, brand.nameArabic, brand.address, brand.selectedCity, brand.selectedCountry]
      .some(value => value?.toLocaleLowerCase().includes(query)),
  );

  // ── 7. Photo capture & library selection ───────────────────────────────────

  const handleCamera = useCallback(async () => {
    Keyboard.dismiss();
    if (!await ensurePermission('camera')) return;
    launchCamera(
      {mediaType: 'photo', quality: 0.8, saveToPhotos: false},
      response => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) addPhoto(uri);
      },
    );
  }, [photos]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGallery = useCallback(() => {
    Keyboard.dismiss();
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, selectionLimit: 1},
      response => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) addPhoto(uri);
      },
    );
  }, [photos]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 8. Photo helpers ────────────────────────────────────────────────────────

  const makeEntry = (uri: string): PhotoEntry => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    uri,
    progress: null,
    downloadUrl: null,
    error: false,
  });

  const addPhoto = (uri: string) => {
    setPhotos(prev => {
      if (prev.length >= MAX_PHOTOS) {
        Alert.alert('Limit reached', `Max ${MAX_PHOTOS} photos allowed.`);
        return prev;
      }
      return [...prev, makeEntry(uri)];
    });
  };

  const removePhoto = (id: string) =>
    setPhotos(prev => prev.filter(p => p.id !== id));

  const patchPhoto = (id: string, patch: Partial<PhotoEntry>) =>
    setPhotos(prev => prev.map(p => (p.id === id ? {...p, ...patch} : p)));

  // ── 9. Check-in / upload ────────────────────────────────────────────────────

  const handleCheckIn = async () => {
    if (!photos.length) {
      Alert.alert('Missing photo', 'Please add at least one photo.');
      return;
    }
    if (!selectedBrand) {
      Alert.alert(hbsText(isAr, 'ui_hala_brands'), hbsText(isAr, 'ui_select_hala_brand'));
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('hala_token');
      const headers = token ? {Authorization: `Bearer ${token}`} : undefined;

      // Upload photos to Firebase
      const results = await Promise.all(
        photos.map(entry =>
          uploadToFirebase(entry.uri, pct =>
            patchPhoto(entry.id, {progress: pct}),
          )
            .then(url => {
              patchPhoto(entry.id, {downloadUrl: url, progress: 100});
              return {ok: true as const, url};
            })
            .catch(err => {
              console.log('[Timeline] Firebase upload error:', err);
              patchPhoto(entry.id, {error: true});
              return {ok: false as const, url: null};
            }),
        ),
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length) {
        Alert.alert(
          'Upload error',
          `${failed.length} photo(s) failed. Remove them and try again.`,
        );
        return;
      }

      // Save to backend
      await Promise.all(
        results.map(({url}) =>
          axios.post(
            `${BASE_URL}/api/hbs/map/photos`,
            {
              brandId: selectedBrand._id,
              image: url,
              caption: description?.trim() || 'Uploaded from app',
            },
            {headers},
          ),
        ),
      );

      Alert.alert('Success', 'Check-in uploaded 🎉');
      setDescription('');
      setPhotos([]);
      setSelectedBrand(null);
      navigation.goBack();
    } catch (error) {
      const err = error as any;
      console.log(
        '[Timeline] handleCheckIn error:',
        err?.response?.status,
        err?.response?.data || err?.message,
      );
      Alert.alert(
        'Upload failed',
        err?.response?.data?.error || err?.response?.data?.message || 'Could not upload check-in.',
      );
    } finally {
      setUploading(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const anyActiveUpload = photos.some(
    p => p.progress !== null && p.progress < 100 && !p.error,
  );
  const isDisabled =
    uploading || !photos.length || anyActiveUpload || brandsLoading || !selectedBrand;


  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timeline</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={16} color={Colors.accent} />
              <Text style={styles.cardLabel}>{hbsText(isAr, 'ui_hala_brands')}</Text>
            </View>
            {selectedBrand ? (
              <View style={styles.suggestionItemActive}>
                <Text style={styles.locationName}>{brandName(selectedBrand)}</Text>
                <Text style={styles.addressLine}>{brandAddress(selectedBrand)}</Text>
                <TouchableOpacity
                  style={styles.changeRow}
                  disabled={uploading}
                  onPress={() => {
                    setSelectedBrand(null);
                    setSearchText('');
                  }}>
                  <Ionicons name="swap-horizontal" size={16} color={Colors.accent} />
                  <Text style={styles.changeText}>{isAr ? 'تغيير العلامة' : 'Change brand'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
            <View style={styles.searchWrap}>
              <TextInput
                placeholder={hbsText(isAr, 'ui_search_hala_brands')}
                placeholderTextColor={Colors.textMuted}
                value={searchText} onChangeText={setSearchText} style={styles.searchInput}
              />
            </View>
            {brandsLoading ? <ActivityIndicator color={Colors.accent} /> : brandsError ? (
              <TouchableOpacity onPress={loadBrands} style={styles.errorRow}>
                <Text style={styles.errorText}>{hbsText(isAr, 'ui_hala_brands_retry')}</Text>
              </TouchableOpacity>
            ) : filteredBrands.length === 0 ? (
              <Text style={styles.emptyText}>{hbsText(isAr, query ? 'ui_not_hala_member' : 'ui_no_hala_brands')}</Text>
            ) : (
              <ScrollView style={{maxHeight: 240}} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {filteredBrands.map(brand => <TouchableOpacity
                  key={brand._id} disabled={uploading}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSelectedBrand(brand);
                    setSearchText('');
                    Keyboard.dismiss();
                  }}>
                  <View style={styles.suggestionRight}>
                    <Text style={styles.suggestionName}>{brandName(brand)}</Text>
                    <Text style={styles.suggestionVicinity}>{brandAddress(brand)}</Text>
                  </View>

                </TouchableOpacity>)}
              </ScrollView>
            )}
              </>
            )}

          </View>

          {/* ── Caption card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="create-outline" size={16} color={Colors.accent} />
              <Text style={styles.cardLabel}>Caption</Text>
            </View>
            <TextInput
              placeholder="What're you up to?"
              placeholderTextColor={Colors.surfaceRaised}
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline
              maxLength={160}
            />
            <Text style={styles.charCount}>{description.length}/160</Text>
          </View>

          {/* ── Photos card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="images-outline" size={16} color={Colors.accent} />
              <Text style={styles.cardLabel}>Photos</Text>
              <Text style={styles.slotBadge}>
                {photos.length}/{MAX_PHOTOS}
              </Text>
            </View>

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={[
                  styles.photoBtn,
                  photos.length >= MAX_PHOTOS && styles.photoBtnDisabled,
                ]}
                onPress={handleCamera}
                disabled={photos.length >= MAX_PHOTOS}
                activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={20} color={Colors.onAccent} />
                <Text style={styles.photoBtnText}>{isAr ? 'الكاميرا' : 'Camera'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.photoBtn,
                  photos.length >= MAX_PHOTOS && styles.photoBtnDisabled,
                ]}
                onPress={handleGallery}
                disabled={photos.length >= MAX_PHOTOS}
                activeOpacity={0.8}>
                <Ionicons name="image-outline" size={20} color={Colors.onAccent} />
                <Text style={styles.photoBtnText}>{isAr ? 'الصور' : 'Gallery'}</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 ? (
              <FlatList
                horizontal
                data={photos}
                keyExtractor={item => item.id}
                style={styles.thumbList}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                  <PhotoCard
                    entry={item}
                    onRemove={() => removePhoto(item.id)}
                  />
                )}
              />
            ) : (
              <View style={styles.emptyPhotos}>
                <Ionicons name="images-outline" size={32} color={WHITE_10} />
                <Text style={styles.emptyPhotosText}>
                  Add at least one photo
                </Text>
              </View>
            )}
          </View>

          {/* ── Check-in button ── */}
          <TouchableOpacity
            style={[styles.checkInBtn, isDisabled && styles.checkInBtnOff]}
            onPress={handleCheckIn}
            disabled={isDisabled}
            activeOpacity={0.85}>
            {uploading ? (
              <ActivityIndicator color={Colors.onAccent} />
            ) : (
              <>
                <Ionicons name="pin" size={18} color={Colors.onAccent} />
                <Text style={styles.checkInText}>Check in</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TimelineScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {flex:1, marginTop:10, backgroundColor: Colors.background},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    marginBottom:10
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: WHITE},
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 46,
    borderRadius: 6,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 1,
    paddingBottom: 40,
    gap: 14,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    flex: 1,
  },

  // Location states
  locationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  locationLoadingText: {fontSize: 14, color: Colors.textPrimary},
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
  },
  errorText: {fontSize: 13, color: Colors.accent, flex: 1},
  locationName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 10,
    lineHeight: 18,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  changeText: {fontSize: 13, fontWeight: '600', color: Colors.textPrimary},

  // Search
  searchWrap: {
    marginTop: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingRight: 36,
    color: Colors.textPrimary,
    alignItems:'center',
    justifyContent:'center',
  },
  searchClearBtn: {
    position: 'absolute',
    right: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Suggestions
  suggestionBox: {
    marginTop: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: WHITE_10,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceRaised,
    maxHeight: 220,
  },
  suggestionLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  suggestionLoaderText: {fontSize: 13, color: Colors.textPrimary},
  emptyText: {
    color: WHITE,
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WHITE_10,
    gap: 10,
  },
  suggestionItemActive: {backgroundColor: Colors.background},
  suggestionLeft: {width: 20, alignItems: 'center'},
  suggestionRight: {flex: 1},
  suggestionName: {fontSize: 14, fontWeight: '600', color: Colors.textPrimary},
  suggestionNameActive: {color: Colors.textPrimary},
  suggestionVicinity: {fontSize: 13, color: Colors.textSecondary, marginTop: 2},
  suggestionVicinityActive:{color: Colors.textSecondary},

  // Caption
  input: {
    height: 90,
    color: Colors.textPrimary,
    fontSize: 15,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginTop: 6,
  },

  // Photos
  slotBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoActions: {flexDirection: 'row', gap: 10, marginBottom: 4},
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Colors.accent,
    paddingVertical: 13,
    borderRadius: 12,

    borderColor: Colors.surfaceRaised,
  },
  photoBtnDisabled: {opacity: 0.35},
  photoBtnText: {fontSize: 14, fontWeight: '600', color: Colors.onAccent},
  thumbList: {marginTop: 12},
  emptyPhotos: {alignItems: 'center', paddingVertical: 20, gap: 8},
  emptyPhotosText: {fontSize: 13, color: WHITE_60},

  // Check-in button
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 28,
  },
  checkInBtnOff: {opacity: 0.45},
  checkInText: {fontSize: 16, fontWeight: '700', color: Colors.onAccent},
});
