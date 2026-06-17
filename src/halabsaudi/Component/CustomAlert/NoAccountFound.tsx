import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Pressable,
  Platform,
} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux_toolkit/store';
import { languageData } from '../../redux_toolkit/language/languageSlice';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AccountNotFoundModal: React.FC<Props> = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const language = useSelector((state: RootState) => state.language.language);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <StatusBar hidden translucent animated />
      <View style={styles.overlay}>
        <Pressable style={styles.cardWrap}>
          {/* Title & message */}
          <Text style={styles.title}>{languageData[language].No_Account_Found}</Text>
          <Text style={styles.message}>{languageData[language].Please_create_your_account_first}</Text>

          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={languageData[language].cancel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.btnSecondaryTxt}>{languageData[language].cancel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, styles.btnPrimarySpacing]}
              onPress={() => {
                onClose();
                // @ts-ignore
                navigation.navigate('SignUp');
              }}
              accessibilityRole="button"
              accessibilityLabel={languageData[language].Create_account}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.btnPrimaryTxt}>{languageData[language].Create_account}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
};

const CARD_MAX_WIDTH = 320;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // darker dim for dark theme
  },
  cardWrap: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    borderRadius: 16,
    backgroundColor: Colors.dargBg,        // ✅ dark card
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)', // subtle light border
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    ...(Platform.OS === 'android' ? { elevation: 10 } : null),
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    color: Colors.White,                   // ✅ white title
    fontFamily: Fonts.SF_Bold,
    letterSpacing: 0.2,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',        // ✅ soft white message
    fontFamily: (Fonts as any).SF_Regular ?? Fonts.SF_Bold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)', // ✅ light divider on dark
    marginVertical: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryTxt: {
    fontSize: 14,
    fontFamily: Fonts.SF_Bold,
    color: Colors.Red,                    // ✅ green text on dark
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.Red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimarySpacing: {
    marginLeft: 10,
  },
  btnPrimaryTxt: {
    fontSize: 14,
    fontFamily: Fonts.SF_Bold,
    color: Colors.White,
  },
});

export default AccountNotFoundModal;