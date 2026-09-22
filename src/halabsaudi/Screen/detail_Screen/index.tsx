import {Text} from '../../../ui/Text';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Image, TouchableOpacity, Platform, ScrollView, Linking, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
import {useStatusBar} from '../../Component/UseStatusBar/useStatusBar';

const {width} = Dimensions.get('screen');

const DetailScreen: React.FC<{route: any}> = ({route}) => {
  const {item} = route.params;
  useStatusBar('light-content', Colors.dargBg);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const refRBSheet = useRef<React.ElementRef<typeof RBSheet>>(null);

  const latitude = item?.latitude ?? null;
  const longitude = item?.longitude ?? null;
  const Address = item?.address ?? '';
  const phoneNumber = item?.PhoneNumber ?? '';

  const [alertVisible, setAlertVisible] = useState(false);

  const [selectedDiscountText, setSelectedDiscountText] = useState<string>('');
  const [selectedDiscountValue, setSelectedDiscountValue] = useState<number>(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [showTimings, setShowTimings] = useState(false);

  const [imageLoaded, setImageLoaded] = useState<{[k: string]: boolean}>({});
  const [activeIndex, setActiveIndex] = useState(0);

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

  const handleLoad = (key: string) => {
    setImageLoaded(prev => ({...prev, [key]: true}));
  };

  const handleOpenMaps = () => {
    if (!latitude || !longitude) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const Contact = () => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // ✅ preload / cache images (so bar bar load na ho)
  useEffect(() => {
    const urls: {uri: string; priority: any; cache: any}[] = [];

    const push = (u: any) => {
      const s = String(u || '').trim();
      if (s) {
        urls.push({
          uri: s,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        });
      }
    };

    if (Array.isArray(item?.multiImageUrls)) {
      item.multiImageUrls.forEach(push);
    }
    push(item?.heroImage);
    push(item?.img);

    if (urls.length) FastImage.preload(urls);
  }, [item]);

  const hasOffer = Boolean(item?.pdfUrl || item?.menuUrl);

  const onPressOffer = () => {
    const pdf = item?.pdfUrl;
    const menu = item?.menuUrl;

    if (pdf) {
      navigation.navigate('PDFViewerScreen', {pdfUrl: pdf});
      return;
    }

    if (menu) {
      if (String(menu).startsWith('http')) Linking.openURL(menu);
      else navigation.navigate('PDFViewerScreen', {pdfUrl: menu});
      return;
    }

    setModalVisible(true);
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

  const sliderUrls = useMemo(() => {
    const arr = Array.isArray(item?.multiImageUrls) ? item.multiImageUrls : [];
    return arr.filter(Boolean).map((x: any) => String(x));
  }, [item]);

  const mainImageUrl = useMemo(() => {
    return String(item?.heroImage || item?.img || '').trim();
  }, [item]);

  return (
    <View style={{flex: 1, backgroundColor: Colors.dargBg}}>
      <SafeAreaView edges={['top']} style={{backgroundColor: Colors.darkgrey}}>
        <View style={styles.HeaderCont}>
          <CustomHeader
            title={languageData[language].Detail_Screen}
            onBackPress={() => navigation.goBack()}
          />
          <TouchableOpacity onPress={handleToggleCart}>
            <Image
              source={isInCart ? Dark_Heart : Light_Heart}
              style={styles.HeartStyle}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.Body_Cont}>
            {/* ✅ Image Slider / Single Image */}
            {sliderUrls.length > 0 ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{marginBottom: 10}}
                  scrollEventThrottle={16}
                  onScroll={e => {
                    const i = Math.round(
                      e.nativeEvent.contentOffset.x / width,
                    );
                    setActiveIndex(i);
                  }}>
                  {sliderUrls.map((url: string, index: number) => {
                    const key = `slider-${index}`;
                    return (
                      <View key={key} style={styles.imageContainer}>
                        <ShimmerPlaceholder
                          LinearGradient={LinearGradient}
                          visible={!!imageLoaded[key]}
                          style={styles.imageSlider}>
                          <FastImage
                            source={{
                              uri: url,
                              priority:
                                index <= 1
                                  ? FastImage.priority.high
                                  : FastImage.priority.normal,
                              cache: FastImage.cacheControl.immutable,
                            }}
                            style={styles.imageSlider}
                            resizeMode={FastImage.resizeMode.cover}
                            onLoadEnd={() => handleLoad(key)}
                            onError={() => handleLoad(key)}
                          />
                        </ShimmerPlaceholder>
                      </View>
                    );
                  })}
                </ScrollView>

                {sliderUrls.length > 1 ? (
                  <View style={styles.dotsRow}>
                    {sliderUrls.map((_: unknown, i: number) => (
                      <View
                        key={`dot-${i}`}
                        style={[styles.dot, i === activeIndex ? styles.dotActive : null]}
                      />
                    ))}
                  </View>
                ) : null}
              </>
            ) : (
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                visible={!!imageLoaded['single']}
                style={styles.image}>
                <FastImage
                  source={{
                    uri: mainImageUrl,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.cover}
                  onLoadEnd={() => handleLoad('single')}
                  onError={() => handleLoad('single')}
                />
              </ShimmerPlaceholder>
            )}

            {/* Category */}
            <View style={styles.Type_Cont}>
              <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
            </View>

            {/* Title + Call */}
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

            {/* Address */}
            <View style={styles.Loc_Cont}>
              <Image source={Location} style={styles.Loc_Icon} />
              <Text style={styles.Loc_Txt} numberOfLines={2}>
                {Address}
              </Text>
            </View>

            {/* Working Hours + Branch List */}
            <View style={styles.rowBetween}>
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
                style={styles.branchBtn}>
                <Text style={styles.branchBtnText}>
                  {languageData[language].List_of_Branch}
                </Text>
              </TouchableOpacity>
            </View>

            {showTimings && item.timings && (
              <View style={styles.timingsCard}>
                {Object.entries(item.timings).map(([day, time]: any) => (
                  <View key={day} style={styles.item_cont}>
                    <Text style={styles.timingDay}>
                      {language === 'ar'
                        ? daysArabic[String(day).toLowerCase()] || day
                        : day}
                    </Text>
                    <Text style={styles.timingTime}>{String(time)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ✅ Modern Offer/Menu Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!hasOffer}
              style={[styles.offerBtn, !hasOffer ? styles.offerBtnDisabled : null]}
              onPress={onPressOffer}>
              <View style={styles.offerBtnLeft}>
                <Text style={styles.offerBtnTitle}>
                  {hasOffer ? languageData[language].Avaliable_Offer : 'No Menu Available'}
                </Text>
                <Text style={styles.offerBtnSub}>
                  {hasOffer ? 'Tap to open menu / offer' : 'This brand has no menu right now'}
                </Text>
              </View>
              <Text style={styles.offerBtnArrow}>{language === 'ar' ? '‹' : '›'}</Text>
            </TouchableOpacity>

            {/* Discounts */}
            <View style={{width: '100%', marginTop: 8}}>
              {Array.isArray(item?.discounts) && item.discounts.length > 0 ? (
                item.discounts.map((d: any, index: number) => {
                  const englishText = `${d.value} ${d.descriptionEng}`;
                  return (
                    <TouchableOpacity
                      key={`dis-${index}`}
                      activeOpacity={0.85}
                      style={styles.Dis_Cont}
                      onPress={() => {
                        setSelectedDiscountText(englishText);
                        setSelectedDiscountValue(Number(d.value) || 0);
                        setAlertVisible(true);
                      }}>
                      <Text style={styles.Total_Discount}>{englishText}</Text>
                      <Text style={styles.disArrow}>{language === 'ar' ? '‹' : '›'}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : null}
            </View>

            {/* Description */}
            <View style={styles.Desc_Cont}>
              <Text style={styles.Desc}>
                {languageData[language].description}
              </Text>
            </View>

            <Text style={styles.Detail}>
              {language === 'ar' ? item.descriptionArabic : item.descriptionEng}
            </Text>
          </View>

          <View style={{marginBottom: Platform.OS === 'ios' ? 18 : 14}} />

          <CustomButton
            title={languageData[language].Open_Map}
            onPress={handleOpenMaps}
          />
        </View>

        {/* PIN MODAL */}
        <Pin_Modal
          visible={alertVisible}
          correctPin={item.pin}
          brand={item.nameEng}
          Redeempin={item.pin}
          brandId={item._id}
          address={item.address}
          discountText={selectedDiscountText}
          discountValue={selectedDiscountValue}
          onClose={hideAlert}
        />

        <MenuUnavailableModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        <Branches ref={refRBSheet} brandName={item.nameEng} excludeId={item.id} />

        <View style={{height: 80}} />
      </ScrollView>
    </View>
  );
};

export default DetailScreen;