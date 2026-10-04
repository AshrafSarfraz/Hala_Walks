import Geolocation from '@react-native-community/geolocation';
import React,{ useEffect,useState } from 'react';
import { Image,ImageSourcePropType,StyleSheet,TouchableOpacity,View } from 'react-native';
import { useDispatch,useSelector } from 'react-redux';
import { Text } from '../../../ui/Text';
import { Colors } from '../../Themes/Colors';
import { DropdownIcon } from '../../Themes/Images';
import { permissionStatus } from '../../permissions/service';
import { switchCountryName } from '../../redux_toolkit/selectcountry.tsx/countrySlice';
import { RootState } from '../../redux_toolkit/store';

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
        if (await permissionStatus('location') === 'granted') detectFromLocation();
        else setLocationChecked(true);
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
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 3, gap: 2, backgroundColor:Colors.background,
  },
  flag:     { width: 14, height: 14, borderRadius: 2 },
  code:     { fontSize: 12, fontWeight: '600', color: Colors.textPrimary,  },
  icon:     { width: 12, height: 12, tintColor:Colors.textPrimary  , marginLeft: 'auto' },
  menu: {
    position: 'absolute', top: 35, left: 0, right: 0,
    backgroundColor: Colors.background, borderWidth: 1,
    // zIndex: 999,
    // elevation: 1000,     // ✅ menu sabse upar
    overflow: 'visible',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    height: 30, paddingHorizontal: 6, gap: 6, backgroundColor: Colors.background,
  },
  itemCode: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary,    },
});

export default CountryDropdown2;
