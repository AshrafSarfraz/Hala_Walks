import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, Platform} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import {Colors} from '../../Themes/Colors';
import {getAvatarColor} from '../../Themes/avatarColor';

type Props = {
  name: string;
  userId: string;
  avatarUri?: string | null;
  onBackPress: () => void;
};

export default function ChatScreenHeader({
  name,
  userId,
  avatarUri,
  onBackPress,
}: Props) {
  const fallbackColor = getAvatarColor(userId);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
        <Ionicons name='arrow-back' color="#fff" size={Platform.OS === 'ios' ? 30 : 16}/>
      </TouchableOpacity>

      <View style={styles.profileWrap}>
        {avatarUri ? (
          <Image source={{uri: avatarUri}} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatar, {backgroundColor: fallbackColor}]}>
            <Text style={styles.avatarText}>
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}

        <View style={styles.textWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {/* <Text style={styles.subtitle}>Tap for details</Text> */}
        </View>
      </View>

      {/* <TouchableOpacity style={styles.moreBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Green,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  profileWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#d1d5db',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  textWrap: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  moreBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
});