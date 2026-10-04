import {readLocationAccess} from '../../utils/locationPermissions';
import {Text} from '../../../ui/Text';
import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import {DropdownIcon} from '../../Themes/Images';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux_toolkit/store';
import {switchCountryName} from '../../redux_toolkit/selectcountry.tsx/countrySlice';
import Geolocation from '@react-native-community/geolocation';
import {Colors} from '../../Themes/Colors';

type Country = {
  name: 'Qatar' | 'Bahrain' | 'Saudi Arabia';
  code: 'QA' | 'BA' | 'SA';
  image: ImageSourcePropType;
};

type Props = {
  onSelectCountry?: (code: Country['code']) => void;
};

const countryOptions: Country[] = [
  {
    name: 'Qatar',
    code: 'QA',
    image: require('../../assets/Icons/Qatar_Flag.jpg'),
  },
  {
    name: 'Bahrain',
    code: 'BA',
    image: require('../../assets/Icons/flag_bahrain.png'),
  },
  // { name: 'Saudi Arabia', code: 'SA', image: require('../../assets/Icons/saudi.png') },
];

// ✅ Coordinates boundary check se country detect karna
const detectCountryFromCoords = (lat: number, lon: number): Country | null => {
  // Qatar boundary
  if (lat >= 24.4 && lat <= 26.2 && lon >= 50.7 && lon <= 51.7) {
    return countryOptions.find(c => c.code === 'QA') || null;
  }
  // Bahrain boundary
  if (lat >= 25.5 && lat <= 26.4 && lon >= 50.3 && lon <= 50.9) {
    return countryOptions.find(c => c.code === 'BA') || null;
  }
  // Saudi Arabia boundary
  if (lat >= 16.3 && lat <= 32.2 && lon >= 34.5 && lon <= 55.7) {
    return countryOptions.find(c => c.code === 'SA') || null;
  }
  return null;
};

const CountryDropdown2: React.FC<Props> = ({onSelectCountry}) => {
  const dispatch = useDispatch();
  const countryName = useSelector((s: RootState) => s.country.countryName);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Country>(countryOptions[0]);
  const [locationChecked, setLocationChecked] = useState(false);

  // ✅ Pehli baar app open ho to location se country detect karo
  useEffect(() => {
    // Agar Redux mein already country set hai to skip karo
    if (countryName) {
      const match = countryOptions.find(o => o.name === countryName);
      if (match) setSelected(match);
      setLocationChecked(true);
      return;
    }

    let live = true;
    const applyCountry = (country: Country) => {
      if (!live) return;
      setSelected(country);
      dispatch(switchCountryName(country.name));
      onSelectCountry?.(country.code);
      setLocationChecked(true);
    };
    const detectFromLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          applyCountry(
            detectCountryFromCoords(latitude, longitude) || countryOptions[0],
          );
        },
        () => applyCountry(countryOptions[0]),
        {enableHighAccuracy: false, timeout: 8000, maximumAge: 300000},
      );
    };
    void readLocationAccess()
      .then(access => {
        if (!live) return;
        if (access.foreground) detectFromLocation();
        else applyCountry(countryOptions[0]);
      })
      .catch(() => applyCountry(countryOptions[0]));
    return () => {
      live = false;
    };
  }, [countryName, dispatch, onSelectCountry]);

  // ✅ Redux name change hone par UI sync karo
  useEffect(() => {
    if (!locationChecked) return;
    const match = countryOptions.find(o => o.name === countryName);
    if (match) setSelected(match);
  }, [countryName, locationChecked]);

  const handleSelect = (c: Country) => {
    setSelected(c);
    setOpen(false);
    dispatch(switchCountryName(c.name));
    onSelectCountry?.(c.code);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}>
        <Image source={selected.image} style={styles.flag} />
        <Text style={styles.code}>{selected.code}</Text>
        <Image source={DropdownIcon} style={styles.icon} />
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          {countryOptions.map(c => (
            <TouchableOpacity
              key={c.code}
              style={styles.item}
              onPress={() => handleSelect(c)}>
              <Image source={c.image} style={styles.flag} />
              <Text style={styles.itemCode}>{c.code}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 65,
    backgroundColor: Colors.background,
    // zIndex: 999,
    // elevation: 999,      // ✅ Android
    borderRadius: 6,
    paddingHorizontal: 7,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 3,
    gap: 2,
    backgroundColor: Colors.background,
  },
  flag: {width: 14, height: 14, borderRadius: 2},
  code: {fontSize: 12, fontWeight: '600', color: Colors.white},
  icon: {width: 12, height: 12, tintColor: Colors.white, marginLeft: 'auto'},
  menu: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderWidth: 1,
    // zIndex: 999,
    // elevation: 1000,     // ✅ menu sabse upar
    overflow: 'visible',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 6,
    gap: 6,
    backgroundColor: Colors.background,
  },
  itemCode: {fontSize: 12, fontWeight: '500', color: Colors.white},
});

export default CountryDropdown2;
