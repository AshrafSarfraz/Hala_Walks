import { Text } from '../../ui/Text';
import CustomHeader from '../Component/CustomHeader/CustomHeader';

// src/halabsaudi/chat/AllMediaScreen.tsx
import Ionicons from '@react-native-vector-icons/ionicons';
import React,{ useState } from 'react';
import { Dimensions,FlatList,Image,StyleSheet,TouchableOpacity,View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useStatusBar } from '../Component/UseStatusBar/useStatusBar';
import { Colors } from '../Themes/Colors';
import { languageData } from '../redux_toolkit/language/languageSlice';
import { RootState } from '../redux_toolkit/store';
import type { MediaItem } from './UserProfileScreen';
import DeleteMessageModal from './components/DeleteMessageModal';
import ImageViewerModal from './components/ImageViewerModal';
import WhatsAppMessageModal,{ MessageAction } from './components/WhatsAppMessageModal';
import { getSocket } from './socket';

const {width: W} = Dimensions.get('window');
const COL       = 3;
const ITEM_SIZE = (W - (COL + 1) * 2) / COL;

type Props = {route: any; navigation: any};

export default function AllMediaScreen({route, navigation}: Props) {
  const language = useSelector((state: RootState) => state.language.language);
  const t        = languageData[language];
  const isRTL    = language === 'ar';
  useStatusBar('dark-content', Colors.surface, true);
  const {
    allMedia: initialMedia = [],
    participantName = 'Media',
    chatId,
  }: {allMedia: MediaItem[]; participantName: string; chatId: string} =
    route.params || {};

  const insets = useSafeAreaInsets();
  const [media, setMedia]               = useState<MediaItem[]>(initialMedia);
  const [viewerItem, setViewerItem]     = useState<MediaItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [pressY, setPressY]             = useState(0);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // ── Localised subtitle ──────────────────────────────────────────────
  const imageCount = media.filter(m => m.mediaType === 'image').length;
  const videoCount = media.filter(m => m.mediaType === 'video').length;
  const subtitle = [
    imageCount > 0 && `${imageCount} ${imageCount > 1 ? t.photos_label : t.photo_label}`,
    videoCount > 0 && `${videoCount} ${videoCount > 1 ? t.videos_label : t.video_label}`,
  ].filter(Boolean).join('  ·  ');

  const handleDeleteForMe = () => {
    if (!selectedItem) return;
    getSocket()?.emit('delete-message', {
      messageId: selectedItem.id, chatId, deleteForEveryone: false,
    });
    setMedia(prev => prev.filter(m => m.id !== selectedItem.id));
  };

  const actions: MessageAction[] = [
    {label: t.media_view,   icon: 'eye-outline',   onPress: () => setViewerItem(selectedItem)},
    {label: t.media_delete, icon: 'trash-outline', destructive: true, onPress: () => setDeleteModalVisible(true)},
  ];

  const renderItem = ({item}: {item: MediaItem}) => (
    <TouchableOpacity
      style={s.cell}
      onPress={() => setViewerItem(item)}
      onLongPress={e => {
        setSelectedItem(item);
        setPressY(e.nativeEvent.pageY);
        setActionModalVisible(true);
      }}
      delayLongPress={300}
      activeOpacity={0.8}>
      <Image source={{uri: item.uri}} style={s.cellImg} resizeMode="cover" />
      {item.mediaType === 'video' && (
        <View style={s.videoOverlay}>
          <Ionicons name="play-circle" size={32} color={Colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>

      <CustomHeader title={participantName} onBackPress={() => navigation.goBack()} />
      {!!subtitle && <Text style={[s.headerSub, {paddingHorizontal: 16, paddingVertical: 8}]}>{subtitle}</Text>}

      {/* ── Grid ── */}
      {media.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="images-outline" size={48} color={Colors.textSecondary} />
          <Text style={s.emptyText}>{t.no_shared_media}</Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={item => item.id}
          numColumns={COL}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
        />
      )}

      <WhatsAppMessageModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        messageText={undefined}
        isMe={true}
        messageY={pressY}
        currentUserEmoji={null}
        onReact={() => {}}
        actions={actions}
      />

      <DeleteMessageModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        isMe={false}
        onDeleteForMe={() => {
          setDeleteModalVisible(false);
          setTimeout(handleDeleteForMe, 200);
        }}
      />

      <ImageViewerModal
        visible={!!viewerItem}
        uri={viewerItem?.uri || null}
        senderName={participantName}
        timestamp={
          viewerItem?.createdAt
            ? new Date(viewerItem.createdAt).toLocaleDateString([], {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : undefined
        }
        onClose={() => setViewerItem(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   {flex: 1, backgroundColor:Colors.background},
  header: {
    alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn:      {width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20},
  headerCenter: {flex: 1, alignItems: 'center'},
  headerTitle:  {fontSize: 16, fontWeight: '700', color: Colors.textPrimary},
  headerSub:    {fontSize: 12, color: Colors.textSecondary, marginTop: 1},
  grid: {padding: 2},
  row:  {gap: 2},
  cell: {
    width: ITEM_SIZE, height: ITEM_SIZE, margin: 1,
    backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden',
  },
  cellImg:      {width: '100%', height: '100%'},
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlaySoft,
    justifyContent: 'center', alignItems: 'center',
  },
  empty:     {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12},
  emptyText: {fontSize: 14, color: Colors.textMuted},
});




