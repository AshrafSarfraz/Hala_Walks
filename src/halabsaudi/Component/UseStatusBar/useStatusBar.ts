// src/hooks/useStatusBar.ts
import {useCallback} from 'react';
import {StatusBar, StatusBarStyle, Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

export function useStatusBar(
  barStyle: StatusBarStyle,
  backgroundColor: string,
) {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(false, 'fade');   // ✅ splash ke baad bar wapas show
      StatusBar.setBarStyle(barStyle, true);
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);     // ✅ solid bar
        StatusBar.setBackgroundColor(backgroundColor, true);
      }
    }, [barStyle, backgroundColor]),
  );
}