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
import RBSheet from 'react-native-raw-bottom-sheet';

const {width} = Dimensions.get('screen');

const DetailScreen: React.FC<{route: any}> = ({route}) => {
  const {item} = route.params;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const refRBSheet = useRef<RBSheet>(null);

  const latitude = item?.latitude ?? null;
  const longitude = item?.longitude ?? null;
  const Address = item?.address ?? null;
  const phoneNumber = item?.PhoneNumber;

  const [alertVisible, setAlertVisible] = useState(false);

  // ✅ discount text + value (both)
  const [selectedDiscountText, setSelectedDiscountText] = useState<string>('');
  const [selectedDiscountValue, setSelectedDiscountValue] = useState<number>(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [showTimings, setShowTimings] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<any>({});

  const language = useSelector((state: RootState) => state.language.language);
  const styles = getStyles(language);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some(cartItem => cartItem.id === item.id);

  const handleToggleCart = () => dispatch(toggleItemInCart(item));

  const hideAlert = () => {
    setAlertVisible(false);
    setSelectedDiscountText('');
    setSelectedDiscountValue(0);
  };

  const handleLoad = (key: string | number) => {
    setImageLoaded((prev: any) => ({...prev, [key]: true}));
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const Contact = () => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const daysArabic: any = {
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        hidden={false}
        translucent
        animated
        backgroundColor={Colors.White4}
        barStyle="dark-content"
      />

      <View style={styles.HeaderCont}>
        <CustomHeader
          title={languageData[language].Detail_Screen}
          onBackPress={() => navigation.goBack()}
        />
        <TouchableOpacity onPress={handleToggleCart}>
          {isInCart ? (
            <Image source={Dark_Heart} style={styles.HeartStyle} />
          ) : (
            <Image source={Light_Heart} style={styles.HeartStyle} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.Body_Cont}>
            {/* Images */}
            {item.multiImageUrls && item.multiImageUrls.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{marginBottom: 16}}
                scrollEventThrottle={16}>
                {item.multiImageUrls.map((url: string, index: number) => (
                  <View key={index} style={styles.imageContainer}>
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      visible={!!imageLoaded[index]}
                      style={styles.imageSlider}>
                      <FastImage
                        source={{
                          uri: url,
                          priority:
                            index <= 1
                              ? FastImage.priority.high
                              : FastImage.priority.normal,
                        }}
                        style={styles.imageSlider}
                        resizeMode={FastImage.resizeMode.cover}
                        onLoadEnd={() => handleLoad(index)}
                        onError={() => handleLoad(index)}
                      />
                    </ShimmerPlaceholder>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                visible={!!imageLoaded['single']}
                style={styles.image}>
                <Image
                  source={{uri: item.img}}
                  style={styles.image}
                  resizeMode="cover"
                  onLoadEnd={() => handleLoad('single')}
                  onError={() => handleLoad('single')}
                />
              </ShimmerPlaceholder>
            )}

            <View style={styles.Type_Cont}>
              <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
            </View>

            <View style={styles.Title_Cont}>
              <Text style={styles.title}>
                {language === 'ar' ? item.nameArabic : item.nameEng}
              </Text>

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
              <Text style={styles.Loc_Txt}>{Address}</Text>
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
                  {languageData[language].Working_Hours || 'Working Hours'}
                </Text>
                <Text style={styles.dropdown_icon}>
                  {showTimings ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => refRBSheet.current?.open()}
                style={styles.Redeem_btn}>
                <Text style={styles.use_txt}>
                  {languageData[language].List_of_Branch}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              {showTimings && item.timings && (
                <View
                  style={{
                    padding: 10,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    marginTop: 6,
                  }}>
                  {Object.entries(item.timings).map(([day, time]: any) => (
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

            {/* ✅ Discounts (ALWAYS English) */}
            <View style={{width: '100%', marginBottom: 10}}>
              {Array.isArray(item?.discounts) && item.discounts.length > 0 ? (
                item.discounts.map((d: any, index: number) => {
                  const englishText = `${d.value} ${d.descriptionEng}`;
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.85}
                      style={[
                        styles.Dis_Cont,
                        {width: '100%', alignSelf: 'stretch', marginBottom: 10},
                      ]}
                      onPress={() => {
                        setSelectedDiscountText(englishText); // ✅ description
                        setSelectedDiscountValue(Number(d.value) || 0); // ✅ digit
                        setAlertVisible(true);
                      }}>
                      <Text style={styles.Total_Discount}>{englishText}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={[styles.Dis_Cont, {width: '100%'}]}>
                  <Text style={styles.Total_Discount}>undefined</Text>
                </View>
              )}
            </View>

            {/* Menu Button */}
            <TouchableOpacity
              style={styles.Menu_Btn}
              onPress={() => {
                const pdf = item.pdfUrl;
                const menu = item.menuUrl;

                if (pdf) {
                  navigation.navigate('PDFViewerScreen', {pdfUrl: pdf});
                } else if (menu) {
                  if (menu.startsWith('http')) {
                    Linking.openURL(menu);
                  } else {
                    navigation.navigate('PDFViewerScreen', {pdfUrl: menu});
                  }
                } else {
                  setModalVisible(true);
                }
              }}>
              <Text style={styles.menu_txt}>
                {languageData[language].Avaliable_Offer}
              </Text>
            </TouchableOpacity>

            <View style={styles.Desc_Cont}>
              <Text style={styles.Desc}>{languageData[language].description}</Text>
            </View>

            <Text style={styles.Detail}>
              {language === 'ar' ? item.descriptionArabic : item.descriptionEng}
            </Text>
          </View>

          <View style={{marginBottom: Platform.OS === 'ios' ? '5%' : '4%'}} />

          <CustomButton
            title={languageData[language].Open_Map}
            onPress={handleOpenMaps}
          />
        </View>

        {/* ✅ PIN MODAL */}
        <Pin_Modal
          visible={alertVisible}
          correctPin={item.pin}
          brand={item.nameEng}
          Redeempin={item.pin}
          address={item.address}
          discountText={selectedDiscountText}   // ✅ full text
          discountValue={selectedDiscountValue} // ✅ digit
          onClose={hideAlert}
        />

        <MenuUnavailableModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        <Branches
          ref={refRBSheet}
          brandName={item.nameEng}
          excludeId={item.id}
        />

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailScreen;
