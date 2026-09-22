import {Text} from '../../ui/Text';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, Modal, Platform, StatusBar} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import {Colors} from '../Themes/Colors';
import {HBS_API} from '../../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type EntityType = 'venue' | 'brand';

type BrandDetailRouteParams = {
  id: string;
  type: EntityType;
  name?: string;
  address?: string;
  image?: string | null;
};

type EntityDetail = {
  name: string;
  address?: string | null;
  description?: string | null;
  category?: string | null;
};

// ─── API helpers ────────────────────────────────────────────────────────────
// TODO: point these at your real backend routes — these are best-guess
// endpoints based on the shape of VENUES_API / BRANDS_API used in MapScreen.

const detailUrl = (type: EntityType, id: string) =>
  type === 'venue'
    ? `${HBS_API}/api/hbs/venues/${id}`
    : `${HBS_API}/api/hbs/brands/${id}`;

// Expected to return every image any user has uploaded for this venue/brand.
const imagesUrl = (type: EntityType, id: string) =>
  `${HBS_API}/api/hbs/uploads?entityType=${type}&entityId=${id}`;

// Expected to accept a multipart upload and attach it to this venue/brand.
const uploadImageUrl = () => `${HBS_API}/api/hbs/uploads`;

const extractImageUrls = (raw: any): string[] => {
  const list: any[] =
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    [];
  return list
    .map(item =>
      typeof item === 'string' ? item : item?.url ?? item?.image ?? item?.img,
    )
    .filter(Boolean);
};

// ─── Layout constants ───────────────────────────────────────────────────────

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SLIDER_HEIGHT = Math.round(SCREEN_WIDTH * 0.95);
const GRID_GAP = 2;
const GRID_COLUMNS = 3;
const GRID_ITEM_SIZE =
  (SCREEN_WIDTH - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

// ─── Image slider (top of screen) ──────────────────────────────────────────

const ImageSlider = ({images}: {images: string[]}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onMomentumScrollEnd = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  }, []);

  if (images.length === 0) {
    return (
      <View style={[styles.slide, styles.sliderEmpty]}>
        <Ionicons name="image-outline" size={40} color="#ccc" />
        <Text style={styles.sliderEmptyText}>No photos yet</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(uri, idx) => `${uri}-${idx}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({item}) => (
          <Image source={{uri: item}} style={styles.slide} resizeMode="cover" />
        )}
      />
      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Full-screen photo viewer (opened from the grid, like an IG post) ──────

const PhotoViewerModal = ({
  visible,
  images,
  initialIndex,
  onClose,
}: {
  visible: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerBackdrop}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.viewerCloseBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.viewerCounter}>
          {index + 1} / {images.length}
        </Text>
        <FlatList
          data={images}
          keyExtractor={(uri, idx) => `${uri}-${idx}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, idx) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * idx,
            index: idx,
          })}
          onMomentumScrollEnd={e =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
          }
          renderItem={({item}) => (
            <View style={styles.viewerSlide}>
              <Image
                source={{uri: item}}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

// ─── Main screen ────────────────────────────────────────────────────────────

const BrandDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    id,
    type,
    name: routeName,
    address: routeAddress,
    image: routeImage,
  } = (route.params ?? {}) as BrandDetailRouteParams;

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<EntityDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [detailRes, imagesRes] = await Promise.allSettled([
      axios.get(detailUrl(type, id)),
      axios.get(imagesUrl(type, id)),
    ]);

    if (detailRes.status === 'fulfilled') {
      const data = detailRes.value?.data?.data ?? detailRes.value?.data;
      setDetail({
        name: data?.venueName ?? data?.nameEng ?? data?.name ?? routeName ?? 'Untitled',
        address:
          [data?.city, data?.country].filter(Boolean).join(', ') ||
          data?.address ||
          routeAddress ||
          null,
        description: data?.description ?? data?.about ?? null,
        category: data?.category ?? (type === 'venue' ? 'Venue' : 'Brand'),
      });
    } else {
      console.log('[BrandDetailScreen] detail error:', (detailRes.reason as any)?.message);
      // Fall back to whatever the map screen already knew about this marker
      setDetail({
        name: routeName ?? 'Untitled',
        address: routeAddress ?? null,
        description: null,
        category: type === 'venue' ? 'Venue' : 'Brand',
      });
    }

    if (imagesRes.status === 'fulfilled') {
      const urls = extractImageUrls(imagesRes.value?.data);
      setImages(urls.length ? urls : routeImage ? [routeImage] : []);
    } else {
      console.log('[BrandDetailScreen] images error:', (imagesRes.reason as any)?.message);
      setImages(routeImage ? [routeImage] : []);
    }

    setLoading(false);
  }, [id, type, routeName, routeAddress, routeImage]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openViewerAt = useCallback((idx: number) => {
    setViewerIndex(idx);
    setViewerVisible(true);
  }, []);

  const addPhoto = useCallback(
    async (fromCamera: boolean) => {
      const pick = () =>
        new Promise<{uri?: string} | null>(resolve => {
          const cb = (r: any) => {
            if (r.didCancel || r.errorCode) return resolve(null);
            resolve(r.assets?.[0] ?? null);
          };
          if (fromCamera) {
            launchCamera({mediaType: 'photo', quality: 0.8, saveToPhotos: true}, cb);
          } else {
            launchImageLibrary({mediaType: 'photo', quality: 0.8, selectionLimit: 1}, cb);
          }
        });

      const asset = await pick();
      if (!asset?.uri) return;

      // Optimistically show it in the grid right away.
      setImages(prev => [asset.uri as string, ...prev]);

      // TODO: replace with your real multipart upload call, e.g.:
      // const form = new FormData();
      // form.append('entityType', type);
      // form.append('entityId', id);
      // form.append('file', {uri: asset.uri, name: 'photo.jpg', type: 'image/jpeg'} as any);
      // await axios.post(uploadImageUrl(), form, {headers: {'Content-Type': 'multipart/form-data'}});
      setUploading(true);
      try {
        // Placeholder — wire this up to your actual endpoint.
        console.log('[BrandDetailScreen] TODO upload photo for', type, id, asset.uri);
      } finally {
        setUploading(false);
      }
    },
    [id, type],
  );

  const renderHeader = () => (
    <View>
      <ImageSlider images={images} />

      <View style={styles.detailCard}>
        <View style={styles.detailTopRow}>
          <Text style={styles.detailName} numberOfLines={2}>
            {detail?.name}
          </Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{detail?.category}</Text>
          </View>
        </View>

        {!!detail?.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={15} color='#ABB2BF' />
            <Text style={styles.detailAddress} numberOfLines={2}>
              {detail.address}
            </Text>
          </View>
        )}

        {!!detail?.description && (
          <Text style={styles.detailDescription}>{detail.description}</Text>
        )}
      </View>

      <View style={styles.photosHeaderRow}>
        <Text style={styles.photosHeaderTitle}>Photos ({images.length})</Text>
        {/* <TouchableOpacity
          style={styles.addPhotoBtn}
          disabled={uploading}
          onPress={() => addPhoto(false)}>
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.btnRed} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={16} color={Colors.btnRed} />
              <Text style={styles.addPhotoBtnText}>Add Photo</Text>
            </>
          )}
        </TouchableOpacity> */}
      </View>
    </View>
  );

  const renderEmptyGrid = () =>
    loading ? null : (
      <View style={styles.emptyGrid}>
        <Ionicons name="camera-outline" size={30} color="#ccc" />
        <Text style={styles.emptyGridText}>No photos uploaded yet.</Text>
        <Text style={styles.emptyGridSubtext}>Be the first to add one!</Text>
      </View>
    );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.btnRed} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fixed overlay header (stays on top while the list scrolls) */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity style={styles.overlayBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.overlayBtn} onPress={() => addPhoto(true)}>
          <Ionicons name="camera" size={19} color="#fff" />
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={images}
        keyExtractor={(uri, idx) => `grid-${uri}-${idx}`}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={images.length > 0 ? styles.gridRow : undefined}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyGrid}
        renderItem={({item, index}) => (
          <TouchableOpacity activeOpacity={0.85} onPress={() => openViewerAt(index)}>
            <Image source={{uri: item}} style={styles.gridImage} resizeMode="cover" />
          </TouchableOpacity>
        )}
      />

      <PhotoViewerModal
        visible={viewerVisible}
        images={images}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

export default BrandDetailScreen;

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191B20',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dargBg,
  },

  // Overlay header
  overlayHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 10,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Slider
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: '#191B20',
  },
  sliderEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sliderEmptyText: {
    fontSize: 13,
    color: '#aaa',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#191B20',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Detail card
  detailCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  detailTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailName: {
    flex: 1,
    fontSize: 21,
    fontWeight: '700',
    color: Colors.White,
  },
  typeBadge: {
    backgroundColor: '#191B20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.btnRed,
    textTransform: 'uppercase',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  detailAddress: {
    flex: 1,
    fontSize: 13,
    color: '#ABB2BF',
  },
  detailDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.White,
  },

  // Photos section header
  photosHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderColor: '#343841',
    marginTop: 8,
  },
  photosHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.White,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addPhotoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.btnRed,
  },

  // Grid
  gridContent: {
    paddingBottom: 40,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridImage: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    backgroundColor: '#191B20',
    marginBottom: GRID_GAP,
  },
  emptyGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyGridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ABB2BF',
  },
  emptyGridSubtext: {
    fontSize: 12,
    color: '#bbb',
  },

  // Full-screen viewer
  viewerBackdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 10,
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : (StatusBar.currentHeight ?? 24) + 18,
    alignSelf: 'center',
    zIndex: 10,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  viewerSlide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});