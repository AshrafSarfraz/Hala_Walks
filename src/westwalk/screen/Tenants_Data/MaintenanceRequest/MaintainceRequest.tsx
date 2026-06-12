// src/westwalk/screens/Maintenance/MaintainceRequest.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../../theme/Colors';


const API_URL =
  'https://hala-b-saudi.onrender.com/api/westwalk/maintainceRequest';

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

interface TenantData {
  name?: string;
  unitNumber?: string;
  buildingNo?: string;
  phoneNumber?: string;
  email?: string;
  qid?: string;
  [key: string]: any;
}

const MaintainceRequest = ({navigation}: any) => {
  const [subject, setSubject]           = useState('');
  const [description, setDescription]  = useState('');
  const [images, setImages]             = useState<ImageFile[]>([]);
  const [loading, setLoading]           = useState(false);
  const [isAtHome, setIsAtHome]         = useState<'yes' | 'no' | null>(null);

  const [tenantData, setTenantData]         = useState<TenantData | null>(null);
  const [tenantLoading, setTenantLoading]   = useState(true);

  // ── Load tenant data on mount ──
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem('tenant_data');
        if (raw) setTenantData(JSON.parse(raw));
      } catch (e) {
        console.log('MaintainceRequest: tenant_data load error:', e);
      } finally {
        setTenantLoading(false);
      }
    };
    load();
  }, []);

  // ── Pick images (up to 3) ──
  const pickImages = () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only attach up to 3 images.');
      return;
    }
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, selectionLimit: 3 - images.length},
      response => {
        if (response.didCancel || response.errorCode) return;
        const assets = response.assets || [];
        const newImages: ImageFile[] = assets.map(asset => ({
          uri:  asset.uri || '',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        }));
        setImages(prev => [...prev, ...newImages].slice(0, 3));
      },
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!tenantData) {
      Alert.alert('Profile Missing', 'Could not load your profile. Please log in again.');
      return false;
    }
    if (isAtHome === null) {
      Alert.alert('Required', 'Please confirm if we can proceed without you being at your premises.');
      return false;
    }
    if (!subject.trim()) {
      Alert.alert('Missing Field', 'Please enter a subject.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Missing Field', 'Please enter a description.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();

      // ── Auto-filled from tenant_data ──
      formData.append('name',        tenantData?.name        || '');
      formData.append('qid',         tenantData?.qid         || '');
      formData.append('unitno',      tenantData?.unitNumber  || '');
      formData.append('buildingno',  tenantData?.buildingNo  || '');
      formData.append('phoneNumber', tenantData?.phoneNumber || '');
      formData.append('email',       tenantData?.email       || '');
      formData.append('isAtHome',    isAtHome!);

      // ── User entered ──
      formData.append('subject',     subject.trim());
      formData.append('description', description.trim());

      // ── Images ──
      images.forEach(img => {
        formData.append('image', {
          uri:  Platform.OS === 'android' ? img.uri : img.uri.replace('file://', ''),
          name: img.name,
          type: img.type,
        } as any);
      });

      const res  = await fetch(API_URL, {
        method:  'POST',
        body:    formData,
        headers: {Accept: 'application/json'},
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // ── Save to local history ──
        const historyRaw = await AsyncStorage.getItem('maintenance_history');
        const history    = historyRaw ? JSON.parse(historyRaw) : [];
        history.unshift({
          id:          data.data?._id || Date.now().toString(),
          subject:     subject.trim(),
          description: description.trim(),
          status:      'Pending',
          date:        new Date().toISOString(),
        });
        await AsyncStorage.setItem('maintenance_history', JSON.stringify(history));

        Alert.alert(
          'Submitted',
          'Your maintenance request has been submitted successfully.',
          [{
            text: 'OK',
            onPress: () => {
              setSubject('');
              setDescription('');
              setImages([]);
              setIsAtHome(null);
            },
          }],
        );
      } else {
        Alert.alert('Error', data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Network Error', 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 160 : 0}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
 
        {/* ── Tenant info preview (read-only) ── */}
        {tenantLoading ? (
          <View style={styles.tenantLoadingWrap}>
            <ActivityIndicator color={Colors.PrimaryColor} />
            <Text style={styles.tenantLoadingText}>Loading your profile…</Text>
          </View>
        ) : tenantData ? (
          <View style={styles.tenantPreview}>
            <View style={styles.tenantPreviewRow}>
              <Text style={styles.tenantPreviewIcon}>👤</Text>
              <View style={{flex: 1}}>
                <Text style={styles.tenantPreviewName}>{tenantData.name || '—'}</Text>
                <Text style={styles.tenantPreviewSub}>
                  Unit {tenantData.unitNumber || '—'} · Building {tenantData.buildingNo || '—'}
                </Text>
                <Text style={styles.tenantPreviewQid}>QID: {tenantData.qid || '—'}</Text>
              </View>
              <View style={styles.autoTag}>
                <Text style={styles.autoTagText}>Auto-filled</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.tenantMissing}>
            <Text style={styles.tenantMissingText}>Profile not found. Please log in again.</Text>
          </View>
        )}

        {/* ── isAtHome — Yes / No toggle ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Can we proceed with your request if you are not available at your premises?
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                isAtHome === 'yes' && styles.toggleBtnActiveYes,
              ]}
              onPress={() => setIsAtHome('yes')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.toggleBtnText,
                  isAtHome === 'yes' && styles.toggleBtnTextActive,
                ]}>
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                isAtHome === 'no' && styles.toggleBtnActiveNo,
              ]}
              onPress={() => setIsAtHome('no')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.toggleBtnText,
                  isAtHome === 'no' && styles.toggleBtnTextActive,
                ]}>
                No
              </Text>
            </TouchableOpacity>
          </View>

          {isAtHome === 'no' && (
            <View style={styles.notAtHomeWarn}>
              <Text style={styles.notAtHomeWarnText}>
                Your request will be on hold until you are available at your premises.
              </Text>
            </View>
          )}
        </View>

        {/* ── Request Details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Ac is not working"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor={Colors.Grey}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe the issue in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor={Colors.Grey}
            />
          </View>
        </View>

        {/* ── Attach Images ── */}
        <View style={styles.section}>
          <View style={styles.imageSectionHeader}>
            <Text style={styles.sectionTitle}>
              Attach Images{' '}
              <Text style={styles.optional}>(Optional · max 3)</Text>
            </Text>
            <Text style={styles.imageCount}>{images.length}/3</Text>
          </View>

          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageThumbWrapper}>
                  <Image source={{uri: img.uri}} style={styles.imageThumb} />
                  <TouchableOpacity
                    style={styles.imageRemoveBtn}
                    onPress={() => removeImage(index)}>
                    <Text style={styles.imageRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {images.length < 3 && (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
              <Text style={styles.imagePickerIcon}>📷</Text>
              <Text style={styles.imagePickerText}>
                {images.length === 0 ? 'Tap to upload photos' : 'Add more photos'}
              </Text>
              <Text style={styles.imagePickerHint}>
                {3 - images.length} slot{3 - images.length !== 1 ? 's' : ''} remaining · JPG, PNG
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (loading || !tenantData || isAtHome === null) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || !tenantData || isAtHome === null}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color={Colors.White} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex:      {flex: 1, backgroundColor: Colors.Bg},
  container: {flex: 1, backgroundColor: Colors.Bg},
  content:   {paddingHorizontal: 16, paddingTop: 12},

  // ── Tenant preview ──
  tenantLoadingWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.White, borderRadius: 12, padding: 14, marginBottom: 14,
  },
  tenantLoadingText: {fontSize: 12, color: Colors.Grey},
  tenantPreview: {
    backgroundColor: Colors.White, borderRadius: 12, padding: 14,
    marginBottom: 14, borderLeftWidth: 3, borderLeftColor: Colors.SecondaryColor,
  },
  tenantPreviewRow:  {flexDirection: 'row', alignItems: 'center', gap: 10},
  tenantPreviewIcon: {fontSize: 28},
  tenantPreviewName: {fontSize: 12, fontWeight: '700', color: Colors.PrimaryColor, lineHeight: 16},
  tenantPreviewSub:  {fontSize: 10, color: Colors.Grey, marginTop: 2, lineHeight: 14},
  tenantPreviewQid:  {fontSize: 10, color: Colors.Grey, marginTop: 2, lineHeight: 14},
  autoTag: {
    backgroundColor: '#EEF0FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  autoTagText: {fontSize: 8, fontWeight: '700', color: Colors.PrimaryColor},
  tenantMissing: {
    backgroundColor: '#FFF3CD', borderRadius: 12, padding: 14, marginBottom: 14,
  },
  tenantMissingText: {fontSize: 12, color: '#856404'},

  // ── Section ──
  section: {
    backgroundColor: Colors.White, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 0.2, borderColor: Colors.Grey,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '500', color: Colors.PrimaryColor, marginBottom: 14, lineHeight: 16,
  },
  optional: {fontWeight: '400', color: Colors.Grey, textTransform: 'none', letterSpacing: 0},

  // ── isAtHome toggle ──
  toggleRow: {flexDirection: 'row', gap: 10},
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', backgroundColor: Colors.Bg,
  },
  toggleBtnActiveYes: {
    backgroundColor: Colors.PrimaryColor, borderColor: Colors.PrimaryColor,
  },
  toggleBtnActiveNo: {
    backgroundColor: '#EF4444', borderColor: '#EF4444',
  },
  toggleBtnText:       {fontSize: 10, fontWeight: '600', color: Colors.Grey},
  toggleBtnTextActive: {color: Colors.White},

  // ── Not at home warning ──
  notAtHomeWarn: {
    backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginTop: 10,
  },
  notAtHomeWarnText: {fontSize: 12, color: '#991B1B', textAlign: 'center'},

  // ── Fields ──
  fieldWrapper: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6},
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 12, lineHeight: 16,
    color: Colors.Black, backgroundColor: Colors.Bg,
  },
  textarea: {minHeight: 110, paddingTop: 12, lineHeight: 14},

  // ── Images ──
  imageSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  imageCount:        {fontSize: 13, fontWeight: '700', color: Colors.Grey, marginBottom: 14},
  imageGrid:         {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12},
  imageThumbWrapper: {
    width: '30%', aspectRatio: 1, borderRadius: 10,
    overflow: 'hidden', position: 'relative',
  },
  imageThumb:     {width: '100%', height: '100%', resizeMode: 'cover'},
  imageRemoveBtn: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  imageRemoveText: {color: Colors.White, fontSize: 11, fontWeight: '700'},
  imagePicker: {
    borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed',
    borderRadius: 12, padding: 20, alignItems: 'center', backgroundColor: Colors.Bg,
  },
  imagePickerIcon: {fontSize: 26, marginBottom: 6},
  imagePickerText: {fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 3},
  imagePickerHint: {fontSize: 12, color: Colors.Grey},

  // ── Submit ──
  submitBtn: {
    backgroundColor: Colors.PrimaryColor, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4, elevation: 4,
  },
  submitBtnDisabled: {backgroundColor: Colors.Grey},
  submitBtnText:     {color: Colors.White, fontSize: 16, fontWeight: '700', letterSpacing: 0.3},
  bottomSpacer:      {height: 32},
});

export default MaintainceRequest;





// // src/westwalk/screens/Maintenance/MaintainceRequest.tsx
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import {launchImageLibrary} from 'react-native-image-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {Colors} from '../../../theme/Colors';


// const API_URL =
//   'https://hala-b-saudi.onrender.com/api/westwalk/maintainceRequest';

// interface ImageFile {
//   uri: string;
//   name: string;
//   type: string;
// }

// interface TenantData {
//   name?: string;
//   unitNumber?: string;
//   buildingNo?: string;
//   phoneNumber?: string;
//   email?: string;
//   qid?: string;
//   [key: string]: any;
// }

// const MaintainceRequest = ({navigation}: any) => {
//   const [subject, setSubject]           = useState('');
//   const [description, setDescription]  = useState('');
//   const [images, setImages]             = useState<ImageFile[]>([]);
//   const [loading, setLoading]           = useState(false);
//   const [isAtHome, setIsAtHome]         = useState<'yes' | 'no' | null>(null); // ✅ NEW

//   const [tenantData, setTenantData]         = useState<TenantData | null>(null);
//   const [tenantLoading, setTenantLoading]   = useState(true);

//   // ── Load tenant data on mount ──
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const raw = await AsyncStorage.getItem('tenant_data');
//         if (raw) setTenantData(JSON.parse(raw));
//       } catch (e) {
//         console.log('MaintainceRequest: tenant_data load error:', e);
//       } finally {
//         setTenantLoading(false);
//       }
//     };
//     load();
//   }, []);

//   // ── Pick images (up to 3) ──
//   const pickImages = () => {
//     if (images.length >= 3) {
//       Alert.alert('Limit Reached', 'You can only attach up to 3 images.');
//       return;
//     }
//     launchImageLibrary(
//       {mediaType: 'photo', quality: 0.8, selectionLimit: 3 - images.length},
//       response => {
//         if (response.didCancel || response.errorCode) return;
//         const assets = response.assets || [];
//         const newImages: ImageFile[] = assets.map(asset => ({
//           uri:  asset.uri || '',
//           name: asset.fileName || `image_${Date.now()}.jpg`,
//           type: asset.type || 'image/jpeg',
//         }));
//         setImages(prev => [...prev, ...newImages].slice(0, 3));
//       },
//     );
//   };

//   const removeImage = (index: number) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const validate = () => {
//     if (!tenantData) {
//       Alert.alert('Profile Missing', 'Could not load your profile. Please log in again.');
//       return false;
//     }
//     if (isAtHome === null) {
//       Alert.alert('Required', 'Please confirm if you are currently in your room.');
//       return false;
//     }
//     if (isAtHome === 'no') {
//       Alert.alert(
//         'Not At Home',
//         'Complaint cannot be submitted. Please be present in your room and try again.',
//       );
//       return false;
//     }
//     if (!subject.trim()) {
//       Alert.alert('Missing Field', 'Please enter a subject.');
//       return false;
//     }
//     if (!description.trim()) {
//       Alert.alert('Missing Field', 'Please enter a description.');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const formData = new FormData();

//       // ── Auto-filled from tenant_data ──
//       formData.append('name',        tenantData?.name        || '');
//       formData.append('qid',         tenantData?.qid         || ''); // ✅ QID autofill
//       formData.append('unitno',      tenantData?.unitNumber  || '');
//       formData.append('buildingno',  tenantData?.buildingNo  || '');
//       formData.append('phoneNumber', tenantData?.phoneNumber || '');
//       formData.append('email',       tenantData?.email       || '');
//       formData.append('isAtHome',    isAtHome!);                     // ✅ isAtHome

//       // ── User entered ──
//       formData.append('subject',     subject.trim());
//       formData.append('description', description.trim());

//       // ── Images ──
//       images.forEach(img => {
//         formData.append('image', {
//           uri:  Platform.OS === 'android' ? img.uri : img.uri.replace('file://', ''),
//           name: img.name,
//           type: img.type,
//         } as any);
//       });

//       const res  = await fetch(API_URL, {
//         method:  'POST',
//         body:    formData,
//         headers: {Accept: 'application/json'},
//       });
//       const data = await res.json();

//       if (res.ok && data.success) {
//         // ── Save to local history ──
//         const historyRaw = await AsyncStorage.getItem('maintenance_history');
//         const history    = historyRaw ? JSON.parse(historyRaw) : [];
//         history.unshift({
//           id:          data.data?._id || Date.now().toString(),
//           subject:     subject.trim(),
//           description: description.trim(),
//           status:      'Pending',
//           date:        new Date().toISOString(),
//         });
//         await AsyncStorage.setItem('maintenance_history', JSON.stringify(history));

//         Alert.alert(
//           'Submitted',
//           'Your maintenance request has been submitted successfully.',
//           [{
//             text: 'OK',
//             onPress: () => {
//               setSubject('');
//               setDescription('');
//               setImages([]);
//               setIsAtHome(null); // ✅ reset
//             },
//           }],
//         );
//       } else {
//         Alert.alert('Error', data.message || 'Submission failed. Please try again.');
//       }
//     } catch (err) {
//       console.error('Submit error:', err);
//       Alert.alert('Network Error', 'Could not connect to the server. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.flex}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled">

//         {/* ── Tenant info preview (read-only) ── */}
//         {tenantLoading ? (
//           <View style={styles.tenantLoadingWrap}>
//             <ActivityIndicator color={Colors.PrimaryColor} />
//             <Text style={styles.tenantLoadingText}>Loading your profile…</Text>
//           </View>
//         ) : tenantData ? (
//           <View style={styles.tenantPreview}>
//             <View style={styles.tenantPreviewRow}>
//               <Text style={styles.tenantPreviewIcon}>👤</Text>
//               <View style={{flex: 1}}>
//                 <Text style={styles.tenantPreviewName}>{tenantData.name || '—'}</Text>
//                 <Text style={styles.tenantPreviewSub}>
//                   Unit {tenantData.unitNumber || '—'} · Building {tenantData.buildingNo || '—'}
//                 </Text>
//                 {/* ✅ QID display */}
//                 <Text style={styles.tenantPreviewQid}>QID: {tenantData.qid || '—'}</Text>
//               </View>
//               <View style={styles.autoTag}>
//                 <Text style={styles.autoTagText}>Auto-filled</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.tenantMissing}>
//             <Text style={styles.tenantMissingText}>Profile not found. Please log in again.</Text>
//           </View>
//         )}

//         {/* ✅ isAtHome — Yes / No toggle */}
//         <View style={styles.section}>
//   <Text style={styles.sectionTitle}>
//     Can we proceed with your request if you are not available at your premises?
//   </Text>
//   <View style={styles.toggleRow}>
//     <TouchableOpacity
//       style={[
//         styles.toggleBtn,
//         isAtHome === 'yes' && styles.toggleBtnActiveYes,
//       ]}
//       onPress={() => setIsAtHome('yes')}
//       activeOpacity={0.8}>
//       <Text
//         style={[
//           styles.toggleBtnText,
//           isAtHome === 'yes' && styles.toggleBtnTextActive,
//         ]}>
//         Yes
//       </Text>
//     </TouchableOpacity>

//     <TouchableOpacity
//       style={[
//         styles.toggleBtn,
//         isAtHome === 'no' && styles.toggleBtnActiveNo,
//       ]}
//       onPress={() => setIsAtHome('no')}
//       activeOpacity={0.8}>
//       <Text
//         style={[
//           styles.toggleBtnText,
//           isAtHome === 'no' && styles.toggleBtnTextActive,
//         ]}>
//         No
//       </Text>
//     </TouchableOpacity>
//   </View>

//   {isAtHome === 'no' && (
//     <View style={styles.notAtHomeWarn}>
//       <Text style={styles.notAtHomeWarnText}>
//         Your request will be on hold until you are available at your premises.
//       </Text>
//     </View>
//   )}
// </View>

//         {/* ── Request Details ── */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Request Details</Text>

//           <View style={styles.fieldWrapper}>
//             <Text style={styles.label}>Subject</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Ac is not working"
//               value={subject}
//               onChangeText={setSubject}
//               placeholderTextColor={Colors.Grey}
//             />
//           </View>

//           <View style={styles.fieldWrapper}>
//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={[styles.input, styles.textarea]}
//               placeholder="Describe the issue in detail..."
//               value={description}
//               onChangeText={setDescription}
//               multiline
//               numberOfLines={5}
//               textAlignVertical="top"
//               placeholderTextColor={Colors.Grey}
//             />
//           </View>
//         </View>

//         {/* ── Attach Images ── */}
//         <View style={styles.section}>
//           <View style={styles.imageSectionHeader}>
//             <Text style={styles.sectionTitle}>
//               Attach Images{' '}
//               <Text style={styles.optional}>(Optional · max 3)</Text>
//             </Text>
//             <Text style={styles.imageCount}>{images.length}/3</Text>
//           </View>

//           {images.length > 0 && (
//             <View style={styles.imageGrid}>
//               {images.map((img, index) => (
//                 <View key={index} style={styles.imageThumbWrapper}>
//                   <Image source={{uri: img.uri}} style={styles.imageThumb} />
//                   <TouchableOpacity
//                     style={styles.imageRemoveBtn}
//                     onPress={() => removeImage(index)}>
//                     <Text style={styles.imageRemoveText}>✕</Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           )}

//           {images.length < 3 && (
//             <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
//               <Text style={styles.imagePickerIcon}>📷</Text>
//               <Text style={styles.imagePickerText}>
//                 {images.length === 0 ? 'Tap to upload photos' : 'Add more photos'}
//               </Text>
//               <Text style={styles.imagePickerHint}>
//                 {3 - images.length} slot{3 - images.length !== 1 ? 's' : ''} remaining · JPG, PNG
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* ── Submit ── */}
//         <TouchableOpacity
//           style={[
//             styles.submitBtn,
//             (loading || !tenantData || isAtHome !== 'yes') && styles.submitBtnDisabled,
//           ]}
//           onPress={handleSubmit}
//           disabled={loading || !tenantData || isAtHome !== 'yes'} // ✅ disabled if not at home
//           activeOpacity={0.85}>
//           {loading ? (
//             <ActivityIndicator color={Colors.White} />
//           ) : (
//             <Text style={styles.submitBtnText}>Submit Request</Text>
//           )}
//         </TouchableOpacity>

//         <View style={styles.bottomSpacer} />
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   flex:      {flex: 1, backgroundColor: Colors.Bg},
//   container: {flex: 1, backgroundColor: Colors.Bg},
//   content:   {paddingHorizontal: 16, paddingTop: 12},

//   // ── Tenant preview ──
//   tenantLoadingWrap: {
//     flexDirection: 'row', alignItems: 'center', gap: 10,
//     backgroundColor: Colors.White, borderRadius: 12, padding: 14, marginBottom: 14,
//   },
//   tenantLoadingText: {fontSize: 12, color: Colors.Grey},
//   tenantPreview: {
//     backgroundColor: Colors.White, borderRadius: 12, padding: 14,
//     marginBottom: 14, borderLeftWidth: 3, borderLeftColor: Colors.SecondaryColor,
//   },
//   tenantPreviewRow:  {flexDirection: 'row', alignItems: 'center', gap: 10},
//   tenantPreviewIcon: {fontSize: 28},
//   tenantPreviewName: {fontSize: 12, fontWeight: '700', color: Colors.PrimaryColor, lineHeight:16},
//   tenantPreviewSub:  {fontSize: 10, color: Colors.Grey, marginTop: 2, lineHeight:14},
//   tenantPreviewQid:  {fontSize: 10, color: Colors.Grey, marginTop: 2, lineHeight:14}, // ✅ NEW
//   autoTag: {
//     backgroundColor: '#EEF0FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
//   },
//   autoTagText: {fontSize: 8, fontWeight: '700', color: Colors.PrimaryColor},
//   tenantMissing: {
//     backgroundColor: '#FFF3CD', borderRadius: 12, padding: 14, marginBottom: 14,
//   },
//   tenantMissingText: {fontSize: 12, color: '#856404'},

//   // ── Section ──
//   section: {
//     backgroundColor: Colors.White, borderRadius: 16, padding: 16,
//     marginBottom: 14, borderWidth: 0.2, borderColor: Colors.Grey,
//   },
//   sectionTitle: {
//     fontSize: 12, fontWeight: '500', color: Colors.PrimaryColor, marginBottom: 14,lineHeight:16,
//   },
//   optional: {fontWeight: '400', color: Colors.Grey, textTransform: 'none', letterSpacing: 0 },

//   // ✅ isAtHome toggle
//   toggleRow: {flexDirection: 'row', gap: 10},
//   toggleBtn: {
//     flex: 1, paddingVertical: 12, borderRadius: 10,
//     borderWidth: 1.5, borderColor: '#E5E7EB',
//     alignItems: 'center', backgroundColor: Colors.Bg,
//   },
//   toggleBtnActiveYes: {
//     backgroundColor: Colors.PrimaryColor, borderColor: Colors.PrimaryColor,
//   },
//   toggleBtnActiveNo: {
//     backgroundColor: '#EF4444', borderColor: '#EF4444',
//   },
//   toggleBtnText:       {fontSize: 10, fontWeight: '600', color: Colors.Grey},
//   toggleBtnTextActive: {color: Colors.White},

//   // ✅ Not at home warning
//   notAtHomeWarn: {
//     backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginTop: 10,
//   },
//   notAtHomeWarnText: {fontSize: 12, color: '#991B1B', textAlign: 'center'},

//   // ── Fields ──
//   fieldWrapper: {marginBottom: 14},
//   label: {fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6},
//   input: {
//     borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
//     paddingHorizontal: 14, paddingVertical: 11, fontSize: 12,lineHeight:16,
//     color: Colors.Black, backgroundColor: Colors.Bg,
//   },
//   textarea: {minHeight: 110, paddingTop: 12, lineHeight:14 },

//   // ── Images ──
//   imageSectionHeader: {
//     flexDirection: 'row', alignItems: 'center',
//     justifyContent: 'space-between', marginBottom: 12,
//   },
//   imageCount:        {fontSize: 13, fontWeight: '700', color: Colors.Grey, marginBottom: 14},
//   imageGrid:         {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12},
//   imageThumbWrapper: {
//     width: '30%', aspectRatio: 1, borderRadius: 10,
//     overflow: 'hidden', position: 'relative',
//   },
//   imageThumb:     {width: '100%', height: '100%', resizeMode: 'cover'},
//   imageRemoveBtn: {
//     position: 'absolute', top: 4, right: 4,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     width: 22, height: 22, borderRadius: 11,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   imageRemoveText: {color: Colors.White, fontSize: 11, fontWeight: '700'},
//   imagePicker: {
//     borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed',
//     borderRadius: 12, padding: 20, alignItems: 'center', backgroundColor: Colors.Bg,
//   },
//   imagePickerIcon: {fontSize: 26, marginBottom: 6},
//   imagePickerText: {fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 3},
//   imagePickerHint: {fontSize: 12, color: Colors.Grey},

//   // ── Submit ──
//   submitBtn: {
//     backgroundColor: Colors.PrimaryColor, borderRadius: 14,
//     paddingVertical: 16, alignItems: 'center', marginTop: 4, elevation: 4,
//   },
//   submitBtnDisabled: {backgroundColor: Colors.Grey},
//   submitBtnText:     {color: Colors.White, fontSize: 16, fontWeight: '700', letterSpacing: 0.3},
//   bottomSpacer:      {height: 32},
// });

// export default MaintainceRequest;