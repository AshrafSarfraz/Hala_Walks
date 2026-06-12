import React, {useState} from 'react';
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
  StatusBar,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import CustomHeader from '../../../components/header/CustomHeader';
import {Colors} from '../../../theme/Colors';
import {languageData} from '../../../redux/language/languageSlice';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';

const API_URL =
  'https://hala-b-saudi.onrender.com/api/westwalk/maintainceRequest';

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

const MaintainceRequest = ({navigation}: any) => {
  const language = useSelector((state: RootState) => state.language.language);
  const [form, setForm] = useState({
    name: '',
    unitno: '',
    buildingno: '',
    phoneNumber: '',
    email: '',
    subject: '',
    description: '',
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({...prev, [key]: value}));
  };

  // ── Pick images (up to 3) ──
  const pickImages = () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only attach up to 3 images.');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 3 - images.length, // remaining slots
      },
      response => {
        if (response.didCancel || response.errorCode) return;
        const assets = response.assets || [];
        const newImages: ImageFile[] = assets.map(asset => ({
          uri: asset.uri || '',
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
    const required = [
      'name',
      'unitno',
      'buildingno',
      'phoneNumber',
      'email',
      'subject',
      'description',
    ];
    for (const field of required) {
      if (!form[field as keyof typeof form].trim()) {
        Alert.alert('Missing Field', `Please fill in the ${field} field.`);
        return false;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();

      // ── Append text fields ──
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });

      // ── Append each image correctly ──
      images.forEach(img => {
        formData.append('image', {
          uri:
            Platform.OS === 'android'
              ? img.uri
              : img.uri.replace('file://', ''),
          name: img.name,
          type: img.type,
        } as any);
      });

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        // ⚠️ Do NOT manually set Content-Type — let fetch set it with the boundary
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Alert.alert(
          '✅ Submitted',
          'Your maintenance request has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setForm({
                  name: '',
                  unitno: '',
                  buildingno: '',
                  phoneNumber: '',
                  email: '',
                  subject: '',
                  description: '',
                });
                setImages([]);
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          data.message || 'Submission failed. Please try again.',
        );
      }
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar
        hidden={false}
        translucent={true}
        animated={true}
        backgroundColor={Colors.Bg}
        barStyle={'dark-content'}
      />
      <CustomHeader
        title={languageData[language].Back}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <View style={{marginBottom: 20}} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛠️</Text>
          <Text style={styles.headerTitle}>Maintenance Request</Text>
          <Text style={styles.headerSubtitle}>
            Fill in the details below and we'll get back to you shortly.
          </Text>
        </View>

        {/* ── Personal Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Field
            label="Full Name"
            placeholder="e.g. Ashraf M Sarfraz"
            value={form.name}
            onChangeText={v => handleChange('name', v)}
          />
          <Field
            label="Email Address"
            placeholder="e.g. ashraf@email.com"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
          />
          <Field
            label="Phone Number"
            placeholder="e.g. +966 5X XXX XXXX"
            value={form.phoneNumber}
            onChangeText={v => handleChange('phoneNumber', v)}
            keyboardType="phone-pad"
          />
        </View>

        {/* ── Unit Details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unit Details</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Unit No.</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 12"
                value={form.unitno}
                onChangeText={v => handleChange('unitno', v)}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Building No.</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. A3"
                value={form.buildingno}
                onChangeText={v => handleChange('buildingno', v)}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* ── Request Details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <Field
            label="Subject"
            placeholder="e.g. AC not working"
            value={form.subject}
            onChangeText={v => handleChange('subject', v)}
          />
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChangeText={v => handleChange('description', v)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
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

          {/* ── Image previews grid ── */}
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

          {/* ── Pick button (hide when 3 selected) ── */}
          {images.length < 3 && (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
              <Text style={styles.imagePickerIcon}>📷</Text>
              <Text style={styles.imagePickerText}>
                {images.length === 0
                  ? 'Tap to upload photos'
                  : 'Add more photos'}
              </Text>
              <Text style={styles.imagePickerHint}>
                {3 - images.length} slot{3 - images.length !== 1 ? 's' : ''}{' '}
                remaining · JPG, PNG
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─────────────────────────────────────────────────────────────────
// Reusable Field
// ─────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
}

const Field: React.FC<FieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="none"
      placeholderTextColor="#9ca3af"
    />
  </View>
);

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  content: {},

  header: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  headerIcon: {fontSize: 40, marginBottom: 10},
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    borderWidth: 0.2,
    borderColor: Colors.Grey,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  optional: {
    fontWeight: '400',
    color: '#9ca3af',
    textTransform: 'none',
    letterSpacing: 0,
  },

  fieldWrapper: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6},
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  textarea: {minHeight: 110, paddingTop: 12},
  row: {flexDirection: 'row', gap: 12},
  halfField: {flex: 1},

  // Image section
  imageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 14,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  imageThumbWrapper: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  imagePickerIcon: {fontSize: 28, marginBottom: 6},
  imagePickerText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 3,
  },
  imagePickerHint: {fontSize: 12, color: '#9ca3af'},

  submitBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  submitBtnDisabled: {backgroundColor: '#6b7280'},
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  bottomSpacer: {height: 32},
});

export default MaintainceRequest;
