import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { West_NB } from '../../theme/Images';
import { Colors } from '../../theme/Colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  data: {
    code: string;
    createdAt: string;
    validity?: string;
    eligibility?: string;
    employeeId?: string;
    qid?: string;
    brandName: string;
    nameEng?: string;
    discount?: string;
    percentage?: string;
  } | null;
};

const RedeemHistoryModal: React.FC<Props> = ({ visible, onClose, data }) => {
  if (!data) return null;

  const userData = {
    staffId: data?.employeeId || '',
    tenantId: '',
    orgEmpId: '',
    qid: data?.qid || '',
  };

  const pin = data?.code || 'N/A';
  const createdDate = new Date(data?.createdAt || '');
  const currentDate = createdDate.toLocaleDateString();

  const getEligibility = () => {
    return data?.eligibility || 'N/A';
  };

  const getStatusText = () => {
    if (!data?.createdAt) return 'Invalid date';

    const created = new Date(data.createdAt);
    const expiryDate = new Date(created);
    expiryDate.setDate(created.getDate() + 3);

    const today = new Date();

    if (today > expiryDate) {
      return 'Expired';
    } else {
      return ' ';
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ImageBackground
            source={require('../../assets/images/westwalk_Icon.png')}
            style={styles.BgImg}
            imageStyle={{
              resizeMode: 'contain',
              margin: 20,
              marginVertical: 80,
              opacity: 0.08,
            }}
          >
            <Image source={West_NB} style={styles.logo} resizeMode="contain" />
            <Text style={styles.heading}>Redeem Details</Text>
            <Text style={[styles.Status,]}>{getStatusText()}</Text> 

            <Detail label="Brand Name" value={data.nameEng || data.brandName} />
            <Detail
              label="Employee ID"
              value={
                userData.staffId ||
                userData.tenantId ||
                userData.orgEmpId ||
                'N/A'
              }
            />
            <Detail label="QID" value={userData.qid || 'N/A'} />
            <Detail label="Code" value={pin} />
            <Detail label="Date" value={`${currentDate} ${getStatusText()}`} />
            <Detail
              label="Discount"
              value={data.discount || data.percentage || 'N/A'}
            />
            <Detail label="Valid for" value={data.validity || '3 days'} />
            <Detail label="Eligibility" value={getEligibility()} />

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailBlock}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  BgImg: {
    backgroundColor: Colors.White,
    padding: 20,
    borderRadius: 20,
    width: '100%',
    resizeMode: 'contain',
  },
  logo: {
    width: 120,
    height: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2f2f75',
    textAlign: 'center',
  },
  detailBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#444',
    width: '40%',
  },
  value: {
    fontSize: 15,
    color: '#000',
    width: '55%',
    textAlign: 'right',
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
  Status:{
    color: 'red',
    textAlign:'center',
    fontSize: 18,
    marginBottom:'4%',
    fontWeight:'600',
    letterSpacing:0.4
  }
});

export default RedeemHistoryModal;
