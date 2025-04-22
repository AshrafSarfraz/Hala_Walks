import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { West_NB } from '../../theme/Images'; // Your company logo
import { Colors } from '../../theme/Colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  data: {
    code: string;
    createdAt: string;
    percentage: string;
    validity?: string;
    eligibility?: string;
    staffId?: string;
    qid?: string;
    BrandName: string;
  } | null;
};

const RedeemReceiptModal: React.FC<Props> = ({ visible, onClose, data }) => {
  if (!data) return null;

  return (
    <Modal visible={visible} animationType='slide' transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ImageBackground source={require('../../assets/images/westwalk_Icon.png')} style={styles.BgImg} imageStyle={{resizeMode:"contain",margin:20,marginVertical:80,opacity:0.08}}>
            <Image source={West_NB} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Redeem Details</Text>

            {data.BrandName && (
              <View style={styles.detailBlock}>
                <Text style={styles.label}>Brand Name:</Text>
                <Text style={styles.value}>{data.BrandName}</Text>
              </View>
            )}

            {data.staffId && (
              <View style={styles.detailBlock}>
                <Text style={styles.label}>Employee ID:</Text>
                <Text style={styles.value}>{data.staffId}</Text>
              </View>
            )}

            {data.qid && (
              <View style={styles.detailBlock}>
                <Text style={styles.label}>QID:</Text>
                <Text style={styles.value}>{data.qid}</Text>
              </View>
            )}

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Code:</Text>
              <Text style={styles.value}>{data.code}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{data.createdAt}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Discount:</Text>
              <Text style={styles.value}>{data.percentage}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Valid for:</Text>
              <Text style={styles.value}>{data.validity ?? '7 days'}</Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.label}>Eligibility:</Text>
              <Text style={styles.value}>{data.eligibility}</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',  // Reduced width for a more compact view
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  BgImg: {
    backgroundColor:Colors.White,
    padding: 20,  // Reduced padding for better balance
    borderRadius: 20,
    width:"100%",
    resizeMode:"contain",
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,  // Slightly smaller heading
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2f2f75',
    textAlign: 'center',
  },
  detailBlock: {
    flexDirection: 'row',  // Added to align label and value horizontally
    justifyContent: 'space-between',  // Ensures even spacing between label and value
    marginBottom: 10,  // Reduced space between elements
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#444',
    width: '40%',  // Ensures the label takes up less space
  },
  value: {
    fontSize: 15,
    color: '#000',
    width: '55%',  // Ensures the value takes up most of the space
    textAlign: 'right',  // Align the value to the right
  },
  closeButton: {
    backgroundColor: '#2f2f75',
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RedeemReceiptModal;
