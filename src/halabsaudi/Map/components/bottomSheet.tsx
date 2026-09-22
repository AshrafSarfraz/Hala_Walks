import {Text} from '../../../ui/Text';
import {TextInput} from '../../../ui/TextInput';
// /src/halabsaudi/Map/components/bottomSheet.tsx

import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList, Image, Animated} from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import storage from '@react-native-firebase/storage';
import {BASE_URL} from '../../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import type {PlaceSuggestion} from '../mapScreen';
import {Colors} from '../../Themes/Colors';
import ActivityIndicatorModal from '../../Component/Loader/ActivityIndicator';
import {useCustomAlert} from './customAlert'

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoEntry = {
  id: string;
  uri: string;
  /** Upload progress 0–100. null = not started */
  progress: number | null;
  downloadUrl: string | null;
  error: boolean;
};

/** A place the user searched on the map (name + full address string, no coords) */
export type SearchedLocation = {
  name: string;
  address: string;
};

/**
 * Which location the check-in is posted against.
 * 'current'  → GPS coords + address from parent
 * 'searched' → searchedLocation prop (address string / server geocodes)
 */
type LocationMode = 'current' | 'searched';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => Promise<{uri?: string} | null>;
  onGallery: () => Promise<{uri?: string} | null>;
  currentLocation: {latitude: number; longitude: number} | null;
  address: string;
  locationId: string | null;
  suggestions: PlaceSuggestion[];
  onLocationNameChanged: (newName: string) => void;
  /** Place selected from the map search bar */
  searchedLocation?: SearchedLocation | null;
};

const MAX_PHOTOS = 2;

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
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    marginRight: 10,
  },
  image: {width: '100%', height: '100%'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  pct: {color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 6},
  trackBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {height: '100%', backgroundColor: '#6C4EFF', borderRadius: 2},
  doneBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBadge: {backgroundColor: '#ef4444'},
  badgeText: {color: '#fff', fontSize: 11, fontWeight: '800'},
  remove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {color: '#fff', fontSize: 10, fontWeight: '700'},
});

// ─── LocationToggle ───────────────────────────────────────────────────────────
// Pill switcher shown when a searched location exists.

const LocationToggle = ({
  mode,
  currentLabel,
  searchedLabel,
  onChange,
}: {
  mode: LocationMode;
  currentLabel: string;
  searchedLabel: string;
  onChange: (m: LocationMode) => void;
}) => (
  <View style={toggleStyles.wrapper}>
    <Text style={toggleStyles.label}>Post location</Text>
    <View style={toggleStyles.row}>
      <TouchableOpacity
        style={[
          toggleStyles.pill,
          mode === 'current' && toggleStyles.pillActive,
        ]}
        onPress={() => onChange('current')}
        activeOpacity={0.8}>
        <Ionicons
          name="location"
          size={12}
          color={mode === 'current' ? '#fff' : '#6C4EFF'}
        />
        <Text
          style={[
            toggleStyles.pillText,
            mode === 'current' && toggleStyles.pillTextActive,
          ]}>
          My Location
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          toggleStyles.pill,
          mode === 'searched' && toggleStyles.pillActive,
        ]}
        onPress={() => onChange('searched')}
        activeOpacity={0.8}>
        <Ionicons
          name="search"
          size={12}
          color={mode === 'searched' ? '#fff' : '#6C4EFF'}
        />
        <Text
          style={[
            toggleStyles.pillText,
            mode === 'searched' && toggleStyles.pillTextActive,
          ]}
          numberOfLines={1}>
          {searchedLabel}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const toggleStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#343841',
    backgroundColor: '#191B20',
  },
  pillActive: {
    backgroundColor: '#6C4EFF',
    borderColor: '#6C4EFF',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C4EFF',
    flexShrink: 1,
  },
  pillTextActive: {
    color: '#fff',
  },
});

// ─── BottomSheet ──────────────────────────────────────────────────────────────

const BottomSheet = ({
  visible,
  onClose,
  onCamera,
  onGallery,
  currentLocation,
  address,
  locationId,
  suggestions,
  onLocationNameChanged,
  searchedLocation,
}: Props) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [displayName, setDisplayName] = useState(
    address || 'Current Location',
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [renamingLocation, setRenamingLocation] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>('current');
  const {alert, AlertComponent} = useCustomAlert();

  // Reset mode to 'current' when a new searched location arrives
  useEffect(() => {
    if (searchedLocation) setLocationMode('current');
  }, [searchedLocation]);

  // Sync display name with active mode
  useEffect(() => {
    if (locationMode === 'searched' && searchedLocation) {
      setDisplayName(searchedLocation.name);
    } else if (address && address !== 'Current Location') {
      setDisplayName(address);
    }
  }, [locationMode, searchedLocation, address]);

  // Keep current-mode name fresh as parent resolves GPS address
  useEffect(() => {
    if (locationMode === 'current' && address && address !== 'Current Location') {
      setDisplayName(address);
    }
  }, [address, locationMode]);

  // Reset when sheet closes
  useEffect(() => {
    if (!visible) {
      setPhotos([]);
      setDescription('');
      setShowSuggestions(false);
      setLocationMode('current');
    }
  }, [visible]);

  // ─── Photo helpers ────────────────────────────────────────────────────────

  const makeEntry = (uri: string): PhotoEntry => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    uri,
    progress: null,
    downloadUrl: null,
    error: false,
  });

  const addPhoto = (asset: any) => {
    if (!asset?.uri) return;
    if (photos.length >= MAX_PHOTOS) {
      alert('Limit reached', `Max ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    setPhotos(prev => [...prev, makeEntry(asset.uri)]);
  };

  const removePhoto = (id: string) =>
    setPhotos(prev => prev.filter(p => p.id !== id));

  const patchPhoto = (id: string, patch: Partial<PhotoEntry>) =>
    setPhotos(prev => prev.map(p => (p.id === id ? {...p, ...patch} : p)));

  const handleCamera = async () => addPhoto(await onCamera());
  const handleGallery = async () => addPhoto(await onGallery());

  // ─── Suggestion picker (GPS mode only) ───────────────────────────────────

  const handleToggleSuggestions = () => {
    if (!suggestions.length) {
      alert('No nearby places', 'No suggestions found near you.');
      return;
    }
    setShowSuggestions(prev => !prev);
  };

  const handlePickSuggestion = async (s: PlaceSuggestion) => {
    setShowSuggestions(false);
    setDisplayName(s.name);
    onLocationNameChanged(s.name);
    if (!locationId) return;
    try {
      setRenamingLocation(true);
      const token = await AsyncStorage.getItem('hala_token');
      await axios.patch(
        // ✅ FIX: URL me `/map` missing tha.
        //    Frontend: /api/hbs/location/:id/name
        //    Backend:  /api/hbs/map/location/:id/name   ← sahi
        //    Is wajah se location rename HAMESHA 404 deta tha, aur naam
        //    kabhi save nahi hota tha (error catch me chup-chaap chala jata).
        `${BASE_URL}/api/hbs/map/location/${locationId}/name`,
        {name: s.name},
        token ? {headers: {Authorization: `Bearer ${token}`}} : undefined,
      );
    } catch (err) {
      console.log('[handlePickSuggestion] PATCH failed:', err);
    } finally {
      setRenamingLocation(false);
    }
  };

  // ─── Check-in / upload ────────────────────────────────────────────────────

  const handleCheckIn = async () => {
    if (!photos.length) {
      alert('Missing photo', 'Please add at least one photo.');
      return;
    }

    const isRemote = locationMode === 'searched' && !!searchedLocation;

    if (!isRemote && !currentLocation) {
      alert('Missing location', 'Unable to detect your location.');
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('hala_token');
      const headers = token ? {Authorization: `Bearer ${token}`} : undefined;

      // 1. Resolve / create the location document on the server
      let targetId = isRemote ? null : locationId;

      if (!targetId) {
        const body = isRemote
          ? {
              name: searchedLocation!.name,
              address: searchedLocation!.address,
              remote: true,
            }
          : {
              lat: currentLocation!.latitude,
              lng: currentLocation!.longitude,
            };

        const locRes = await axios.post(
          `${BASE_URL}/api/hbs/map/location`,
          body,
          {headers},
        );
        targetId =
          locRes?.data?.data?._id ?? locRes?.data?._id ?? null;
      }

      if (!targetId) {
        alert('Location error', 'Unable to resolve location.');
        return;
      }

      // 2. Upload all photos to Firebase Storage
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
              console.log('[Firebase upload error]', err);
              patchPhoto(entry.id, {error: true});
              return {ok: false as const, url: null};
            }),
        ),
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length) {
        alert(
          'Upload error',
          `${failed.length} photo(s) failed. Remove them and try again.`,
        );
        return;
      }

      // 3. Save Firebase URLs to backend
      await Promise.all(
        results.map(({url}) =>
          axios.post(
            `${BASE_URL}/api/hbs/map/photos`,
            {
              locationId: targetId,
              image: url,
              caption: description?.trim() || 'Uploaded from app',
            },
            {headers},
          ),
        ),
      );

      alert('Success', 'Check-in uploaded 🎉');
      setDescription('');
      setPhotos([]);
      setShowSuggestions(false);
      onClose();
    } catch (error) {
      const err = error as any;
      console.log(
        '[handleCheckIn]',
        err?.response?.status,
        err?.response?.data || err?.message,
      );
      alert(
        'Upload failed',
        err?.response?.data?.message || 'Could not upload your check-in.',
      );
    } finally {
      setUploading(false);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────

  const anyActiveUpload = photos.some(
    p => p.progress !== null && p.progress < 100 && !p.error,
  );
  const isCheckInDisabled = uploading || !photos.length || anyActiveUpload;
  const showChangeLocation = locationMode === 'current';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        style={styles.modal}
        avoidKeyboard>
        <View style={styles.container}>

          {/* ── Drag handle ── */}
          <View style={styles.handle} />

          {/* ── Location toggle (only when a searched place exists) ── */}
          {!!searchedLocation && (
            <LocationToggle
              mode={locationMode}
              currentLabel={address || 'My Location'}
              searchedLabel={searchedLocation.name}
              onChange={mode => {
                setLocationMode(mode);
                if (mode === 'searched') setShowSuggestions(false);
              }}
            />
          )}

          {/* ── Place name row ── */}
          <View style={styles.locationRow}>
            {renamingLocation ? (
              // <ActivityIndicator size="small" color="#6C4EFF" />
              <ActivityIndicatorModal visible={renamingLocation} />
            ) : (
              <Text style={styles.title} numberOfLines={1}>
                {displayName}
              </Text>
            )}
            {locationMode === 'searched' && (
              <View style={styles.remoteBadge}>
                <Text style={styles.remoteBadgeText}>Remote</Text>
              </View>
            )}
          </View>

          {/* ── "Change location" link (current-GPS mode only) ── */}
          {showChangeLocation && (
            <TouchableOpacity
              style={styles.changeRow}
              onPress={handleToggleSuggestions}>
              <Ionicons
                name={showSuggestions ? 'chevron-up' : 'swap-horizontal'}
                size={13}
                color="#6C4EFF"
              />
              <Text style={styles.changeLocation}>
                {showSuggestions ? 'Hide suggestions' : 'Change location'}
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Suggestion picker ── */}
          {showChangeLocation && showSuggestions && (
            <View style={styles.suggestionList}>
              <FlatList
                data={suggestions}
                keyExtractor={item => item.placeId}
                style={{maxHeight: 180}}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handlePickSuggestion(item)}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    {!!item.vicinity && (
                      <Text
                        style={styles.suggestionVicinity}
                        numberOfLines={1}>
                        {item.vicinity}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No nearby places found</Text>
                }
              />
            </View>
          )}

          {/* ── Remote info callout ── */}
          {locationMode === 'searched' && (
            <View style={styles.remoteInfo}>
              <Ionicons name="globe-outline" size={14} color="#6C4EFF" />
              <Text style={styles.remoteInfoText}>
                Your photo will be posted at{' '}
                <Text style={styles.remoteInfoBold}>
                  {searchedLocation?.name}
                </Text>
                , regardless of where you are right now.
              </Text>
            </View>
          )}

          {/* ── Description ── */}
          <TextInput
            placeholder="What're you up to?"
            placeholderTextColor="#bbb"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            maxLength={160}
          />

          {/* ── Photo buttons ── */}
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={[
                styles.addPhotoBtn,
                photos.length >= MAX_PHOTOS && styles.addPhotoBtnDisabled,
              ]}
              onPress={handleCamera}
              disabled={photos.length >= MAX_PHOTOS}>
              <Ionicons name="camera-outline" size={18} color='#F5F6F8' />
              <Text style={styles.addPhotoText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addPhotoBtn,
                photos.length >= MAX_PHOTOS && styles.addPhotoBtnDisabled,
              ]}
              onPress={handleGallery}
              disabled={photos.length >= MAX_PHOTOS}>
              <Ionicons name="image-outline" size={18} color='#F5F6F8' />
              <Text style={styles.addPhotoText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* ── Slot counter ── */}
          <Text style={styles.slotCounter}>
            {photos.length} / {MAX_PHOTOS} photos
          </Text>

          {/* ── Photo thumbnails ── */}
          {photos.length > 0 && (
            <FlatList
              horizontal
              data={photos}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <PhotoCard entry={item} onRemove={() => removePhoto(item.id)} />
              )}
            />
          )}

          {/* ── Check-in button ── */}
          <TouchableOpacity
            style={[
              styles.checkInBtn,
              isCheckInDisabled && styles.checkInBtnDisabled,
            ]}
            onPress={handleCheckIn}
            disabled={isCheckInDisabled}>
            {uploading ? (
              // <ActivityIndicator color="#fff" />
              <ActivityIndicatorModal visible={uploading} />
            ) : (
              <Text style={styles.checkInText}>Check in</Text>
            )}
          </TouchableOpacity>

        </View>
      </Modal>

      {/* ── Custom alert modal (replaces Alert.alert) ── */}
      <AlertComponent />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modal: {justifyContent: 'flex-end', margin: 0},
  container: {
    backgroundColor: Colors.dargBg,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Drag handle
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#191B20' ,
    alignSelf: 'center',
    marginBottom: 16,
  },

  // Location row
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    minHeight: 28,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
    color: Colors.White,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 8,
  },
  changeLocation: {
    fontSize: 13,
    color: '#6C4EFF',
    fontWeight: '600',
  },

  // Remote badge
  remoteBadge: {
    backgroundColor: '#191B20',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  remoteBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C4EFF',
  },

  // Remote info callout
  remoteInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#191B20',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 2,
  },
  remoteInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#5B4DB3',
    lineHeight: 18,
  },
  remoteInfoBold: {
    fontWeight: '700',
  },

  // Suggestion list
  suggestionList: {
    borderWidth: 1,
    borderColor: '#343841',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: '#343841',
  },
  suggestionName: {fontSize: 14, fontWeight: '600', color: Colors.White},
  suggestionVicinity: {fontSize: 12, color: '#ABB2BF', marginTop: 2},
  emptyText: {color: '#ABB2BF', textAlign: 'center', paddingVertical: 10},

  // Description input
  input: {
    borderWidth: 1,
    borderColor: '#343841',
    borderRadius: 12,
    padding: 12,
    height: 88,
    marginTop: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.White,
  },

  // Photo buttons
  photoActions: {flexDirection: 'row', gap: 10, marginTop: 12},
  addPhotoBtn: {
    backgroundColor: '#191B20',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  addPhotoBtnDisabled: {opacity: 0.4},
  addPhotoText: {fontSize: 14, fontWeight: '600', color: Colors.White},
  slotCounter: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 2,
  },

  // Check-in
  checkInBtn: {
    marginTop: 16,
    backgroundColor: '#6C4EFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkInBtnDisabled: {opacity: 0.5},
  checkInText: {color: '#fff', fontSize: 16, fontWeight: '700'},
});

export default BottomSheet;