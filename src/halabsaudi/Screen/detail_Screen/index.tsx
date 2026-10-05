import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import React,{ useEffect,useMemo,useRef,useState } from 'react';
import { FlatList,Image,Linking,Platform,ScrollView,StatusBar,TouchableOpacity,View,useWindowDimensions } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { useDispatch,useSelector } from 'react-redux';
import { Text } from '../../../ui/Text';
import Branches from '../../Component/BottomSheet/Branches';
import MenuUnavailableModal from '../../Component/CustomAlert/MenuAlert';
import Pin_Modal from '../../Component/CustomAlert/Pin_Modal';
import CachedImage from '../../Component/Media/CachedImage';
import { brandGallery } from '../../Component/Media/gallery';
import { Colors } from '../../Themes/Colors';
import { toggleItemInCart } from '../../redux_toolkit/cartSlice';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { RootState } from '../../redux_toolkit/store';
import { getStyles,heroStyles } from './style';

import { hbsText } from '../../i18n/translations';

const ImageSlider = ({images, width}: {images: string[]; width: number}) => {
  const [index, setIndex] = useState(0);
  const identity = images.join('|');
  useEffect(() => setIndex(0), [identity, width]);
  return (
    <View>
      <FlatList
        key={`${identity}:${width}`}
        data={images.length ? images : ['']}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        initialNumToRender={2} maxToRenderPerBatch={2} windowSize={3}
        keyExtractor={(uri, i) => `${uri}:${i}`}
        getItemLayout={(_, i) => ({length: width, offset: width * i, index: i})}
        onMomentumScrollEnd={event => setIndex(Math.max(0, Math.min(images.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}
        renderItem={({item}) => <CachedImage uri={item} style={{width, height: Math.round(width * 0.8)}} resizeMode={FastImage.resizeMode.cover} />}
      />
      {images.length > 1 && <Text style={heroStyles.counter}>{index + 1} / {images.length}</Text>}
      {images.length > 1 && <View pointerEvents="none" style={heroStyles.dotsRow}>
        {images.map((uri, i) => <View key={`${uri}:${i}`} style={[heroStyles.dot, i === index && heroStyles.dotActive]} />)}
      </View>}
    </View>
  );
};

const DetailScreen: React.FC<{route: any}> = ({route}) => {
  const {item} = route.params;
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
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

  const handleOpenMaps = () => {
    if (latitude == null || longitude == null) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const Contact = () => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

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
    monday: hbsText(true, 'ui_monday'),
    tuesday: hbsText(true, 'ui_tuesday'),
    wednesday: hbsText(true, 'ui_wednesday'),
    thursday: hbsText(true, 'ui_thursday'),
    friday: hbsText(true, 'ui_friday'),
    saturday: hbsText(true, 'ui_saturday'),
    sunday: hbsText(true, 'ui_sunday'),
  };

  const sliderUrls = useMemo(() => brandGallery(item), [item]);

  return (
    <View style={{flex: 1, backgroundColor: Colors.background}}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never">
        <View>
          <ImageSlider images={sliderUrls} width={width} />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={language === 'ar' ? 'رجوع' : 'Back'}
            onPress={() => navigation.goBack()}
            style={[heroStyles.overlayButton, {top: insets.top + 8, left: 16}]}>
            <Ionicons name="arrow-back" size={24} color={Colors.onMedia} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={language === 'ar' ? 'المفضلة' : 'Wishlist'}
            accessibilityState={{selected: isInCart}}
            onPress={handleToggleCart}
            style={[heroStyles.overlayButton, {top: insets.top + 8, right: 16}]}>
            <Ionicons name={isInCart ? 'heart' : 'heart-outline'} size={24} color={isInCart ? Colors.accent : Colors.onMedia} />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <View style={styles.Body_Cont}>

            <View style={styles.Title_Cont}>
              <Text style={styles.title}>{language === 'ar' ? item.nameArabic || item.nameEng : item.nameEng || item.nameArabic}</Text>
              {!!item.selectedCategory && <View style={styles.Type_Cont}><Text style={styles.Type_Text}>{item.selectedCategory}</Text></View>}
            </View>
            <View style={styles.addressRow}>
              <View style={styles.Loc_Cont}>
                <Ionicons name="location-outline" size={21} color={Colors.textSecondary} />
                <Text style={styles.Loc_Txt}>{Address}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" onPress={Contact} style={styles.call_cont}>
                <Ionicons name="call" size={18} color={Colors.accent} />
                <Text style={styles.call_txt}>{languageData[language].Call_Now}</Text>
              </TouchableOpacity>
            </View>

            {/* Working Hours + Branch List */}
            <View style={styles.rowBetween}>
              <TouchableOpacity
                onPress={() => setShowTimings(!showTimings)}
                style={styles.timing_dropdown}>
                <Ionicons name="time-outline" size={22} color={Colors.accent} />
                <Text style={styles.working_hour_txt}>
                  {languageData[language].Working_Hours || 'Working Hours'}
                </Text>
                <Text style={styles.dropdown_icon}>
                  {showTimings ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => refRBSheet.current?.open()}
                style={styles.branchBtn}>
                <Ionicons name="storefront-outline" size={22} color={Colors.accent} />
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

            {/* Discounts */}
            <View style={{width: '100%', marginTop: 8}}>
              {Array.isArray(item?.discounts) && item.discounts.length > 0 ? (
                item.discounts.map((d: any, index: number) => {
                  const englishText = `${d.value} ${language === 'ar' ? d.descriptionArabic || d.descriptionEng : d.descriptionEng}`;
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
                      <Ionicons name="pricetag-outline" size={25} color={Colors.accent} />
                      <Text style={styles.Total_Discount}>{englishText}</Text>
                      <View style={styles.redeemBadge}><Text style={styles.redeemText}>{language === 'ar' ? 'استبدال العرض' : 'Redeem offer'}</Text></View>
                    </TouchableOpacity>
                  );
                })
              ) : null}
            </View>

            {/* ✅ Modern Offer/Menu Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!hasOffer}
              style={[styles.offerBtn, !hasOffer ? styles.offerBtnDisabled : null]}
              onPress={onPressOffer}>
              <Ionicons name="document-text-outline" size={25} color={hasOffer ? Colors.accent : Colors.textMuted} />
              <View style={styles.offerBtnLeft}>
                <Text style={[styles.offerBtnTitle, !hasOffer && {color: Colors.textSecondary}]}>
                  {hasOffer ? languageData[language].Avaliable_Offer : (language === 'ar' ? 'لا توجد قائمة متاحة' : 'No menu available')}
                </Text>
                <Text style={[styles.offerBtnSub, !hasOffer && {color: Colors.textSecondary}]}>
                  {hasOffer ? (language === 'ar' ? 'اضغط لعرض القائمة أو العرض' : 'Tap to open menu / offer') : (language === 'ar' ? 'لا توجد قائمة لهذه العلامة حاليًا' : 'This brand has no menu right now')}
                </Text>
              </View>
              <Text style={[styles.offerBtnArrow, !hasOffer && {color: Colors.textSecondary}]}>{language === 'ar' ? '‹' : '›'}</Text>
            </TouchableOpacity>

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

          <TouchableOpacity accessibilityRole="button" onPress={handleOpenMaps} style={styles.mapButton}>
            <Ionicons name="map-outline" size={24} color={Colors.onAccent} />
            <Text style={styles.mapText}>{languageData[language].Open_Map}</Text>
          </TouchableOpacity>
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

        <View style={{height: Math.max(insets.bottom, 16)}} />
      </ScrollView>
    </View>
  );
};

export default DetailScreen;
