import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { Back_Icon } from '../../Themes/Images';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';

type HeaderProps = {
  title: string;
  onBackPress: () => void;
  backgroundColor?: string;   // ✅ optional 
  iconColor?: string;         // ✅ optional 
  textColor?: string;         // ✅ optional
};

const CustomHeader: React.FC<HeaderProps> = ({
  onBackPress,
  title,
  backgroundColor,
  iconColor,
  textColor,
}) => {
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  return (
    <View style={[styles.header, backgroundColor ? { backgroundColor } : null]}>
      <TouchableOpacity onPress={onBackPress}>
        <Image
          source={Back_Icon}
          style={[styles.backIcon, iconColor ? { tintColor: iconColor } : null]}
        />
      </TouchableOpacity>
      <Text style={[styles.headerText, textColor ? { color: textColor } : null]}>
        {title}
      </Text>
    </View>
  );
};

const getStyles = (language: String) => StyleSheet.create({
  header: {
    flexDirection: language === 'en' ? 'row' : 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.darkgrey,   // ✅ default
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: language === 'en' ? 12 : 0,
    marginLeft: language === 'ar' ? 12 : 0,
    tintColor: Colors.White,            // ✅ default
    transform: language === 'en' ? [{ scaleX: 1 }] : [{ scaleX: -1 }],
  },
  headerText: {
    fontSize: language === 'en' ? 18 : 16,
    fontFamily: Fonts.SF_Bold,
    lineHeight: language === 'en' ? 24 : 30,
    color: Colors.White,                // ✅ default
  },
});

export default CustomHeader;