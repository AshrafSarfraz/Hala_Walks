import AsyncStorage from '@react-native-async-storage/async-storage';
import React,{ useState } from 'react';
import { StyleSheet,View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import CustomHeader from '../../Component/CustomHeader/CustomHeader';
import { useStatusBar } from '../../Component/UseStatusBar/useStatusBar';
import { Colors } from '../../Themes/Colors';
import PermissionCard from '../../permissions/PermissionCard';
import { permissionStatus } from '../../permissions/service';
import { RootState } from '../../redux_toolkit/store';

export default function LocationDisclosure({navigation}: any) {
  useStatusBar('dark-content', Colors.surface);
  const ar = useSelector((state: RootState) => state.language.language === 'ar');
  const [step, setStep] = useState(0);
  const advance = async () => {
    if (step === 0) {setStep(1); return;}
    await AsyncStorage.multiSet([
      ['hala_permissions_asked', 'true'], ['hala_permissions_v2', 'true'],
      ['hala_location_permission_granted', String(await permissionStatus('location') === 'granted')],
    ]);
    navigation.replace('BottomTab');
  };
  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
    <CustomHeader title={ar ? 'اجعل هلا يناسبك' : 'Make Hala yours'} />
    <View style={styles.progress}>{[0, 1].map(i => <View key={i} style={[styles.dot, i === step && styles.active]} />)}</View>
    <PermissionCard key={step} kind={step === 0 ? 'location' : 'notifications'} onDone={advance} onSkip={advance} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.surface},
  progress: {flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 20},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border}, active: {width: 22, backgroundColor: Colors.accent},
});
