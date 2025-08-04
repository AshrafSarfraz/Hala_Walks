import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { DropdownIcon } from '../../Themes/Images';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';

type Country = {
  name: string;
  code: string;
  image: number;
};

type Props = {
  onSelectCountry: (countryCode: string) => void;
};

// ✅ Country Options with correct image paths
const countryOptions: Country[] = [
  { name: 'Saudi Arabia', code: '+966', image: require('../../assets/Icons/Saudi_Flag.png') },
  //  { name: 'Qatar', code: '+974', image: require('../../assets/Icons/Saudi_Flag.png') },
];

const CountryDropdown: React.FC<Props> = ({ onSelectCountry }) => {
  const [dropdown, setDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countryOptions[0]);

  const language = useSelector((state: RootState) => state.language.language);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setDropdown(false);
    onSelectCountry(country.code);
  };

  return (
    <View style={styles.Dropdown_Cont}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={[styles.Dropdown_Btn,{flexDirection:language==='en'?'row':'row-reverse'}]}
        onPress={() => setDropdown(!dropdown)}
      >
        <Image source={selectedCountry.image} style={styles.flag} />
        <Text style={styles.selectedText}>({selectedCountry.code})</Text>
        <Image source={DropdownIcon} style={styles.dropdown_Icon} />
      </TouchableOpacity>

      {/* Dropdown Options */}
      {dropdown && (
        <View style={styles.dropdown_Container}>
          {countryOptions.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={styles.Dropdown_ContItem}
              onPress={() => handleSelectCountry(country)}
            >
              <Image source={country.image} style={styles.flag} />
              <Text style={styles.dropdownText}>({country.code})</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  Dropdown_Cont: {
    alignSelf: 'center',
    width: 85,
  },
  Dropdown_Btn: {
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 6, // Added vertical padding to make it look less cramped
    borderRadius: 4,
    height: 50,
    justifyContent: 'space-between',

    shadowRadius: 4,
  },
  dropdown_Icon: {
    width: 12,
    height: 12,
    tintColor: Colors.Black,
  },
  flag: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  selectedText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.Black,
    flex: 1, // Push the icon to the right
  },
  dropdown_Container: {
    position: 'absolute',
    top: 54, // Positioning dropdown slightly lower for better spacing
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.grey1,
    elevation: 4, // Adding shadow for Android
  },
  Dropdown_ContItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height:50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey1,
  },
  dropdownText: {
    fontSize: 10,
    color: Colors.Black,
  },
});

export default CountryDropdown;
