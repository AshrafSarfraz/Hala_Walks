// import {Text} from '../../../ui/Text';

// import React, { useState } from 'react';
// import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
// import { Colors } from '../../Themes/Colors';
// import { DropdownIcon } from '../../Themes/Images';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux_toolkit/store';

// type Country = {
//   name: string;
//   code: string;
//   image: number;
// };

// type Props = {
//   onSelectCountry: (countryCode: string) => void;
// };

// // ✅ Country Options with correct image paths
// const countryOptions: Country[] = [
//   { name: 'Saudi Arabia', code: '+966', image: require('../../assets/Icons/Saudi_Flag.png') },
//   // { name: 'Qatar',        code: '+974', image: require('../../assets/Icons/Qatar_Flag.jpg') },
//   // { name: 'Bahrain',      code: '+973', image:  require('../../assets/Icons/flag_bahrain.png') },
//   // { name: 'Kuwait',       code: '+965', image: require('../../assets/Icons/Kuwait_flag.png') },
//   // { name: 'Oman',         code: '+968', image: require('../../assets/Icons/Oman_flag.png') },
//   // { name: 'UAE',          code: '+971', image: require('../../assets/Icons/Uae_Flag.png') },



// ];

// const CountryDropdown: React.FC<Props> = ({ onSelectCountry }) => {
//   const [dropdown, setDropdown] = useState(false);
//   const [selectedCountry, setSelectedCountry] = useState<Country>(countryOptions[0]);

//   const language = useSelector((state: RootState) => state.language.language);

//   const handleSelectCountry = (country: Country) => {
//     setSelectedCountry(country);
//     setDropdown(false);
//     onSelectCountry(country.code);
//   };

//   return (
//     <View style={styles.Dropdown_Cont}>
//       {/* Dropdown Button */}
//       <TouchableOpacity
//         style={[styles.Dropdown_Btn,{flexDirection:language==='en'?'row':'row-reverse'}]}
//         onPress={() => setDropdown(!dropdown)}
//       >
//         <Image source={selectedCountry.image} style={styles.flag} />
//         <Text style={styles.selectedText}>({selectedCountry.code})</Text>
//         <Image source={DropdownIcon} style={styles.dropdown_Icon} />
//       </TouchableOpacity>

//       {/* Dropdown Options */}
//       {dropdown && (
//         <View style={styles.dropdown_Container}>
//           {countryOptions.map((country) => (
//             <TouchableOpacity
//               key={country.code}
//               style={styles.Dropdown_ContItem}
//               onPress={() => handleSelectCountry(country)}
//             >
//               <Image source={country.image} style={styles.flag} />
//               <Text style={styles.dropdownText}>({country.code})</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   Dropdown_Cont: {
//     alignSelf: 'center',
//     width: 85,
//   },
//   Dropdown_Btn: {
//     alignItems: 'center',
//     paddingHorizontal: 5,
//     paddingVertical: 6, // Added vertical padding to make it look less cramped
//     borderRadius: 4,
//     height: 50,
//     justifyContent: 'space-between',

//     shadowRadius: 4,
//   },
//   dropdown_Icon: {
//     width: 12,
//     height: 12,
//     tintColor: Colors.textPrimary,
//   },
//   flag: {
//     width: 16,
//     height: 16,
//     marginRight: 6,
//   },
//   selectedText: {
//     fontSize: 10,
//     fontWeight: '500',
//     color: Colors.textPrimary,
//     flex: 1, // Push the icon to the right
//   },
//   dropdown_Container: {
//     position: 'absolute',
//     top: 54, // Positioning dropdown slightly lower for better spacing
//     left: 0,
//     right: 0,
//     backgroundColor: Colors.surface,
//     borderRadius: 4,
//     zIndex: 10,
//     borderWidth: 0.6,
//     borderColor: Colors.black,
//     elevation: 4, // Adding shadow for Android
//   },
//   Dropdown_ContItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     height:40,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.textSecondary,
//   },
//   dropdownText: {
//     fontSize: 12,
//     color: Colors.textPrimary,
//     fontWeight:'bold'
//   },
// });

// export default CountryDropdown;



import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {Text} from '../../../ui/Text';
import {Colors} from '../../Themes/Colors';
import {DropdownIcon} from '../../Themes/Images';
import {RootState} from '../../redux_toolkit/store';

type Country = {
  name: string;
  code: string;
  image: number;
};

type Props = {
  countryCode?: string;
  onSelectCountry: (countryCode: string) => void;
  disabled?: boolean;
};

const saudiCountry: Country = {
  name: 'Saudi Arabia',
  code: '+966',
  image: require('../../assets/Icons/Saudi_Flag.png'),
};

// Qatar and Bahrain are selected through the phone prefix.
const countries: Country[] = [
  saudiCountry,
  {
    name: 'Qatar',
    code: '+974',
    image: require('../../assets/Icons/Qatar_Flag.jpg'),
  },
  {
    name: 'Bahrain',
    code: '+973',
    image: require('../../assets/Icons/flag_bahrain.png'),
  },
];

const CountryDropdown: React.FC<Props> = ({
  countryCode,
  onSelectCountry,
  disabled = false,
}) => {
  const [dropdown, setDropdown] = useState(false);
  const [localCode, setLocalCode] = useState('+966');

  const ar = useSelector(
    (state: RootState) => state.language.language === 'ar',
  );

  const selectedCountry =
    countries.find(country => country.code === (countryCode ?? localCode)) ??
    saudiCountry;

  const handleSelectCountry = (country: Country) => {
    setLocalCode(country.code);
    setDropdown(false);
    onSelectCountry(country.code);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={selectedCountry.name}
        accessibilityState={{disabled, expanded: dropdown}}
        disabled={disabled}
        activeOpacity={0.75}
        style={[
          styles.button,
          {flexDirection: ar ? 'row-reverse' : 'row'},
          disabled && styles.disabled,
        ]}
        onPress={() => setDropdown(previous => !previous)}>
        <Image source={selectedCountry.image} style={styles.flag} />

        <Text style={styles.selectedText}>
          {selectedCountry.code}
        </Text>

        <Image source={DropdownIcon} style={styles.dropdownIcon} />
      </TouchableOpacity>

      {dropdown && !disabled && (
        <View style={styles.options}>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.option}
            onPress={() => handleSelectCountry(saudiCountry)}>
            <Image source={saudiCountry.image} style={styles.flag} />

            <Text style={styles.optionText}>
              {saudiCountry.code}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: 96,
    zIndex: 30,
  },
  button: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 4,
  },
  flag: {
    width: 20,
    height: 15,
    resizeMode: 'cover',
    borderRadius: 2,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  dropdownIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    tintColor: Colors.textPrimary,
  },
  options: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    zIndex: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.textSecondary,
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 44,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    writingDirection: 'ltr',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CountryDropdown;