// import React, { useEffect, useState } from 'react';
// import { Image, StyleSheet, Text, TouchableOpacity, View, ImageSourcePropType } from 'react-native';
// import { DropdownIcon } from '../../Themes/Images';
// import { useDispatch, useSelector } from 'react-redux';

// import { RootState } from '../../redux_toolkit/store';
// import { switchCountryName } from '../../redux_toolkit/selectcountry.tsx/countrySlice';

// type Country = {
//   name: 'Qatar' | 'Bahrain'| "Saudi Arabia";
//   code: 'QA' | 'BA'  | "SA";
  
//   image: ImageSourcePropType;
// };

// type Props = {
//   onSelectCountry?: (code: Country['code']) => void;
// };

// const countryOptions: Country[] = [
//   { name: 'Qatar',   code: 'QA',  image: require('../../assets/Icons/Qatar_Flag.jpg') },
//    { name: 'Bahrain', code: 'BA', image: require('../../assets/Icons/flag_bahrain.png') },
//    { name: 'Saudi Arabia', code: 'SA', image: require('../../assets/Icons/saudi.png') },
// ];

// const CountryDropdown2: React.FC<Props> = ({ onSelectCountry }) => {
//   const dispatch = useDispatch();

//   // 🔹 Redux se current name lo
//   const countryName = useSelector((s: RootState) => s.country.countryName);

//   // 🔹 Local UI state (sirf open/selected ke liye)
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState<Country>(countryOptions[0]);

//   // 🔹 Redux name -> UI selected sync
//   useEffect(() => {
//     const match = countryOptions.find(o => o.name === countryName);
//     if (match) setSelected(match);
//   }, [countryName]);

//   const handleSelect = (c: Country) => {
//     setSelected(c);
//     setOpen(false);
//     dispatch(switchCountryName(c.name));   // Redux me name store hota hai
//     onSelectCountry?.(c.code);
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.button} onPress={() => setOpen(!open)} activeOpacity={0.8}>
//         <Image source={selected.image} style={styles.flag} />
//         {/* 🔹 Yahan hamesha Redux-synced code show hoga */}
//         <Text style={styles.code}>{selected.code}</Text>
//         <Image source={DropdownIcon} style={styles.icon} />
//       </TouchableOpacity>

//       {open && (
//         <View style={styles.menu}>
//           {countryOptions.map((c) => (
//             <TouchableOpacity key={c.code} style={styles.item} onPress={() => handleSelect(c)}>
//               <Image source={c.image} style={styles.flag} />
//               <Text style={styles.itemCode}>{c.code}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// const BORDER = '#E6E6E6';
// const TEXT = '#111';

// const styles = StyleSheet.create({
//   container: { width: 60, backgroundColor: '#ffffff' },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 36,
//     borderWidth: 1, borderColor: BORDER, borderRadius: 6,
//     paddingHorizontal: 3, gap: 2, backgroundColor: '#ffffff',
//   },
//   flag: { width: 14, height: 14, borderRadius: 2 },
//   code: { fontSize: 12, fontWeight: '600', color: TEXT },
//   icon: { width: 12, height: 12, tintColor: TEXT, marginLeft: 'auto' },
//   menu: {
//     position: 'absolute', top: 35, left: 0, right: 0,
//     backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 6,
//     zIndex: 10, overflow: 'hidden',
//   },
//   item: {
//     flexDirection: 'row', alignItems: 'center',
//     height: 34, paddingHorizontal: 6, gap: 6,
//     borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: '#fff',
//   },
//   itemCode: { fontSize: 12, fontWeight: '500', color: TEXT },
// });

// export default CountryDropdown2;


import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ImageSourcePropType, Platform, PermissionsAndroid } from 'react-native';
import { DropdownIcon } from '../../Themes/Images';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { switchCountryName } from '../../redux_toolkit/selectcountry.tsx/countrySlice';
import Geolocation from '@react-native-community/geolocation';

type Country = {
  name: 'Qatar' | 'Bahrain' | 'Saudi Arabia';
  code: 'QA' | 'BA' | 'SA';
  image: ImageSourcePropType;
};

type Props = {
  onSelectCountry?: (code: Country['code']) => void;
};

const countryOptions: Country[] = [
  { name: 'Qatar',        code: 'QA', image: require('../../assets/Icons/Qatar_Flag.jpg') },
  { name: 'Bahrain',      code: 'BA', image: require('../../assets/Icons/flag_bahrain.png') },
  { name: 'Saudi Arabia', code: 'SA', image: require('../../assets/Icons/saudi.png') },
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

const CountryDropdown2: React.FC<Props> = ({ onSelectCountry }) => {
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

    const detectFromLocation = () => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const detected = detectCountryFromCoords(latitude, longitude);

          if (detected) {
            setSelected(detected);
            dispatch(switchCountryName(detected.name));
            onSelectCountry?.(detected.code);
          }
          // detected na ho to Qatar default rahega
          setLocationChecked(true);
        },
        error => {
          console.log('Location error:', error);
          setLocationChecked(true); // error par bhi Qatar default rahega
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    };

    const requestAndDetect = async () => {
      try {
        if (Platform.OS === 'android') {
          const already = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (already) {
            detectFromLocation();
            return;
          }
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'App aapki location se country detect karega.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            detectFromLocation();
          } else {
            setLocationChecked(true); // permission deny — Qatar default
          }
        } else {
          Geolocation.requestAuthorization();
          detectFromLocation();
        }
      } catch (e) {
        console.log('Permission error:', e);
        setLocationChecked(true);
      }
    };

    requestAndDetect();
  }, []);

  // ✅ Redux name change hone par UI sync karo
  useEffect(() => {
    if (!locationChecked) return;
    const match = countryOptions.find(o => o.name === countryName);
    if (match) setSelected(match);
  }, [countryName]);

  const handleSelect = (c: Country) => {
    setSelected(c);
    setOpen(false);
    dispatch(switchCountryName(c.name));
    onSelectCountry?.(c.code);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Image source={selected.image} style={styles.flag} />
        <Text style={styles.code}>{selected.code}</Text>
        <Image source={DropdownIcon} style={styles.icon} />
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          {countryOptions.map(c => (
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
  container: {
    width: 60,
    backgroundColor: '#ffffff',
    zIndex: 999,

  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderWidth: 1, borderColor: BORDER, borderRadius: 6,
    paddingHorizontal: 3, gap: 2, backgroundColor: '#ffffff',
  },
  flag:     { width: 14, height: 14, borderRadius: 2 },
  code:     { fontSize: 12, fontWeight: '600', color: TEXT },
  icon:     { width: 12, height: 12, tintColor: TEXT, marginLeft: 'auto' },
  menu: {
    position: 'absolute', top: 35, left: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 6,
    zIndex: 999, elevation: 10, overflow: 'visible',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    height: 34, paddingHorizontal: 6, gap: 6,
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: '#fff',
  },
  itemCode: { fontSize: 12, fontWeight: '500', color: TEXT },
});

export default CountryDropdown2;
