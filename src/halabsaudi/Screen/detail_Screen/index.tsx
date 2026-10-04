import { useNavigation } from '@react-navigation/native';
import React,{ useMemo,useRef,useState } from 'react';
import { Image,Linking,Platform,ScrollView,TouchableOpacity,View } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch,useSelector } from 'react-redux';
import { Text } from '../../../ui/Text';
import Branches from '../../Component/BottomSheet/Branches';
import MenuUnavailableModal from '../../Component/CustomAlert/MenuAlert';
import Pin_Modal from '../../Component/CustomAlert/Pin_Modal';
import CustomButton from '../../Component/CustomButton/CustomButton';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import ImageGallery from '../../Component/Media/ImageGallery';
import { brandGallery } from '../../Component/Media/gallery';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';
import { Colors } from '../../Themes/Colors';
import { Dark_Heart,Light_Heart,Location } from '../../Themes/Images';
import { toggleItemInCart } from '../../redux_toolkit/cartSlice';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { RootState } from '../../redux_toolkit/store';
import { getStyles } from './style';

import { hbsText } from '../../i18n/translations';

const DetailScreen: React.FC<{route: any}> = ({route}) => {
  const {item} = route.params;
  useStatusBar('dark-content', Colors.background);
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
      <SafeAreaView edges={['top']} style={{backgroundColor: Colors.surface}}>
        <CustomHeader title={languageData[language].Detail_Screen} onBackPress={() => navigation.goBack()}
          right={<TouchableOpacity accessibilityRole="button" accessibilityLabel={language === 'ar' ? 'المفضلة' : 'Wishlist'}
            onPress={handleToggleCart} style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}>
            <Image source={isInCart ? Dark_Heart : Light_Heart} style={[styles.HeartStyle, {width: 24, height: 24, tintColor: Colors.accent}]} />
          </TouchableOpacity>} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.Body_Cont}>
            <ImageGallery images={sliderUrls} inset={16} height={240} />

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
                <Text style={[styles.offerBtnTitle, !hasOffer && {color: Colors.textSecondary}]}>
                  {hasOffer ? languageData[language].Avaliable_Offer : (language === 'ar' ? 'لا توجد قائمة متاحة' : 'No menu available')}
                </Text>
                <Text style={[styles.offerBtnSub, !hasOffer && {color: Colors.textSecondary}]}>
                  {hasOffer ? (language === 'ar' ? 'اضغط لعرض القائمة أو العرض' : 'Tap to open menu / offer') : (language === 'ar' ? 'لا توجد قائمة لهذه العلامة حاليًا' : 'This brand has no menu right now')}
                </Text>
              </View>
              <Text style={[styles.offerBtnArrow, !hasOffer && {color: Colors.textSecondary}]}>{language === 'ar' ? '‹' : '›'}</Text>
            </TouchableOpacity>

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
