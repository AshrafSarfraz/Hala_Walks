import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { Colors } from '../theme/Colors';
import { DropDownIcon,  ManIcon } from '../theme/Images';

type UserType = 'staff' | 'tenant'  | 'organization' | 'none';

type Option = {
  label: string;
  value: UserType;
};

type Props = {
  selected: UserType;
  onSelect: (value: UserType) => void;
};

const options: Option[] = [
  { label: 'None', value: 'none' },
  { label: 'Westwalk Staff', value: 'staff' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'Organization', value: 'organization' },
];

const CustomDropdown: React.FC<Props> = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  const getLabel = () => {
    const found = options.find((opt) => opt.value === selected);
    return found ? found.label : 'None';
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
          selected && selected !== 'none'
            ? { borderColor: Colors.PrimaryColor }
            : { borderColor: '#ccc' },
        ]}
        onPress={() => setOpen(true)}
      >
        <View style={styles.left_cont} >
         <Image source={ManIcon} style={styles.ManIcon} />
        <Text
          style={[
            styles.dropdownText,
            selected === 'none' && { color: '#999' },
          ]}
        >
          {getLabel()}
        </Text>
        </View>
        <Image source={DropDownIcon} style={styles.dropdownIcon} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        >
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdown: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    borderWidth: 2,
    borderRadius: 25,
    backgroundColor: Colors.White,
    marginBottom: 10,
    height:50,
    paddingLeft:16,
    width: '100%',
    borderColor: "#CCC",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3, // Optional for iOS
   
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  left_cont:{
    flexDirection:"row",
     alignItems:"center",
     justifyContent:"center"
  },
  ManIcon:{
     width:20,height:20,
     marginRight:10
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    borderRadius: 20,

    padding: 20,
  },
  dropdownIcon:{
   width:15,
   height:10,
   marginRight:20,
   resizeMode:"contain",
   transform: [{ rotate: '180deg' }] 
  },
  item: {
    padding: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});
