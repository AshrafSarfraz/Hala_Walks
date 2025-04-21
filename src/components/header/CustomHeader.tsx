import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';
import { Back_Icon } from '../../theme/Images';
import { Colors } from '../../theme/Colors';
import { RootState } from '../../redux/store';
import { Fonts } from '../../theme/Fonts';


type HeaderProps={
    title: string,
    onBackPress: () => void,
}

const CustomHeader:React.FC<HeaderProps> = ({onBackPress,title}) => {
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
  const styles = getStyles(language);
    return (
        <View style={styles.header}>
                <TouchableOpacity onPress={onBackPress}>
                  <Image source={Back_Icon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>{title}</Text>
              </View>
    );
}

const getStyles=(language:String)=> StyleSheet.create({
  header: {
    flexDirection: language==='en'?'row':'row-reverse',
    alignItems: 'center',
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight:language==='en'?12:0,
    marginLeft:language==='ar'?12:0,
    tintColor: Colors.PrimaryColor,
    transform:language==='en'?[{ scaleX:1}]:[{ scaleX:-1}]
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.F_Bold,
    lineHeight: 24,
    color: Colors.PrimaryColor,
  },

})

export default CustomHeader;
