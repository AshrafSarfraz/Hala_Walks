
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {Colors} from '../../../Themes/Colors';
import AttachmentSheet from '../../../chat/components/AttachmentSheet';
import {languageData} from '../../../redux_toolkit/language/languageSlice';
import {RootState} from '../../../redux_toolkit/store';
import { useStatusBar } from '../../../Component/UseStatusBar/useStatusBar';

const BASE_URL = 'https://hala-b-saudi.onrender.com';

const EditAccountScreen: React.FC = ({navigation}: any) => {
 useStatusBar('dark-content', Colors.White4, true);
  const language = useSelector((state: RootState) => state.language.language);
  const t = languageData[language];
  const isRTL = language === 'ar';

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false); // ✅
  const [showPicker, setShowPicker] = useState(false);

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() ?? '')
        .join('')
    : 'U';

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem('hala_user_backend');
      if (!raw) return;
      const user = JSON.parse(raw);
      setName(user.name ?? '');
      setBio(user.bio ?? '');
      setPhone(user.phone ?? '');
      setBirthday(user.birthday ? user.birthday.split('T')[0] : '');
      setAvatar(user.avatar ?? null);
      if (user.birthday) setDateObj(new Date(user.birthday));
    };
    load();
  }, []);

  const getToken = async () => await AsyncStorage.getItem('hala_token');
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const rowDir = isRTL ? 'row-reverse' : 'row';

  // ─── Upload Image ──────────────────────────────────────────────────
  const uploadImage = async (img: any) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', {
      uri: img.uri,
      type: img.type || 'image/jpeg',
      name: img.fileName || 'avatar.jpg',
    } as any);

    setUploading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/phoneAuth/profile/avatar`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      FastImage.clearMemoryCache();
      if (data.avatar) {
        FastImage.preload([
          {
            uri: data.avatar,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.reload,
          },
        ]);
      }

      setAvatar(data.avatar);

      const userRaw = await AsyncStorage.getItem('hala_user_backend');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        await AsyncStorage.setItem(
          'hala_user_backend',
          JSON.stringify({...user, avatar: data.avatar}),
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Remove Avatar ─────────────────────────────────────────────────
  const removeAvatar = () => {
    Alert.alert(
      isRTL ? 'حذف الصورة' : 'Remove Photo',
      isRTL ? 'هل أنت متأكد؟' : 'Are you sure you want to remove your photo?',
      [
        {text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel'},
        {
          text: isRTL ? 'حذف' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              const token = await getToken();
              const res = await fetch(
                `${BASE_URL}/api/phoneAuth/profile/avatar`,
                {
                  method: 'DELETE',
                  headers: {Authorization: `Bearer ${token}`},
                },
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.message);

              // ✅ State + cache + AsyncStorage clear
              setAvatar(null);
              FastImage.clearMemoryCache();

              const userRaw = await AsyncStorage.getItem('hala_user_backend');
              if (userRaw) {
                const user = JSON.parse(userRaw);
                await AsyncStorage.setItem(
                  'hala_user_backend',
                  JSON.stringify({...user, avatar: null}),
                );
              }
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
    );
  };

  const pickFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!result.didCancel && result.assets?.[0]) uploadImage(result.assets[0]);
  };

  const pickFromCamera = async () => {
    const result = await launchCamera({mediaType: 'photo', quality: 0.8});
    if (!result.didCancel && result.assets?.[0]) uploadImage(result.assets[0]);
  };

  // ─── Save Profile ──────────────────────────────────────────────────
  const saveProfile = async () => {
    const token = await getToken();
    const body: any = {};
    if (name.trim()) body.name = name.trim();
    if (bio.trim()) body.bio = bio.trim();
    if (birthday.trim()) body.birthday = birthday.trim();

    if (Object.keys(body).length === 0) {
      Alert.alert(t.nothing_to_update);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/phoneAuth/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const userRaw = await AsyncStorage.getItem('hala_user_backend');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        await AsyncStorage.setItem(
          'hala_user_backend',
          JSON.stringify({
            ...user,
            name: body.name ?? user.name,
            bio: body.bio ?? user.bio,
            birthday: body.birthday ?? user.birthday,
          }),
        );
      }

      Alert.alert(t.profile_updated);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor:Colors.White4}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={[s.header, {flexDirection: rowDir}]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={26}
              color={Colors.Green}
            />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t.edit_profile}</Text>
          <TouchableOpacity onPress={saveProfile}>
            {loading ? (
              <ActivityIndicator color={Colors.Green} />
            ) : (
              <Text style={s.saveTxt}>{t.save}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Avatar ── */}
          <View style={s.avatarSection}>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              activeOpacity={0.8}>

              {/* ✅ uploading ya removing dono mein spinner */}
              {uploading || removing ? (
                <View style={s.avatarCircle}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : avatar ? (
                <View>
                  <FastImage
                    source={{
                      uri: avatar,
                      priority: FastImage.priority.high,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={s.avatarImg}
                    onError={() => setAvatar(null)}
                  />
                  <View style={s.avatarEditBadge}>
                    <Ionicons name="camera-outline" size={14} color="#fff" />
                  </View>
                </View>
              ) : (
                <View style={s.avatarCircle}>
                  <Text style={s.avatarInitials}>{initials}</Text>
                  <View style={s.avatarEditBadge}>
                    <Ionicons name="camera-outline" size={14} color="#fff" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <Text style={s.changePhotoTxt}>{t.change_photo}</Text>
          </View>

          {/* ── Fields ── */}
          <View style={s.section}>

            {/* Name */}
            <View style={s.fieldWrap}>
              <Text style={[s.label, {textAlign: isRTL ? 'right' : 'left'}]}>
                {t.full_name}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.enter_name}
                placeholderTextColor="#9CA3AF"
                style={[
                  s.input,
                  {
                    textAlign: isRTL ? 'right' : 'left',
                    writingDirection: isRTL ? 'rtl' : 'ltr',
                  },
                ]}
              />
            </View>

            {/* Phone — readonly */}
            <View style={s.fieldWrap}>
              <Text style={[s.label, {textAlign: isRTL ? 'right' : 'left'}]}>
                {t.phone}
              </Text>
              <View style={[s.readonlyInput, {flexDirection: rowDir}]}>
                <Text style={s.readonlyText}>{phone || '—'}</Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color="#9CA3AF"
                />
              </View>
            </View>

            {/* Bio */}
            <View style={s.fieldWrap}>
              <Text style={[s.label, {textAlign: isRTL ? 'right' : 'left'}]}>
                {t.bio}
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder={t.bio_placeholder}
                placeholderTextColor="#9CA3AF"
                style={[
                  s.input,
                  {
                    minHeight: 60,
                    textAlign: isRTL ? 'right' : 'left',
                    writingDirection: isRTL ? 'rtl' : 'ltr',
                  },
                ]}
                multiline
                maxLength={150}
              />
              <Text style={[s.charCount, {textAlign: isRTL ? 'left' : 'right'}]}>
                {bio.length}/150
              </Text>
            </View>

            {/* Birthday */}
            <View style={s.fieldWrap}>
              <Text style={[s.label, {textAlign: isRTL ? 'right' : 'left'}]}>
                {t.birthday}
              </Text>
              <TouchableOpacity
                style={[s.dateInput, {flexDirection: rowDir}]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}>
                <Text style={{color: birthday ? '#111827' : '#9CA3AF'}}>
                  {birthday || t.select_birthday}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dateObj || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDateObj(selectedDate);
                setBirthday(formatDate(selectedDate));
              }
            }}
          />
        )}
      </KeyboardAvoidingView>

      {/* ✅ AttachmentSheet — onRemoveAvatar sirf tab jab avatar ho */}
      <AttachmentSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onCamera={() => {
          setShowPicker(false);
          pickFromCamera();
        }}
        onGallery={() => {
          setShowPicker(false);
          pickFromGallery();
        }}
        onRemoveAvatar={
          avatar
            ? () => {
                setShowPicker(false);
                removeAvatar();
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111827'},
  saveTxt: {color: Colors.Green, fontSize: 16, fontWeight: '600'},

  avatarSection: {alignItems: 'center', marginTop: 20, marginBottom: 8},
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.Green,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.Green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {color: '#fff', fontSize: 30, fontWeight: '700'},
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.Green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoTxt: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.Green,
    fontWeight: '500',
  },

  section: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40},
  fieldWrap: {marginBottom: 20},
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  charCount: {fontSize: 11, color: '#9CA3AF', marginTop: 4},
  readonlyInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readonlyText: {fontSize: 15, color: '#6B7280'},
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default EditAccountScreen;