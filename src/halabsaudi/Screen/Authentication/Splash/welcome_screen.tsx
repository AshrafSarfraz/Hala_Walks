import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Image, TouchableOpacity, Text, TextInput,KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback,Keyboard,Alert,} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../../Themes/Colors';
import { Bank, Profile_Img, W_logo, WW_Icon } from '../../../Themes/Images';
import { Fonts } from '../../../Themes/Fonts';

type SplashBlankProps = {
  navigation: NativeStackNavigationProp<any>;
};

const WelcomeScreen: React.FC<SplashBlankProps> = ({ navigation }) => {
  const [selected, setSelected] = useState<'customer' | 'community' | null>(null);
  const [code, setCode] = useState('');

  const handleSelection = (type: 'customer' | 'community') => {
    setSelected(type);
  };

  const handleContinue = () => {
    if (selected === 'customer') {
      navigation.navigate('Login');
    } else if (selected === 'community') {
      if (code.trim() === '24680') {
        navigation.navigate('WestwalkStack');
      } else {
        Alert.alert('Invalid community code. Please enter the correct code.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.Main_Container}>
            <StatusBar hidden={true} translucent={true} animated={true} />
            <Image source={W_logo} style={styles.logo} />

            <View style={styles.buttonRow}>
              {/* Customer Button */}
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  selected === 'customer' ? styles.selectedButton : styles.defaultButton,
                ]}
                onPress={() => handleSelection('customer')}
              >
                <Image
                  source={Profile_Img}
                  style={[
                    styles.buttonImage,
                    { tintColor: selected === 'customer' ? Colors.Green : 'white' },
                  ]}
                  resizeMode="contain"
                />
                <Text style={[styles.buttonText, selected === 'customer' && styles.selectedText]}>
                  Customer / Saudi Visitor
                </Text>
              </TouchableOpacity>

              {/* Community Button */}
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  selected === 'community' ? styles.selectedButton : styles.defaultButton,
                ]}
                onPress={() => handleSelection('community')}
              >
                <Image
                  source={WW_Icon}
                  style={[
                    styles.buttonImage2,
                    { tintColor: selected === 'community' ? Colors.Green : 'white' },
                  ]}
                  resizeMode="contain"
                />
                <Text style={[styles.buttonText, selected === 'community' && styles.selectedText]}>
                  West Walk Community
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input + Continue */}
            {selected && (
              <View style={styles.inputContainer}>
                {selected === 'community' && (
                  <TextInput
                    placeholder="Community code e.g. 12345"
                    placeholderTextColor="#ccc"
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
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.Green,
  },
  scrollContent: {
    flexGrow: 1,
  },
  Main_Container: {
    flex: 1,
    backgroundColor: Colors.Green,
    padding: 20,
    justifyContent: 'flex-start',
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginTop: 55,
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

  defaultButton: {
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  selectedButton: {
    borderColor: Colors.Green,
    backgroundColor: 'white',
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  buttonImage2:{
    width: 80,
    height: 80,

  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.SF_Bold,
  },
  selectedText: {
    color: Colors.Green,
  },
  inputContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 20,
    color: Colors.Green,
    fontFamily: Fonts.SF_Bold,
  },
  continueButton: {
    width: '100%',
    backgroundColor: 'white',
    height: 55,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:10
  },
  continueText: {
    color: Colors.Green,
    fontSize: 16,
    fontFamily: Fonts.SF_Bold,
    lineHeight: 20,
  },
});
