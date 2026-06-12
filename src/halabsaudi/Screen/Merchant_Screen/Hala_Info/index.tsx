import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import { Colors } from '../../../Themes/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../../Component/CustomButton/CustomButton';

const HalaInfoScreen = () => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);



  return (
    <SafeAreaView style={styles.container}>
       <StatusBar hidden={false} translucent={true} animated={true}  backgroundColor={Colors.White} />
      <CustomHeader title='' onBackPress={()=>{navigation.goBack()}} />
      <View style={styles.Body} >
       <Image source={require('../../../assets/Images/partner.png')} style={styles.Img} />
      <Text style={styles.heading}>{languageData[language].heading}</Text>
      <Text style={styles.paragraph}>{languageData[language].description1}</Text>
      </View>
      <CustomButton title={languageData[language].continue} onPress={()=>navigation.navigate('PartnerForm')} />
   
    </SafeAreaView>
  );
};

export default HalaInfoScreen;

