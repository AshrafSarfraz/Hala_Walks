import {Text} from '../../../../ui/Text';
import {TextInput} from '../../../../ui/TextInput';
import {Alert} from '../../../../ui/Alert';
import React, {useState} from 'react';
import {View, StyleSheet, StatusBar, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors} from '../../../Themes/Colors';
import { Full_logo_B, Full_logo_w, languageIcon, Logo_G, Profile_Img,WW_Icon} from '../../../Themes/Images';
import {Fonts} from '../../../Themes/Fonts';
import LanguageModal from '../../../Component/CustomAlert/Lan_Modal';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux_toolkit/store';
import { languageData } from '../../../redux_toolkit/language/languageSlice';
import { useStatusBar } from '../../../Component/UseStatusBar/useStatusBar';

type SplashBlankProps = {
  navigation: NativeStackNavigationProp<any>;
};

const WelcomeScreen: React.FC<SplashBlankProps> = ({navigation}) => {
  useStatusBar('dark-content', Colors.background);
  const [selected, setSelected] = useState<'customer' | 'community' | null>( null,);
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [code, setCode] = useState('');
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);



  const showAlert = () => {
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleSelection = (type: 'customer' | 'community') => {
    setSelected(type);
  };

  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.Main_Container}>
     
            <TouchableOpacity
              onPress={showAlert}
              activeOpacity={0.8}
              hitSlop={{top: 8, bottom: 10, left: 10, right: 10}}
              style={styles.languageFab}>
              <Image source={languageIcon} style={styles.languageIcon} />
            </TouchableOpacity>
            <Image source={Logo_G} style={styles.logo} />
            <Text style={styles.Passport_Txt} >{languageData[language].Passport_Txt}</Text>
            <View style={styles.buttonRow}>
              {/* Customer Button */}
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  selected === 'customer'
                    ? styles.selectedButton
                    : styles.defaultButton,
                ]}
                // onPress={() => handleSelection('customer')}
                onPress={() => {
                  navigation.navigate('Login'), handleSelection('customer');
                }}>
                <Image
                  source={Profile_Img}
                  style={[
                    styles.buttonImage,
                    {
                      tintColor:
                        selected === 'customer' ? Colors.accent : Colors.accent,
                    },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.buttonText,
                    selected === 'customer' && styles.selectedText,
                  ]}>
                 {languageData[language].Saudi_Visitor}
                </Text>
              </TouchableOpacity>

              {/* Community Button */}
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  selected === 'community'
                    ? styles.selectedButton
                    : styles.defaultButton,
                ]}
                onPress={() => {
                  navigation.navigate('WestwalkStack'),
                    handleSelection('customer');
                }}>
                <Image
                  source={WW_Icon}
                  style={[
                    styles.buttonImage2,
                    {
                      tintColor:
                        selected === 'community' ? Colors.accent : Colors.accent,
                    },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.buttonText,
                    selected === 'community' && styles.selectedText,
                  ]}>
                   {languageData[language].Westwalk_Community}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input + Continue */}
            {/* {selected && (
              <View style={styles.inputContainer}>
                {selected === 'community' && (
                  <TextInput
                    placeholder="Community code e.g. 12345"
                    placeholderTextColor={Colors.textSecondary}
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                  />
                )}
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                  <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )} */}
          </View>
          <LanguageModal visible={alertVisible} onClose={hideAlert} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;

const getStyles=(langauge:string) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  Main_Container: {
    flex: 1,
    backgroundColor: Colors.background ,
    paddingHorizontal: 20,
    paddingVertical:60,
    justifyContent: 'flex-start',
  },
  logo: {
    width: 250,
    height: 120,
    alignSelf: 'center',
    marginTop: 80,
    resizeMode: 'contain',
  },
  languageFab: {
    position: 'absolute',
    top: 70,        
    right: 35,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.surface, // soft white (glass look)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.overlaySubtle,

    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
    zIndex: 10,
  },
  
  languageIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: Colors.textPrimary, // ya Colors.black/Theme primary
  },


  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  selectButton: {
    width: '46%',
    height: 200,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  Passport_Txt:{
    color:Colors.warning,
    fontSize:16,
    fontFamily:Fonts.SF_Bold,
    textAlign:"center",
    alignSelf:"center",
    width:200,
    marginTop:10,
    lineHeight:22
  },
  defaultButton: {
    borderColor: Colors.border,
    backgroundColor: Colors.transparent,
  },
  selectedButton: {
    borderColor: Colors.surface,
    backgroundColor: Colors.surface,
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  buttonImage2: {
    width: 80,
    height: 80,
  },
  buttonText: {
    color: Colors.accent,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.SF_Bold,
  },
  selectedText: {
    color: Colors.textPrimary,
  },
  inputContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 20,
    color: Colors.textPrimary,
    fontFamily: Fonts.SF_Bold,
  },
  continueButton: {
    width: '100%',
    backgroundColor: Colors.surface,
    height: 55,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  continueText: {
    color: Colors.accent,
    fontSize: 16,
    fontFamily: Fonts.SF_Bold,
    lineHeight: 20,
  },
});
