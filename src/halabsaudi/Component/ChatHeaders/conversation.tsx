import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../Themes/Colors';
import Ionicons from '@react-native-vector-icons/ionicons';

type Props = {
  title?: string;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
};

export default function ConversationHeader({
  title = 'Chats',
  onSearchPress,
  onMenuPress,
}: Props) {
  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* RIGHT SIDE ACTIONS */}
      {/* <View style={styles.actions}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconBtn}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Green,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop:50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,

  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  actions: {
    flexDirection: 'row',
  },

  iconBtn: {
    marginLeft: 15,
  },
});