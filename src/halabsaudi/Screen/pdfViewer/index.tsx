import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import {Text} from '../../../ui/Text';

import React from 'react';
import {View, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Platform} from 'react-native';
// ✅ FIX: RN ka SafeAreaView Android par no-op hai — isi liye '8%' hack lagana para tha
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { useNavigation } from '@react-navigation/native';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';

const PDFViewerScreen:React.FC = ({ route }: any) => {
  const navigation=useNavigation<NavigationProp<ParamListBase>>()
  const { pdfUrl } = route.params;
  const source = { uri: pdfUrl, cache: true };

  return (
   <SafeAreaView style={{flex:1,backgroundColor:'#191B20'}} edges={['top']}>
   <View style={styles.container}>
      <Pdf
       trustAllCerts={false}
       source={source}
        onLoadComplete={(numberOfPages) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page) => {
           console.log(`Current page: ${page}`);
        }}
        onError={(error) => {
           console.log('PDF load error:', error);
        }}
        onPressLink={(uri) => {
           console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
      />
      <TouchableOpacity style={styles.CloseBtn} onPress={()=>{navigation.goBack()}} >
        <Text style={styles.CloseTxt} >X</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#191B20',
    // ✅ marginTop '8%' hack hataya — ab SafeAreaView asli inset deta hai
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('screen').height,
  

  },
  CloseBtn:{
    position:'absolute',
    backgroundColor:Colors.btnRed,
    height:50,
    width:50,
    borderRadius:30,
    alignItems:"center",
    justifyContent:"center",
    right:15,
    top:15
  },
  CloseTxt:{
    color:Colors.White,
    fontSize:22,
    fontFamily:Fonts.SF_Medium
  }
  
});

export default PDFViewerScreen;

