import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { Emp_User, ManIcon, Tenants, User, West_Icon } from '../../../theme/Images';
import { Colors } from '../../../theme/Colors';
import { Fonts } from '../../../theme/Fonts';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.Header_Cont} >
      <Image source={West_Icon}  style={styles.logo} />
      <Text style={styles.heading}>WELCOME TO {"\n"}WESTWALK FAMILY</Text>
   
      </View>
     <View style={styles.Btn_Cont} >
     <Text style={styles.Role_Txt}>Select your role to continue</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StaffLogin')}>
        <View style={styles.innerButton}>
          <Image source={User} style={styles.user_icon} />
          <Text style={styles.buttonText}>WEST-WALK EMPLOYEE</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Company')}>
        <View style={styles.innerButton}>
          <Image source={Tenants} style={styles.icon} />
          <Text style={styles.buttonText}>WEST-WALK TENANT</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Staff')}>
        <View style={styles.innerButton}>
          <Image source={Emp_User} style={styles.icon} />
          <Text style={styles.buttonText}>ORGANIZATION-EMP </Text>
        </View>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#31386A',
  },
  Header_Cont:{
    flex:0.33,
    alignItems:'center',
    justifyContent:'flex-end',
    paddingBottom:15
  },
  logo:{
    width: 150,
    height:110,
    resizeMode: 'contain',
    alignSelf:"center"
  },
  heading: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: Fonts.F_Bold,
    letterSpacing:0.2,
    lineHeight:26
  },
  Btn_Cont:{
  flex: Platform.OS === 'ios' ? 0.7 : 0.7,
  paddingTop:40,
  marginHorizontal:20,
  },
  Role_Txt:{
   fontSize:14,
    color:Colors.White,
    lineHeight:20,
    fontFamily:Fonts.F_Medium,
    marginBottom:15
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent:'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    height:90
  },
  innerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: Colors.PrimaryColor,
    marginLeft: 12,
    fontFamily:Fonts.F_Bold,
    letterSpacing:0.2
  },
  user_icon:{
    width: 22,
    height: 22,
    tintColor: Colors.PrimaryColor,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: Colors.PrimaryColor,
  },


});

export default RoleSelectionScreen;
