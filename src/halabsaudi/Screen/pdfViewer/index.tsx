import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, StatusBar, SafeAreaView, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { useNavigation } from '@react-navigation/native';

const PDFViewerScreen:React.FC = ({ route }: any) => {
 const navigation=useNavigation()
  const { pdfUrl } = route.params;
  const source = { uri: pdfUrl, cache: true };

  return (
   <SafeAreaView style={{flex:1,backgroundColor:Colors.White}} >
   <View style={styles.container}>
          <StatusBar hidden={false} translucent={true} animated={true} backgroundColor={Colors.White4} barStyle='dark-content' />
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
    backgroundColor:Colors.White,
    marginTop:Platform.OS==='ios'?'0%':'8%'
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('screen').height,
  

  },
  CloseBtn:{
    position:'absolute',
    backgroundColor:Colors.Green,
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

