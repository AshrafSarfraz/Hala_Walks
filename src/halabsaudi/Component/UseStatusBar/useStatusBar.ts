import {useCallback} from 'react';
import {StatusBar, StatusBarStyle, Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
export function useStatusBar(barStyle: StatusBarStyle, backgroundColor: string, _legacyTranslucent?: boolean) {
  useFocusEffect(useCallback(() => {
    StatusBar.setHidden(false, 'fade');
    StatusBar.setBarStyle(barStyle, true);
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(backgroundColor, true);
    }
  }, [barStyle, backgroundColor]));
}
