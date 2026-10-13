import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function useMember(storageKey?: string) {
  const [member, setMember] = useState<any>(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const keys = storageKey
            ? [storageKey]
            : ['staff_data', 'tenant_data', 'org_emp_data'];
          const values = await AsyncStorage.multiGet(keys);
          let data: any = null;
          for (const [, raw] of values) {
            try {
              if (raw) {
                data = JSON.parse(raw);
                if (data) break;
              }
            } catch {}
          }
          if (active) setMember(data);
        } catch {
          if (active) setMember(null);
        }
      })();
      return () => {
        active = false;
      };
    }, [storageKey]),
  );
  return member;
}
