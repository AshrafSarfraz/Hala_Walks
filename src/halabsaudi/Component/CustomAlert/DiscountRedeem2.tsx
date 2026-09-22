import {Text} from '../../../ui/Text';

import React from 'react';
import {View, Modal, StyleSheet, Image, StatusBar} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { Giftpack } from '../../Themes/Images';
import CustomButton from '../CustomButton/CustomButton';

interface DiscountProps {
  visible: boolean;
  onClose: () => void;
  item: {
    code?: string;
    percentage?: string;
    createdAt?: any;
    brand?: string;
  } | null;
}

const Discount_Redeem2: React.FC<DiscountProps> = ({ visible, onClose, item }) => {
  if (!item) return null;
  const created = item.createdAt?.toDate?.() ?? (item.createdAt ? new Date(item.createdAt) : null);
  const date = created && !Number.isNaN(created.getTime()) ? created.toLocaleString() : '—';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <StatusBar hidden translucent animated />
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 🏷 Brand Name */}
          <Text style={styles.brandHeader}>
            {item.brand ?? 'Brand Name'}
          </Text>

          {/* 🎁 Icon */}
          <Image
            style={styles.image}
            source={Giftpack}
          />

          {/* 🔢 Code */}
          <Text style={styles.headerText}>Your discount code is:</Text>
          <Text style={styles.codeText}>{item.code}</Text>

          {/* 💸 Discount */}
          <Text style={styles.percentageText}>{item.percentage}</Text>

          {/* 📅 Used Date */}
          <Text style={styles.dateText}>Used on: {date}</Text>

          {/* ⏰ Expiry Warning */}
          <Text style={styles.expiryText}>This token expires in 1 day.</Text>

          {/* ℹ️ Note */}
          <Text style={styles.noteText}>
            This is a single-use code valid only for your account.
          </Text>

          {/* ✅ Close */}
          <CustomButton onPress={onClose} title="Close" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    backgroundColor: '#191B20',
    width: '85%',
    paddingVertical: 25,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  brandHeader: {
    fontSize: 20,
    fontFamily: Fonts.SF_Bold,
    color: '#F5F6F8',
    marginBottom: 5,
    textAlign: 'center',
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginVertical: 2,
  },
  headerText: {
    fontSize: 15,
    fontFamily: Fonts.SF_Regular,
    color: '#F5F6F8',
    marginTop: 10,
  },
  codeText: {
    fontSize: 26,
    fontFamily: Fonts.SF_Bold,
    color: '#F5F6F8',
    letterSpacing: 0.2,

  },
  percentageText: {
    fontSize: 22,
    fontFamily: Fonts.SF_Bold,
    color: '#F5F6F8',

  },
  dateText: {
    fontSize: 13,
    fontFamily: Fonts.SF_Regular,
    color: '#ABB2BF',

  },
  expiryText: {
    fontSize: 14,
    fontFamily: Fonts.SF_Bold,
    color: '#D32F2F',

  },
  noteText: {
    fontSize: 11,
    fontFamily: Fonts.SF_Regular,
    color: '#ABB2BF',
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default Discount_Redeem2;
