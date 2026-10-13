import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from '../../../components/Text';
import CachedImage from '../../../components/Media/CachedImage';
import BranchesModal from '../../../components/Modal/BranchesModal';
import PinModal from '../../../components/Modal/CustomAlert/Pin_Modal';
import IncorrectPin from '../../../components/Modal/CustomAlert/IncorrectPin';
import MenuAlert from '../../../components/Modal/CustomAlert/MenuAlert';
import StaffReceipt from '../../../components/Modal/StaffModal/RedeemModal';
import TenantReceipt from '../../../components/Modal/Tenant/RedeemModal2';
import OrganizationReceipt from '../../../components/Modal/OrgEmp/RedeemModal3';
import {RootState} from '../../../redux/store';
import {toggleItemInCart} from '../../../redux/cartSlice';
import {Colors} from '../../../theme/Colors';
import {
  discountLabel,
  galleryImages,
  offerRows,
  OfferRow,
  validRedeemPin,
} from '../../../utils/offers';
import {getStyles, heroStyles} from './style';
const ImageSlider = React.memo(function ImageSlider({
  images,
  width,
  topInset,
}: {
  images: string[];
  width: number;
  topInset: number;
}) {
  const [index, setIndex] = useState(0);
  const height = Math.max(Math.round(width * 0.8), topInset + 180);
  const key = `${width}:${images.join('|')}`;
  useEffect(() => setIndex(0), [key]);
  return (
    <View>
      <FlatList
        key={key}
        data={images.length ? images : ['']}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        keyExtractor={(uri, i) => `${uri}:${i}`}
        getItemLayout={(_, i) => ({length: width, offset: width * i, index: i})}
        onMomentumScrollEnd={event =>
          setIndex(
            Math.max(
              0,
              Math.min(
                images.length - 1,
                Math.round(event.nativeEvent.contentOffset.x / width),
              ),
            ),
          )
        }
        renderItem={({item}) => (
          <CachedImage uri={item} style={{width, height}} />
        )}
      />
      {images.length > 1 && (
        <>
          <Text style={heroStyles.counter}>
            {index + 1} / {images.length}
          </Text>
          <View pointerEvents="none" style={heroStyles.dotsRow}>
            {images.map((uri, i) => (
              <View
                key={`${uri}:${i}`}
                style={[heroStyles.dot, i === index && heroStyles.dotActive]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
});
export default function DetailScreen({route}: {route: any}) {
  const item = route.params?.item || {};
  const event = route.params?.source === 'event';
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const language = useSelector((s: RootState) => s.language.language);
  const ar = language === 'ar';
  const styles = useMemo(() => getStyles(language), [language]);
  const images = useMemo(() => galleryImages(item), [item]);
  const offers = useMemo(() => offerRows(item), [item]);
  const cart = useSelector((s: RootState) => s.cart.items);
  const saved = cart.some(b => b.id === item.id);
  const [showTimings, setShowTimings] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);
  const [showMenuAlert, setShowMenuAlert] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferRow | null>(null);
  const [userType, setUserType] = useState<'staff' | 'tenant' | 'org' | null>(
    null,
  );
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const values = await AsyncStorage.multiGet([
          'staff_data',
          'tenant_data',
          'org_emp_data',
        ]);
        if (mounted)
          setUserType(
            values[0][1]
              ? 'staff'
              : values[1][1]
              ? 'tenant'
              : values[2][1]
              ? 'org'
              : null,
          );
      } catch {
        if (mounted) setUserType(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    setShowTimings(false);
    setSelectedOffer(null);
    setShowPin(false);
    setReceipt(null);
  }, [item.id]);
  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        ar ? 'تعذر فتح الرابط' : 'Could not open link',
        ar ? 'يرجى المحاولة مرة أخرى.' : 'Please try again.',
      );
    }
  };
  const call = () => {
    if (item.PhoneNumber) void openLink(`tel:${item.PhoneNumber}`);
  };
  const map = () => {
    const query =
      item.latitude != null && item.longitude != null
        ? `${item.latitude},${item.longitude}`
        : String(item.address || '');
    if (query)
      void openLink(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          query,
        )}`,
      );
  };
  const hasMenu = Boolean(item.pdfUrl || item.menuUrl);
  const menu = () => {
    if (item.pdfUrl)
      navigation.navigate('PDFViewerScreen', {pdfUrl: item.pdfUrl});
    else if (item.menuUrl)
      /^https?:\/\//i.test(String(item.menuUrl))
        ? void openLink(String(item.menuUrl))
        : navigation.navigate('PDFViewerScreen', {pdfUrl: item.menuUrl});
    else setShowMenuAlert(true);
  };
  const redeem = (row: OfferRow) => {
    if (!userType) {
      Alert.alert(
        ar ? 'تسجيل الدخول مطلوب' : 'Login required',
        ar
          ? 'يرجى تسجيل الدخول للاستفادة من العرض.'
          : 'Please log in to redeem this offer.',
      );
      return;
    }
    setSelectedOffer(row);
    setShowPin(true);
  };
  const verifyPin = (pin: string) => {
    const expected = selectedOffer?.pin ?? item.pin;
    setShowPin(false);
    if (selectedOffer && validRedeemPin(pin, expected)) {
      setReceipt({
        ...item,
        discount: selectedOffer.value,
        discountText: discountLabel(selectedOffer, ar),
      });
    } else setWrongPin(true);
  };
  const daysArabic: Record<string, string> = {
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
  };
  const date = (v: unknown) => {
    const d = new Date(String(v || ''));
    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString(ar ? 'ar-QA' : 'en-GB');
  };
  return (
    <View style={{flex: 1, backgroundColor: Colors.White}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{paddingBottom: Math.max(insets.bottom, 16)}}>
        <View>
          <ImageSlider images={images} width={width} topInset={insets.top} />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={ar ? 'رجوع' : 'Back'}
            onPress={() => navigation.goBack()}
            style={[heroStyles.overlayButton, {top: insets.top + 8, left: 16}]}>
            <Ionicons name="arrow-back" size={24} color={Colors.White} />
          </TouchableOpacity>
          {!event && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={ar ? 'المفضلة' : 'Wishlist'}
              accessibilityState={{selected: saved}}
              onPress={() => dispatch(toggleItemInCart(item))}
              style={[
                heroStyles.overlayButton,
                {top: insets.top + 8, right: 16},
              ]}>
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={24}
                color={saved ? Colors.PrimaryColor : Colors.White}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.container}>
          <View style={styles.Body_Cont}>
            <View style={styles.Title_Cont}>
              <Text style={styles.title}>
                {ar
                  ? item.nameArabic || item.nameEng
                  : item.nameEng || item.nameArabic}
              </Text>
              {!!item.selectedCategory && (
                <View style={styles.Type_Cont}>
                  <Text style={styles.Type_Text}>{item.selectedCategory}</Text>
                </View>
              )}
            </View>
            <View style={styles.addressRow}>
              <View style={styles.Loc_Cont}>
                <Ionicons
                  name="location-outline"
                  size={21}
                  color={Colors.textSecondary}
                />
                <Text style={styles.Loc_Txt}>{item.address}</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={!item.PhoneNumber}
                onPress={call}
                style={[styles.call_cont, !item.PhoneNumber && {opacity: 0.4}]}>
                <Ionicons name="call" size={18} color={Colors.PrimaryColor} />
                <Text style={styles.call_txt}>
                  {ar ? 'اتصل الآن' : 'Call Now'}
                </Text>
              </TouchableOpacity>
            </View>
            {event ? (
              <View style={styles.timingsCard}>
                <View style={styles.item_cont}>
                  <Text style={styles.timingDay}>
                    {ar ? 'تاريخ البداية' : 'Starting Date'}
                  </Text>
                  <Text style={styles.timingTime}>{date(item.startAt)}</Text>
                </View>
                <View style={styles.item_cont}>
                  <Text style={styles.timingDay}>
                    {ar ? 'تاريخ النهاية' : 'Ending Date'}
                  </Text>
                  <Text style={styles.timingTime}>{date(item.endAt)}</Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.rowBetween}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{expanded: showTimings}}
                    onPress={() => setShowTimings(v => !v)}
                    style={styles.timing_dropdown}>
                    <Ionicons
                      name="time-outline"
                      size={22}
                      color={Colors.PrimaryColor}
                    />
                    <Text style={styles.working_hour_txt}>
                      {ar ? 'ساعات العمل' : 'Working Hours'}
                    </Text>
                    <Text style={styles.dropdown_icon}>
                      {showTimings ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setShowBranches(true)}
                    style={styles.branchBtn}>
                    <Ionicons
                      name="storefront-outline"
                      size={22}
                      color={Colors.PrimaryColor}
                    />
                    <Text style={styles.branchBtnText}>
                      {ar ? 'قائمة الفروع' : 'List of Branches'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showTimings && (
                  <View style={styles.timingsCard}>
                    {item.timings && Object.keys(item.timings).length ? (
                      Object.entries(item.timings).map(([day, time]) => (
                        <View key={day} style={styles.item_cont}>
                          <Text style={styles.timingDay}>
                            {ar ? daysArabic[day.toLowerCase()] || day : day}
                          </Text>
                          <Text style={styles.timingTime}>{String(time)}</Text>
                        </View>
                      ))
                    ) : (
                      <Text>
                        {ar
                          ? 'ساعات العمل غير متاحة.'
                          : 'Working hours unavailable.'}
                      </Text>
                    )}
                  </View>
                )}
                {offers.map(row => (
                  <TouchableOpacity
                    key={row.key}
                    accessibilityRole="button"
                    onPress={() => redeem(row)}
                    style={styles.Dis_Cont}>
                    <Ionicons
                      name="pricetag-outline"
                      size={25}
                      color={Colors.PrimaryColor}
                    />
                    <Text style={styles.Total_Discount}>
                      {discountLabel(row, ar)}
                    </Text>
                    <View style={styles.redeemBadge}>
                      <Text style={styles.redeemText}>
                        {ar ? 'استبدال العرض' : 'Redeem offer'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.85}
                  onPress={menu}
                  style={[
                    styles.offerBtn,
                    !hasMenu && styles.offerBtnDisabled,
                  ]}>
                  <Ionicons
                    name="document-text-outline"
                    size={25}
                    color={hasMenu ? Colors.PrimaryColor : Colors.Grey}
                  />
                  <View style={styles.offerBtnLeft}>
                    <Text style={styles.offerBtnTitle}>
                      {hasMenu
                        ? ar
                          ? 'العرض المتاح'
                          : 'Available Offer'
                        : ar
                        ? 'القائمة غير متاحة'
                        : 'No menu available'}
                    </Text>
                    <Text style={styles.offerBtnSub}>
                      {hasMenu
                        ? ar
                          ? 'اضغط لعرض القائمة أو العرض'
                          : 'Tap to open menu / offer'
                        : ar
                        ? 'لا توجد قائمة لهذا المتجر حاليًا'
                        : 'This venue has no menu right now'}
                    </Text>
                  </View>
                  <Text style={styles.offerBtnArrow}>{ar ? '‹' : '›'}</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.Desc_Cont}>
              <Text style={styles.Desc}>{ar ? 'الوصف' : 'Description'}</Text>
            </View>
            <Text style={styles.Detail}>
              {ar
                ? item.descriptionArabic || item.descriptionEng
                : item.descriptionEng || item.descriptionArabic}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={map}
            style={styles.mapButton}>
            <Ionicons name="map-outline" size={24} color={Colors.White} />
            <Text style={styles.mapText}>
              {ar ? 'افتح الخريطة' : 'Open Map'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PinModal
        visible={showPin}
        correctPin={selectedOffer?.pin ?? item.pin}
        onSubmit={verifyPin}
        onClose={() => {
          setShowPin(false);
          setSelectedOffer(null);
        }}
      />
      <IncorrectPin visible={wrongPin} onClose={() => setWrongPin(false)} />
      <MenuAlert
        visible={showMenuAlert}
        onClose={() => setShowMenuAlert(false)}
      />
      {showBranches && (
        <BranchesModal
          visible
          item={item}
          onClose={() => setShowBranches(false)}
          onSelect={branch => {
            setShowBranches(false);
            if (branch.id !== item.id)
              navigation.push('DetailScreen', {item: branch});
          }}
        />
      )}
      {userType === 'staff' && (
        <StaffReceipt
          visible={!!receipt}
          data={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
      {userType === 'tenant' && (
        <TenantReceipt
          visible={!!receipt}
          data={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
      {userType === 'org' && (
        <OrganizationReceipt
          visible={!!receipt}
          data={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
    </View>
  );
}
