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

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

const AccountNotFoundModal: React.FC<Props> = ({
  visible,
  onClose,
  title = 'No Account Found',
  message = 'Please create your account first.',
  primaryLabel = 'Create Account',
  secondaryLabel = 'Cancel',
}) => {
  const navigation = useNavigation();

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <StatusBar hidden translucent animated />
      <View style={styles.overlay}>
        <Pressable style={styles.cardWrap}>
          {/* Title & message */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={secondaryLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.btnSecondaryTxt}>{secondaryLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, styles.btnPrimarySpacing]}
              onPress={() => {
                onClose();
                // @ts-ignore
                navigation.navigate('SignUp');
              }}
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.btnPrimaryTxt}>{primaryLabel}</Text>
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
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // soft dim
  },
  cardWrap: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    ...(Platform.OS === 'android' ? { elevation: 10 } : null),
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    color: Colors.Black,
    fontFamily: Fonts.SF_Bold,
    letterSpacing: 0.2,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#475569', // slate-600-ish
    // If you don't have SF_Regular, keep it Bold or switch to your regular face
    fontFamily: (Fonts as any).SF_Regular ?? Fonts.SF_Bold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
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
    borderColor: Colors.Green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryTxt: {
    fontSize: 14,
    fontFamily: Fonts.SF_Bold,
    color: '#0F766E', // slightly darker green for better contrast
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.Green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimarySpacing: {
    marginLeft: 10, // safer than 'gap' for older RN versions
  },
  btnPrimaryTxt: {
    fontSize: 14,
    fontFamily: Fonts.SF_Bold,
    color: '#FFFFFF',
  },
});

export default AccountNotFoundModal;
