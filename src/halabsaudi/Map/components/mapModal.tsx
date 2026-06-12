
//
// Custom animated bottom sheet for the Map screen.
// Replaces the previous third-party BottomSheet entirely.
//
// Props match the existing MapScreen contract — no changes needed in
// MapScreen.tsx other than pointing the import here.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import type {PlaceSuggestion} from '../mapScreen';

// ─── Constants ────────────────────────────────────────────────────────────────

const {height: SCREEN_H} = Dimensions.get('window');

/** How tall the sheet is when fully open */
const SHEET_HEIGHT = SCREEN_H * 0.65;

/** How far down the user must drag to trigger dismiss */
const DISMISS_THRESHOLD = SHEET_HEIGHT * 0.28;

const ANIM_CONFIG = {
  open: {toValue: 0, useNativeDriver: true, tension: 68, friction: 11},
  close: {toValue: SHEET_HEIGHT, useNativeDriver: true, tension: 68, friction: 11},
} as const;

const COLORS = {
  purple: '#6C4EFF',
  purpleLight: '#EDE9FF',
  purpleMid: '#9B7BFF',
  white: '#FFFFFF',
  bg: '#F7F6FF',
  border: '#E8E3FF',
  text: '#1A1A2E',
  sub: '#6B6B8A',
  placeholder: '#B0ABCC',
  overlay: 'rgba(10,8,30,0.45)',
  divider: '#EEEBFF',
  red: '#FF4D6D',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => Promise<unknown>;
  onGallery: () => Promise<unknown>;
  currentLocation: {latitude: number; longitude: number};
  address: string;
  locationId: string | null;
  suggestions: PlaceSuggestion[];
  onLocationNameChanged: (name: string) => void;
}

// ─── SuggestionRow ────────────────────────────────────────────────────────────

const SuggestionRow = memo(function SuggestionRow({
  item,
  onPress,
}: {
  item: PlaceSuggestion;
  onPress: (item: PlaceSuggestion) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.suggestionRow}
      activeOpacity={0.7}
      onPress={() => onPress(item)}>
      <View style={styles.suggestionIcon}>
        <Ionicons name="location-outline" size={16} color={COLORS.purple} />
      </View>
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.suggestionVicinity} numberOfLines={1}>
          {item.vicinity}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={COLORS.placeholder} />
    </TouchableOpacity>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  onCamera,
  onGallery,
  address,
  locationId,
  suggestions,
  onLocationNameChanged,
}) => {
  // translateY: 0 = fully visible, SHEET_HEIGHT = off-screen below
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Internal copy of the address so user can edit it inline
  const [editedName, setEditedName] = useState(address);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Keep editedName in sync when parent updates address
  useEffect(() => {
    if (!isEditing) {
      setEditedName(address);
    }
  }, [address, isEditing]);

  // ── Open / close animation ──────────────────────────────────────────────

  const open = useCallback(() => {
    setMounted(true);
    Animated.parallel([
      Animated.spring(translateY, ANIM_CONFIG.open),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, overlayOpacity]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.spring(translateY, ANIM_CONFIG.close),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false);
      onClose();
    });
  }, [translateY, overlayOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      open();
    } else {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Drag-to-dismiss ─────────────────────────────────────────────────────

  const dragStart = useRef(0);
  const dragCurrent = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderGrant: (_, g) => {
        dragStart.current = g.y0;
      },
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          // Only allow dragging downwards
          dragCurrent.setValue(g.dy);
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        dragCurrent.setValue(0);
        if (g.dy > DISMISS_THRESHOLD || g.vy > 1.2) {
          // Fling / dragged far enough — dismiss
          close();
        } else {
          // Snap back to open
          Animated.spring(translateY, ANIM_CONFIG.open).start();
        }
      },
    }),
  ).current;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSuggestionPress = useCallback(
    (item: PlaceSuggestion) => {
      setEditedName(item.name);
      onLocationNameChanged(item.name);
      setIsEditing(false);
      Keyboard.dismiss();
    },
    [onLocationNameChanged],
  );

  const handleNameSubmit = useCallback(() => {
    const trimmed = editedName.trim();
    if (trimmed) {
      onLocationNameChanged(trimmed);
    }
    setIsEditing(false);
    Keyboard.dismiss();
  }, [editedName, onLocationNameChanged]);

  const handleCameraPress = useCallback(async () => {
    close();
    await onCamera();
  }, [close, onCamera]);

  const handleGalleryPress = useCallback(async () => {
    close();
    await onGallery();
  }, [close, onGallery]);

  // ── Render ──────────────────────────────────────────────────────────────

  if (!mounted && !visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}>
      {/* Dimmed backdrop */}
      <Animated.View
        style={[styles.overlay, {opacity: overlayOpacity}]}
        pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Sheet */}
      <KeyboardAvoidingView
        style={styles.kavWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            {transform: [{translateY}]},
          ]}>
          {/* ── Drag handle ─────────────────────────────────────────── */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          {/* ── Header ──────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add to location</Text>
            <TouchableOpacity
              onPress={close}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.headerClose}>
              <Ionicons name="close" size={20} color={COLORS.sub} />
            </TouchableOpacity>
          </View>

          {/* ── Location name row ────────────────────────────────────── */}
          <View style={styles.locationRow}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="location" size={18} color={COLORS.purple} />
            </View>

            <View style={styles.locationNameWrap}>
              {isEditing ? (
                <TextInput
                  style={styles.locationInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  onBlur={handleNameSubmit}
                  onSubmitEditing={handleNameSubmit}
                  returnKeyType="done"
                  autoFocus
                  selectTextOnFocus
                  placeholderTextColor={COLORS.placeholder}
                  placeholder="Enter location name"
                />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setIsEditing(true)}
                  style={styles.locationNameBtn}>
                  <Text style={styles.locationName} numberOfLines={1}>
                    {editedName || 'Current Location'}
                  </Text>
                  <Ionicons
                    name="pencil-outline"
                    size={13}
                    color={COLORS.purpleMid}
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              )}
              {locationId ? (
                <Text style={styles.locationId} numberOfLines={1}>
                  ID: {locationId}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── Media actions ────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>Attach media</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={styles.mediaBtn}
              activeOpacity={0.8}
              onPress={handleCameraPress}>
              <View style={[styles.mediaIconWrap, {backgroundColor: COLORS.purpleLight}]}>
                <Ionicons name="camera" size={22} color={COLORS.purple} />
              </View>
              <Text style={styles.mediaBtnLabel}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaBtn}
              activeOpacity={0.8}
              onPress={handleGalleryPress}>
              <View style={[styles.mediaIconWrap, {backgroundColor: '#FFF0F3'}]}>
                <Ionicons name="images" size={22} color={COLORS.red} />
              </View>
              <Text style={styles.mediaBtnLabel}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ── Suggestions ──────────────────────────────────────────── */}
          {suggestions.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>Nearby places</Text>
              <FlatList
                data={suggestions}
                keyExtractor={item => item.placeId}
                renderItem={({item}) => (
                  <SuggestionRow item={item} onPress={handleSuggestionPress} />
                )}
                ItemSeparatorComponent={() => <View style={styles.suggestionSep} />}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.suggestionList}
                contentContainerStyle={styles.suggestionListContent}
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={32}
                color={COLORS.placeholder}
              />
              <Text style={styles.emptyText}>No nearby places found</Text>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomModal;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Modal layers ──────────────────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // ── Sheet container ───────────────────────────────────────────────────────
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },

  // ── Drag handle ───────────────────────────────────────────────────────────
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  headerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Location row ──────────────────────────────────────────────────────────
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  locationNameWrap: {
    flex: 1,
  },
  locationNameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
  },
  editIcon: {
    marginLeft: 6,
  },
  locationInput: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    padding: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.purple,
  },
  locationId: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.placeholder,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 20,
    marginBottom: 16,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.sub,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // ── Media buttons ─────────────────────────────────────────────────────────
  mediaRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  mediaBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mediaBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  // ── Suggestions list ──────────────────────────────────────────────────────
  suggestionList: {
    flex: 1,
  },
  suggestionListContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    marginRight: 6,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionVicinity: {
    fontSize: 11,
    color: COLORS.sub,
    marginTop: 1,
  },
  suggestionSep: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 42,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.placeholder,
  },
});