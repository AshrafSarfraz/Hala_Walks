// src/hooks/useStatusBar.ts
import {useCallback} from 'react';
import {StatusBar, StatusBarStyle} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

export function useStatusBar(
  barStyle: StatusBarStyle,
  backgroundColor: string,
  translucent = false,
) {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle, true);
      StatusBar.setBackgroundColor(backgroundColor, true);
      StatusBar.setTranslucent(translucent);
    }, [barStyle, backgroundColor, translucent]),
  );
}