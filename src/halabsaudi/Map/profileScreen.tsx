import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config/api';

const WIDTH = Dimensions.get('window').width;
const SIZE = WIDTH / 3;

const MapProfile = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('hala_token');

      const res = await axios.get(
        `${BASE_URL}/api/hbs/map/my-checkins`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPosts(res.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelected(item)}>
        <Image
          source={{uri: item.image}}
          style={styles.gridImage}
        />

        {/* Location tag */}
        <View style={styles.locationTag}>
          <Text style={styles.locationText}>
            📍 {item.location?.name || 'Location'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

  <View style={styles.topRow}>

    <Image
      source={{
        uri:
          posts?.[0]?.user?.profilePhoto ||
          'https://i.pravatar.cc/300',
      }}
      style={styles.avatar}
    />

    <View style={styles.stats}>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {posts.length}
        </Text>
        <Text style={styles.statLabel}>
          Posts
        </Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>12k</Text>
        <Text style={styles.statLabel}>
          Followers
        </Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>245</Text>
        <Text style={styles.statLabel}>
          Following
        </Text>
      </View>

    </View>

  </View>

  <Text style={styles.profileName}>
    {posts?.[0]?.user?.name || 'Your Profile'}
  </Text>

  <Text style={styles.profileBio}>
    📍 Exploring places • Capturing moments
  </Text>

  <TouchableOpacity style={styles.editBtn}>
    <Text style={styles.editBtnText}>
      Edit Profile
    </Text>
  </TouchableOpacity>

</View>

      {/* GRID */}
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* FULLSCREEN MODAL */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}>

        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelected(null)}>
            <Text style={{color: '#fff', fontSize: 18}}>✕</Text>
          </TouchableOpacity>

          {selected && (
            <>
              <Image
                source={{uri: selected.image}}
                style={styles.fullImage}
                resizeMode="contain"
              />

              {/* LOCATION OVERLAY */}
              <View style={styles.overlay}>
                <Text style={styles.overlayLocation}>
                  📍 {selected.location?.name}
                </Text>

                {!!selected.caption && (
                  <Text style={styles.caption}>
                    {selected.caption}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>

    </View>
  );
};

export default MapProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ───────────────── HEADER ─────────────────

  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#e5e5e5',
    borderWidth: 3,
    borderColor: '#6C4EFF',
  },

  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginLeft: 20,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  statLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 14,
  },

  profileBio: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },

  editBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },

  editBtnText: {
    fontWeight: '600',
    color: '#111',
  },

  // ───────────────── GRID ─────────────────

  gridWrapper: {
    position: 'relative',
    margin: 1,
  },

  gridImage: {
    width: SIZE - 2,
    height: SIZE - 2,
    backgroundColor: '#f2f2f2',
  },

  locationTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  locationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 120,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginTop: 20,
  },

  emptyText: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ───────────────── MODAL ─────────────────

  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  closeBtn: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 100,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 42,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  overlayLocation: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  caption: {
    color: '#f5f5f5',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
});