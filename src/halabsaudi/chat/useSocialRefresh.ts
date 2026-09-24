import {useCallback} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connectSocket, getSocket} from './socket';

// Revalidate on return, reconnection, social changes and while visible.
// Each caller receives an AbortSignal so old profiles cannot overwrite a new one.
export function useSocialRefresh(load: (signal: AbortSignal) => Promise<void>, clear: () => void) {
  useFocusEffect(useCallback(() => {
    let current: AbortController | undefined;
    let disposed = false;
    const refresh = () => {
      current?.abort();
      current = new AbortController();
      void load(current.signal);
    };
    clear();
    refresh();
    let socket = getSocket();
    const attach = () => {
      socket?.on('social-updated', refresh);
      socket?.on('connect', refresh);
    };
    if (socket) attach();
    else AsyncStorage.getItem('hala_token').then(token => {
      if (!disposed && token) {socket = connectSocket(token); attach(); refresh();}
    }).catch(() => {});
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
      else {current?.abort(); clear();}
    });
    const timer = setInterval(() => {if (AppState.currentState === 'active') refresh();}, 30000);
    return () => {
      disposed = true;
      current?.abort(); clearInterval(timer); subscription.remove();
      socket?.off('social-updated', refresh); socket?.off('connect', refresh);
      clear();
    };
  }, [load, clear]));
}
