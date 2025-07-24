import React from 'react';
import { View,  TouchableOpacity, Text, StatusBar, SafeAreaView, } from 'react-native';
import Pdf from 'react-native-pdf';

import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/Colors';
import { styles } from './style';


const PDFViewerScreen:React.FC = ({ route }: any) => {
 const navigation=useNavigation()
  const { pdfUrl } = route.params;
  const source = { uri: pdfUrl, cache: true };

  return (
   <SafeAreaView style={{flex:1,backgroundColor:Colors.White}} >
   <View style={styles.container}>
    <StatusBar hidden={true} translucent={true} animated={true} />
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



export default PDFViewerScreen;

