import {Text} from '../Text';
import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import {Colors} from '../../theme/Colors';
import {Fonts} from '../../theme/Fonts';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

type Props = {
  title: string;
  image: ImageSourcePropType; // image URI
  onPress: () => void;
};

const CustomButton2: React.FC<Props> = ({title, image, onPress}) => {
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.leftSection}>
        <Image source={image} style={styles.image} />
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (language: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      paddingHorizontal: 15,
      marginVertical: 8,
      height: 58,
      marginHorizontal: 16,
      borderRadius: 14,
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    leftSection: {
      flexDirection: language === 'en' ? 'row' : 'row-reverse',
      alignItems: 'center',
    },
    image: {
      width: 20,
      height: 20,
      marginRight: language === 'en' ? 12 : 0,
      marginLeft: language === 'en' ? 0 : 12,
      tintColor: Colors.PrimaryColor,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 15,
      color: '#232C33',
      fontWeight: '400',
      fontFamily: Fonts.F_Regular,
      lineHeight: 20,
    },
  });

export default CustomButton2;
