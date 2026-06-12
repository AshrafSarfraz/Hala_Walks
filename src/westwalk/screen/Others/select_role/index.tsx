import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar,} from 'react-native';
import { Back_Icon, Emp_User, ManIcon, Tenants, User, West_Icon } from '../../../theme/Images';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getStyles } from './style';
import { languageData } from '../../../redux/language/languageSlice';
import { Colors } from '../../../theme/Colors';


const RoleSelectionScreen:React.FC= () => {
  const navigation=useNavigation()
  const language = useSelector( (state: RootState) => state.language.language);
  const styles = getStyles(language);
 
  return (
    <View style={styles.container}>
          <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.PrimaryColor} barStyle='light-content' />
      <View style={styles.Header_Cont} >
      <TouchableOpacity onPress={()=>{navigation.navigate('WelcomeScreen')}} style={styles.Back_Btn}  >
        <Image style={{tintColor:Colors.White,width:25, height:25,alignSelf:"flex-start"}} source={Back_Icon}  />
       </TouchableOpacity>
      <Image source={West_Icon}  style={styles.logo} />
      <Text style={styles.heading}>{languageData[language].Welcome_to}{"\n"}{languageData[language].WestWalk_Family}</Text>
   
      </View>
     <View style={styles.Btn_Cont} >
     <Text style={styles.Role_Txt}>{languageData[language].Select_your_role}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StaffLogin')}>
        <View style={styles.innerButton}>
          <Image source={User} style={styles.user_icon} />
          <Text style={styles.buttonText}>{languageData[language].WestWalk_Employee}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TenantsLogin')}>
        <View style={styles.innerButton}>
          <Image source={Tenants} style={styles.icon} />
          <Text style={styles.buttonText}>{languageData[language].WestWalk_Tenant}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CorEmp_Login')}>
        <View style={styles.innerButton}>
          <Image source={Emp_User} style={styles.icon} />
          <Text style={styles.buttonText}>{languageData[language].Organization_Emp}</Text>
        </View>
      </TouchableOpacity>
    </View>
    </View>
  );
};



export default RoleSelectionScreen;