import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';

import {BASE_URL} from '../../config/api';
import {
  ensureLocationPermission,
  getDeviceLocation,
} from '../utils/getDeviceLocation';
import BottomSheet from './components/bottomSheet';

// ─── Exported types ──────────────────────────────────────────────────────────

export type PlaceSuggestion = {
  placeId: string;
  name: string;
  vicinity: string;
  types?: string[];
  location?: {lat: number; lng: number};
};

type VenueMarker = {
  _id: string;
  type: 'venue' | 'brand';
  name: string;
  latitude: number;
  longitude: number;
  image?: string | null;
  address?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_REGION = {
  latitude: 25.2524385,
  longitude: 51.462465,
  latitudeDelta: 0.45,
  longitudeDelta: 0.45,
};

const GCC_OVERVIEW_REGION: Region = {
  latitude: 25.6,
  longitude: 50.8,
  latitudeDelta: 5.5,
  longitudeDelta: 5.5,
};

const regionFromVenues = (venues: VenueMarker[]): Region => {
  if (venues.length === 0) return GCC_OVERVIEW_REGION;
  
  const lats = venues.map(v => v.latitude);
  const lngs = venues.map(v => v.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * 0.35, 0.4);
  const lngPad = Math.max((maxLng - minLng) * 0.35, 0.4);
  
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: maxLat - minLat + latPad,
    longitudeDelta: maxLng - minLng + lngPad,
  };
};

const MAX_VISIBLE_MARKERS = 45;
const NEARBY_RADIUS_KM = 25;
const NEAR_VENUE_RADIUS_KM = 120;

const PRODUCTION_API = 'https://hala-b-saudi.onrender.com';
const VENUES_API = `${PRODUCTION_API}/api/hbs/venues`;
const BRANDS_API = `${PRODUCTION_API}/api/hbs/brands`;

// ─── Geo helpers ─────────────────────────────────────────────────────────────

const toRad = (v: number) => (v * Math.PI) / 180;

const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const parseCoord = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null || value === '') return NaN;
  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;
  const match = String(value).match(/[-+]?\d*\.?\d+/);
  return match ? Number(match[0]) : NaN;
};

const isValidCoord = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0);

const isActiveStatus = (status: unknown) =>
  String(status ?? '')
    .trim()
    .toLowerCase() === 'active';

// ─── Marker fetch / normalize ────────────────────────────────────────────────

const buildMarkersFromCatalog = (venues: any[], brands: any[]): VenueMarker[] => {
  const venueMarkers: VenueMarker[] = venues
    .map(v => {
      const latitude = parseCoord(v?.latitude);
      const longitude = parseCoord(v?.longitude);
      if (!isValidCoord(latitude, longitude)) return null;
      return {
        _id: String(v._id),
        type: 'venue' as const,
        name: String(v.venueName ?? 'Venue'),
        latitude,
        longitude,
        image: v.img ?? null,
        address: `${v.city ?? ''} ${v.country ?? ''}`.trim(),
      };
    })
    .filter((m): m is VenueMarker => m !== null);

  const brandMarkers: VenueMarker[] = brands
    .filter(b => isActiveStatus(b?.status))
    .map(b => {
      const latitude = parseCoord(b.latitude);
      const longitude = parseCoord(b.longitude);
      if (!isValidCoord(latitude, longitude)) return null;
      return {
        _id: String(b._id),
        type: 'brand' as const,
        name: String(b.nameEng ?? b.name ?? 'Brand'),
        latitude,
        longitude,
        image: b.img ?? null,
        address: b.address ?? undefined,
      };
    })
    .filter((m): m is VenueMarker => m !== null);

  return [...venueMarkers, ...brandMarkers];
};

const isNearAnyVenue = (
  coords: {latitude: number; longitude: number},
  venues: VenueMarker[],
  radiusKm = NEAR_VENUE_RADIUS_KM,
) =>
  venues.some(
    v =>
      haversineKm(coords.latitude, coords.longitude, v.latitude, v.longitude) <=
      radiusKm,
  );

const resolveMarkerFilterCenter = (
  location: {latitude: number; longitude: number} | null,
  mapCenter: {latitude: number; longitude: number} | null,
  venues: VenueMarker[],
) => {
  if (location && isNearAnyVenue(location, venues)) return location;
  return mapCenter ?? DEFAULT_REGION;
};

const pickVisibleMarkers = (
  all: VenueMarker[],
  center: {latitude: number; longitude: number},
  radiusKm = NEARBY_RADIUS_KM,
): VenueMarker[] => {
  const venues = all.filter(m => m.type === 'venue');
  const brandSlots = Math.max(0, MAX_VISIBLE_MARKERS - venues.length);

  const nearbyBrands = all
    .filter(m => m.type === 'brand')
    .map(m => ({
      ...m,
      distance: haversineKm(center.latitude, center.longitude, m.latitude, m.longitude),
    }))
    .filter(m => m.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, brandSlots)
    .map(({distance: _d, ...m}) => m);

  return [...venues, ...nearbyBrands];
};

const PIN = {
  venue: '#6C4EFF',
  brand: '#9B7BFF',
  brandFill: '#6C4EFF',
  white: '#FFFFFF',
};

const MapPin = memo(function MapPin({
  type,
  selected,
}: {
  type: 'venue' | 'brand';
  selected: boolean;
}) {
  if (type === 'venue') {
    return (
      <View collapsable={false} style={[styles.venuePin, selected && styles.pinSelected]}>
        <View style={styles.venuePinCore} />
      </View>
    );
  }
  return (
    <View
      collapsable={false}
      style={[styles.brandPin, selected && styles.pinSelected]}
    />
  );
});

const ImagePin = memo(function ImagePin({
  type,
  selected,
  imageUri,
}: {
  type: 'venue' | 'brand';
  selected: boolean;
  imageUri: string;
}) {
  const size = type === 'venue' ? 36 : 28;
  const borderColor = type === 'venue' ? PIN.venue : PIN.brandFill;

  return (
    <View
      collapsable={false}
      style={[
        styles.imagePin,
        {width: size, height: size, borderRadius: size / 2, borderColor},
        selected && styles.pinSelected,
      ]}>
      <Image
        source={{uri: imageUri}}
        style={{width: size - 4, height: size - 4, borderRadius: (size - 4) / 2}}
        resizeMode="cover"
      />
    </View>
  );
});

function CatalogMarker({
  item,
  selected,
  uploadedImage,
  onPress,
}: {
  item: VenueMarker;
  selected: boolean;
  uploadedImage?: string | null;
  onPress: () => void;
}) {
  const coordinate = {
    latitude: item.latitude,
    longitude: item.longitude,
  };

  // FIX: Android requires specific string colors or hues, NOT hex codes.
  if (Platform.OS === 'android') {
    return (
      <Marker
        coordinate={coordinate}
        pinColor={item.type === 'venue' ? 'blueviolet' : 'violet'}
        title={item.name}
        description={item.type === 'venue' ? 'Venue' : 'Brand'}
        zIndex={selected ? 10 : item.type === 'venue' ? 5 : 1}
        onPress={onPress}
      />
    );
  }

  const resolvedImage = uploadedImage ?? item.image ?? null;
  const useImagePin = !!resolvedImage;
  const [tracks, setTracks] = useState(useImagePin);

  useEffect(() => {
    if (!tracks) return;
    const t = setTimeout(() => setTracks(false), 800);
    return () => clearTimeout(t);
  }, [tracks, useImagePin]);

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={tracks}
      zIndex={selected ? 10 : 1}
      anchor={{x: 0.5, y: 0.5}}
      onPress={onPress}>
      {useImagePin ? (
        <ImagePin
          type={item.type}
          selected={selected}
          imageUri={resolvedImage as string}
        />
      ) : (
        <MapPin type={item.type} selected={selected} />
      )}
    </Marker>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const didFitRef = useRef(false);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [address, setAddress] = useState('Current Location');
  const [locationId, setLocationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);

  const [allMarkers, setAllMarkers] = useState<VenueMarker[]>([]);
  const [mapCenter, setMapCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [markersLoaded, setMarkersLoaded] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<VenueMarker | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // FIX: Force mapReady to true on Android as a fallback if onMapReady fails.
  useEffect(() => {
    if (Platform.OS === 'android') {
      const timer = setTimeout(() => setMapReady(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const animateToLocation = useCallback(
    (coords: {latitude: number; longitude: number}, delta = 0.05) => {
      const region: Region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };
      mapRef.current?.animateToRegion(region, 800);
    },
    [],
  );

  const resolveLocationMeta = useCallback(
    async (coords: {latitude: number; longitude: number}) => {
      try {
        const [locRes, sugRes] = await Promise.all([
          axios.post(`${BASE_URL}/api/hbs/map/location`, {
            lat: coords.latitude,
            lng: coords.longitude,
          }),
          axios.get(`${BASE_URL}/api/hbs/map/suggestions`, {
            params: {
              lat: coords.latitude,
              lng: coords.longitude,
              radius: 200,
              limit: 10,
            },
          }),
        ]);

        const locData = locRes?.data?.data ?? locRes?.data;
        if (locData?.name) setAddress(locData.name);
        if (locData?._id) setLocationId(locData._id);

        const sugData = sugRes?.data?.data;
        if (Array.isArray(sugData)) setSuggestions(sugData);
      } catch (err) {
        console.log('[resolveLocationMeta]', err);
        setAddress('Current Location');
        setLocationId(null);
        setSuggestions([]);
      }
    },
    [],
  );

  const applyLocation = useCallback(
    (coords: {latitude: number; longitude: number}) => {
      setLocation(coords);
      setLocationError(null);
      setLoading(false);
      animateToLocation(coords);
      resolveLocationMeta(coords);
    },
    [animateToLocation, resolveLocationMeta],
  );

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setLocationError(null);

    const permitted = await ensureLocationPermission();
    setHasLocationPermission(permitted);
    
    if (!permitted) {
      setLocationError('Location permission denied');
      setLocation(DEFAULT_REGION);
      setLoading(false);
      return;
    }

    try {
      const coords = await getDeviceLocation();
      applyLocation(coords);
    } catch (error: any) {
      console.log('[getCurrentLocation] Error:', error);
      if (error?.code === 1) {
        setHasLocationPermission(false);
        setLocationError('Location permission denied');
      } else {
        setLocationError('GPS fix timed out. Tap locate to retry.');
      }
      setLocation(DEFAULT_REGION);
      setLoading(false);
    }
  }, [applyLocation]);

  const onUserLocationChange = useCallback(
    (event: {nativeEvent: {coordinate?: {latitude: number; longitude: number}}}) => {
      const coord = event.nativeEvent.coordinate;
      if (!coord) return;

      const coords = {
        latitude: coord.latitude,
        longitude: coord.longitude,
      };

      setLocation(prev => prev ?? coords);
      setLocationError(null);
      setLoading(false);

      if (!locationId) resolveLocationMeta(coords);
    },
    [locationId, resolveLocationMeta],
  );

  const fetchVenueMarkers = useCallback(async () => {
    try {
      const [venuesRes, brandsRes] = await Promise.all([
        fetch(VENUES_API),
        fetch(BRANDS_API),
      ]);
      const venuesJson = venuesRes.ok ? await venuesRes.json() : {data: []};
      const brandsJson = brandsRes.ok ? await brandsRes.json() : {data: []};
      const venues = Array.isArray(venuesJson.data) ? venuesJson.data : [];
      const brands = Array.isArray(brandsJson.data) ? brandsJson.data : [];
      
      const markers = buildMarkersFromCatalog(venues, brands);
      setAllMarkers(markers);
      didFitRef.current = false;
    } catch (err) {
      console.log('[fetchVenueMarkers]', err);
    } finally {
      setMarkersLoaded(true);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
    fetchVenueMarkers();
  }, [getCurrentLocation, fetchVenueMarkers]);

  useEffect(() => {
    if (markersLoaded) setLoading(false);
  }, [markersLoaded]);

  const visibleMarkers = useMemo(() => {
    if (allMarkers.length === 0) return [];
    
    if (Platform.OS === 'android') {
      const venues = allMarkers.filter(m => m.type === 'venue');
      const center = resolveMarkerFilterCenter(location, mapCenter, venues);
      const nearUser = !!location && isNearAnyVenue(location, venues);
      const radiusKm = nearUser ? NEARBY_RADIUS_KM : 80;
      return pickVisibleMarkers(allMarkers, center, radiusKm);
    }
    return allMarkers;
  }, [allMarkers, location, mapCenter]);

  const fitMapToContent = useCallback(() => {
    if (!mapRef.current || allMarkers.length === 0) return false;

    const venues = allMarkers.filter(m => m.type === 'venue');
    const markersToFit = visibleMarkers.length > 0 ? visibleMarkers : allMarkers;
    const markerCoords = markersToFit.map(m => ({
      latitude: m.latitude,
      longitude: m.longitude,
    }));

    if (markerCoords.length === 0) return false;

    const userNearVenues = !!location && isNearAnyVenue(location, venues);
    const coords = userNearVenues
      ? [{latitude: location!.latitude, longitude: location!.longitude}, ...markerCoords]
      : markerCoords;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: {top: 100, right: 50, bottom: 140, left: 50},
      animated: true,
    });
    return true;
  }, [allMarkers, location, visibleMarkers]);

  useFocusEffect(
    useCallback(() => {
      didFitRef.current = false;
      const timer = setTimeout(() => {
        if (mapRef.current && allMarkers.length > 0) {
          fitMapToContent();
          didFitRef.current = true;
        }
      }, 600);
      return () => clearTimeout(timer);
    }, [allMarkers.length, fitMapToContent]),
  );

  useEffect(() => {
    if (!markersLoaded || allMarkers.length === 0 || !mapReady) return;
    
    const venues = allMarkers.filter(m => m.type === 'venue');
    const nearUser = !!location && isNearAnyVenue(location, venues);
    
    const nextRegion =
      nearUser && location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }
        : regionFromVenues(venues);
        
    mapRef.current?.animateToRegion(nextRegion, 700);
  }, [allMarkers, location, mapReady, markersLoaded]);

  const onRegionChangeComplete = useCallback((region: Region) => {
    setMapCenter({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  }, []);

  const saveUploadedImage = useCallback(
    (asset: {uri?: string} | null) => {
      if (!asset?.uri || !selectedMarker) return;
      setUploadedImages(prev => ({
        ...prev,
        [selectedMarker._id]: asset.uri as string,
      }));
    },
    [selectedMarker],
  );

  const openCamera = useCallback(async () => {
    return new Promise<{uri?: string} | null>(resolve => {
      launchCamera({mediaType: 'photo', quality: 0.8, saveToPhotos: true}, r => {
        if (r.didCancel || r.errorCode) return resolve(null);
        const asset = r.assets?.[0] ?? null;
        saveUploadedImage(asset);
        resolve(asset);
      });
    });
  }, [saveUploadedImage]);

  const openGallery = useCallback(async () => {
    return new Promise<{uri?: string} | null>(resolve => {
      launchImageLibrary({mediaType: 'photo', quality: 0.8, selectionLimit: 1}, r => {
        if (r.didCancel || r.errorCode) return resolve(null);
        const asset = r.assets?.[0] ?? null;
        saveUploadedImage(asset);
        resolve(asset);
      });
    });
  }, [saveUploadedImage]);

  // FIX: Removed `isFocused` as it causes markers to flash or hide unexpectedly
  const showMarkers = markersLoaded && visibleMarkers.length > 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        showsUserLocation={true} // FIX: Forced true so OS handles the blue dot natively
        showsMyLocationButton={false}
        moveOnMarkerPress={false}
        loadingEnabled
        initialRegion={GCC_OVERVIEW_REGION}
        onMapReady={() => setMapReady(true)}
        onUserLocationChange={onUserLocationChange}
        onRegionChangeComplete={onRegionChangeComplete}>
        {showMarkers &&
          visibleMarkers.map(item => (
            <CatalogMarker
              key={`${item.type}-${item._id}`}
              item={item}
              selected={
                selectedMarker?._id === item._id &&
                selectedMarker?.type === item.type
              }
              uploadedImage={uploadedImages[item._id] ?? null}
              onPress={() => setSelectedMarker(item)}
            />
          ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C4EFF" />
          <Text style={styles.loadingText}>Getting your location…</Text>
        </View>
      )}

      {!loading && locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && address ? (
        <View style={styles.locationBanner}>
          <Ionicons name="location" size={16} color="#6C4EFF" />
          <Text style={styles.locationBannerText} numberOfLines={1}>
            {address}
          </Text>
        </View>
      ) : null}

      <View style={styles.fabRow}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('MapProfile')}>
          <Ionicons name="person" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          onPress={() => {
            if (!location) {
              Alert.alert(
                'Location unavailable',
                'Please allow location access to check in.',
              );
              return;
            }
            setSheetVisible(true);
          }}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (location) animateToLocation(location);
            else getCurrentLocation();
          }}>
          <Ionicons name="locate" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {selectedMarker && (
        <View style={styles.markerCard}>
          <Text style={styles.markerName}>{selectedMarker.name}</Text>
          {!!selectedMarker.address && (
            <Text style={styles.markerAddress}>{selectedMarker.address}</Text>
          )}
          <TouchableOpacity onPress={() => setSelectedMarker(null)}>
            <Text style={styles.markerClose}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onCamera={openCamera}
        onGallery={openGallery}
        currentLocation={location}
        address={address}
        locationId={locationId}
        suggestions={suggestions}
        onLocationNameChanged={setAddress}
      />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#333',
  },
  errorBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#C0392B',
    marginRight: 8,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C4EFF',
  },
  locationBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  locationBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  fabRow: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C4EFF',
  },
  markerCard: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  markerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  markerAddress: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
  markerClose: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#6C4EFF',
  },
  imagePin: {
    borderWidth: 2,
    backgroundColor: PIN.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },
  venuePin: {
    width: Platform.OS === 'android' ? 32 : 24,
    height: Platform.OS === 'android' ? 32 : 24,
    borderRadius: Platform.OS === 'android' ? 16 : 12,
    borderWidth: 3,
    borderColor: PIN.venue,
    backgroundColor: PIN.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  venuePinCore: {
    width: Platform.OS === 'android' ? 12 : 8,
    height: Platform.OS === 'android' ? 12 : 8,
    borderRadius: Platform.OS === 'android' ? 6 : 4,
    backgroundColor: PIN.venue,
  },
  brandPin: {
    width: Platform.OS === 'android' ? 20 : 14,
    height: Platform.OS === 'android' ? 20 : 14,
    borderRadius: Platform.OS === 'android' ? 10 : 7,
    backgroundColor: PIN.brandFill,
    borderWidth: 2,
    borderColor: PIN.white,
    elevation: 4,
  },
  pinSelected: {
    transform: [{scale: 1.25}],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
});