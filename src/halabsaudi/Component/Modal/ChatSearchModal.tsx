import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Colors } from "../../Themes/Colors";
import { getAvatarColor } from "../../Themes/avatarColor";

type Props = {
  visible: boolean;
  onClose: () => void;
  data: any[]; // conversations array
  onSelect: (item: any) => void;
};

export default function ChatSearchModal({ visible, onClose, data = [], onSelect }: Props) {
  const [search, setSearch] = useState("");

  // Filter conversations directly, no setState
  const filtered = data.filter((item) =>
    item?.participant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: any) => {
    const name = item.participant?.name || "User";
    const avatarLetter = name.charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(item.participant?._id || name);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          onSelect(item);
          setSearch(""); // reset search
          onClose();
        }}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TextInput
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            autoFocus
            style={styles.searchInput}
          />
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              onClose();
            }}
          >
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* RESULTS */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No conversations found</Text>}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Bg },
  header: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: Colors.Grey4 },
  searchInput: { flex: 1, backgroundColor: Colors.White, borderRadius: 10, paddingHorizontal: 12, height: 40 },
  cancel: { marginLeft: 10, color: Colors.Green, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 0.5, borderColor: Colors.Grey4 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: Colors.White, fontWeight: "bold", fontSize: 16 },
  name: { fontSize: 16, color: Colors.Black2, fontWeight: "500" },
  empty: { textAlign: "center", marginTop: 30, color: Colors.Grey5 },
});
