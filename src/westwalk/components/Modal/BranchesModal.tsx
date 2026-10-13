import React, {useMemo} from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useSelector} from 'react-redux';
import {Text} from '../Text';
import useBrandCatalog from '../../hooks/useBrandCatalog';
import {RootState} from '../../redux/store';
import {Colors} from '../../theme/Colors';
import {Fonts} from '../../theme/Fonts';
const norm = (s: unknown) =>
  String(s || '')
    .trim()
    .toLowerCase();
export default function BranchesModal({
  visible,
  item,
  onClose,
  onSelect,
}: {
  visible: boolean;
  item: any;
  onClose: () => void;
  onSelect: (branch: any) => void;
}) {
  const ar = useSelector((s: RootState) => s.language.language === 'ar');
  const {brands, loading, error} = useBrandCatalog();
  const branches = useMemo(
    () =>
      brands.filter(
        b =>
          (norm(item.nameEng) && norm(b.nameEng) === norm(item.nameEng)) ||
          (norm(item.nameArabic) &&
            norm(b.nameArabic) === norm(item.nameArabic)),
      ),
    [brands, item],
  );
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.row}>
            <Text style={styles.heading}>
              {ar ? 'قائمة الفروع' : 'List of Branches'}
            </Text>
            <TouchableOpacity
              accessibilityLabel="Close branches"
              onPress={onClose}
              style={{padding: 12}}>
              <Ionicons name="close" size={23} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.PrimaryColor} />
          ) : (
            <FlatList
              data={branches}
              keyExtractor={b => String(b.id)}
              style={{maxHeight: 380}}
              renderItem={({item: branch}) => (
                <TouchableOpacity
                  style={styles.branch}
                  onPress={() => onSelect(branch)}>
                  <Text style={{fontFamily: Fonts.F_Bold}}>
                    {ar
                      ? branch.nameArabic || branch.nameEng
                      : branch.nameEng || branch.nameArabic}
                  </Text>
                  <Text style={styles.address}>{branch.address}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.address}>
                  {error
                    ? ar
                      ? 'تعذر تحميل الفروع.'
                      : 'Could not load branches.'
                    : ar
                    ? 'لا توجد فروع متاحة.'
                    : 'No branches available.'}
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end'},
  sheet: {
    backgroundColor: Colors.White,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 36,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heading: {fontSize: 18, fontFamily: Fonts.F_Bold},
  branch: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  address: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
});
