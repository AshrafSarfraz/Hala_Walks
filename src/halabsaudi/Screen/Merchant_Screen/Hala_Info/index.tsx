import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import {Text} from '../../../../ui/Text';
import React from 'react';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { getStyles } from './style';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import CustomHeader from '../../../Component/CustomHeader/CustomHeader';
import { Colors } from '../../../Themes/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../../../Component/CustomButton/CustomButton';
import { useStatusBar } from '../../../Component/UseStatusBar/useStatusBar';

const HalaInfoScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  useStatusBar('light-content', Colors.dargBg);
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title='' onBackPress={()=>{navigation.goBack()}} backgroundColor={Colors.dargBg} />
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