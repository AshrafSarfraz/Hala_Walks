import React, {useState} from 'react';
import {TextInput, StyleSheet, View, Text, Image, TouchableOpacity, Linking} from 'react-native';
import {Hide, Lock, ManIcon, Show} from '../../theme/Images';
import { Colors } from '../../theme/Colors';
import CustomButton from '../buttons/CustomButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CustomCheckbox from '../checkbox/checkbox';
import { languageData } from '../../redux/language/languageSlice';

interface Props {}

const CorporationLogin = ({navigation}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [hide, setHide] = React.useState(true);
    const [isChecked, setIsChecked] = useState<boolean>(false);

  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
 
  const styles = getStyles(language);
  return (
    <View>
      <View style={[styles.InputContainer,email !== '' ? styles.Active_Input_Field : null ]}>
        <Image source={ManIcon} style={[styles.ManIcon, email!== '' ? styles.Active_Image : null]} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
      </View>

      <View style={[styles.InputContainer,password !== '' ? styles.Active_Input_Field : null ]}>
        <Image source={Lock} style={[styles.ManIcon, password!== '' ? styles.Active_Image : null]} />
        <TextInput
          secureTextEntry={hide}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordinput}
        />
         <TouchableOpacity onPress={()=>{setHide(!hide)}} >
          <Image source={hide ? Hide : Show} style={[styles.HideIcons,password!== '' ? styles.Active_Image : null]} />
         </TouchableOpacity>
      </View>
      <CustomCheckbox
            label={languageData[language].agree_to}
            isChecked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
            linkText={languageData[language].privacy_policy}
            onLinkPress={() => Linking.openURL('https://halabsaudi.com/privacy-policy-2/')}
          />
      <CustomButton title='Login' onPress={()=>{navigation.navigate('BottomNavigation')}} />

    </View>
  );
};

export default CorporationLogin;

const getStyles=(language:string)=> StyleSheet.create({
  InputContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#CCC",
    borderRadius: 25,
    height: 50,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3, // Optional for iOS
  },
  ManIcon: {
       width:20,height:20,
       resizeMode:"contain",
       marginLeft:12,
       marginRight:1,
       tintColor:Colors.Grey
  },
  input: {
    width:'80%',
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    fontSize:14,
  },
  passwordinput:{
    width:'75%',
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
  },
  HideIcons: {
    width:20,height:20,
    resizeMode:"contain",
    marginLeft:5,
    tintColor:Colors.Grey
},
Active_Input_Field:{
  borderWidth:2,
  borderColor:Colors.PrimaryColor,
},
Active_Image:{
  tintColor:Colors.PrimaryColor
}

});
