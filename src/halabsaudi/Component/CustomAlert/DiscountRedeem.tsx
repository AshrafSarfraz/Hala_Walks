import {Text} from '../../../ui/Text';

import React from 'react';
import {Modal, View, StyleSheet, Image} from 'react-native';
import { Colors } from '../../Themes/Colors';
import { Fonts } from '../../Themes/Fonts';
import { Giftpack } from '../../Themes/Images';
import CustomButton from '../CustomButton/CustomButton';

type RedeemData = {
  id: string;
  code: string;
  percentage: string;
  brand: string;
  address: string;
  date: string;
  Username: string;
  phoneNumber: string;
  brandId:string;
  Redeempin:string
};

type Props = {
  visible: boolean;
  data: RedeemData | null;
  onClose: () => void;
};

const Discount_Redeem: React.FC<Props> = ({ visible, data, onClose }) => {
  if (!data) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      {/* StatusBar ko yahan hide NAHIN karna — parent modal handle kare */}
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            style={styles.gift}
            source={Giftpack}
          />
          <Text style={styles.header_Text}>{data.brand}</Text>
          <Text style={styles.code_Text}>{data.code}</Text>
          <Text style={styles.dis_Text}>{data.percentage}</Text>
         
         


          <Text style={styles.desc_Text}>
            This is a single-use code for your use only. Get a new code each time you open the app.
          </Text>

          <CustomButton onPress={onClose} title="Redeem" />
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
    backgroundColor: Colors.overlay,
  },
  container: {
    backgroundColor: Colors.surface,
    width: '80%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gift: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    marginVertical: 20,
  },
  header_Text: {
    fontSize: 16,
    fontFamily: Fonts.SF_Regular,
    lineHeight: 20,
    color: Colors.textPrimary,
    marginVertical: 10,
  },
  code_Text: {
    fontSize: 20,
    lineHeight: 30,
    fontFamily: Fonts.SF_Bold,
    color: Colors.textPrimary,
  },
  dis_Text: {
    fontSize: 18,
    lineHeight: 30,
    fontFamily: Fonts.SF_Bold,
    color: Colors.textPrimary,
    marginTop: '3%',
  },
  desc_Text: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: Fonts.SF_Regular,
    color: Colors.textMuted,
    marginVertical: 20,
    textAlign: 'center',
  },
});

export default Discount_Redeem;


// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
// import { Colors } from '../../Themes/Colors';
// import { Fonts } from '../../Themes/Fonts';
// import { Giftpack } from '../../Themes/Images';
// import CustomButton from '../CustomButton/CustomButton';

// type Props = {
//   visible: boolean;
//   data: {
//     id: string;
//     code: string;
//     percentage: string;
//     brand: string;
//     address: string;
//     date: string;
//     Username: string;
//     phoneNumber: string;
//   } | null;
//   onClose: () => void;
// };

// const Discount_Redeem: React.FC<Props> = ({ visible, data, onClose }) => {
//   if (!data) return null;

//   return (
//     <Modal transparent visible={visible} animationType="fade">
//     <StatusBar barStyle="light-content" />
//   <View style={styles.overlay}>
//     <View style={styles.container}>
//       <Image
//         style={{width: 150, height: 150, resizeMode: 'cover', marginVertical: 20}}
//         source={Giftpack}
//       />
//        {/* <Text style={styles.header_Text}>{address}</Text> */}
//       <Text style={styles.header_Text}>{data.brand}</Text>
//       <Text style={styles.code_Text}>{data.code}</Text>
//       <Text style={styles.dis_Text}>{data.percentage}</Text>
      
//       <Text style={styles.desc_Text}>
//         This is single use of code for your use only. Get a new code each
//         time you open the App
//       </Text>

//       <CustomButton onPress={onClose} title="Redeem" />
//     </View>
//   </View>
// </Modal>
    

//   );
// };




// const styles = StyleSheet.create({
//     overlay: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: Colors.overlay,
//     },
//     container: {
//       backgroundColor: Colors.white,
//       width: '80%',
//       paddingVertical: 20,
//       paddingHorizontal: 20,
//       borderRadius: 12,
//       alignItems: 'center',
//       elevation: 5, // For Android shadow
//       shadowColor: Colors.black, // For iOS shadow
//       shadowOffset: {width: 0, height: 3},
//       shadowOpacity: 0.2,
//       shadowRadius: 4,
//     },
//     closeButton: {
//       alignSelf: 'flex-end',
//       marginHorizontal: '3%',
//       marginBottom: '7%',
//       marginTop: '2%',
//     },
//     RemoveIcon: {
//       width: 25,
//       height: 25,
//       resizeMode: 'contain',
//       tintColor: Colors.brandGreen,
//     },
//     header_Text: {
//       fontSize: 16,
//       fontFamily: Fonts.SF_Regular,
//       lineHeight: 20,
//       color: Colors.brandGreen,
//       marginVertical: 10,
//     },
//     code_Text: {
//       fontSize: 20,
//       lineHeight: 30,
//        fontFamily:Fonts.SF_Bold,
//       color: Colors.brandGreen,
//     },
//     dis_Text: {
//       fontSize: 18,
//       lineHeight: 30,
//       fontFamily:Fonts.SF_Bold,
//       color: Colors.brandGreen,
//       marginTop:"3%"
    
//     },
//     desc_Text: {
//       fontSize: 10,
//       lineHeight:12,
//       fontFamily:Fonts.SF_Regular,
//       color: Colors.textMuted,
//       marginVertical:20,
//       textAlign:"center"
//     },
//   });
  

// export default Discount_Redeem;









