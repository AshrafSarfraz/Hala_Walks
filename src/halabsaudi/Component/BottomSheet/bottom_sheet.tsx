import {Text} from '../../../ui/Text';

import React, { forwardRef } from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Colors} from '../../Themes/Colors';

type RBSheetRef = React.ElementRef<typeof RBSheet>;

const FilterRBSheet = forwardRef<RBSheetRef>((props, ref) => {
  return (
    <RBSheet
      ref={ref}
      draggable={true}
      height={550}
      closeOnPressMask={true}
      customStyles={{
        wrapper: { backgroundColor: Colors.overlaySoft },
        container: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: Colors.surface,
          elevation: 10,
        },
        draggableIcon: { backgroundColor: Colors.surface },
      }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>🔐 How to Redeem Your Discount</Text>

        <Text style={styles.paragraph}>
          To successfully redeem your discount, please follow these steps:
        </Text>

        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>Visit the partner shop, restaurant, or service provider.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>Tap the <Text style={styles.highlight}>“Redeem”</Text> button on your phone.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>A PIN entry screen will appear.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>Hand your phone to the staff to enter the secret PIN.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>Once the PIN is correct, the discount will be applied.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>You will see a confirmation that your offer is redeemed.</Text>
        </View>

        <Text style={styles.subheading}>📌 Important Tips:</Text>

        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>The Redeem PIN is known only to the merchant staff.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.text}>Only tap Redeem when you are at the shop and ready to use the discount.</Text>
        </View>
      </ScrollView>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingVertical: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 15,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
  highlight: {
    fontWeight: '600',
    color: Colors.info,
  },
});

export default FilterRBSheet;
