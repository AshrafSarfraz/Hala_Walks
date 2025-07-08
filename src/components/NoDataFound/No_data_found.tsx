import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import CustomHeader from '../header/CustomHeader';
import {useNavigation} from '@react-navigation/native';

const NoDataFound: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.Container}>
      <CustomHeader title=" " onBackPress={navigation.goBack} />
      <View style={styles.Body}>
        <Text>No Data Found</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex:1,
    marginTop: Platform.OS === 'ios' ? 40 : 30,
    paddingVertical: 20,
    backgroundColor: '#f4f4f4',
    width: '90%',
    alignSelf: 'center',
  },
  Body: {
    flex:1,
    justifyContent: 'center',
    alignItems:"center"
  },
});

export default NoDataFound;
