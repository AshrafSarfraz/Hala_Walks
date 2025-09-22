import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Linking,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import CustomButton from '../../Component/CustomButton/CustomButton';
import {useDispatch, useSelector} from 'react-redux';
import {toggleItemInCart} from '../../redux_toolkit/cartSlice';
import {RootState} from '../../redux_toolkit/store';
import {Dark_Heart, Light_Heart, Location} from '../../Themes/Images';
import Pin_Modal from '../../Component/CustomAlert/Pin_Modal';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import {getStyles} from './style';
import {languageData} from '../../redux_toolkit/language/languageSlice';
import MenuUnavailableModal from '../../Component/CustomAlert/MenuAlert';
import {Colors} from '../../Themes/Colors';
import FastImage from 'react-native-fast-image';
import Branches from '../../Component/BottomSheet/Branches';
const {width} = Dimensions.get('screen');

const DetailScreen: React.FC<{route: any}> = ({route}) => {
  const {item} = route.params;
  const dispatch = useDispatch();
  const refRBSheet = useRef<RBSheet>();
  const latitude = item.latitude ? item.latitude : null;
  const longitude = item.longitude ? item.longitude : null;
  const Address = item.address ? item.address : null;
  const phoneNumber = item.PhoneNumber;
  const navigation = useNavigation();

  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTimings, setShowTimings] = useState(false);

  // Redux Toolkit
  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some(cartItem => cartItem.id === item.id);

  const handleToggleCart = () => {
    dispatch(toggleItemInCart(item));
  };
  // Redux Toolkit

  // Alert Modal
  const showAlert = () => {
    setAlertVisible(true);
  };
  const hideAlert = () => {
    setAlertVisible(false);
  };
 
  // Modal

  // Google Map and Mobile Number
  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };
  const Contact = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };
  // Google Map and Mobile Number
  const daysArabic = {
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  return (
    <SafeAreaView>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.White4}
        barStyle="dark-content"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.HeaderCont}>
            <CustomHeader
              title={languageData[language].Detail_Screen}
              onBackPress={() => {
                navigation.goBack();
              }}
            />
            <TouchableOpacity
              onPress={() => {
                handleToggleCart();
              }}>
              {isInCart ? (
                <Image source={Dark_Heart} style={styles.HeartStyle} />
              ) : (
                <Image source={Light_Heart} style={styles.HeartStyle} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.Body_Cont}>
            {item.multiImageUrls && item.multiImageUrls.length > 0 ? (
            
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{marginBottom: 16}}>
                {item.multiImageUrls.map((url, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <FastImage
                      source={{uri: url}}
                      style={styles.imageSlider}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <FastImage
                source={{uri: item.img}} // fallback single image
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <View style={styles.Type_Cont}>
              <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
            </View>

            <View style={styles.Title_Cont}>
              {language === 'ar' ? (
                <Text style={styles.title}>{item.nameArabic}</Text>
              ) : (
                <Text style={styles.title}>{item.nameEng}</Text>
              )}

              <TouchableOpacity onPress={Contact} style={styles.call_cont}>
                <Image
                  source={require('../../assets/Icons/phone.png')}
                  style={styles.Phone_Icon}
                />
                <Text style={styles.call_txt}>
                  {languageData[language].Call_Now}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.Loc_Cont}>
              <Image source={Location} style={styles.Loc_Icon} />
              <Text style={styles.Loc_Txt}>{Address} </Text>
            </View>

            {/* Working Hours */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 5,
              }}>
              <TouchableOpacity
                onPress={() => setShowTimings(!showTimings)}
                style={styles.timing_dropdown}>
                <Text style={styles.working_hour_txt}>
                  {' '}
                  {languageData[language].Working_Hours || 'Working Hours'}{' '}
                </Text>
                <Text style={styles.dropdown_icon}>
                  {showTimings ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => refRBSheet.current.open()}
                style={styles.Redeem_btn}>
                <Text style={styles.use_txt}>{languageData[language].List_of_Branch}</Text>
              </TouchableOpacity>
            </View>
            <View style={{}}>
              {showTimings && item.timings && (
                <View
                  style={{
                    padding: 10,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    marginTop: 6,
                  }}>
                  {Object.entries(item.timings).map(([day, time]) => (
                    <View key={day} style={styles.item_cont}>
                      <Text style={{fontSize: 15, color: '#333'}}>
                        {language === 'ar'
                          ? daysArabic[day.toLowerCase()]
                          : day}
                      </Text>
                      <Text style={{fontSize: 15, color: '#000'}}>{time}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* working Hours */}

            <View style={styles.Dis_Cont}>
            
              <View style={styles.Dis_txt_cont}>
                {language === 'ar' ? (
                  <Text style={styles.Total_Discount}>
                    {' '}
                    {'' + item.discountArabic + ''}{' '}
                  </Text>
                ) : (
                  <Text style={styles.Total_Discount}>
                    {' '}
                    {'' + item.discount + ''}{' '}
                  </Text>
                )}
              </View>



              <TouchableOpacity
  style={styles.Menu_Btn}
  onPress={() => {
    const pdf = item.pdfUrl;
    const menu = item.menuUrl;

    if (pdf) {
      // PDF موجود ہے → PDFViewerScreen پر navigate کرو
      navigation.navigate('PDFViewerScreen', { pdfUrl: pdf });
    } else if (menu) {
      // اگر menu URL ہے → براہِ راست browser میں کھولو
      if (menu.startsWith('http')) {
        Linking.openURL(menu);
      } else {
        // اگر local file path ہے تو بھی PDFViewerScreen پر بھیج سکتے ہیں
        navigation.navigate('PDFViewerScreen', { pdfUrl: menu });
      }
    } else {
      // کوئی URL نہیں → modal کھولو
      setModalVisible(true);
    }
  }}
>


                <Text style={styles.menu_txt}>
                  {languageData[language].Avaliable_Offer}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.Desc_Cont}>
              <Text style={styles.Desc}>
                {languageData[language].description}
              </Text>
            </View>
            {language === 'ar' ? (
              <Text style={styles.Detail}>{item.descriptionArabic}</Text>
            ) : (
              <Text style={styles.Detail}>{item.descriptionEng}</Text>
            )}
          </View>

          <CustomButton
            title={languageData[language].Redeem}
            onPress={() => {
              showAlert();
            }}
          />
          <View style={{marginBottom: Platform.OS === 'ios' ? '5%' : '4%'}} />
          <CustomButton
            title={languageData[language].Open_Map}
            onPress={() => {
              handleOpenMaps();
            }}
          />
        </View>

        <Pin_Modal
          visible={alertVisible}
          correctPin={item.pin}
          brand={item.nameEng}
          address={item.address}
          discount={Number(item.discount) || 0}
          // optional: sirf info/analytics ke liye
          onSubmit={userPin => {
            // console.log('Correct PIN entered:', userPin);
          }}
          onClose={hideAlert}
        />

        <MenuUnavailableModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        <Branches
          ref={refRBSheet}
          brandName={item.nameEng} // ← YAHAN se filter hoga (agar Arabic se aata hai to nameArabic bhej dein)
          excludeId={item.id} // ← current branch ko list se hata do
          // onSelect={(branch) => console.log('Selected branch:', branch)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailScreen;
