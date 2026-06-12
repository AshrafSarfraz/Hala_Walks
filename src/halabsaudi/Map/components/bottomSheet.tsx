
// /src/halabsaudi/Map/components/bottomSheet.tsx

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import storage from '@react-native-firebase/storage';
import {BASE_URL} from '../../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {PlaceSuggestion} from '../mapScreen';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type PhotoEntry = {
  /** Unique key for list rendering */
  id: string;
  /** Local file URI from camera / gallery */
  uri: string;
  /** Upload progress 0–100. null = not started yet */
  progress: number | null;
  /** Firebase download URL once upload finishes */
  downloadUrl: string | null;
  /** Upload error flag */
  error: boolean;
};

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
};

const MAX_PHOTOS = 2;

// ─────────────────────────────────────────────
// Firebase upload helper
// ─────────────────────────────────────────────

/**
 * Uploads a local file URI to Firebase Storage at mapGallery/<timestamp>_<random>.jpg
 * Fires onProgress(0-100) during the upload, then resolves with the download URL.
 */
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

// ─────────────────────────────────────────────
// PhotoCard – thumbnail with progress bar + remove button
// ─────────────────────────────────────────────

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

      {/* Uploading overlay with progress bar */}
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

      {/* ✓ done badge */}
      {isDone && (
        <View style={cardStyles.doneBadge}>
          <Text style={cardStyles.badgeText}>✓</Text>
        </View>
      )}

      {/* ! error badge */}
      {entry.error && (
        <View style={[cardStyles.doneBadge, cardStyles.errorBadge]}>
          <Text style={cardStyles.badgeText}>!</Text>
        </View>
      )}

      {/* ✕ remove button — hidden while uploading */}
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
  trackFill: {
    height: '100%',
    backgroundColor: '#6C4EFF',
    borderRadius: 2,
  },
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

// ─────────────────────────────────────────────
// BottomSheet
// ─────────────────────────────────────────────

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
}: Props) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [displayName, setDisplayName] = useState(address || 'Current Location');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [renamingLocation, setRenamingLocation] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync display name when parent resolves address
  useEffect(() => {
    if (address) setDisplayName(address);
  }, [address]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!visible) {
      setPhotos([]);
      setDescription('');
      setShowSuggestions(false);
    }
  }, [visible]);

  // ─── Photo helpers ───────────────────────────────────────────────────────

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
      Alert.alert('Limit reached', `Max ${MAX_PHOTOS} photos allowed.`);
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

  // ─── Location suggestion picker ──────────────────────────────────────────

  const handleToggleSuggestions = () => {
    if (!suggestions.length) {
      Alert.alert('No nearby places', 'No suggestions found near you.');
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

  // ─── Check-in ────────────────────────────────────────────────────────────

  const handleCheckIn = async () => {
    if (!photos.length) {
      Alert.alert('Missing photo', 'Please add at least one photo.');
      return;
    }
    if (!currentLocation) {
      Alert.alert('Missing location', 'Unable to detect your location.');
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('hala_token');
      const headers = token ? {Authorization: `Bearer ${token}`} : undefined;

      // 1. Resolve / create the MongoDB location doc
      let targetId = locationId;
      if (!targetId) {
        const locRes = await axios.post(
          `${BASE_URL}/api/hbs/map/location`,
          {lat: currentLocation.latitude, lng: currentLocation.longitude},
          {headers},
        );
        targetId = locRes?.data?.data?._id ?? locRes?.data?._id ?? null;
      }

      if (!targetId) {
        Alert.alert('Location error', 'Unable to resolve location.');
        return;
      }

      // 2. Upload all photos to Firebase Storage concurrently.
      //    Each photo shows its own live progress bar in the UI.
      const results = await Promise.all(
        photos.map(entry =>
          uploadToFirebase(entry.uri, pct => patchPhoto(entry.id, {progress: pct}))
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
        Alert.alert(
          'Upload error',
          `${failed.length} photo(s) failed. Please remove them and try again.`,
        );
        return;
      }

      // 3. Save Firebase URLs to the backend
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

      Alert.alert('Success', 'Check-in uploaded 🎉');
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
      Alert.alert(
        'Upload failed',
        err?.response?.data?.message || 'Could not upload your check-in.',
      );
    } finally {
      setUploading(false);
    }
  };

  // ─── Derived state ───────────────────────────────────────────────────────

  const anyActiveUpload = photos.some(
    p => p.progress !== null && p.progress < 100 && !p.error,
  );
  const isCheckInDisabled = uploading || !photos.length || anyActiveUpload;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>

        {/* 📍 Place name */}
        <View style={styles.locationRow}>
          {renamingLocation ? (
            <ActivityIndicator size="small" color="#6C4EFF" />
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {displayName}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleToggleSuggestions}>
          <Text style={styles.changeLocation}>
            {showSuggestions ? 'Hide suggestions' : 'Change location'}
          </Text>
        </TouchableOpacity>

        {/* 📍 Suggestion picker */}
        {showSuggestions && (
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
                    <Text style={styles.suggestionVicinity} numberOfLines={1}>
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

        {/* 📝 Description */}
        <TextInput
          placeholder="What're you up to?"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          maxLength={160}
        />

        {/* 📸 Add photo buttons – greyed when limit reached */}
        <View style={styles.photoActions}>
          <TouchableOpacity
            style={[
              styles.addPhotoBtn,
              photos.length >= MAX_PHOTOS && styles.addPhotoBtnDisabled,
            ]}
            onPress={handleCamera}
            disabled={photos.length >= MAX_PHOTOS}>
            <Text style={styles.addPhotoText}>📷  Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addPhotoBtn,
              photos.length >= MAX_PHOTOS && styles.addPhotoBtnDisabled,
            ]}
            onPress={handleGallery}
            disabled={photos.length >= MAX_PHOTOS}>
            <Text style={styles.addPhotoText}>🖼️  Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Slot counter */}
        <Text style={styles.slotCounter}>
          {photos.length} / {MAX_PHOTOS} photos
        </Text>

        {/* 📸 Thumbnails with progress + remove */}
        {photos.length > 0 && (
          <FlatList
            horizontal
            data={photos}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <PhotoCard
                entry={item}
                onRemove={() => removePhoto(item.id)}
              />
            )}
          />
        )}

        {/* ✅ Check-in */}
        <TouchableOpacity
          style={[
            styles.checkInBtn,
            isCheckInDisabled && styles.checkInBtnDisabled,
          ]}
          onPress={handleCheckIn}
          disabled={isCheckInDisabled}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkInText}>Check-in</Text>
          )}
        </TouchableOpacity>

      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  modal: {justifyContent: 'flex-end', margin: 0},
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  // Location row
  locationRow: {alignItems: 'center', minHeight: 28},
  title: {fontSize: 20, fontWeight: '700', textAlign: 'center'},
  changeLocation: {
    textAlign: 'center',
    color: '#6C4EFF',
    marginTop: 5,
    marginBottom: 10,
  },

  // Suggestion list
  suggestionList: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
  },
  suggestionName: {fontSize: 14, fontWeight: '600', color: '#111'},
  suggestionVicinity: {fontSize: 12, color: '#888', marginTop: 2},
  emptyText: {color: '#777', textAlign: 'center', paddingVertical: 10},

  // Description input
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    height: 90,
    marginTop: 10,
    textAlignVertical: 'top',
  },

  // Photo buttons
  photoActions: {flexDirection: 'row', gap: 10, marginTop: 12},
  addPhotoBtn: {
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  addPhotoBtnDisabled: {opacity: 0.4},
  addPhotoText: {fontSize: 15, fontWeight: '600'},
  slotCounter: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 2,
  },

  // Check-in
  checkInBtn: {
    marginTop: 16,
    backgroundColor: '#6C4EFF',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkInBtnDisabled: {opacity: 0.5},
  checkInText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});

export default BottomSheet;