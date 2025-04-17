import React, {useState} from 'react';
import {TextInput, StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import {Hide, Lock, ManIcon} from '../../theme/Images';
import { Colors } from '../../theme/Colors';
import CustomButton from '../buttons/CustomButton';

interface Props {}

const BrandsLogin = ({navigation}) => {
  const [employeeId, setEmployeeId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [hide, setHide] = React.useState(true);
  return (
    <View>
      <View style={[styles.InputContainer,employeeId !== '' ? styles.Active_Input_Field : null ]}>
        <Image source={ManIcon} style={styles.ManIcon} />
        <TextInput
          placeholder="Email"
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
        />
      </View>

      <View style={[styles.InputContainer,password !== '' ? styles.Active_Input_Field : null ]}>
        <Image source={Lock} style={styles.ManIcon} />
        <TextInput
          secureTextEntry={hide}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordinput}
        />
         <TouchableOpacity onPress={()=>{setHide(!hide)}} >
          <Image source={hide ? Hide : Lock} style={styles.HideIcons} />
         </TouchableOpacity>
      </View>
      <CustomButton title='Login' onPress={()=>{navigation.navigate('BottomNavigation')}} />

    </View>
  );
};

export default BrandsLogin;

const styles = StyleSheet.create({
  InputContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderWidth:1,
    borderColor: "#CCC",
    borderRadius:8,
    height:45,
    marginBottom:10
  },
  ManIcon: {
       width:20,height:20,
       resizeMode:"contain",
       marginLeft:12,
       marginRight:1
  },
  input: {
    width:'80%',
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
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
    marginLeft:5
},
Active_Input_Field:{
  borderWidth:1,
  borderColor:Colors.PrimaryColor,
}

});
