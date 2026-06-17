
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import storage from '@react-native-firebase/storage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {BASE_URL} from '../../../config/api';
import {
  ensureLocationPermission,
  getDeviceLocation,
} from '../../utils/getDeviceLocation';
import { Colors } from '../../Themes/Colors';

// ─── Constants ────────────────────────────────────────────────────────────────

// Same key as MapScreen — no separate export needed
const GOOGLE_MAPS_API_KEY = 'AIzaSyB6CWvlf9f5twQnSjWbEjeNrxmGW2DOins';

const NEARBY_RADIUS = 2000; // metres — same as MapScreen suggestions call
const MAX_PHOTOS = 2;
const SEARCH_DEBOUNCE_MS = 350;

const PURPLE = '#6C4EFF';
const BG = '#1A1A2E';
const CARD_BG = '#16213E';
const SURFACE = '#0F3460';
const WHITE = '#FFFFFF';
const WHITE_60 = 'rgba(255,255,255,0.6)';
const WHITE_30 = 'rgba(255,255,255,0.3)';
const WHITE_10 = 'rgba(255,255,255,0.1)';

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoEntry = {
  id: string;
  uri: string;
  progress: number | null;
  downloadUrl: string | null;
  error: boolean;
};

type Coords = {latitude: number; longitude: number};

type NearbyPlace = {
  placeId: string;
  name: string;
  vicinity: string;
  lat?: number;
  lng?: number;
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
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  pct: {color: WHITE, fontSize: 13, fontWeight: '700', marginBottom: 6},
  trackBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {height: '100%', backgroundColor: Colors.dargBg, borderRadius: 2},
  doneBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBadge: {backgroundColor: '#ef4444'},
  badgeText: {color: WHITE, fontSize: 11, fontWeight: '800'},
  remove: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {color: WHITE, fontSize: 10, fontWeight: '700'},
});

// ─── TimelineScreen ───────────────────────────────────────────────────────────

const TimelineScreen: React.FC = () => {
  const navigation = useNavigation();

  // ── Location ────────────────────────────────────────────────────────────────
  const [coords, setCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // ── Nearby places ───────────────────────────────────────────────────────────
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  // ── Form ────────────────────────────────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [uploading, setUploading] = useState(false);

  // ── Search location ─────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<NearbyPlace[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placeDetailsLoadingRef = useRef<string | null>(null);

  // ── 1. GPS — exact same flow as MapScreen ──────────────────────────────────

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);

    const permitted = await ensureLocationPermission();
    if (!permitted) {
      setLocationError('Location permission denied. Tap to retry.');
      setLocationLoading(false);
      return;
    }

    try {
      const c = await getDeviceLocation();
      setCoords(c);
      // Run geocode + nearby in parallel, don't block each other
      reverseGeocode(c.latitude, c.longitude);
      fetchNearby(c.latitude, c.longitude);
    } catch (err: any) {
      console.log('[Timeline] getDeviceLocation error:', err);
      setLocationError('Could not get your location. Tap to retry.');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Reverse geocode — same logic as MapScreen.resolveLocationMeta ────────

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/geocode/json` +
        `?latlng=${lat},${lng}` +
        `&key=${GOOGLE_MAPS_API_KEY}` +
        `&language=en` +
        `&result_type=neighborhood|sublocality|locality`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status === 'OK' && json.results?.length > 0) {
        const components: {types: string[]; long_name: string}[] =
          json.results[0].address_components ?? [];

        const pick = (type: string) =>
          components.find(c => c.types.includes(type))?.long_name ?? null;

        const name =
          pick('neighborhood') ??
          pick('sublocality_level_1') ??
          pick('sublocality') ??
          pick('locality') ??
          pick('administrative_area_level_2') ??
          pick('administrative_area_level_1') ??
          json.results[0].formatted_address?.split(',')[0] ??
          null;

        if (name) setAddress(name);
      }
    } catch (err) {
      console.log('[Timeline] reverseGeocode error:', err);
    }

    // Also try backend for locationId — same as MapScreen
    try {
      const locRes = await axios.post(`${BASE_URL}/api/hbs/map/location`, {
        lat,
        lng,
      });
      const locData = locRes?.data?.data ?? locRes?.data;
      if (locData?.name) setAddress(locData.name);
      if (locData?._id) setLocationId(locData._id);
    } catch (err) {
      console.log('[Timeline] backend location error:', err);
    }
  };

  // ── 3. Nearby places — Google Places Nearby Search ──────────────────────────

  const fetchNearby = async (lat: number, lng: number) => {
    setNearbyLoading(true);

    try {
      // First try your backend suggestions (same as MapScreen)
      const sugRes = await axios.get(`${BASE_URL}/api/hbs/map/suggestions`, {
        params: {lat, lng, radius: NEARBY_RADIUS, limit: 10},
      });
      const sugData = sugRes?.data?.data;
      if (Array.isArray(sugData) && sugData.length > 0) {
        setNearbyPlaces(
          sugData.map((s: any) => ({
            placeId: s.placeId ?? s._id ?? String(Math.random()),
            name: s.name,
            vicinity: s.vicinity ?? s.address ?? '',
            lat: s.lat ?? s.location?.lat,
            lng: s.lng ?? s.location?.lng,
          })),
        );
        return;
      }
    } catch {
      // fallback to Google Places below
    }

    // Fallback: Google Places Nearby Search
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lng}` +
        `&radius=${NEARBY_RADIUS}` +
        `&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const places: NearbyPlace[] = (json.results ?? [])
        .slice(0, 10)
        .map((p: any) => ({
          placeId: p.place_id,
          name: p.name,
          vicinity: p.vicinity ?? '',
          lat: p.geometry?.location?.lat,
          lng: p.geometry?.location?.lng,
        }));
      setNearbyPlaces(places);
    } catch (err) {
      console.log('[Timeline] fetchNearby Google error:', err);
    } finally {
      setNearbyLoading(false);
    }
  };

  // ── 4. Search any location — Places Autocomplete (debounced) ───────────────

  const searchPlaces = useCallback(
    (text: string) => {
      setSearchText(text);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      const trimmed = text.trim();
      if (trimmed.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        setSearchLoading(false);
        return;
      }

      setShowSearchResults(true);
      setSearchLoading(true);

      searchDebounceRef.current = setTimeout(async () => {
        try {
          let url =
            `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
            `?input=${encodeURIComponent(trimmed)}` +
            `&key=${GOOGLE_MAPS_API_KEY}`;

          // Bias results toward current location, if available
          if (coords) {
            url +=
              `&location=${coords.latitude},${coords.longitude}` +
              `&radius=${NEARBY_RADIUS}`;
          }

          const res = await fetch(url);
          const json = await res.json();

          const results: NearbyPlace[] =
            json.predictions?.map((item: any) => ({
              placeId: item.place_id,
              name: item.structured_formatting?.main_text || item.description,
              vicinity: item.structured_formatting?.secondary_text || '',
            })) || [];

          setSearchResults(results);
        } catch (error) {
          console.log('[Timeline] Search place error', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [coords],
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchLoading(false);
  };

  // ── 5. Get coordinates for a place (Place Details) ──────────────────────────

  const resolvePlaceCoords = async (
    placeId: string,
  ): Promise<{lat: number; lng: number} | null> => {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/details/json` +
        `?place_id=${encodeURIComponent(placeId)}` +
        `&fields=geometry,formatted_address` +
        `&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json?.result?.geometry?.location;
      if (loc?.lat != null && loc?.lng != null) {
        return {lat: loc.lat, lng: loc.lng};
      }
    } catch (err) {
      console.log('[Timeline] resolvePlaceCoords error:', err);
    }
    return null;
  };

  // ── 6. Pick a place (from nearby OR search results) ─────────────────────────

  const handlePickPlace = async (place: NearbyPlace) => {
    // Close both suggestion UIs and reset search text
    setShowSuggestions(false);
    clearSearch();

    let lat = place.lat ?? coords?.latitude;
    let lng = place.lng ?? coords?.longitude;

    // If we don't have coordinates yet (e.g. from autocomplete), resolve them
    if (place.lat == null || place.lng == null) {
      placeDetailsLoadingRef.current = place.placeId;
      const resolved = await resolvePlaceCoords(place.placeId);
      if (resolved) {
        lat = resolved.lat;
        lng = resolved.lng;
      }
      placeDetailsLoadingRef.current = null;
    }

    const finalPlace: NearbyPlace = {...place, lat, lng};
    setSelectedPlace(finalPlace);

    if (lat != null && lng != null) {
      setCoords({latitude: lat, longitude: lng});
    }
    if (!place.vicinity && finalPlace.name) {
      setAddress(finalPlace.name);
    }

    // Try to create/get location doc on backend
    try {
      const token = await AsyncStorage.getItem('hala_token');
      const headers = token ? {Authorization: `Bearer ${token}`} : undefined;
      const locRes = await axios.post(
        `${BASE_URL}/api/hbs/map/location`,
        {
          name: finalPlace.name,
          address: finalPlace.vicinity,
          placeId: finalPlace.placeId,
          lat,
          lng,
        },
        {headers},
      );
      const id = locRes?.data?.data?._id ?? locRes?.data?._id ?? null;
      if (id) setLocationId(id);
    } catch (err) {
      console.log('[Timeline] handlePickPlace error:', err);
    }
  };

  // ── 7. Camera & Gallery — exact same as MapScreen ──────────────────────────

  const handleCamera = useCallback(() => {
    launchCamera(
      {mediaType: 'photo', quality: 0.8, saveToPhotos: true},
      response => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) addPhoto(uri);
      },
    );
  }, [photos]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGallery = useCallback(() => {
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
    if (!coords) {
      Alert.alert('No location', 'Waiting for your location…');
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('hala_token');
      const headers = token ? {Authorization: `Bearer ${token}`} : undefined;

      // Resolve location id
      let targetId = locationId;
      if (!targetId) {
        const locRes = await axios.post(
          `${BASE_URL}/api/hbs/map/location`,
          {
            name: selectedPlace?.name ?? address ?? 'Timeline Check-in',
            address: selectedPlace?.vicinity ?? address ?? '',
            lat: coords.latitude,
            lng: coords.longitude,
          },
          {headers},
        );
        targetId = locRes?.data?.data?._id ?? locRes?.data?._id ?? null;
      }

      if (!targetId) {
        Alert.alert('Location error', 'Unable to resolve location.');
        return;
      }

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
      setSelectedPlace(null);
      setLocationId(null);
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
        err?.response?.data?.message || 'Could not upload check-in.',
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
    uploading || !photos.length || anyActiveUpload || locationLoading;

  const displayName = selectedPlace?.name ?? address;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dargBg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timeline</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="close" size={22} color={WHITE} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Location card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={16} color={Colors.btnRed} />
              <Text style={styles.cardLabel}>Location</Text>
              {nearbyLoading && (
                <ActivityIndicator size="small" color={Colors.grey} />
              )}
            </View>

            {locationLoading ? (
              <View style={styles.locationLoadingRow}>
                <ActivityIndicator size="small" color={Colors.grey} />
                <Text style={styles.locationLoadingText}>
                  Fetching your location…
                </Text>
              </View>
            ) : locationError ? (
              <TouchableOpacity
                style={styles.errorRow}
                onPress={fetchLocation}
                activeOpacity={0.7}>
                <Ionicons name="refresh" size={15} color={Colors.btnRed} />
                <Text style={styles.errorText}>{locationError}</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.locationName} numberOfLines={1}>
                  {displayName || 'Resolving address…'}
                </Text>

                {selectedPlace && address ? (
                  <Text style={styles.addressLine} numberOfLines={2}>
                    {address}
                  </Text>
                ) : null}

                {/* ── Search any location ── */}
                <View style={styles.searchWrap}>
                  <TextInput
                    placeholder="Search any location..."
                    placeholderTextColor={Colors.grey}
                    value={searchText}
                    onChangeText={searchPlaces}
                    style={styles.searchInput}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity
                      style={styles.searchClearBtn}
                      onPress={clearSearch}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Ionicons name="close-circle" size={18} color={Colors.Red} />
                    </TouchableOpacity>
                  )}
                </View>

                {showSearchResults && (
                  <View style={styles.suggestionBox}>
                    {searchLoading ? (
                      <View style={styles.suggestionLoader}>
                        <ActivityIndicator size="small" color={Colors.grey} />
                        <Text style={styles.suggestionLoaderText}>
                          Searching…
                        </Text>
                      </View>
                    ) : searchResults.length === 0 ? (
                      <Text style={styles.emptyText}>No results found</Text>
                    ) : (
                      <FlatList
                        data={searchResults}
                        keyExtractor={item => item.placeId}
                        scrollEnabled={false}
                        renderItem={({item}) => (
                          <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handlePickPlace(item)}
                            activeOpacity={0.7}>
                            <View style={styles.suggestionLeft}>
                              <Ionicons
                                name="location-outline"
                                size={15}
                                color={Colors.grey}
                              />
                            </View>
                            <View style={styles.suggestionRight}>
                              <Text style={styles.suggestionName}>
                                {item.name}
                              </Text>
                              {!!item.vicinity && (
                                <Text
                                  style={styles.suggestionVicinity}
                                  numberOfLines={1}>
                                  {item.vicinity}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.changeRow}
                  onPress={() => setShowSuggestions(p => !p)}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={showSuggestions ? 'chevron-up' : 'swap-horizontal'}
                    size={13}
                    color={Colors.btnRed}
                  />
                  <Text style={styles.changeText}>
                    {showSuggestions
                      ? 'Hide nearby places'
                      : 'Change location'}
                  </Text>
                </TouchableOpacity>

                {showSuggestions && (
                  <View style={styles.suggestionBox}>
                    {nearbyLoading ? (
                      <View style={styles.suggestionLoader}>
                        <ActivityIndicator size="small" color={Colors.grey} />
                        <Text style={styles.suggestionLoaderText}>
                          Loading nearby places…
                        </Text>
                      </View>
                    ) : nearbyPlaces.length === 0 ? (
                      <Text style={styles.emptyText}>
                        No nearby places found
                      </Text>
                    ) : (
                      <FlatList
                        data={nearbyPlaces}
                        keyExtractor={item => item.placeId}
                        scrollEnabled={false}
                        renderItem={({item}) => {
                          const isActive =
                            selectedPlace?.placeId === item.placeId;
                          return (
                            <TouchableOpacity
                              style={[
                                styles.suggestionItem,
                                isActive && styles.suggestionItemActive,
                              ]}
                              onPress={() => handlePickPlace(item)}
                              activeOpacity={0.7}>
                              <View style={styles.suggestionLeft}>
                                <Ionicons
                                  name={
                                    isActive
                                      ? 'location'
                                      : 'location-outline'
                                  }
                                  size={15}
                                  color={isActive ? Colors.btnRed : WHITE_60}
                                />
                              </View>
                              <View style={styles.suggestionRight}>
                                <Text
                                  style={[
                                    styles.suggestionName,
                                    isActive && styles.suggestionNameActive,
                                  ]}>
                                  {item.name}
                                </Text>
                                {!!item.vicinity && (
                                  <Text
                                    style={styles.suggestionVicinity}
                                    numberOfLines={1}>
                                    {item.vicinity}
                                  </Text>
                                )}
                              </View>
                              {isActive && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={18}
                                  color={Colors.btnRed}
                                />
                              )}
                            </TouchableOpacity>
                          );
                        }}
                      />
                    )}
                  </View>
                )}
              </>
            )}
          </View>

          {/* ── Caption card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="create-outline" size={16} color={Colors.btnRed} />
              <Text style={styles.cardLabel}>Caption</Text>
            </View>
            <TextInput
              placeholder="What're you up to?"
              placeholderTextColor={Colors.grey}
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
              <Ionicons name="images-outline" size={16} color={Colors.btnRed} />
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
                <Ionicons name="camera-outline" size={20} color={WHITE} />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.photoBtn,
                  photos.length >= MAX_PHOTOS && styles.photoBtnDisabled,
                ]}
                onPress={handleGallery}
                disabled={photos.length >= MAX_PHOTOS}
                activeOpacity={0.8}>
                <Ionicons name="image-outline" size={20} color={WHITE} />
                <Text style={styles.photoBtnText}>Gallery</Text>
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
                <Ionicons name="camera-outline" size={32} color={WHITE_10} />
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
              <ActivityIndicator color={WHITE} />
            ) : (
              <>
                <Ionicons name="pin" size={18} color={WHITE} />
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
  container: {flex: 1, backgroundColor: Colors.dargBg},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: WHITE},
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.dargBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },

  card: {
    backgroundColor: Colors.White,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.darkgrey,
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
    color: Colors.grey,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },

  // Location states
  locationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  locationLoadingText: {fontSize: 14, color: Colors.grey},
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
  },
  errorText: {fontSize: 13, color: Colors.btnRed, flex: 1},
  locationName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dargBg,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 12,
    color: Colors.grey,
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
  changeText: {fontSize: 13, fontWeight: '600', color: Colors.grey},

  // Search
  searchWrap: {
    marginTop: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: Colors.darkgrey,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingRight: 36,
    color: Colors.dargBg,
  },
  searchClearBtn: {
    position: 'absolute',
    right: 10,
    height: 45,
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
    backgroundColor: Colors.cardBg,
  },
  suggestionLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  suggestionLoaderText: {fontSize: 13, color: Colors.grey},
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
  suggestionItemActive: {backgroundColor: Colors.dargBg},
  suggestionLeft: {width: 20, alignItems: 'center'},
  suggestionRight: {flex: 1},
  suggestionName: {fontSize: 14, fontWeight: '600', color: Colors.grey},
  suggestionNameActive: {color: Colors.Red},
  suggestionVicinity: {fontSize: 12, color: Colors.grey, marginTop: 2},

  // Caption
  input: {
    height: 90,
    color: Colors.dargBg,
    fontSize: 15,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    color: Colors.grey,
    textAlign: 'right',
    marginTop: 6,
  },

  // Photos
  slotBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.btnRed,
    backgroundColor: Colors.dargBg,
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
    backgroundColor: Colors.Red,
    paddingVertical: 13,
    borderRadius: 12,

    borderColor: Colors.grey,
  },
  photoBtnDisabled: {opacity: 0.35},
  photoBtnText: {fontSize: 14, fontWeight: '600', color: WHITE},
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
    backgroundColor: Colors.Red,
    paddingVertical: 16,
    borderRadius: 28,
  },
  checkInBtnOff: {opacity: 0.45},
  checkInText: {fontSize: 16, fontWeight: '700', color: WHITE},
});