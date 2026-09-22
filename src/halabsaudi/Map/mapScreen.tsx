import {fetchBrandCatalog} from '../api/brandCatalog';
import {Text} from '../../ui/Text';
import {darkMapStyle} from '../../ui/darkMap';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {TextInput} from '../../ui/TextInput';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {View, StyleSheet, Platform, TouchableOpacity, Image, FlatList, Keyboard} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Colors} from '../Themes/Colors';

import {BASE_URL, HBS_API} from '../../config/api';
import {
  ensureLocationPermission,
  getDeviceLocation,
} from '../utils/getDeviceLocation';
import ActivityIndicatorModal from '../Component/Loader/ActivityIndicator';

// ─── Exported types ───────────────────────────────────────────────────────────

export type PlaceSuggestion = {
  placeId: string;
  name: string;
  vicinity: string;
  types?: string[];
  location?: {lat: number; lng: number};
};

type AutocompletePrediction = {
  placeId: string;
  mainText: string;
  secondaryText: string;
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

const VENUES_API = `${HBS_API}/api/hbs/venues`;
const BRANDS_API = `${HBS_API}/api/hbs/brands`;

// ─── Geo helpers ──────────────────────────────────────────────────────────────

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

// ─── Marker fetch / normalize ─────────────────────────────────────────────────

const buildMarkersFromCatalog = (
  venues: any[],
  brands: any[],
): VenueMarker[] => {
  const venueMarkers: VenueMarker[] = venues
    .map((v): VenueMarker | null => {
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
    .map((b): VenueMarker | null => {
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
      haversineKm(
        coords.latitude,
        coords.longitude,
        v.latitude,
        v.longitude,
      ) <= radiusKm,
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
      distance: haversineKm(
        center.latitude,
        center.longitude,
        m.latitude,
        m.longitude,
      ),
    }))
    .filter(m => m.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, brandSlots)
    .map(({distance: _d, ...m}) => m);

  return [...venues, ...nearbyBrands];
};

// ─── Pin components ───────────────────────────────────────────────────────────

const PIN = {
  venue: Colors.btnRed,
  brand: Colors.btnRed,
  brandFill: Colors.btnRed,
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
      <View
        collapsable={false}
        style={[styles.venuePin, selected && styles.pinSelected]}>
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
        style={{
          width: size - 4,
          height: size - 4,
          borderRadius: (size - 4) / 2,
        }}
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
  const coordinate = {latitude: item.latitude, longitude: item.longitude};
  const resolvedImage = uploadedImage ?? item.image ?? null;
  const useImagePin = !!resolvedImage;
  const [tracks, setTracks] = useState(useImagePin);

  useEffect(() => {
    if (!tracks) return;
    const delay = Platform.OS === 'android' ? 500 : 800;
    const t = setTimeout(() => setTracks(false), delay);
    return () => clearTimeout(t);
  }, [tracks, useImagePin]);

  return (
    <Marker
      coordinate={coordinate}
      tracksViewChanges={tracks}
      zIndex={selected ? 10 : item.type === 'venue' ? 5 : 1}
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

// ─── Google Places helpers ────────────────────────────────────────────────────

const GOOGLE_MAPS_API_KEY = 'AIzaSyB6CWvlf9f5twQnSjWbEjeNrxmGW2DOins';

const AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAIL_URL =
  'https://maps.googleapis.com/maps/api/place/details/json';

const fetchGooglePredictions = async (
  input: string,
): Promise<AutocompletePrediction[]> => {
  const url = `${AUTOCOMPLETE_URL}?input=${encodeURIComponent(
    input,
  )}&key=${GOOGLE_MAPS_API_KEY}&language=en&types=geocode|establishment`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    throw new Error(
      `Google Places: ${json.status} – ${json.error_message ?? ''}`,
    );
  }

  return (json.predictions ?? []).slice(0, 6).map((p: any) => ({
    placeId: p.place_id,
    mainText: p.structured_formatting?.main_text ?? p.description,
    secondaryText: p.structured_formatting?.secondary_text ?? '',
  }));
};

const fetchGooglePlaceCoords = async (
  placeId: string,
): Promise<{lat: number; lng: number} | null> => {
  const url = `${PLACE_DETAIL_URL}?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const loc = json?.result?.geometry?.location ?? null;
  return loc ?? null;
};

// ─── LocationSearchBar ────────────────────────────────────────────────────────

type LocationSearchBarProps = {
  currentAddress: string;
  onSearchResult: (result: {name: string; address: string} | null) => void;
  onAnimateTo: (coords: {latitude: number; longitude: number}) => void;
};

const LocationSearchBar = ({
  currentAddress,
  onSearchResult,
  onAnimateTo,
}: LocationSearchBarProps) => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const openSearch = () => {
    setExpanded(true);
    setQuery('');
    setPredictions([]);
    setFetchError(null);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setExpanded(false);
    setQuery('');
    setPredictions([]);
    setFetchError(null);
  };

  const clearSelection = () => {
    setSelectedLabel(null);
    onSearchResult(null);
    closeSearch();
  };

  const fetchPredictions = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setPredictions([]);
      setFetchError(null);
      return;
    }
    setSearching(true);
    setFetchError(null);
    try {
      const results = await fetchGooglePredictions(trimmed);
      setPredictions(results);
    } catch (err: any) {
      console.warn('[LocationSearchBar] autocomplete error:', err?.message);
      setPredictions([]);
      setFetchError(err?.message ?? 'Search unavailable');
    } finally {
      setSearching(false);
    }
  }, []);

  const onChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(text), 350);
  };

  const handleSelectPrediction = async (p: AutocompletePrediction) => {
    Keyboard.dismiss();
    setExpanded(false);
    setQuery('');
    setPredictions([]);
    setFetchError(null);
    setSelectedLabel(p.mainText);

    onSearchResult({
      name: p.mainText,
      address: [p.mainText, p.secondaryText].filter(Boolean).join(', '),
    });

    try {
      const loc = await fetchGooglePlaceCoords(p.placeId);
      if (loc) {
        onAnimateTo({latitude: loc.lat, longitude: loc.lng});
      }
    } catch {
      // Map stays put
    }
  };

  const displayLabel = selectedLabel ?? currentAddress;
  const isRemote = !!selectedLabel;

  const showEmptyState =
    expanded &&
    !searching &&
    !fetchError &&
    query.trim().length >= 2 &&
    predictions.length === 0;
  const showError = expanded && !searching && !!fetchError;

  return (
    <View style={searchBarStyles.wrapper}>
      {!expanded ? (
        <TouchableOpacity
          style={searchBarStyles.banner}
          onPress={openSearch}
          activeOpacity={0.85}>
          <View style={searchBarStyles.bannerLeft}>
            <Ionicons
              name={isRemote ? 'search' : 'location'}
              size={16}
              color={Colors.btnRed}
            />
            <Text style={searchBarStyles.bannerText} numberOfLines={1}>
              {displayLabel || 'Current Location'}
            </Text>
            {isRemote && (
              <View style={searchBarStyles.remotePill}>
                <Text style={searchBarStyles.remotePillText}>Remote</Text>
              </View>
            )}
          </View>
          <View style={searchBarStyles.bannerRight}>
            {isRemote ? (
              <TouchableOpacity
                onPress={clearSelection}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-down" size={16} color="#aaa" />
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={searchBarStyles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.btnRed} />
          <TextInput
            ref={inputRef}
            style={searchBarStyles.searchInput}
            placeholder="Search any place…"
            placeholderTextColor="#bbb"
            value={query}
            onChangeText={onChangeText}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searching ? (
            <ActivityIndicator size="small" color={Colors.btnRed} />
          ) : (
            <TouchableOpacity onPress={closeSearch}>
              <Ionicons name="close" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {expanded && predictions.length > 0 && (
        <View style={searchBarStyles.dropdown}>
          <FlatList
            data={predictions}
            keyExtractor={item => item.placeId}
            keyboardShouldPersistTaps="always"
            renderItem={({item}) => (
              <TouchableOpacity
                style={searchBarStyles.predictionRow}
                onPress={() => handleSelectPrediction(item)}
                activeOpacity={0.75}>
                <View style={searchBarStyles.predictionIcon}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={Colors.btnRed}
                  />
                </View>
                <View style={searchBarStyles.predictionText}>
                  <Text
                    style={searchBarStyles.predictionMain}
                    numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  {!!item.secondaryText && (
                    <Text
                      style={searchBarStyles.predictionSub}
                      numberOfLines={1}>
                      {item.secondaryText}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {showEmptyState && (
        <View style={searchBarStyles.dropdown}>
          <Text style={searchBarStyles.emptyText}>No places found</Text>
        </View>
      )}

      {showError && (
        <View
          style={[searchBarStyles.dropdown, searchBarStyles.errorDropdown]}>
          <Ionicons name="warning-outline" size={14} color="#C0392B" />
          <Text style={searchBarStyles.errorText}>{fetchError}</Text>
        </View>
      )}
    </View>
  );
};

const searchBarStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  banner: {
    backgroundColor: Colors.darkgrey,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 6,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.White,
  },
  bannerRight: {
    paddingLeft: 4,
  },
  remotePill: {
    backgroundColor: '#191B20',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  remotePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.btnRed,
  },
  searchBox: {
    backgroundColor: '#191B20',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: Colors.btnRed,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#F5F6F8',
    padding: 0,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: '#191B20',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    maxHeight: 240,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: '#343841',
    gap: 10,
  },
  predictionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#191B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictionText: {flex: 1},
  predictionMain: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F6F8',
  },
  predictionSub: {
    fontSize: 12,
    color: '#ABB2BF',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 16,
  },
  errorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#191B20',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#C0392B',
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const didFitRef = useRef(false);
  const lastMetaCoordsRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const metaDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const [selectedMarker, setSelectedMarker] = useState<VenueMarker | null>(
    null,
  );
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>(
    {},
  );

  // FIX: Force mapReady on Android if onMapReady fires late
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
      // ── Step 1: Google Reverse Geocoding for real place name ──────────────
      // This always works regardless of your backend status.
      try {
        const geoUrl =
          `https://maps.googleapis.com/maps/api/geocode/json` +
          `?latlng=${coords.latitude},${coords.longitude}` +
          `&key=${GOOGLE_MAPS_API_KEY}` +
          `&language=en` +
          `&result_type=neighborhood|sublocality|locality`;

        const geoRes = await fetch(geoUrl);
        const geoJson = await geoRes.json();

        if (geoJson.status === 'OK' && geoJson.results?.length > 0) {
          // Pick the most specific readable name:
          // prefer neighborhood → sublocality → locality → formatted_address
          const result = geoJson.results[0];
          const components: {types: string[]; long_name: string}[] =
            result.address_components ?? [];

          const pick = (type: string) =>
            components.find(c => c.types.includes(type))?.long_name ?? null;

          const name =
            pick('neighborhood') ??
            pick('sublocality_level_1') ??
            pick('sublocality') ??
            pick('locality') ??
            pick('administrative_area_level_2') ??
            pick('administrative_area_level_1') ??
            result.formatted_address?.split(',')[0] ??
            null;

          if (name) setAddress(name);
        }
      } catch (geoErr) {
        console.log('[resolveLocationMeta] geocode error:', geoErr);
      }

      // ── Step 2: Your backend for locationId + suggestions ─────────────────
      const [locResult, sugResult] = await Promise.allSettled([
        axios.post(`${BASE_URL}/api/hbs/map/location`, {
          lat: coords.latitude,
          lng: coords.longitude,
        }),
        axios.get(`${BASE_URL}/api/hbs/map/suggestions`, {
          params: {
            lat: coords.latitude,
            lng: coords.longitude,
            radius: 2000,
            limit: 10,
          },
        }),
      ]);

      // -- location id / name --
      if (locResult.status === 'fulfilled') {
        const locData = locResult.value?.data?.data ?? locResult.value?.data;
        if (locData?.name) setAddress(locData.name);
        setLocationId(locData?._id ?? null);
      } else {
        console.log(
          '[resolveLocationMeta] location error:',
          (locResult.reason as any)?.response?.status,
          (locResult.reason as any)?.response?.data ??
            (locResult.reason as any)?.message,
        );
        setLocationId(null);
      }

      // -- nearby suggestions --
      if (sugResult.status === 'fulfilled') {
        const raw = sugResult.value?.data;
        const sugData: PlaceSuggestion[] | null =
          (Array.isArray(raw?.data) && raw.data) ||
          (Array.isArray(raw?.results) && raw.results) ||
          (Array.isArray(raw) && raw) ||
          null;

        if (sugData) {
          setSuggestions(sugData);
        } else {
          console.log(
            '[resolveLocationMeta] suggestions: unexpected response shape:',
            raw,
          );
          setSuggestions([]);
        }
      } else {
        console.log(
          '[resolveLocationMeta] suggestions error:',
          (sugResult.reason as any)?.response?.status,
          (sugResult.reason as any)?.response?.data ??
            (sugResult.reason as any)?.message,
        );
        setSuggestions([]);
      }
    },
    [],
  );

  const resolveLocationMetaDebounced = useCallback(
    (coords: {latitude: number; longitude: number}) => {
      const last = lastMetaCoordsRef.current;
      if (
        last &&
        haversineKm(
          last.latitude,
          last.longitude,
          coords.latitude,
          coords.longitude,
        ) < 0.05
      ) {
        return;
      }
      if (metaDebounceRef.current) clearTimeout(metaDebounceRef.current);
      metaDebounceRef.current = setTimeout(() => {
        lastMetaCoordsRef.current = coords;
        resolveLocationMeta(coords);
      }, 800);
    },
    [resolveLocationMeta],
  );

  useEffect(
    () => () => {
      if (metaDebounceRef.current) clearTimeout(metaDebounceRef.current);
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
    (event: {
      nativeEvent: {coordinate?: {latitude: number; longitude: number}};
    }) => {
      const coord = event.nativeEvent.coordinate;
      if (!coord) return;
      const coords = {latitude: coord.latitude, longitude: coord.longitude};
      setLocation(coords);
      setLocationError(null);
      setLoading(false);
      resolveLocationMetaDebounced(coords);
    },
    [resolveLocationMetaDebounced],
  );

  const fetchVenueMarkers = useCallback(async () => {
    try {
      const [venuesRes, brandsRes] = await Promise.all([
        fetch(VENUES_API),
        fetchBrandCatalog(BRANDS_API),
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
    const venues = allMarkers.filter(m => m.type === 'venue');
    if (!location && !mapCenter) return allMarkers;
    const center = resolveMarkerFilterCenter(location, mapCenter, venues);
    const nearUser =
      !!location && isNearAnyVenue(location, venues, NEAR_VENUE_RADIUS_KM);
    const radiusKm = nearUser ? NEARBY_RADIUS_KM : NEAR_VENUE_RADIUS_KM;
    return pickVisibleMarkers(allMarkers, center, radiusKm);
  }, [allMarkers, location, mapCenter]);

  const fitMapToContent = useCallback(() => {
    if (!mapRef.current || allMarkers.length === 0) return false;
    const venues = allMarkers.filter(m => m.type === 'venue');
    const markersToFit =
      visibleMarkers.length > 0 ? visibleMarkers : allMarkers;
    const markerCoords = markersToFit.map(m => ({
      latitude: m.latitude,
      longitude: m.longitude,
    }));
    if (markerCoords.length === 0) return false;
    const userNearVenues = !!location && isNearAnyVenue(location, venues);
    const coords = userNearVenues
      ? [
          {latitude: location!.latitude, longitude: location!.longitude},
          ...markerCoords,
        ]
      : markerCoords;
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: {top: 100, right: 50, bottom: 140, left: 50},
      animated: true,
    });
    return true;
  }, [allMarkers, location, visibleMarkers]);

  useFocusEffect(
    useCallback(() => {
      if (didFitRef.current) return;
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
    if (didFitRef.current) return;

    const venues = allMarkers.filter(m => m.type === 'venue');
    const nearUser = !!location && isNearAnyVenue(location, venues);
    const nextRegion = nearUser && location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }
      : regionFromVenues(venues);
    mapRef.current?.animateToRegion(nextRegion, 700);
    didFitRef.current = true;
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
      launchCamera(
        {mediaType: 'photo', quality: 0.8, saveToPhotos: true},
        r => {
          if (r.didCancel || r.errorCode) return resolve(null);
          const asset = r.assets?.[0] ?? null;
          saveUploadedImage(asset);
          resolve(asset);
        },
      );
    });
  }, [saveUploadedImage]);

  const openGallery = useCallback(async () => {
    return new Promise<{uri?: string} | null>(resolve => {
      launchImageLibrary(
        {mediaType: 'photo', quality: 0.8, selectionLimit: 1},
        r => {
          if (r.didCancel || r.errorCode) return resolve(null);
          const asset = r.assets?.[0] ?? null;
          saveUploadedImage(asset);
          resolve(asset);
        },
      );
    });
  }, [saveUploadedImage]);

  // NEW: open the full brand/venue detail screen (image slider + details + gallery)
  const openBrandDetail = useCallback(
    (marker: VenueMarker) => {
      navigation.navigate('BrandDetail', {
        id: marker._id,
        type: marker.type,
        name: marker.name,
        address: marker.address,
        image: uploadedImages[marker._id] ?? marker.image ?? null,
      });
    },
    [navigation, uploadedImages],
  );

  const showMarkers = markersLoaded && visibleMarkers.length > 0 && mapReady;

  return (
    <View style={styles.container}>
      <MapView
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        loadingBackgroundColor="#101114"
        loadingIndicatorColor="#E75049"
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
        followsUserLocation={false}
        moveOnMarkerPress={false}
        loadingEnabled
        initialRegion={GCC_OVERVIEW_REGION}
        onMapReady={() => setMapReady(true)}
        onUserLocationChange={onUserLocationChange}
        onRegionChangeComplete={onRegionChangeComplete}>
        {location && hasLocationPermission && Platform.OS === 'android' && (
          <Marker
            coordinate={location}
            anchor={{x: 0.5, y: 0.5}}
            tracksViewChanges={false}
            zIndex={20}>
            <View collapsable={false} style={styles.userLocationDot}>
              <View style={styles.userLocationCore} />
            </View>
          </Marker>
        )}
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

      <ActivityIndicatorModal visible={loading} />

      {!loading && locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !locationError && (
        <LocationSearchBar
          currentAddress={address}
          onSearchResult={() => {}}
          onAnimateTo={coords => animateToLocation(coords, 0.04)}
        />
      )}

      <View style={styles.fabRow}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('BottomTab', {screen: 'Profile'})}>
          <Ionicons name="person" size={22} color="#fff" />
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

      {/* ── Selected marker card → tap opens BrandDetailScreen ── */}
      {selectedMarker && (
        <TouchableOpacity
          style={styles.markerCard}
          activeOpacity={0.85}
          onPress={() => openBrandDetail(selectedMarker)}>
          <TouchableOpacity
            style={styles.markerCloseBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            onPress={e => {
              e.stopPropagation();
              setSelectedMarker(null);
            }}>
            <Ionicons name="close" size={16} color='#ABB2BF' />
          </TouchableOpacity>

          <View style={styles.markerCardRow}>
            {uploadedImages[selectedMarker._id] || selectedMarker.image ? (
              <Image
                source={{
                  uri:
                    uploadedImages[selectedMarker._id] ??
                    (selectedMarker.image as string),
                }}
                style={styles.markerCardImage}
              />
            ) : (
              <View style={[styles.markerCardImage, styles.markerCardImageFallback]}>
                <Ionicons
                  name={selectedMarker.type === 'venue' ? 'business' : 'pricetag'}
                  size={22}
                  color={Colors.btnRed}
                />
              </View>
            )}

            <View style={styles.markerCardInfo}>
              <Text style={styles.markerName} numberOfLines={1}>
                {selectedMarker.name}
              </Text>
              {!!selectedMarker.address && (
                <Text style={styles.markerAddress} numberOfLines={1}>
                  {selectedMarker.address}
                </Text>
              )}
              <Text style={styles.markerViewMore}>View details</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </TouchableOpacity>
      )}

      {/*
       * BottomSheet has been REMOVED from MapScreen.
       * It now lives as a standalone modal screen registered in the navigator.
       * See bottomTabs.tsx — the Timeline screen is presented as a modal.
       *
       * NEW: BrandDetail is also a standalone screen (see BrandDetailScreen.tsx).
       * Register it in your navigator, e.g.:
       *   <Stack.Screen name="BrandDetail" component={BrandDetailScreen} />
       */}
    </View>
  );
};

export default MapScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191B20',
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
    color: '#F5F6F8',
  },
  errorBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#191B20',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#343841',
    zIndex: 20,
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
    color: Colors.btnRed,
  },
  fabRow: {
    position: 'absolute',
    bottom: 100,
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
  markerCard: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    right: 16,
    backgroundColor: '#191B20',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  markerCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#191B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 20,
  },
  markerCardImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#191B20',
  },
  markerCardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191B20',
  },
  markerCardInfo: {
    flex: 1,
  },
  markerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F6F8',
  },
  markerAddress: {
    marginTop: 3,
    fontSize: 13,
    color: '#ABB2BF',
  },
  markerViewMore: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.btnRed,
  },
  imagePin: {
    borderWidth: 2,
    backgroundColor: '#191B20',
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
  userLocationDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.btnRed,
    borderWidth: 2,
    borderColor: '#343841',
  },
});