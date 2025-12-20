import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ImageSourcePropType } from 'react-native';
import { DropdownIcon } from '../../Themes/Images';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../redux_toolkit/store';
import { switchCountryName } from '../../redux_toolkit/selectcountry.tsx/countrySlice';

type Country = {
  name: 'Qatar' | 'Bahrain';
  code: 'QA' | 'BA';
  image: ImageSourcePropType;
};

type Props = {
  onSelectCountry?: (code: Country['code']) => void;
};

const countryOptions: Country[] = [
  { name: 'Qatar',   code: 'QA',  image: require('../../assets/Icons/Qatar_Flag.jpg') },
   { name: 'Bahrain', code: 'BA', image: require('../../assets/Icons/flag_bahrain.png') },
];

const CountryDropdown2: React.FC<Props> = ({ onSelectCountry }) => {
  const dispatch = useDispatch();

  // 🔹 Redux se current name lo
  const countryName = useSelector((s: RootState) => s.country.countryName);

  // 🔹 Local UI state (sirf open/selected ke liye)
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Country>(countryOptions[0]);

  // 🔹 Redux name -> UI selected sync
  useEffect(() => {
    const match = countryOptions.find(o => o.name === countryName);
    if (match) setSelected(match);
  }, [countryName]);

  const handleSelect = (c: Country) => {
    setSelected(c);
    setOpen(false);
    dispatch(switchCountryName(c.name));   // Redux me name store hota hai
    onSelectCountry?.(c.code);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Image source={selected.image} style={styles.flag} />
        {/* 🔹 Yahan hamesha Redux-synced code show hoga */}
        <Text style={styles.code}>{selected.code}</Text>
        <Image source={DropdownIcon} style={styles.icon} />
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          {countryOptions.map((c) => (
            <TouchableOpacity key={c.code} style={styles.item} onPress={() => handleSelect(c)}>
              <Image source={c.image} style={styles.flag} />
              <Text style={styles.itemCode}>{c.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const BORDER = '#E6E6E6';
const TEXT = '#111';

const styles = StyleSheet.create({
  container: { width: 60, backgroundColor: '#ffffff' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderWidth: 1, borderColor: BORDER, borderRadius: 6,
    paddingHorizontal: 3, gap: 2, backgroundColor: '#ffffff',
  },
  flag: { width: 14, height: 14, borderRadius: 2 },
  code: { fontSize: 12, fontWeight: '600', color: TEXT },
  icon: { width: 12, height: 12, tintColor: TEXT, marginLeft: 'auto' },
  menu: {
    position: 'absolute', top: 35, left: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 6,
    zIndex: 10, overflow: 'hidden',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    height: 34, paddingHorizontal: 6, gap: 6,
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: '#fff',
  },
  itemCode: { fontSize: 12, fontWeight: '500', color: TEXT },
});

export default CountryDropdown2;
