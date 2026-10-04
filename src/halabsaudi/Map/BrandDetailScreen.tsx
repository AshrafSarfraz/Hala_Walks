import {RemoteImage} from '../../ui/RemoteImage';
import {Text} from '../../ui/Text';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {hbsText} from '../i18n/translations';
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
  offers?: string[];
};

const detailUrl = (type: EntityType, id: string) =>
  `${HBS_API}/api/hbs/${type === 'venue' ? 'venues' : 'brands'}/${id}`;

type CheckIn = {
  _id: string;
  image: string;
  caption?: string;
  createdAt?: string;
  user?: {name?: string};
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
        <Ionicons name="image-outline" size={40} color={Colors.textSecondary} />
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
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({item}) => <RemoteImage uri={item} style={styles.slide} />}
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

  // Mount at the tapped photo on every open, including after a previous swipe.
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.viewerBackdrop}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity style={styles.viewerCloseBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color={Colors.white} />
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
              <RemoteImage
                uri={item}
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
  const [detail, setDetail] = useState<EntityDetail | null>({
    name: routeName || 'Brand',
    address: routeAddress,
  });
  const [images, setImages] = useState<string[]>([]);
  const isAr = useSelector((state: any) => state.language.language === 'ar');
  const [posts, setPosts] = useState<CheckIn[]>([]);
  const [postsError, setPostsError] = useState(false);
  const [officialImages, setOfficialImages] = useState<string[]>(
    routeImage ? [routeImage] : [],
  );
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchAll = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setPostsError(false);
      try {
        const token = await AsyncStorage.getItem('hala_token');
        await Promise.allSettled([
          axios
            .get(detailUrl(type, id), {timeout: 15000, signal})
            .then(response => {
              if (signal?.aborted) return;
              const data = response.data?.data ?? response.data;
              setDetail({
                name:
                  (isAr ? data?.nameArabic ?? data?.venueNameAr : null) ??
                  data?.venueName ??
                  data?.nameEng ??
                  data?.name ??
                  routeName ??
                  'Brand',
                address:
                  data?.address ||
                  [data?.city, data?.country].filter(Boolean).join(', ') ||
                  routeAddress,
                description:
                  (isAr ? data?.descriptionArabic : data?.descriptionEng) ??
                  data?.description ??
                  data?.about,
                category: data?.selectedCategory ?? data?.category,
                offers: (Array.isArray(data?.discounts)
                  ? data.discounts
                  : []
                ).map(
                  (offer: any) =>
                    `${offer.value}${data?.isFlatOffer ? '' : '%'} — ${
                      isAr
                        ? offer.descriptionArabic || offer.descriptionEng || ''
                        : offer.descriptionEng || ''
                    }`,
                ),
              });
              setOfficialImages([
                ...new Set(
                  [
                    data?.heroImage,
                    ...(Array.isArray(data?.multiImageUrls)
                      ? data.multiImageUrls
                      : []),
                    data?.img || routeImage,
                  ]
                    .filter(
                      (url): url is string =>
                        typeof url === 'string' && !!url.trim(),
                    )
                    .map(url => url.trim()),
                ),
              ]);
            }),
          (type === 'brand'
            ? axios.get(`${HBS_API}/api/hbs/map/brands/${id}/photos`, {
                headers: {Authorization: `Bearer ${token}`},
                timeout: 15000,
                signal,
              })
            : Promise.resolve({data: {data: []}})
          )
            .then(response => {
              if (signal?.aborted) return;
              const checkins: CheckIn[] = Array.isArray(response.data?.data)
                ? response.data.data.filter(
                    (post: CheckIn) =>
                      typeof post.image === 'string' && !!post.image,
                  )
                : [];
              setPosts(checkins);
              setImages(checkins.map(post => post.image));
            })
            .catch(() => {
              if (!signal?.aborted) setPostsError(true);
            }),
        ]);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id, type, routeName, routeAddress, routeImage, isAr],
  );
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void fetchAll(controller.signal).catch(() => {});
      return () => controller.abort();
    }, [fetchAll]),
  );

  const openViewerAt = useCallback((idx: number) => {
    setViewerIndex(idx);
    setViewerVisible(true);
  }, []);

  const renderHeader = () => (
    <View>
      <ImageSlider images={officialImages} />

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
            <Ionicons
              name="location-outline"
              size={15}
              color={Colors.textSecondary}
            />
            <Text style={styles.detailAddress} numberOfLines={2}>
              {detail.address}
            </Text>
          </View>
        )}

        {!!detail?.description && (
          <Text style={styles.detailDescription}>{detail.description}</Text>
        )}
        {detail?.offers?.map((offer, index) => (
          <Text key={index} style={styles.detailDescription}>
            {offer}
          </Text>
        ))}
      </View>

      <View style={styles.photosHeaderRow}>
        <Text style={styles.photosHeaderTitle}>
          {hbsText(isAr, 'ui_brand_checkins')} ({posts.length})
        </Text>
      </View>
    </View>
  );

  const renderEmptyGrid = () =>
    loading ? (
      <ActivityIndicator size="small" />
    ) : (
      <View style={styles.emptyGrid}>
        <Ionicons
          name="images-outline"
          size={30}
          color={Colors.textSecondary}
        />
        <TouchableOpacity
          disabled={!postsError}
          onPress={() => {
            void fetchAll();
          }}>
          <Text style={styles.emptyGridText}>
            {hbsText(
              isAr,
              postsError ? 'ui_brand_photos_retry' : 'ui_no_brand_checkins',
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor={Colors.transparent}
      />

      {/* Fixed overlay header (stays on top while the list scrolls) */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity
          style={styles.overlayBtn}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={post => post._id}
        numColumns={GRID_COLUMNS}
        initialNumToRender={9}
        maxToRenderPerBatch={6}
        windowSize={5}
        columnWrapperStyle={posts.length ? styles.gridRow : undefined}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyGrid}
        renderItem={({item, index}) => (
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              item.caption ||
              item.user?.name ||
              (isAr ? 'فتح الصورة' : 'Open photo')
            }
            onPress={() => openViewerAt(index)}>
            <RemoteImage uri={item.image} style={styles.gridImage} />
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
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.overlaySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Slider
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: Colors.surface,
  },
  sliderEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sliderEmptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.lightOverlay,
  },
  dotActive: {
    backgroundColor: Colors.surface,
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
    color: Colors.white,
  },
  typeBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
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
    color: Colors.textSecondary,
  },
  detailDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.white,
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
    borderColor: Colors.border,
    marginTop: 8,
  },
  photosHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addPhotoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
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
    backgroundColor: Colors.surface,
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
    color: Colors.textSecondary,
  },
  emptyGridSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Full-screen viewer
  viewerBackdrop: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 10,
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.lightOverlaySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : (StatusBar.currentHeight ?? 24) + 18,
    alignSelf: 'center',
    zIndex: 10,
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  viewerSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});
