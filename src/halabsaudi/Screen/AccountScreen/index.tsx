import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
   Image,  
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Colors, Colors as ThemeColors } from '../../Themes/Colors';


import { Back_Icon } from '../../Themes/Images';
import { languageData } from '../../redux_toolkit/language/languageSlice';
import { RootState } from '../../redux_toolkit/store';
import { useSelector } from 'react-redux';
import { getStyles } from './style';



type UserDoc = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  age?: number | null;
  gender?: string | null;
  countryCode?: string;
  createdAt?: any;
  updatedAt?: any;
};




const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'] as const;
type GenderType = (typeof GENDER_OPTIONS)[number];

const AccountScreen: React.FC = ({navigation}) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [docId, setDocId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserDoc | null>(null);

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageStr, setAgeStr] = useState('');
  const [gender, setGender] = useState<GenderType | ''>('');
  const [error, setError] = useState<string | null>(null);

  // gender modal
  const [genderOpen, setGenderOpen] = useState(false);
  const language = useSelector((state: RootState) => state.language.language); // Get the current language from Redux
 const styles = getStyles(language);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setInitialLoading(true);

        const currentUser = auth().currentUser;
        const phone = currentUser?.phoneNumber;
        if (!phone) {
          setError('No authenticated phone number found.');
          setInitialLoading(false);
          return;
        }

        const snap = await firestore()
          .collection('hala_users')
          .where('phoneNumber', '==', phone)
          .limit(1)
          .get();

        if (snap.empty) {
          setError('User not found in hala_users.');
          setInitialLoading(false);
          return;
        }

        const doc = snap.docs[0];
        const data = (doc.data() || {}) as UserDoc;
        setDocId(doc.id);
        setUserData(data);

        // seed form
        setName(data.name ?? '');
        setEmail(data.email ?? '');
        setAgeStr(typeof data.age === 'number' ? String(data.age) : '');
        setGender((data.gender as GenderType) ?? '');
      } catch (e: any) {
        setError('Failed to load profile. ' + (e?.message ?? ''));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, []);

  const initials = useMemo(() => {
    const src = name || userData?.name || '';
    const parts = src.trim().split(/\s+/).slice(0, 2);
    const letters = parts.map(p => p[0]?.toUpperCase() ?? '').join('');
    return letters || 'U';
  }, [name, userData?.name]);

  // ---------- validation & save ----------
  const validate = () => {
    if (!name.trim()) return 'Please enter your full name';
    if (!email.trim()) return 'Please enter your email';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return 'Please enter a valid email';
    if (ageStr.trim()) {
      const n = Number(ageStr);
      if (!Number.isInteger(n) || n < 10 || n > 120)
        return 'Please enter a valid age between 10 and 120';
    }
    return null;
  };

  const onSave = async () => {
    setError(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    if (!docId) {
      setError('Cannot update: missing user document.');
      return;
    }

    const ageVal = ageStr.trim() ? Math.max(10, Math.min(120, parseInt(ageStr, 10))) : null;

    try {
      setSaving(true);
      await firestore().collection('hala_users').doc(docId).set(
        {
          name: name.trim(),
          email: email.trim(),
          age: ageVal,
          gender: gender || null,
          // phoneNumber intentionally not updated
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      setUserData(prev => ({
        ...(prev ?? {}),
        name: name.trim(),
        email: email.trim(),
        age: ageVal,
        gender: gender || null,
      }));

      setEditMode(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e: any) {
      setError('Failed to update profile. ' + (e?.message ?? ''));
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setName(userData?.name ?? '');
    setEmail(userData?.email ?? '');
    setAgeStr(typeof userData?.age === 'number' ? String(userData?.age) : '');
    setGender((userData?.gender as GenderType) ?? '');
    setEditMode(false);
    setError(null);
  };
/* ---------- Presentational helpers (flat) ---------- */
const ListRow: React.FC<{ label: string; value: string; last?: boolean }> = ({
  label,
  value,
  last,
}) => (
  <View style={[styles.listRow, last && styles.listRowLast]}>
    <Text style={styles.listKey}>{label}</Text>
    <Text style={styles.listVal} numberOfLines={1}>
      {value || '—'}
    </Text>
  </View>
);

const Field: React.FC<{ label: string; helper?: string; children: React.ReactNode }> = ({
  label,
  helper,
  children,
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
    {helper ? <Text style={styles.helper}>{helper}</Text> : null}
  </View>
);


  // ---------- UI ----------
  if (initialLoading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingTxt}>Loading your profile…</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: Colors.White4 }]}>
        <Text style={[styles.loadingTxt, { color: Colors.Red }]}>
          {error ?? 'No data found.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.White }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* Hero Header (keep as-is) */}
      <View style={styles.hero}>
        
        <View style={styles.heroTopRow}>
        <TouchableOpacity  onPress={()=>{navigation.goBack()}}    style={{flexDirection:language==='en'?"row":"row-reverse",alignItems:"center"}}   >
          <Image source={Back_Icon} style={{marginRight:4,  width:25,height:25,resizeMode:"contain", tintColor:"white",  transform:language==='en'?[{ scaleX:1}]:[{ scaleX:-1}]}} />
          <Text style={styles.heroTitle}>{languageData[language].account}</Text>
        </TouchableOpacity>

          
          {!editMode ? (
            <TouchableOpacity style={styles.heroBtnOutline} onPress={() => setEditMode(true)}>
              <Text style={styles.heroBtnOutlineTxt}>{languageData[language].edit}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.heroBtnGhost} onPress={onCancel} disabled={saving}>
                <Text style={styles.heroBtnGhostTxt}>{languageData[language].cancel}</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity style={styles.heroBtnSolid} onPress={onSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.heroBtnSolidTxt}>{languageData[language].save}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.heroBottom}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.nameTxt}>{userData?.name || '—'}</Text>
            <Text style={styles.subTxt}>{userData?.email || 'No email'}</Text>
          </View>
        </View>
      </View>

      {/* Content (FLAT — no card background) */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>{languageData[language].personal_details}</Text>

        {!editMode ? (
          // ---- VIEW MODE: clean list rows (no cards) ----
          <View style={styles.list}>
            <ListRow label={languageData[language].full_name} value={userData?.name ?? '—'} />
            <ListRow label={languageData[language].email} value={userData?.email ?? '—'} />
            <ListRow label={languageData[language].phone_number} value={userData?.phoneNumber ?? '—'} />
            <ListRow label={languageData[language].age} value={userData?.age != null ? String(userData?.age) : '—'} />
            <ListRow label={languageData[language].gender} value={userData?.gender ?? '—'} last />
          </View>
        ) : (
          // ---- EDIT MODE: minimal underline inputs (flat) ----
          <View style={styles.form}>
            <Field label={languageData[language].full_name}>
              <TextInput
                style={styles.inputFlat}
                placeholder={languageData[language].full_name}
                placeholderTextColor={Colors.Black}
                value={name}
                onChangeText={setName}
              />
            </Field>

            <Field label={languageData[language].email}>
              <TextInput
                style={styles.inputFlat}
                placeholder="you@example.com"
                placeholderTextColor={Colors.Black}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Field>

            <Field label={languageData[language].phone_number}helper="Phone number cannot be changed.">
              <TextInput
                style={[styles.inputFlat, styles.inputDisabledFlat]}
                value={userData?.phoneNumber ?? ''}
                editable={false}
              />
            </Field>

            <Field label={languageData[language].age}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g., 28"
                placeholderTextColor={Colors.Black}
                value={ageStr}
                onChangeText={t => setAgeStr(t.replace(/[^\d]/g, ''))}
                keyboardType="numeric"
                maxLength={3}
              />
            </Field>

            <Field label={languageData[language].gender}>
              <TouchableOpacity
                style={[styles.inputFlat, styles.dropdownTap]}
                onPress={() => setGenderOpen(true)}
              >
                <Text style={gender ? styles.inputText : styles.placeholderText}>
                  {gender || 'Select gender'}
                </Text>
              </TouchableOpacity>
            </Field>

            {error ? <Text style={styles.formError}>{error}</Text> : null}
          </View>
        )}
      </ScrollView>

      {/* Gender Modal */}
      <Modal
        transparent
        visible={genderOpen}
        animationType="fade"
        onRequestClose={() => setGenderOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setGenderOpen(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDER_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.modalRow}
                onPress={() => {
                  setGender(opt);
                  setGenderOpen(false);
                }}
              >
                <Text style={styles.modalRowTxt}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};



export default AccountScreen;


