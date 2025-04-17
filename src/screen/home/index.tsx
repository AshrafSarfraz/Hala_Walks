import React from 'react';
import { StyleSheet, View,Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '../../theme/Fonts';

const Home = () => {
    return (
        <SafeAreaView style={{flex:1,backgroundColor:"yellow"}} >
         <StatusBar hidden={false} translucent={true} animated={true} />
        <View style={{flex:1,backgroundColor:"red",alignItems:"center",justifyContent:"center"}} >
            <Text style={{fontSize:20, fontFamily:Fonts.SF_Bold}} >  Home</Text>
          
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({})

export default Home;
